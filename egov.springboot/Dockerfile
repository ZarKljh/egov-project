# ============================================
# Spring Boot (eGovFrame WAR) - Multi-stage, JRE + Tomcat만으로 이미지 최소화
# ============================================

# Stage 1: Maven 빌드 (Maven 포함 이미지 사용)
FROM maven:3.9-eclipse-temurin-11-alpine AS builder

WORKDIR /build

# pom과 소스만 복사 (캐시 활용)
COPY pom.xml .
RUN mvn dependency:go-offline -B -q || true

COPY src ./src
RUN mvn package -DskipTests -B -q

# Stage 2: Tomcat + WAR만 배치 (JRE 기반으로 용량 최소화)
FROM tomcat:9.0-jre11-temurin-jammy

# 기본 webapps 제거 후 우리 앱만 배치 (선택)
RUN rm -rf /usr/local/tomcat/webapps/*

# 빌드된 WAR 배치 (context path: /springboot)
COPY --from=builder /build/target/springboot-1.0.0.war /usr/local/tomcat/webapps/springboot.war

# Tomcat이 WAR 압축 해제하므로 ROOT 제거 시 springboot/ 로 서비스
# (기본 설정으로 두면 /springboot 로 접근)

EXPOSE 8080
CMD ["catalina.sh", "run"]
