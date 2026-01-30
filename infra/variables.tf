# ============================================
# workspace-egov Terraform 변수 (NCP)
# ============================================

variable "ncloud_access_key" {
  description = "NCP Access Key (NCP 콘솔 > 마이페이지 > 계정관리 > 인증키관리)"
  type        = string
  sensitive   = true
}

variable "ncloud_secret_key" {
  description = "NCP Secret Key (NCP 콘솔 > 마이페이지 > 계정관리 > 인증키관리)"
  type        = string
  sensitive   = true
}

variable "ncloud_region" {
  description = "NCP 리전"
  type        = string
  default     = "KR"  # 한국 리전
}

variable "ncloud_site" {
  description = "NCP 사이트 (public=민간, gov=공공, fin=금융)"
  type        = string
  default     = "public"
}

variable "project_name" {
  description = "프로젝트/리소스 이름"
  type        = string
  default     = "workspace-egov"
}

variable "vpc_no" {
  description = "VPC 번호 (비우면 기본 VPC 사용)"
  type        = string
  default     = ""
}

variable "subnet_no" {
  description = "서브넷 번호 (비우면 기본 VPC의 첫 번째 퍼블릭 서브넷 사용)"
  type        = string
  default     = ""
}

variable "server_image_product_code" {
  description = "서버 이미지 제품 코드 (OS). NCP 콘솔에서 확인 필요"
  type        = string
  # 예시: Ubuntu 22.04 = "SW.VSVR.OS.LNX64.Ubuntu.Ubuntu.22.04.B050"
  # NCP 콘솔 > 서버 > 서버 생성 > 이미지 선택 후 제품 코드 확인
}

variable "server_product_code" {
  description = "서버 제품 코드 (스펙). NCP 콘솔에서 확인 필요"
  type        = string
  # 예시: 2vCPU 4GB = "SVR.VSVR.HICPU.C002.M004.NET.SSD.B050.G002"
  # NCP 콘솔 > 서버 > 서버 생성 > 스펙 선택 후 제품 코드 확인
}

variable "login_key_name" {
  description = "로그인 키 이름 (NCP 콘솔 > 서버 > 로그인 키 관리에서 생성)"
  type        = string
}

variable "ssh_allowed_cidrs" {
  description = "SSH 허용 IP (보안상 본인 IP만 권장)"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "assign_public_ip" {
  description = "공인 IP 할당 여부 (고정 IP 필요 시 true)"
  type        = bool
  default     = true
}

variable "init_script_no" {
  description = "초기화 스크립트 번호 (선택사항, NCP 콘솔에서 생성 후 번호 입력)"
  type        = string
  default     = ""
}
