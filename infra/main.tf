# ============================================
# workspace-egov NCP 인프라 (Terraform)
# ============================================
# - 서버 1대 (Next.js, Laravel, Spring Boot, NPM, Postgres Docker 배포용)
# - NCP 가입 후: Access Key/Secret Key 발급 → terraform.tfvars 에 입력 → terraform apply
# ============================================

terraform {
  required_version = ">= 1.0"

  required_providers {
    ncloud = {
      source  = "NaverCloudPlatform/ncloud"
      version = "~> 3.0"
    }
  }
}

provider "ncloud" {
  access_key  = var.ncloud_access_key
  secret_key  = var.ncloud_secret_key
  region      = var.ncloud_region
  site        = var.ncloud_site
  support_vpc = true  # VPC 사용 (필수)
}

# --------------------------------------------
# VPC (기본 VPC 사용 시)
# --------------------------------------------
data "ncloud_vpc" "default" {
  count = var.vpc_no == "" ? 1 : 0
  name  = "Default-VPC"
}

# --------------------------------------------
# 서브넷 (기본 서브넷 사용 시)
# --------------------------------------------
data "ncloud_subnets" "default" {
  count  = var.subnet_no == "" ? 1 : 0
  vpc_no = var.vpc_no != "" ? var.vpc_no : data.ncloud_vpc.default[0].vpc_no
  
  filter {
    name   = "subnet_type"
    values = ["PUBLIC"]  # 퍼블릭 서브넷
  }
}

locals {
  vpc_no    = var.vpc_no != "" ? var.vpc_no : (length(data.ncloud_vpc.default) > 0 ? data.ncloud_vpc.default[0].vpc_no : "")
  subnet_no = var.subnet_no != "" ? var.subnet_no : (length(data.ncloud_subnets.default) > 0 ? tolist(data.ncloud_subnets.default[0].ids)[0] : "")
}

# --------------------------------------------
# ACG (Access Control Group = 보안그룹)
# --------------------------------------------
resource "ncloud_access_control_group" "egov_acg" {
  name   = "${var.project_name}-acg"
  vpc_no = local.vpc_no
}

# ACG Rule: SSH
resource "ncloud_access_control_group_rule" "egov_acg_ssh" {
  access_control_group_no = ncloud_access_control_group.egov_acg.id
  
  inbound {
    protocol    = "TCP"
    ip_block    = length(var.ssh_allowed_cidrs) > 0 ? var.ssh_allowed_cidrs[0] : "0.0.0.0/0"
    port_range  = "22"
    description = "SSH"
  }
}

# ACG Rule: HTTP
resource "ncloud_access_control_group_rule" "egov_acg_http" {
  access_control_group_no = ncloud_access_control_group.egov_acg.id
  
  inbound {
    protocol    = "TCP"
    ip_block    = "0.0.0.0/0"
    port_range  = "80"
    description = "HTTP"
  }
}

# ACG Rule: HTTPS
resource "ncloud_access_control_group_rule" "egov_acg_https" {
  access_control_group_no = ncloud_access_control_group.egov_acg.id
  
  inbound {
    protocol    = "TCP"
    ip_block    = "0.0.0.0/0"
    port_range  = "443"
    description = "HTTPS"
  }
}

# ACG Rule: NPM Admin UI
resource "ncloud_access_control_group_rule" "egov_acg_npm" {
  access_control_group_no = ncloud_access_control_group.egov_acg.id
  
  inbound {
    protocol    = "TCP"
    ip_block    = "0.0.0.0/0"
    port_range  = "81"
    description = "Nginx Proxy Manager Admin"
  }
}

# ACG Rule: Egress (모든 아웃바운드 허용)
resource "ncloud_access_control_group_rule" "egov_acg_egress" {
  access_control_group_no = ncloud_access_control_group.egov_acg.id
  
  outbound {
    protocol    = "TCP"
    ip_block    = "0.0.0.0/0"
    port_range  = "1-65535"
    description = "All outbound"
  }
}

# --------------------------------------------
# 서버 인스턴스
# --------------------------------------------
resource "ncloud_server" "egov" {
  name                      = var.project_name
  server_image_product_code = var.server_image_product_code  # OS 이미지 코드
  server_product_code       = var.server_product_code        # 서버 스펙 코드
  subnet_no                 = local.subnet_no
  login_key_name            = var.login_key_name
  access_control_group_no_list = [ncloud_access_control_group.egov_acg.id]
  
  # 초기화 스크립트 (선택사항)
  init_script_no = var.init_script_no != "" ? var.init_script_no : null
}

# --------------------------------------------
# 공인 IP (고정 IP)
# --------------------------------------------
resource "ncloud_public_ip" "egov" {
  count       = var.assign_public_ip ? 1 : 0
  server_no   = ncloud_server.egov.id
  description = "${var.project_name} public IP"
}
