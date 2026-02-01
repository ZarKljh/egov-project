"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMenuContext } from "./layout";
import Cookies from "js-cookie";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Users, Settings, BarChart3, Home } from "lucide-react";

// 각 메뉴별 컨텐츠 컴포넌트
function DashboardContent() {
  const userRole = Cookies.get("user_role");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#003366]">대시보드</h1>
        <p className="text-muted-foreground mt-2">시스템 현황 및 주요 정보를 확인하세요.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">총 사용자</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">+12% 지난달 대비</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">활성 사용자</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">856</div>
            <p className="text-xs text-muted-foreground">+8% 지난달 대비</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">시스템 상태</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">정상</div>
            <p className="text-xs text-muted-foreground">모든 시스템 운영 중</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>현재 사용자 정보</CardTitle>
          <CardDescription>로그인한 관리자 정보</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm">
              <span className="font-semibold">권한:</span> {userRole || "없음"}
            </p>
            <p className="text-xs text-muted-foreground">
              관리자 권한으로 로그인되어 있습니다.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function UsersContent() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#003366]">사용자 관리</h1>
        <p className="text-muted-foreground mt-2">회원 정보 조회 및 관리</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>사용자 목록</CardTitle>
          <CardDescription>시스템에 등록된 모든 사용자를 관리합니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">사용자 목록 조회</p>
                <p className="text-sm text-muted-foreground">전체 사용자 정보 확인</p>
              </div>
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">권한 변경</p>
                <p className="text-sm text-muted-foreground">사용자 권한 수정 및 관리</p>
              </div>
              <Settings className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">계정 관리</p>
                <p className="text-sm text-muted-foreground">계정 활성화/비활성화 처리</p>
              </div>
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SettingsContent() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#003366]">시스템 설정</h1>
        <p className="text-muted-foreground mt-2">시스템 전반의 설정을 관리합니다.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>환경 설정</CardTitle>
            <CardDescription>시스템 환경 변수 및 기본 설정</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              서버 환경, 데이터베이스 연결, API 설정 등을 관리합니다.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>알림 설정</CardTitle>
            <CardDescription>시스템 알림 및 알림 방식 설정</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              이메일, SMS 등 알림 채널 및 알림 규칙을 설정합니다.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>보안 설정</CardTitle>
            <CardDescription>시스템 보안 및 인증 설정</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              비밀번호 정책, 세션 관리, 접근 제어 등을 설정합니다.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>백업 설정</CardTitle>
            <CardDescription>데이터 백업 및 복구 설정</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              자동 백업 스케줄 및 백업 보관 정책을 설정합니다.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatisticsContent() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#003366]">통계 및 리포트</h1>
        <p className="text-muted-foreground mt-2">시스템 사용 통계 및 리포트를 확인합니다.</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>사용자 활동 통계</CardTitle>
            <CardDescription>일별/월별 사용자 활동 분석</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">오늘 방문자</span>
                <span className="font-semibold">234명</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">이번 주 방문자</span>
                <span className="font-semibold">1,456명</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">이번 달 방문자</span>
                <span className="font-semibold">5,678명</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>접속 로그</CardTitle>
            <CardDescription>시스템 접속 기록 및 로그 관리</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              사용자 접속 기록, 로그인 이력, API 호출 로그를 확인할 수 있습니다.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>리포트 생성</CardTitle>
            <CardDescription>사용자 지정 리포트 생성 및 다운로드</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              기간별, 항목별 리포트를 생성하고 Excel, PDF 형식으로 다운로드할 수 있습니다.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const { activeMenu } = useMenuContext();

  // /admin 접속 시 대시보드 미구현이므로 민원문의처리로 리다이렉트
  useEffect(() => {
    router.replace("/admin/complaints");
  }, [router]);

  const renderContent = () => {
    switch (activeMenu) {
      case "dashboard":
        return <DashboardContent />;
      case "users":
        return <UsersContent />;
      case "settings":
        return <SettingsContent />;
      case "statistics":
        return <StatisticsContent />;
      default:
        return <DashboardContent />;
    }
  };

  return null; // 리다이렉트 중이므로 화면 미표시
}
