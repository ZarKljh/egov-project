<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>아이디 찾기 - 전자정부프레임워크</title>
    
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
                <h2 class="card-title text-center mb-4">아이디 찾기</h2>
                
                @if ($errors->any())
                    <div class="alert alert-danger mb-3">
                        <ul class="mb-0">
                            @foreach ($errors->all() as $error)
                                <li>{{ $error }}</li>
                            @endforeach
                        </ul>
                    </div>
                @endif

                <form method="POST" action="{{ route('find-id') }}">
                    @csrf

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
                        <button type="submit" class="btn btn-primary btn-lg">아이디 찾기</button>
                    </div>

                    <!-- 링크 -->
                    <div class="text-center">
                        <a href="{{ route('register') }}" class="text-decoration-none me-3">회원가입</a>
                        <a href="{{ route('reset-password') }}" class="text-decoration-none">비밀번호 재설정</a>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- Bootstrap 5 JS CDN -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
