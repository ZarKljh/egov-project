"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import springBootAxios from "@/lib/springboot-axios";
import { AxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpDown, Search } from "lucide-react";

interface Complaint {
  articleId: number;
  title: string;
  username: string;
  createdAt: string;
  status: "REGISTER" | "ANSWERED" | "HOLD" | "DELETE";
}

export default function ComplaintsPage() {
  const router = useRouter();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [filteredComplaints, setFilteredComplaints] = useState<Complaint[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("REGISTER");
  const [dateFilter, setDateFilter] = useState<string>("ALL");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCnt, setTotalCnt] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 권한 체크
    const userRole = Cookies.get("user_role");
    if (userRole !== "ADMIN") {
      alert("접근 권한이 없습니다.");
      router.push("/admin");
      return;
    }

    // 데이터 로드
    loadComplaints();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, statusFilter, currentPage, dateFilter, sortOrder]); // 필터 및 페이지 변경 시 재조회

  const loadComplaints = async () => {
    try {
      setLoading(true);

      // API 파라미터 구성
      const params: any = {
        page: currentPage,
        size: 20, // 페이지당 20개
      };

      // 상태 필터
      if (statusFilter !== "ALL") {
        params.status = statusFilter;
      }

      // 날짜 필터
      if (dateFilter !== "ALL") {
        params.dateFilter = dateFilter;
      }

      // 정렬
      if (sortOrder) {
        params.sortOrder = sortOrder;
      }

      // 검색어 (제목 검색)
      if (searchQuery) {
        params.searchKeyword = searchQuery;
        params.searchCondition = 0; // 0=제목, 1=내용, 2=작성자
      }

      const response = await springBootAxios.get<any>("/api/complaints", {
        params,
      });

      // Spring Boot 응답 형식: { list: [...], totalCnt: number, page: number, size: number }
      const data = (response.data?.list || []) as any[];
      const total = response.data?.totalCnt || 0;

      // 데이터 매핑 (Spring Boot 응답 형식에 맞게)
      const mappedData: Complaint[] = data.map((item: any) => ({
        articleId: item.article_id || item.articleId,
        title: item.title || "",
        username: item.username || "",
        createdAt: item.created_at || item.createdAt,
        status: item.status || "REGISTER",
      }));

      setComplaints(mappedData);
      setFilteredComplaints(mappedData);
      setTotalCnt(total);
    } catch (error: unknown) {
      console.error("민원 목록 로드 실패:", error);

      // AxiosError 타입 가드
      const axiosError = error as AxiosError<any>;
      const requestConfig = axiosError.config as any;
      console.error("에러 상세:", {
        message: axiosError.message,
        response: axiosError.response?.data as any,
        status: axiosError.response?.status,
        url: requestConfig?.url as string | undefined,
        baseURL: requestConfig?.baseURL as string | undefined,
      });

      if (axiosError.response?.status === 403) {
        alert("접근 권한이 없습니다.");
        router.push("/admin");
      } else if (axiosError.response?.status === 401) {
        alert("인증이 필요합니다. 로그인해주세요.");
        router.push("/login");
      } else if (
        (axiosError as any).code === "ECONNREFUSED" ||
        axiosError.message?.includes("Network Error")
      ) {
        alert(
          "Spring Boot 서버에 연결할 수 없습니다.\n서버가 실행 중인지 확인해주세요.\n(예상 URL: http://localhost:8080)",
        );
      } else if (axiosError.response?.status === 404) {
        alert(
          "API 엔드포인트를 찾을 수 없습니다.\nSpring Boot 서버의 web.xml에 /api/* 매핑이 추가되었는지 확인해주세요.",
        );
      } else {
        const errorMsg =
          (axiosError.response?.data as any)?.error ||
          axiosError.message ||
          "알 수 없는 오류";
        alert(`민원 목록을 불러오는데 실패했습니다.\n${errorMsg}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 서버 사이드에서 모든 필터링이 처리되므로 클라이언트 사이드 필터링 제거
    // 검색어도 백엔드로 전송하므로 클라이언트에서 다시 필터링할 필요 없음
    setFilteredComplaints(complaints);
  }, [complaints]);

  const getStatusBadge = (status: string) => {
    const styles = {
      REGISTER: "bg-blue-100 text-blue-800",
      ANSWERED: "bg-green-100 text-green-800",
      HOLD: "bg-yellow-100 text-yellow-800",
      DELETE: "bg-gray-100 text-gray-800",
    };
    const labels = {
      REGISTER: "접수",
      ANSWERED: "답변완료",
      HOLD: "보류",
      DELETE: "삭제",
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          styles[status as keyof typeof styles] || "bg-gray-100 text-gray-800"
        }`}
      >
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003366] mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">민원문의처리</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>필터 및 검색</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 검색창 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="제목 또는 작성자로 검색..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // 검색어 변경 시 1페이지로 리셋
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setCurrentPage(1); // Enter 키 입력 시 1페이지로 리셋
                }
              }}
              className="pl-10"
            />
          </div>

          <div className="flex gap-4 flex-wrap">
            {/* 상태 필터 */}
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value);
                setCurrentPage(1); // 필터 변경 시 1페이지로 리셋
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="상태 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">전체</SelectItem>
                <SelectItem value="REGISTER">접수</SelectItem>
                <SelectItem value="ANSWERED">답변완료</SelectItem>
                <SelectItem value="REQUERY">재문의</SelectItem>
                <SelectItem value="HOLD">보류</SelectItem>
              </SelectContent>
            </Select>

            {/* 날짜 필터 */}
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="기간 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">전체</SelectItem>
                <SelectItem value="TODAY">오늘</SelectItem>
                <SelectItem value="WEEK">최근 1주일</SelectItem>
                <SelectItem value="MONTH">이번 달</SelectItem>
              </SelectContent>
            </Select>

            {/* 정렬 버튼 */}
            <Button
              variant="outline"
              onClick={() => {
                setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                setCurrentPage(1); // 필터 변경 시 1페이지로 리셋
              }}
            >
              <ArrowUpDown className="h-4 w-4 mr-2" />
              작성일 {sortOrder === "asc" ? "↑" : "↓"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>민원 목록 ({totalCnt}건)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">ID</TableHead>
                <TableHead>제목</TableHead>
                <TableHead className="w-[120px]">작성자</TableHead>
                <TableHead className="w-[180px]">작성일</TableHead>
                <TableHead className="w-[100px]">상태</TableHead>
                <TableHead className="w-[100px]">처리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredComplaints.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    조회된 민원이 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                filteredComplaints.map((complaint) => (
                  <TableRow key={complaint.articleId}>
                    <TableCell>{complaint.articleId}</TableCell>
                    <TableCell className="font-medium">
                      {complaint.title}
                    </TableCell>
                    <TableCell>{complaint.username}</TableCell>
                    <TableCell>{formatDate(complaint.createdAt)}</TableCell>
                    <TableCell>{getStatusBadge(complaint.status)}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() =>
                          router.push(
                            `/admin/complaints/${complaint.articleId}`,
                          )
                        }
                      >
                        처리
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
