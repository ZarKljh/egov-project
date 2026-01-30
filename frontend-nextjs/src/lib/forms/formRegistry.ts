/**
 * 민원 서식 레지스트리 (옵션 3: 하이브리드)
 * - formId(DB)와 React 서식 컴포넌트 매핑
 * - 새 서식 추가 시 여기에 한 줄 등록
 */

import React from "react";
import dynamic from "next/dynamic";

/** Laravel /auth/me 응답의 user 객체 타입 */
export interface FormUser {
  user_id: number;
  username: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  postcode: string | null;
  address_default: string | null;
  address_detail: string | null;
  role: string;
}

/** 레지스트리 항목: formId별 컴포넌트 + 메타 + 사용자 데이터 매핑 */
export type FormRegistryEntry = {
  formName: string;
  Component: React.ComponentType<{
    formData: unknown;
    setFormData: (data: unknown) => void;
  }>;
  /** 서식 기본값 (필수 필드 등). 사용자 데이터는 mapUserToFormData로 병합 */
  getDefaultFormData: () => Record<string, unknown>;
  /** Laravel 사용자 정보 → 서식 초기값 매핑 */
  mapUserToFormData?: (user: FormUser) => Record<string, unknown>;
};

const MoveInReport = dynamic(
  () => import("@/components/forms/MoveInReport").then((m) => m.default),
  { ssr: false },
);

function mapUserToMoveInReportData(user: FormUser): Record<string, unknown> {
  const addr = [user.postcode, user.address_default, user.address_detail]
    .filter(Boolean)
    .join(" ");
  return {
    name: user.name ?? "",
    phone: user.phone ?? "",
    currentAddress: addr || "",
    currentPostcode: user.postcode ?? undefined,
  };
}

function getMoveInReportDefault(): Record<string, unknown> {
  return {
    name: "",
    residentNumber: "",
    phone: "",
    currentAddress: "",
    moveInReason: "",
  };
}

/** form_id(문자열) → 레지스트리 항목 (전입신고서 = form_id 1) */
export const FORM_REGISTRY: Record<string, FormRegistryEntry> = {
  "1": {
    formName: "전입신고서",
    Component: MoveInReport as FormRegistryEntry["Component"],
    getDefaultFormData: getMoveInReportDefault,
    mapUserToFormData: mapUserToMoveInReportData,
  },
};

export function getFormEntry(formId: string): FormRegistryEntry | undefined {
  return FORM_REGISTRY[formId];
}

export function getFormIds(): string[] {
  return Object.keys(FORM_REGISTRY);
}
