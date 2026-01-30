export interface MoveInReportData {
  // 기본 정보
  name: string;
  residentNumber: string;
  phone: string;

  // 신고일
  reportYear?: string;
  reportMonth?: string;
  reportDay?: string;

  // 전에 살던 곳
  previousSido?: string;
  previousSigungu?: string;

  // 현재 사는 곳
  householdHeadName?: string;
  householdHeadPhone?: string;
  currentAddress: string;
  currentPostcode?: string;

  // 전입 사유
  moveInReason: string;
  otherReason?: string;

  // 우편물 전입지 전송 서비스
  mailForwardingNames?: string;
  mailForwardingPhone1?: string;
  mailForwardingPhone2?: string;
  mailForwardingPhone3?: string;
  mailForwardingMobile1?: string;
  mailForwardingMobile2?: string;
  mailForwardingMobile3?: string;
  mailForwardingAgree?: boolean;
}
