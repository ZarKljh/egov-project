<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>회원가입 완료 - 전자정부프레임워크</title>
    
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
    </style>
</head>
<body class="bg-light">
    <div class="container-fluid d-flex vh-100 align-items-center justify-content-center">
        <div class="card shadow-lg" style="width: 100%; max-width: 500px;">
            <div class="card-body p-5 text-center">
                <div class="mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" class="bi bi-check-circle-fill text-success" viewBox="0 0 16 16">
                        <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 2.04 4.907a.75.75 0 0 0-1.06 1.06l5.416 5.416a.75.75 0 0 0 1.08 0l5.416-5.416a.75.75 0 0 0-.022-1.08z"/>
                    </svg>
                </div>
                <h2 class="card-title mb-3">회원가입이 완료되었습니다</h2>
                <p class="text-muted mb-4">회원가입이 성공적으로 완료되었습니다.</p>
                <div class="d-grid">
                    <a href="{{ route('login') }}" class="btn btn-primary">로그인 화면으로 이동하기</a>
                </div>
            </div>
        </div>
    </div>

    <!-- Bootstrap 5 JS CDN -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
