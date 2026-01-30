"use client";

import { useState } from "react";
import MoveInReport from "@/components/forms/MoveInReport";
import { MoveInReportData } from "@/types/forms/moveInReport.types";

export default function TestFormPage() {
  const [formData, setFormData] = useState<MoveInReportData>({
    name: "",
    residentNumber: "",
    phone: "",
    currentAddress: "",
    moveInReason: "",
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        padding: "20px",
      }}
    >
      <div style={{ maxWidth: "794px", margin: "0 auto" }}>
        <div
          style={{
            backgroundColor: "white",
            padding: "16px",
            marginBottom: "16px",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <h1
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              marginBottom: "8px",
            }}
          >
            전입신고서 테스트 페이지
          </h1>
          <p style={{ color: "#666", marginBottom: "8px" }}>
            이 페이지는 전입신고서 컴포넌트를 테스트하기 위한 임시 페이지입니다.
            PDF와 비교하여 레이아웃을 확인하세요.
          </p>
          <p style={{ fontSize: "12px", color: "#999" }}>
            접속 URL:{" "}
            <code
              style={{
                backgroundColor: "#f0f0f0",
                padding: "2px 6px",
                borderRadius: "4px",
              }}
            >
              http://localhost:3000/test-form
            </code>
          </p>
        </div>

        <div
          style={{
            backgroundColor: "white",
            padding: "0",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            overflow: "hidden",
          }}
        >
          <MoveInReport formData={formData} setFormData={setFormData} />
        </div>
      </div>
    </div>
  );
}
