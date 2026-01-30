<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>새 비밀번호 설정 - 전자정부프레임워크</title>
    
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
        <div class="card shadow-lg" style="width: 100%; max-width: 500px;">
            <div class="card-body p-5">
                <h2 class="card-title text-center mb-4">새 비밀번호 설정</h2>
                
                @if ($errors->any())
                    <div class="alert alert-danger mb-3">
                        <ul class="mb-0">
                            @foreach ($errors->all() as $error)
                                <li>{{ $error }}</li>
                            @endforeach
                        </ul>
                    </div>
                @endif

                <form method="POST" action="{{ route('reset-password.submit') }}">
                    @csrf
                    <input type="hidden" name="username" value="{{ $username }}">

                    <!-- 새 비밀번호 -->
                    <div class="form-floating mb-3">
                        <input type="password" 
                               class="form-control @error('password') is-invalid @enderror" 
                               id="password" 
                               name="password" 
                               placeholder="새 비밀번호" 
                               required>
                        <label for="password">새 비밀번호 *</label>
                        <div class="invalid-feedback" id="password-error"></div>
                        <div class="valid-feedback" id="password-success"></div>
                        @error('password')
                            <div class="invalid-feedback d-block">{{ $message }}</div>
                        @enderror
                    </div>

                    <!-- 새 비밀번호 확인 -->
                    <div class="form-floating mb-3">
                        <input type="password" 
                               class="form-control @error('password_confirmation') is-invalid @enderror" 
                               id="password_confirmation" 
                               name="password_confirmation" 
                               placeholder="새 비밀번호 확인" 
                               required>
                        <label for="password_confirmation">새 비밀번호 확인 *</label>
                        <div class="invalid-feedback" id="password_confirmation-error"></div>
                        <div class="valid-feedback" id="password_confirmation-success"></div>
                        @error('password_confirmation')
                            <div class="invalid-feedback d-block">{{ $message }}</div>
                        @enderror
                    </div>

                    <!-- 제출 버튼 -->
                    <div class="d-grid mb-3">
                        <button type="submit" class="btn btn-primary btn-lg">비밀번호 재설정</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- Bootstrap 5 JS CDN -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    
    <!-- 실시간 유효성 검사 스크립트 -->
    <script>
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
