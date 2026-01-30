"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import axiosInstance from "@/lib/axios";
import { getFormEntry, type FormUser } from "@/lib/forms/formRegistry";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

export default function FormByFormIdPage() {
  const params = useParams();
  const router = useRouter();
  const formId = typeof params.formId === "string" ? params.formId : "";

  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const entry = formId ? getFormEntry(formId) : undefined;

  // RBAC: 로그인 사용자만 서식 접근 (USER, ADMIN)
  const checkAuth = useCallback(() => {
    const token = Cookies.get("auth_token");
    const role = Cookies.get("user_role");
    if (!token || !role) {
      router.replace("/login");
      return false;
    }
    if (role !== "USER" && role !== "ADMIN") {
      setError("서식 이용 권한이 없습니다.");
      return false;
    }
    return true;
  }, [router]);

  // 사용자 정보 조회 후 서식 초기값 병합
  useEffect(() => {
    if (!formId || !entry) {
      setLoading(false);
      if (formId && !entry) setError("해당 서식을 찾을 수 없습니다.");
      return;
    }
    if (!checkAuth()) {
      setLoading(false);
      return;
    }

    let merged = { ...entry.getDefaultFormData() };

    axiosInstance
      .get<{ status: string; data?: { user?: FormUser } }>("/auth/me")
      .then((res) => {
        const user = res.data?.data?.user;
        if (user && entry.mapUserToFormData) {
          merged = { ...merged, ...entry.mapUserToFormData(user) };
        }
        setFormData(merged);
      })
      .catch(() => {
        // 로그인 만료 등: 기본값만 사용
        setFormData(merged);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [formId, entry, checkAuth]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-[#003366]" />
          <p className="mt-4 text-gray-600">서식 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !entry) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">
            {error || "해당 서식을 찾을 수 없습니다."}
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push("/forms")}
          >
            서식 목록으로
          </Button>
        </div>
      </div>
    );
  }

  const FormComponent = entry.Component;

  return (
    <div className="min-h-screen bg-[#f5f5f5] py-6 print:bg-white print:py-0">
      <div className="mx-auto max-w-[794px] px-4">
        {/* 상단 액션: 인쇄 (화면에서만 표시) */}
        <div className="no-print mb-4 flex items-center justify-between rounded-lg bg-white p-4 shadow-sm">
          <h1 className="text-lg font-bold text-[#003366]">{entry.formName}</h1>
          <Button
            type="button"
            onClick={handlePrint}
            className="gap-2 print:hidden"
          >
            <Printer className="h-4 w-4" />
            인쇄
          </Button>
        </div>

        {/* 서식 영역 */}
        <div className="overflow-hidden rounded-lg bg-white shadow-sm print:shadow-none">
          <FormComponent
            formData={formData}
            setFormData={(data: unknown) =>
              setFormData(
                typeof data === "object" && data !== null
                  ? (data as Record<string, unknown>)
                  : {},
              )
            }
          />
        </div>
      </div>
    </div>
  );
}
