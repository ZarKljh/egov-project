<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\RegisterController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// 로그인 관련 라우트
Route::get('/login', [AuthController::class, 'showLoginForm'])->name('login');
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

// 회원가입 관련 라우트
Route::get('/register', [RegisterController::class, 'showRegistrationForm'])->name('register');
Route::post('/register', [RegisterController::class, 'register']);
Route::post('/register/check-username', [RegisterController::class, 'checkUsername'])->name('register.check-username');
Route::get('/register/success', [RegisterController::class, 'success'])->name('register.success');

// 아이디 찾기 관련 라우트
Route::get('/find-id', [AuthController::class, 'showFindIdForm'])->name('find-id');
Route::post('/find-id', [AuthController::class, 'findId']);

// 비밀번호 재설정 관련 라우트
Route::get('/reset-password', [AuthController::class, 'showResetPasswordForm'])->name('reset-password');
Route::post('/reset-password/verify', [AuthController::class, 'verifyUser'])->name('reset-password.verify');
Route::get('/reset-password/form', [AuthController::class, 'showNewPasswordForm'])->name('reset-password.form');
Route::post('/reset-password/submit', [AuthController::class, 'resetPassword'])->name('reset-password.submit');
Route::get('/reset-password/success', [AuthController::class, 'resetPasswordSuccess'])->name('reset-password.success');
