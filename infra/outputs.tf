# ============================================
# workspace-egov Terraform 출력 (NCP)
# ============================================

output "server_no" {
  description = "서버 인스턴스 번호"
  value       = ncloud_server.egov.id
}

output "public_ip" {
  description = "공인 IP (공인 IP 할당 시)"
  value       = var.assign_public_ip ? ncloud_public_ip.egov[0].public_ip : ncloud_server.egov.public_ip
}

output "private_ip" {
  description = "사설 IP"
  value       = ncloud_server.egov.private_ip
}

output "ssh_command" {
  description = "SSH 접속 예시"
  value       = "ssh -i <your-key.pem> root@${var.assign_public_ip ? ncloud_public_ip.egov[0].public_ip : ncloud_server.egov.public_ip}"
}

output "acg_id" {
  description = "ACG (보안그룹) 번호"
  value       = ncloud_access_control_group.egov_acg.id
}
