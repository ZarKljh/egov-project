<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>회원가입 - 전자정부프레임워크</title>
    
    <!-- Bootstrap 5 CSS CDN -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    
    <style>
        body {
            background-color: #f8f9fa; /* bg-light */
        }
        .btn-primary {
            background-color: #003366; /* Navy Blue */
            border-color: #003366;
        }
        .btn-primary:hover {
            background-color: #002244;
            border-color: #002244;
        }
        .text-primary {
            color: #003366 !important;
        }
        .is-valid {
            border-color: #198754;
        }
        .valid-feedback {
            display: block;
            color: #198754;
        }
    </style>
</head>
<body class="bg-light">
    <div class="container-fluid d-flex vh-100 align-items-center justify-content-center">
        <div class="card shadow-lg" style="width: 100%; max-width: 600px;">
            <div class="card-body p-5">
                <h2 class="card-title text-center mb-4">회원가입</h2>
                
                @if ($errors->any())
                    <div class="alert alert-danger">
                        <ul class="mb-0">
                            @foreach ($errors->all() as $error)
                                <li>{{ $error }}</li>
                            @endforeach
                        </ul>
                    </div>
                @endif

                <form method="POST" action="{{ route('register') }}">
                    @csrf

                    <!-- 사용자명 (아이디) -->
                    <div class="form-floating mb-3">
                        <input type="text" 
                               class="form-control @error('username') is-invalid @enderror" 
                               id="username" 
                               name="username" 
                               placeholder="사용자명" 
                               value="{{ old('username') }}" 
                               required>
                        <label for="username">사용자명 (아이디) *</label>
                        <div class="invalid-feedback" id="username-error"></div>
                        <div class="valid-feedback" id="username-success"></div>
                        @error('username')
                            <div class="invalid-feedback d-block">{{ $message }}</div>
                        @enderror
                    </div>

                    <!-- 비밀번호 -->
                    <div class="form-floating mb-3">
                        <input type="password" 
                               class="form-control @error('password') is-invalid @enderror" 
                               id="password" 
                               name="password" 
                               placeholder="비밀번호" 
                               required>
                        <label for="password">비밀번호 *</label>
                        <div class="invalid-feedback" id="password-error"></div>
                        <div class="valid-feedback" id="password-success"></div>
                        @error('password')
                            <div class="invalid-feedback d-block">{{ $message }}</div>
                        @enderror
                    </div>

                    <!-- 비밀번호 확인 -->
                    <div class="form-floating mb-3">
                        <input type="password" 
                               class="form-control @error('password_confirmation') is-invalid @enderror" 
                               id="password_confirmation" 
                               name="password_confirmation" 
                               placeholder="비밀번호 확인" 
                               required>
                        <label for="password_confirmation">비밀번호 확인 *</label>
                        <div class="invalid-feedback" id="password_confirmation-error"></div>
                        <div class="valid-feedback" id="password_confirmation-success"></div>
                        @error('password_confirmation')
                            <div class="invalid-feedback d-block">{{ $message }}</div>
                        @enderror
                    </div>

                    <!-- 성명 -->
                    <div class="form-floating mb-3">
                        <input type="text" 
                               class="form-control @error('name') is-invalid @enderror" 
                               id="name" 
                               name="name" 
                               placeholder="성명" 
                               value="{{ old('name') }}">
                        <label for="name">성명</label>
                        @error('name')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>

                    <!-- 전화번호 -->
                    <div class="form-floating mb-3">
                        <input type="tel" 
                               class="form-control @error('phone') is-invalid @enderror" 
                               id="phone" 
                               name="phone" 
                               placeholder="전화번호" 
                               value="{{ old('phone') }}">
                        <label for="phone">전화번호</label>
                        @error('phone')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>

                    <!-- 이메일 -->
                    <div class="form-floating mb-3">
                        <input type="email" 
                               class="form-control @error('email') is-invalid @enderror" 
                               id="email" 
                               name="email" 
                               placeholder="이메일" 
                               value="{{ old('email') }}">
                        <label for="email">이메일</label>
                        @error('email')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>

                    <!-- 우편번호 -->
                    <div class="form-floating mb-3">
                        <input type="text" 
                               class="form-control @error('postcode') is-invalid @enderror" 
                               id="postcode" 
                               name="postcode" 
                               placeholder="우편번호" 
                               value="{{ old('postcode') }}">
                        <label for="postcode">우편번호</label>
                        @error('postcode')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>

                    <!-- 기본 주소 -->
                    <div class="form-floating mb-3">
                        <input type="text" 
                               class="form-control @error('address_default') is-invalid @enderror" 
                               id="address_default" 
                               name="address_default" 
                               placeholder="기본 주소" 
                               value="{{ old('address_default') }}">
                        <label for="address_default">기본 주소</label>
                        @error('address_default')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>

                    <!-- 상세 주소 -->
                    <div class="form-floating mb-3">
                        <input type="text" 
                               class="form-control @error('address_detail') is-invalid @enderror" 
                               id="address_detail" 
                               name="address_detail" 
                               placeholder="상세 주소" 
                               value="{{ old('address_detail') }}">
                        <label for="address_detail">상세 주소</label>
                        @error('address_detail')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>

                    <!-- 제출 버튼 -->
                    <div class="d-grid mb-3">
                        <button type="submit" class="btn btn-primary btn-lg">회원가입</button>
                    </div>

                    <!-- 로그인 링크 -->
                    <div class="text-center">
                        <a href="#" class="text-decoration-none">이미 계정이 있으신가요? 로그인</a>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- Bootstrap 5 JS CDN -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    
    <!-- 실시간 유효성 검사 스크립트 -->
    <script>
        // CSRF 토큰
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content || 
                         document.querySelector('input[name="_token"]')?.value;

        // 아이디 중복 확인 (debounce)
        let usernameTimeout;
        const usernameInput = document.getElementById('username');
        const usernameError = document.getElementById('username-error');
        const usernameSuccess = document.getElementById('username-success');

        usernameInput.addEventListener('blur', function() {
            const username = this.value.trim();
            
            // 5자 미만이면 클라이언트 측에서 검증
            if (username.length > 0 && username.length < 5) {
                showFieldError('username', '아이디는 5자 이상이어야 합니다.');
                return;
            }

            // 5자 이상일 때만 서버 확인
            if (username.length >= 5) {
                checkUsernameAvailability(username);
            }
        });

        usernameInput.addEventListener('input', function() {
            const username = this.value.trim();
            
            // 입력 중에는 실시간으로 길이만 확인
            if (username.length > 0 && username.length < 5) {
                showFieldError('username', '아이디는 5자 이상이어야 합니다.');
            } else if (username.length >= 5) {
                clearFieldError('username');
                // debounce: 입력이 멈춘 후 500ms 뒤에 서버 확인
                clearTimeout(usernameTimeout);
                usernameTimeout = setTimeout(() => {
                    checkUsernameAvailability(username);
                }, 500);
            } else {
                clearFieldError('username');
            }
        });

        function checkUsernameAvailability(username) {
            fetch('/register/check-username', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                },
                body: JSON.stringify({ username: username })
            })
            .then(response => response.json())
            .then(data => {
                if (data.available) {
                    showFieldSuccess('username', data.message);
                } else {
                    showFieldError('username', data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        }

        // 비밀번호 실시간 검증
        const passwordInput = document.getElementById('password');
        const passwordError = document.getElementById('password-error');
        const passwordSuccess = document.getElementById('password-success');

        passwordInput.addEventListener('input', function() {
            const password = this.value;
            if (password.length > 0 && password.length < 8) {
                showFieldError('password', '비밀번호는 8자 이상이어야 합니다.');
            } else if (password.length >= 8) {
                showFieldSuccess('password', '사용 가능한 비밀번호입니다.');
            } else {
                clearFieldError('password');
            }
        });

        passwordInput.addEventListener('blur', function() {
            const password = this.value;
            if (password.length > 0 && password.length < 8) {
                showFieldError('password', '비밀번호는 8자 이상이어야 합니다.');
            }
        });

        // 비밀번호 확인 실시간 검증
        const passwordConfirmationInput = document.getElementById('password_confirmation');
        const passwordConfirmationError = document.getElementById('password_confirmation-error');
        const passwordConfirmationSuccess = document.getElementById('password_confirmation-success');

        passwordConfirmationInput.addEventListener('input', function() {
            const password = passwordInput.value;
            const passwordConfirmation = this.value;
            
            if (passwordConfirmation.length > 0) {
                if (password !== passwordConfirmation) {
                    showFieldError('password_confirmation', '비밀번호가 일치하지 않습니다.');
                } else {
                    showFieldSuccess('password_confirmation', '비밀번호가 일치합니다.');
                }
            }
        });

        passwordConfirmationInput.addEventListener('blur', function() {
            const password = passwordInput.value;
            const passwordConfirmation = this.value;
            
            if (passwordConfirmation.length > 0 && password !== passwordConfirmation) {
                showFieldError('password_confirmation', '비밀번호가 일치하지 않습니다.');
            }
        });

        // 유효성 검사 메시지 표시 함수
        function showFieldError(fieldName, message) {
            const input = document.getElementById(fieldName);
            const errorDiv = document.getElementById(fieldName + '-error');
            const successDiv = document.getElementById(fieldName + '-success');
            
            input.classList.remove('is-valid');
            input.classList.add('is-invalid');
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
            if (successDiv) {
                successDiv.style.display = 'none';
            }
        }

        function showFieldSuccess(fieldName, message) {
            const input = document.getElementById(fieldName);
            const errorDiv = document.getElementById(fieldName + '-error');
            const successDiv = document.getElementById(fieldName + '-success');
            
            input.classList.remove('is-invalid');
            input.classList.add('is-valid');
            if (successDiv) {
                successDiv.textContent = message;
                successDiv.style.display = 'block';
            }
            errorDiv.style.display = 'none';
        }

        function clearFieldError(fieldName) {
            const input = document.getElementById(fieldName);
            const errorDiv = document.getElementById(fieldName + '-error');
            const successDiv = document.getElementById(fieldName + '-success');
            
            input.classList.remove('is-invalid', 'is-valid');
            errorDiv.style.display = 'none';
            if (successDiv) {
                successDiv.style.display = 'none';
            }
        }
    </script>
</body>
</html>
