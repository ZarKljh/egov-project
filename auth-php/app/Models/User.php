<?php

/**
 * ============================================
 * [면접 핵심] Laravel Eloquent User 모델
 * ============================================
 * 
 * [Spring Boot 비교]
 * Spring Boot:
 *   @Entity
 *   @Table(name = "site_user")
 *   public class User implements UserDetails {
 *       @Id
 *       @GeneratedValue
 *       private Long userId;
 *       // ...
 *   }
 * 
 * Laravel:
 *   class User extends Authenticatable implements JWTSubject
 *   protected $table = 'site_user';
 *   protected $primaryKey = 'user_id';
 * 
 * [ORM 비교]
 * - Spring Boot: JPA/Hibernate (Entity, Repository)
 * - Laravel: Eloquent ORM (Model, Query Builder)
 * 
 * [JWT 통합]
 * - JWTSubject 인터페이스 구현 필수
 * - getJWTIdentifier(): 토큰의 'sub' claim에 들어갈 값 (user_id)
 * - getJWTCustomClaims(): 토큰에 추가할 커스텀 정보 (username, role)
 * 
 * [면접 질문 예상]
 * Q: Eloquent ORM과 JPA의 차이점은?
 * A: Eloquent는 Active Record 패턴, JPA는 Data Mapper 패턴
 *    Eloquent: User::find(1) - 모델이 직접 DB 접근
 *    JPA: userRepository.findById(1) - Repository를 통한 접근
 * 
 * Q: JWT 토큰에 어떤 정보를 담나요?
 * A: getJWTIdentifier()로 user_id, getJWTCustomClaims()로 username과 role
 *    Spring Boot: JWT Claims에 userId, username, role 포함
 */

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * [면접 핵심] 데이터베이스 테이블명 지정
     * Spring Boot: @Table(name = "site_user")
     * Laravel: protected $table = 'site_user';
     * 
     * [설명] 기본값은 모델명의 복수형(snake_case)이지만,
     *       기존 DB 테이블명이 다를 경우 명시적으로 지정
     *
     * @var string
     */
    protected $table = 'site_user';

    /**
     * [면접 핵심] 기본 키 컬럼명 지정
     * Spring Boot: @Id private Long userId; (@Column(name = "user_id"))
     * Laravel: protected $primaryKey = 'user_id';
     * 
     * [설명] 기본값은 'id'이지만, 기존 DB의 PK가 다를 경우 지정
     *
     * @var string
     */
    protected $primaryKey = 'user_id';
    
    /**
     * [면접 핵심] 타임스탬프 자동 관리 비활성화
     * Spring Boot: @CreatedDate, @LastModifiedDate (JPA Auditing)
     * Laravel: public $timestamps = false; (created_at, updated_at 미사용)
     * 
     * [설명] 기존 DB에 타임스탬프 컬럼이 없거나 수동 관리하는 경우 false
     */
    public $timestamps = false;

    /**
     * [면접 핵심] Mass Assignment 허용 필드
     * Spring Boot: @Entity의 필드들은 기본적으로 모두 할당 가능 (Setter 사용)
     * Laravel: Mass Assignment 보안을 위해 fillable 또는 guarded 지정 필수
     * 
     * [보안]
     * - User::create($data) 시 fillable에 있는 필드만 할당됨
     * - 없는 필드는 자동으로 무시되어 보안 강화
     * - 예: $data에 'role' => 'ADMIN'이 있어도 fillable에 없으면 무시됨
     * 
     * [Spring Boot 비교]
     * Spring Boot는 DTO 패턴 사용:
     *   UserDto dto = new UserDto();
     *   dto.setUsername(request.getUsername());
     *   User user = userMapper.toEntity(dto);
     *
     * @var list<string>
     */
    protected $fillable = [
        'username',
        'password',
        'name',
        'phone',
        'email',
        'postcode',
        'address_default',
        'address_detail',
        'role',
        'created_at',
        'refresh_token'
    ];

    /**
     * [면접 핵심] JSON 직렬화 시 숨길 필드
     * Spring Boot: @JsonIgnore 또는 DTO에서 제외
     * Laravel: protected $hidden = ['password'];
     * 
     * [보안] API 응답에 비밀번호가 포함되지 않도록 보장
     * 
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'refresh_token'
    ];

    /**
     * [면접 핵심] 자동 타입 캐스팅
     * Spring Boot: JPA의 @Type 또는 Converter 사용
     * Laravel: protected function casts()로 타입 지정
     * 
     * [설명] DB에서 가져온 값을 자동으로 지정된 타입으로 변환
     * - 'password' => 'hashed': Hash::check() 시 자동 인식
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',  // Hash::check() 시 자동 인식
        ];
    }

    /**
     * [면접 핵심] JWT 토큰의 'sub' claim에 들어갈 식별자
     * Spring Boot: JWT Claims의 'sub'에 userId 저장
     * Laravel: getJWTIdentifier() 반환값이 'sub' claim에 저장됨
     * 
     * [동작 원리]
     * - JWT 토큰 생성 시: JWTAuth::fromUser($user) 호출
     * - 이 메서드가 호출되어 user_id를 'sub' claim에 저장
     * - 토큰 검증 시: 'sub'에서 user_id 추출하여 User::find(user_id) 실행
     * 
     * [면접 질문 예상]
     * Q: JWT 토큰에서 사용자를 어떻게 식별하나요?
     * A: 'sub' claim에 user_id 저장, 검증 시 추출하여 DB 조회
     *
     * @return mixed user_id 반환
     */
    public function getJWTIdentifier()
    {
        return $this->getKey(); // user_id 반환 (primaryKey)
    }

    /**
     * [면접 핵심] JWT 토큰에 추가할 커스텀 Claims
     * Spring Boot: JWT Claims에 username, role 추가
     * Laravel: getJWTCustomClaims() 반환값이 Claims에 추가됨
     * 
     * [용도]
     * - username: 사용자 식별용 (로그에 사용)
     * - role: 권한 체크용 (프론트엔드에서 ADMIN/USER 구분)
     * 
     * [주의사항]
     * - 민감 정보(비밀번호 등)는 절대 포함하지 않음
     * - 토큰 크기가 커지면 네트워크 부하 증가
     * 
     * [면접 질문 예상]
     * Q: JWT 토큰에 어떤 정보를 담나요?
     * A: user_id(sub), username, role. 비밀번호는 절대 포함하지 않음
     *
     * @return array ['username' => ..., 'role' => ...]
     */
    public function getJWTCustomClaims()
    {
        return [
            'userId' => $this->user_id,  // Spring Boot에서 사용하기 위해 추가
            'username' => $this->username,
            'role' => $this->role,  // ADMIN 또는 USER
        ];
    }
}
