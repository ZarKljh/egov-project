<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>비밀번호 재설정 - 전자정부프레임워크</title>
    
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
                <h2 class="card-title text-center mb-4">비밀번호 재설정</h2>
                
                <p class="text-muted mb-4 text-center">본인 확인을 위해 정보를 입력해주세요.</p>
                
                @if ($errors->any())
                    <div class="alert alert-danger mb-3">
                        <ul class="mb-0">
                            @foreach ($errors->all() as $error)
                                <li>{{ $error }}</li>
                            @endforeach
                        </ul>
                    </div>
                @endif

                <form method="POST" action="{{ route('reset-password.verify') }}">
                    @csrf

                    <!-- 아이디 -->
                    <div class="form-floating mb-3">
                        <input type="text" 
                               class="form-control @error('username') is-invalid @enderror" 
                               id="username" 
                               name="username" 
                               placeholder="아이디" 
                               value="{{ old('username') }}" 
                               required>
                        <label for="username">아이디 *</label>
                        @error('username')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>

                    <!-- 성명 -->
                    <div class="form-floating mb-3">
                        <input type="text" 
                               class="form-control @error('name') is-invalid @enderror" 
                               id="name" 
                               name="name" 
                               placeholder="성명" 
                               value="{{ old('name') }}" 
                               required>
                        <label for="name">성명 *</label>
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
                               value="{{ old('phone') }}" 
                               required>
                        <label for="phone">전화번호 *</label>
                        @error('phone')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>

                    <!-- 제출 버튼 -->
                    <div class="d-grid mb-3">
                        <button type="submit" class="btn btn-primary btn-lg">본인 확인</button>
                    </div>

                    <!-- 링크 -->
                    <div class="text-center">
                        <a href="{{ route('find-id') }}" class="text-decoration-none me-3">아이디 찾기</a>
                        <a href="{{ route('register') }}" class="text-decoration-none">회원가입</a>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- Bootstrap 5 JS CDN -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
