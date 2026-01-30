<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class RegisterController extends Controller
{
    /**
     * 회원가입 폼 표시
     */
    public function showRegistrationForm()
    {
        return view('auth.register');
    }

    /**
     * 회원가입 처리
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'username' => ['required', 'string', 'max:50', 'unique:site_user,username'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'name' => ['nullable', 'string', 'max:50'],
            'phone' => ['nullable', 'string', 'max:20'],
            'email' => ['email', 'max:100'],
            'postcode' => ['string', 'max:20'],
            'address_default' => ['string', 'max:100'],
            'address_detail' => ['string', 'max:100'],
        ]);

        $user = User::create([
            'username' => $validated['username'],
            'password' => Hash::make($validated['password']),
            'name' => $validated['name'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'email' => $validated['email'] ?? null,
            'postcode' => $validated['postcode'] ?? null,
            'address_default' => $validated['address_default'] ?? null,
            'address_detail' => $validated['address_detail'] ?? null,
            'role' => 'USER', // 기본값으로 USER 설정
        ]);

        return redirect()->route('register.success')->with('success', '회원가입이 완료되었습니다.');
    }

    /**
     * 회원가입 성공 페이지
     */
    public function success()
    {
        return view('auth.register-success');
    }

    /**
     * 아이디 중복 확인 API
     */
    public function checkUsername(Request $request)
    {
        $username = $request->input('username');
        
        if (empty($username)) {
            return response()->json([
                'available' => false,
                'message' => '아이디를 입력해주세요.'
            ]);
        }

        if (strlen($username) < 5) {
            return response()->json([
                'available' => false,
                'message' => '아이디는 5자 이상이어야 합니다.'
            ]);
        }

        $exists = User::where('username', $username)->exists();

        return response()->json([
            'available' => !$exists,
            'message' => $exists ? '이미 사용 중인 아이디입니다.' : '사용 가능한 아이디입니다.'
        ]);
    }
}
