"use client";

import { useEffect } from "react";
import Link from "next/link";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { FORM_REGISTRY } from "@/lib/forms/formRegistry";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

export default function FormsPage() {
  const router = useRouter();

  // RBAC: 로그인 사용자만 서식 목록 접근
  useEffect(() => {
    const token = Cookies.get("auth_token");
    const role = Cookies.get("user_role");
    if (!token || !role) {
      router.replace("/login");
      return;
    }
    if (role !== "USER" && role !== "ADMIN") {
      router.replace("/");
      return;
    }
  }, [router]);

  const formIds = Object.keys(FORM_REGISTRY);

  return (
    <div className="min-h-screen bg-[#f5f5f5] py-8">
      <div className="mx-auto max-w-2xl px-4">
        <h1 className="mb-2 text-2xl font-bold text-[#003366]">민원 서식</h1>
        <p className="mb-6 text-muted-foreground">
          필요한 서식을 선택하여 작성 후 인쇄할 수 있습니다.
        </p>

        <ul className="space-y-3">
          {formIds.map((id) => {
            const entry = FORM_REGISTRY[id];
            if (!entry) return null;
            return (
              <li key={id}>
                <Link
                  href={`/forms/${id}`}
                  className="flex items-center gap-4 rounded-lg border bg-white p-4 shadow-sm transition hover:border-[#003366] hover:bg-slate-50"
                >
                  <FileText className="h-8 w-8 shrink-0 text-[#003366]" />
                  <div className="min-w-0 flex-1">
                    <span className="font-medium text-slate-900">
                      {entry.formName}
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <span>작성하기</span>
                  </Button>
                </Link>
              </li>
            );
          })}
        </ul>

        {formIds.length === 0 && (
          <p className="rounded-lg border bg-white p-6 text-center text-muted-foreground">
            등록된 서식이 없습니다.
          </p>
        )}
      </div>
    </div>
  );
}
