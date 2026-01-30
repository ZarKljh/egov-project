<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>로그인 - 전자정부프레임워크</title>
    
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
    </style>
</head>
<body class="bg-light">
    <div class="container-fluid d-flex vh-100 align-items-center justify-content-center">
        <div class="card shadow-lg" style="width: 100%; max-width: 500px;">
            <div class="card-body p-5">
                <h2 class="card-title text-center mb-4">로그인</h2>
                
                @if($errors->any())
                    <div class="alert alert-danger">
                        <ul class="mb-0">
                            @foreach($errors->all() as $error)
                                <li>{{ $error }}</li>
                            @endforeach
                        </ul>
                    </div>
                @endif

                <form method="POST" action="{{ route('login') }}">
                    @csrf

                    <!-- 아이디 -->
                    <div class="form-floating mb-3">
                        <input type="text" 
                               class="form-control @error('username') is-invalid @enderror" 
                               id="username" 
                               name="username" 
                               placeholder="아이디" 
                               value="{{ old('username') }}" 
                               required 
                               autofocus>
                        <label for="username">아이디 *</label>
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
                        @error('password')
                            <div class="invalid-feedback d-block">{{ $message }}</div>
                        @enderror
                    </div>

                    <!-- 로그인 실패 메시지 -->
                    @error('login_failed')
                        <div class="alert alert-danger">
                            {{ $message }}
                        </div>
                    @enderror

                    <!-- 제출 버튼 -->
                    <div class="d-grid mb-3">
                        <button type="submit" class="btn btn-primary btn-lg">로그인</button>
                    </div>
                </form>

                <!-- 추가 링크 -->
                <div class="text-center">
                    <a href="{{ route('register') }}" class="text-primary text-decoration-none me-3">회원가입</a>
                    <a href="{{ route('find-id') }}" class="text-primary text-decoration-none me-3">아이디 찾기</a>
                    <a href="{{ route('reset-password') }}" class="text-primary text-decoration-none">비밀번호 재설정</a>
                </div>
            </div>
        </div>
    </div>

    <!-- Bootstrap 5 JS CDN -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
