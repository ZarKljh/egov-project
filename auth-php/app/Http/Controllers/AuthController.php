<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    /**
     * 로그인 폼 표시
     */
    public function showLoginForm()
    {
        return view('auth.login');
    }

    /**
     * 로그인 처리
     */
    public function login(Request $request)
    {
        // 유효성 검사
        $validated = $request->validate([
            'username' => ['required', 'string', 'max:50'],
            'password' => ['required', 'string'],
        ]);

        // 사용자 조회
        $user = User::where('username', $validated['username'])->first();

        // 사용자 존재 및 비밀번호 확인
        if ($user && Hash::check($validated['password'], $user->password)) {
            // 로그인 성공 - 세션에 사용자 정보 저장
            session([
                'user_id' => $user->user_id,
                'username' => $user->username,
                'name' => $user->name,
                'role' => $user->role,
            ]);

            // 외부 URL로 리다이렉트 (민원문의 게시판). 배포 시 .env 에 SPRINGBOOT_REDIRECT_URL 설정
            return redirect(config('app.springboot_redirect_url'));
        } else {
            // 로그인 실패
            return back()->withErrors([
                'login_failed' => '아이디 또는 비밀번호가 올바르지 않습니다.'
            ])->withInput();
        }
    }

    /**
     * 로그아웃 처리
     */
    public function logout()
    {
        session()->flush();
        return redirect()->route('login');
    }

    /**
     * 아이디 찾기 폼 표시
     */
    public function showFindIdForm()
    {
        return view('auth.find-id');
    }

    /**
     * 아이디 찾기 처리
     */
    public function findId(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:50'],
            'phone' => ['required', 'string', 'max:20'],
        ]);

        $user = User::where('name', $validated['name'])
                    ->where('phone', $validated['phone'])
                    ->first();

        if ($user) {
            return view('auth.find-id-result', ['username' => $user->username]);
        } else {
            return back()->withErrors([
                'not_found' => '입력하신 정보와 일치하는 계정을 찾을 수 없습니다.'
            ])->withInput();
        }
    }

    /**
     * 비밀번호 재설정 폼 표시
     */
    public function showResetPasswordForm()
    {
        return view('auth.reset-password');
    }

    /**
     * 비밀번호 재설정 - 본인 확인
     */
    public function verifyUser(Request $request)
    {
        $validated = $request->validate([
            'username' => ['required', 'string', 'max:50'],
            'name' => ['required', 'string', 'max:50'],
            'phone' => ['required', 'string', 'max:20'],
        ]);

        $user = User::where('username', $validated['username'])
                    ->where('name', $validated['name'])
                    ->where('phone', $validated['phone'])
                    ->first();

        if ($user) {
            // 본인 확인 성공, 비밀번호 재설정 폼으로 리다이렉트
            return redirect()->route('reset-password.form', ['username' => $user->username])
                           ->with('verified', true);
        } else {
            return back()->withErrors([
                'verification_failed' => '입력하신 정보와 일치하는 계정을 찾을 수 없습니다.'
            ])->withInput();
        }
    }

    /**
     * 비밀번호 재설정 폼 표시 (본인 확인 후)
     */
    public function showNewPasswordForm(Request $request)
    {
        $username = $request->query('username');
        
        if (!$username || !session('verified')) {
            return redirect()->route('reset-password')->withErrors([
                'session_expired' => '본인 확인이 필요합니다.'
            ]);
        }

        return view('auth.reset-password-new', ['username' => $username]);
    }

    /**
     * 비밀번호 재설정 처리
     */
    public function resetPassword(Request $request)
    {
        $validated = $request->validate([
            'username' => ['required', 'string', 'max:50', 'exists:site_user,username'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = User::where('username', $validated['username'])->first();

        if (!$user) {
            return back()->withErrors([
                'user_not_found' => '사용자를 찾을 수 없습니다.'
            ])->withInput();
        }

        // Bcrypt로 비밀번호 암호화하여 업데이트
        $user->password = Hash::make($validated['password']);
        $user->save();

        return redirect()->route('reset-password.success');
    }

    /**
     * 비밀번호 재설정 성공 페이지
     */
    public function resetPasswordSuccess()
    {
        return view('auth.reset-password-success');
    }
}
