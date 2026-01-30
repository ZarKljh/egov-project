"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react"; // 성공 아이콘
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function RegisterSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-md border-slate-200 shadow-xl text-center">
        <CardHeader className="pt-10">
          {/* 성공을 상징하는 녹색 체크 아이콘 */}
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-16 w-16 text-emerald-500 animate-in zoom-in duration-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">
            회원가입이 완료되었습니다
          </CardTitle>
          <CardDescription className="text-base pt-2">
            시스템의 회원이 되신 것을 진심으로 환영합니다. <br />
            이제 로그인을 통해 모든 서비스를 이용하실 수 있습니다.
          </CardDescription>
        </CardHeader>

        <CardContent className="pb-8">
          <div className="bg-slate-100 rounded-lg p-4 text-sm text-slate-600">
            <p>등록하신 아이디로 접속이 가능하며,</p>
            <p>보안을 위해 비밀번호 관리에 유의해 주시기 바랍니다.</p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pb-10">
          {/* 로그인 화면으로 이동하는 메인 버튼 */}
          <Button asChild className="w-full bg-[#003366] hover:bg-[#002244] py-6 text-lg">
            <Link href="/login">로그인 화면으로 이동하기</Link>
          </Button>
          
          {/* 메인 페이지 이동 링크 */}
          <Link 
            href="/" 
            className="text-sm text-slate-500 hover:text-slate-900 transition-colors underline-offset-4 hover:underline"
          >
            홈으로 돌아가기
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
