"use client";

import { useEffect, useState, createContext, useContext } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Users,
  Settings,
  BarChart3,
  Home,
  LogOut,
  FileText,
  ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type MenuType = "dashboard" | "users" | "settings" | "statistics";

/** true로 변경 시 대시보드/사용자관리/시스템설정/통계 및 리포트 메뉴가 사이드바에 표시됨 */
const SHOW_EXTRA_MENUS = false;

// JWT 토큰 구조 정의
interface AuthToken {
  role: 'ADMIN' | 'USER';
  sub: string;
  exp: number; // 만료 시간 (Unix timestamp)
  iat: number; // 발급 시간 (Unix timestamp)
}

// 메뉴 상태를 공유하는 Context
const MenuContext = createContext<{
  activeMenu: MenuType;
  setActiveMenu: (menu: MenuType) => void;
} | null>(null);

export const useMenuContext = () => {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error("useMenuContext must be used within AdminLayout");
  }
  return context;
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState<MenuType>("dashboard");
  const userRole = Cookies.get("user_role");
  const boardUrl = process.env.NEXT_PUBLIC_EGOV_BOARD_URL;

  useEffect(() => {
    const token = Cookies.get("auth_token");
    const role = Cookies.get("user_role");

    // 인증 체크
    if (!token) {
      const loginUrl = process.env.NEXT_PUBLIC_LOGIN_URL || "/login";
      router.push(loginUrl);
      return;
    }

    // 토큰 만료 체크
    try {
      const decoded = jwtDecode<AuthToken>(token);
      const currentTime = Math.floor(Date.now() / 1000); // Unix timestamp (초 단위)
      
      if (decoded.exp && decoded.exp < currentTime) {
        // 토큰이 만료된 경우
        console.warn("토큰이 만료되었습니다.");
        Cookies.remove("auth_token");
        Cookies.remove("refresh_token");
        Cookies.remove("user_role");
        const loginUrl = process.env.NEXT_PUBLIC_LOGIN_URL || "/login";
        router.push(loginUrl);
        return;
      }

      // 권한 체크 - ADMIN만 접근 가능
      if (decoded.role !== "ADMIN" || role !== "ADMIN") {
        alert("관리자만 접근할 수 있습니다.");
        router.push("/");
        return;
      }

      // 권한 확인 완료
      setIsAuthorized(true);
      setIsLoading(false);
    } catch (error) {
      // 토큰 디코딩 실패
      console.error("토큰 해독 실패:", error);
      Cookies.remove("auth_token");
      Cookies.remove("refresh_token");
      Cookies.remove("user_role");
      const loginUrl = process.env.NEXT_PUBLIC_LOGIN_URL || "/login";
      router.push(loginUrl);
    }
  }, [router, pathname]);

  const handleLogout = () => {
    Cookies.remove("auth_token");
    Cookies.remove("refresh_token");
    Cookies.remove("user_role");
    const loginUrl = process.env.NEXT_PUBLIC_LOGIN_URL || "/login";
    router.push(loginUrl);
  };

  // 로딩 중이거나 권한이 없으면 아무것도 표시하지 않음
  if (isLoading || !isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003366] mx-auto"></div>
          <p className="mt-4 text-gray-600">권한을 확인하는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <MenuContext.Provider value={{ activeMenu, setActiveMenu }}>
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <Sidebar collapsible="icon" className="border-r">
            <SidebarHeader className="border-b">
              <div className="flex items-center gap-2 px-2 py-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#003366] text-white font-bold">
                  A
                </div>
                <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                  <span className="text-sm font-semibold text-[#003366]">관리자 시스템</span>
                  <span className="text-xs text-muted-foreground">Admin Portal</span>
                </div>
              </div>
            </SidebarHeader>
            
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>메인 메뉴</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {SHOW_EXTRA_MENUS && (
                      <>
                        <SidebarMenuItem>
                          <SidebarMenuButton
                            asChild
                            isActive={activeMenu === "dashboard"}
                          >
                            <a 
                              href="#" 
                              onClick={(e) => {
                                e.preventDefault();
                                setActiveMenu("dashboard");
                              }}
                            >
                              <Home className="h-4 w-4" />
                              <span>대시보드</span>
                            </a>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                          <SidebarMenuButton
                            asChild
                            isActive={activeMenu === "users"}
                          >
                            <a 
                              href="#" 
                              onClick={(e) => {
                                e.preventDefault();
                                setActiveMenu("users");
                              }}
                            >
                              <Users className="h-4 w-4" />
                              <span>사용자 관리</span>
                            </a>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                          <SidebarMenuButton
                            asChild
                            isActive={activeMenu === "settings"}
                          >
                            <a 
                              href="#" 
                              onClick={(e) => {
                                e.preventDefault();
                                setActiveMenu("settings");
                              }}
                            >
                              <Settings className="h-4 w-4" />
                              <span>시스템 설정</span>
                            </a>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                          <SidebarMenuButton
                            asChild
                            isActive={activeMenu === "statistics"}
                          >
                            <a 
                              href="#" 
                              onClick={(e) => {
                                e.preventDefault();
                                setActiveMenu("statistics");
                              }}
                            >
                              <BarChart3 className="h-4 w-4" />
                              <span>통계 및 리포트</span>
                            </a>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      </>
                    )}
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === "/admin/complaints" || pathname?.startsWith("/admin/complaints/")}
                      >
                        <Link href="/admin/complaints">
                          <ClipboardList className="h-4 w-4" />
                          <span>민원문의처리</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
              
              {/* 민원문의 게시판 링크 */}
              {boardUrl && (
                <SidebarGroup>
                  <SidebarGroupLabel>외부 링크</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                          <a href={boardUrl} target="_blank" rel="noopener noreferrer">
                            <FileText className="h-4 w-4" />
                            <span>민원문의 게시판</span>
                          </a>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              )}
            </SidebarContent>

            <SidebarFooter className="border-t">
              <SidebarMenu>
                <SidebarMenuItem>
                  <div className="px-2 py-2 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
                    <div className="font-semibold">관리자</div>
                    <div className="text-xs">{userRole || "ADMIN"}</div>
                  </div>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <button onClick={handleLogout} className="w-full">
                      <LogOut className="h-4 w-4" />
                      <span>로그아웃</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
            
            <SidebarRail />
          </Sidebar>

          <SidebarInset className="flex-1">
            <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
              <SidebarTrigger className="-ml-1" />
              <div className="flex-1" />
            </header>
            
            <main className="flex-1 overflow-auto p-6 bg-slate-50">
              {children}
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </MenuContext.Provider>
  );
}
