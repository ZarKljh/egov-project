# workspace-egov NCP 인프라 (Terraform)

NCP 서버 1대 + ACG(보안그룹) + 공인 IP 를 생성합니다.  
Next.js, Laravel, Spring Boot, Nginx Proxy Manager, PostgreSQL 은 Docker 로 이 서버에 배포합니다.

## 사전 준비

1. **NCP 계정** 가입: [ncloud.com](https://www.ncloud.com)
2. **인증키 발급**: NCP 콘솔 > 마이페이지 > 계정관리 > 인증키관리
   - Access Key ID, Secret Key 생성 및 저장
3. **로그인 키 생성**: NCP 콘솔 > 서버 > 로그인 키 관리
   - 키 페어 생성 (`.pem` 다운로드)
4. **서버 제품 코드 확인**: NCP 콘솔 > 서버 > 서버 생성
   - 원하는 OS 이미지 제품 코드 확인 (예: Ubuntu 22.04)
   - 원하는 스펙 제품 코드 확인 (예: 2vCPU 4GB)
5. **Terraform** 설치: [terraform.io/downloads](https://www.terraform.io/downloads)

## 자격 증명

`terraform.tfvars` 파일에 직접 입력:

```hcl
ncloud_access_key = "실제AccessKey"
ncloud_secret_key = "실제SecretKey"
```

또는 환경 변수 사용:

```bash
export NCLOUD_ACCESS_KEY="your-access-key"
export NCLOUD_SECRET_KEY="your-secret-key"
```

## 사용 방법

```bash
cd infra

# 1. terraform.tfvars.example 를 복사 후 실제 값 입력
cp terraform.tfvars.example terraform.tfvars
# terraform.tfvars 에 다음 값 입력:
# - ncloud_access_key, ncloud_secret_key
# - server_image_product_code (NCP 콘솔에서 확인)
# - server_product_code (NCP 콘솔에서 확인)
# - login_key_name (NCP 콘솔에서 생성한 키 이름)

# 2. 초기화
terraform init

# 3. 계획 확인
terraform plan

# 4. 적용 (서버 생성)
terraform apply
```

## 변수 요약

| 변수 | 필수 | 설명 |
|------|------|------|
| `ncloud_access_key` | O | NCP Access Key |
| `ncloud_secret_key` | O | NCP Secret Key |
| `server_image_product_code` | O | 서버 이미지 제품 코드 (OS) |
| `server_product_code` | O | 서버 제품 코드 (스펙) |
| `login_key_name` | O | 로그인 키 이름 |
| `vpc_no` | X | 비우면 기본 VPC 사용 |
| `subnet_no` | X | 비우면 기본 서브넷 사용 |
| `assign_public_ip` | X | true 시 고정 공인 IP 부여 |

## NCP 콘솔에서 확인할 사항

### 1. 서버 이미지 제품 코드 확인
- NCP 콘솔 > 서버 > 서버 생성
- 원하는 OS 선택 (예: Ubuntu 22.04)
- 제품 코드 복사 (예: `SW.VSVR.OS.LNX64.Ubuntu.Ubuntu.22.04.B050`)

### 2. 서버 제품 코드 확인
- NCP 콘솔 > 서버 > 서버 생성
- 원하는 스펙 선택 (예: 2vCPU 4GB)
- 제품 코드 복사 (예: `SVR.VSVR.HICPU.C002.M004.NET.SSD.B050.G002`)

### 3. 로그인 키 생성
- NCP 콘솔 > 서버 > 로그인 키 관리
- 키 생성 후 이름과 `.pem` 파일 저장

## 출력

- `public_ip`: SSH/접속용 공인 IP
- `private_ip`: 사설 IP
- `server_no`: 서버 인스턴스 번호
- `ssh_command`: 접속 예시 명령

## SSH 접속

```bash
ssh -i /path/to/your-key.pem root@<public_ip>
```

**참고**: NCP는 기본적으로 `root` 사용자로 접속합니다 (AWS는 `ec2-user`).

이후 서버에 Docker / Docker Compose 설치 후 앱을 배포하면 됩니다.
