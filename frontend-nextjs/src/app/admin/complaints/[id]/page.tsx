"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Cookies from "js-cookie";
import springBootAxios from "@/lib/springboot-axios";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Trash2 } from "lucide-react";

interface Answer {
  answerId: number;
  content: string;
  createdAt: string;
  adminName: string;
}

interface ComplaintDetail {
  articleId: number;
  title: string;
  content: string;
  username: string;
  createdAt: string;
  status: "REGISTER" | "ANSWERED" | "HOLD" | "DELETE";
  answers: Answer[];
}

export default function ComplaintDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [complaint, setComplaint] = useState<ComplaintDetail | null>(null);
  const [newAnswer, setNewAnswer] = useState("");
  const [formsList, setFormsList] = useState<
    { formId: number; formName: string }[]
  >([]);
  const [selectedFormId, setSelectedFormId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    // 권한 체크
    const userRole = Cookies.get("user_role");
    if (userRole !== "ADMIN") {
      alert("접근 권한이 없습니다.");
      router.push("/admin");
      return;
    }

    if (id) {
      loadComplaintDetail();
      loadFormsList();
    }
  }, [id, router]);

  const loadComplaintDetail = async () => {
    try {
      setLoading(true);

      // Spring Boot API에서 민원 상세 정보 조회
      const response = await springBootAxios.get(`/api/complaints/${id}`);

      // API 응답 형식: { article: SampleVO, answers: AnswerVO[] }
      const article = response.data.article;
      const answers = response.data.answers || [];

      // ComplaintDetail 인터페이스에 맞게 데이터 매핑
      const complaintData: ComplaintDetail = {
        articleId: article.articleId || article.article_id,
        title: article.title || "",
        content: article.content || "",
        username: article.username || "",
        createdAt: article.createdAt || article.created_at,
        status: article.status || "REGISTER",
        answers: answers.map((answer: any) => ({
          answerId: answer.answerId || answer.answer_id,
          content: answer.content || "",
          createdAt: answer.createdAt || answer.created_at,
          adminName: answer.adminName || answer.admin_name || "관리자",
        })),
      };

      setComplaint(complaintData);
    } catch (error: any) {
      console.error("민원 상세 정보 로드 실패:", error);
      if (error.response?.status === 403) {
        alert("접근 권한이 없습니다.");
        router.push("/admin/complaints");
      } else if (error.response?.status === 404) {
        alert("민원을 찾을 수 없습니다.");
        router.push("/admin/complaints");
      } else {
        alert(
          error.response?.data?.error || "민원 정보를 불러오는데 실패했습니다.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const loadFormsList = async () => {
    try {
      const response = await springBootAxios.get("/api/forms");
      const forms = response.data.list || [];
      setFormsList(
        forms.map((form: any) => ({
          formId: form.formId,
          formName: form.formName,
        })),
      );
    } catch (error: any) {
      console.error("서식 목록 로드 실패:", error);
      // 서식 목록 로드 실패해도 답변 작성은 가능하도록 에러만 로그
    }
  };

  const handleProcessComplaint = async () => {
    if (!newAnswer.trim()) {
      alert("답변 내용을 입력해주세요.");
      return;
    }

    try {
      setProcessing(true);
      const body: { content: string; formId?: string } = { content: newAnswer };
      if (selectedFormId?.trim() && !isNaN(Number(selectedFormId))) {
        body.formId = selectedFormId.trim();
      }
      await springBootAxios.post(`/api/complaints/${id}/answer`, body);

      alert("답변이 등록되었습니다.");
      setNewAnswer("");
      setSelectedFormId(""); // 서식 선택 초기화
      loadComplaintDetail(); // 상세 정보 새로고침
    } catch (error: any) {
      console.error("답변 등록 실패:", error);
      if (error.response?.status === 403) {
        alert("접근 권한이 없습니다.");
      } else {
        alert(error.response?.data?.error || "답변 등록에 실패했습니다.");
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleHold = async () => {
    if (!confirm("이 민원을 보류 상태로 변경하시겠습니까?")) {
      return;
    }

    try {
      setProcessing(true);
      await springBootAxios.patch(`/api/complaints/${id}/status`, {
        status: "HOLD",
      });

      alert("보류 상태로 변경되었습니다.");
      loadComplaintDetail(); // 상세 정보 새로고침
    } catch (error: any) {
      console.error("상태 변경 실패:", error);
      if (error.response?.status === 403) {
        alert("접근 권한이 없습니다.");
      } else {
        alert(error.response?.data?.error || "상태 변경에 실패했습니다.");
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("이 민원을 삭제하시겠습니까? (논리 삭제)")) {
      return;
    }

    try {
      setProcessing(true);
      await springBootAxios.delete(`/api/complaints/${id}`);

      alert("삭제되었습니다.");
      router.push("/admin/complaints");
    } catch (error: any) {
      console.error("삭제 실패:", error);
      if (error.response?.status === 403) {
        alert("접근 권한이 없습니다.");
      } else {
        alert(error.response?.data?.error || "삭제에 실패했습니다.");
      }
    } finally {
      setProcessing(false);
    }
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

  if (!complaint) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">민원 정보를 찾을 수 없습니다.</p>
        <Button
          onClick={() => router.push("/admin/complaints")}
          className="mt-4"
        >
          목록으로 돌아가기
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.push("/admin/complaints")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            뒤로가기
          </Button>
          <h1 className="text-3xl font-bold text-slate-900">민원 상세</h1>
        </div>
      </div>

      {/* 민원 상세 정보 */}
      <Card>
        <CardHeader>
          <CardTitle>{complaint.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">작성자: </span>
              <span className="font-medium">{complaint.username}</span>
            </div>
            <div>
              <span className="text-muted-foreground">작성일: </span>
              <span className="font-medium">
                {formatDate(complaint.createdAt)}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">상태: </span>
              <span className="font-medium">{complaint.status}</span>
            </div>
          </div>
          <div className="pt-4 border-t">
            <p className="text-sm whitespace-pre-wrap">{complaint.content}</p>
          </div>
        </CardContent>
      </Card>

      {/* 과거 답변 이력 */}
      {complaint.answers && complaint.answers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>과거 답변 이력</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {complaint.answers.map((answer, index) => (
              <Card
                key={answer.answerId || `answer-${index}`}
                className="bg-slate-50"
              >
                <CardContent className="pt-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-medium">
                      {answer.adminName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(answer.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">
                    {answer.content}
                  </p>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}

      {/* 새 답변 작성 */}
      <Card>
        <CardHeader>
          <CardTitle>새 답변 작성</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="formId">추천 민원서식</Label>
            <Select value={selectedFormId} onValueChange={setSelectedFormId}>
              <SelectTrigger id="formId" className="w-full">
                <SelectValue placeholder="-- 관련 서식이 있을 경우 선택해주세요 --" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=" ">
                  -- 관련 서식이 있을 경우 선택해주세요 --
                </SelectItem>
                {formsList.map((form) => (
                  <SelectItem key={form.formId} value={form.formId.toString()}>
                    {form.formName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="answerContent">답변 내용</Label>
            <Textarea
              id="answerContent"
              placeholder="답변 내용을 입력하세요..."
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              rows={6}
              className="resize-none"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={handleHold}
              disabled={processing}
            >
              보류(HOLD)
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={processing}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              삭제(DELETE)
            </Button>
            <Button
              onClick={handleProcessComplaint}
              disabled={processing || !newAnswer.trim()}
            >
              {processing ? "처리 중..." : "문의처리"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
