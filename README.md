# BNCT 안전서류 관리자 페이지

자산관리팀용 이력 조회 대시보드.

## 기능

- 📊 대시보드 (KPI: 이번 달 제출 / 진행중 / 완료 / 평균 결재 시간)
- 📋 제출 이력 목록 (필터: 상태, 업체명, 날짜)
- 🔍 상세 페이지 (작성 정보 + 결재 타임라인 + 서명 이미지 + PDF 재생성 다운로드)
- 🔄 액션: 결재 링크 재발송 / 만료 연장 / 삭제

## 인증

매 페이지 접근 시 비밀번호 입력 (환경변수 `ADMIN_PASSWORD`)

## 로컬 실행

```bash
npm install
cp .env.local.example .env.local
# .env.local 편집해서 실제 값 입력
npm run dev
```

http://localhost:3000

## Vercel 배포

1. GitHub에 이 코드 push
2. Vercel에서 새 프로젝트 → 이 레포 import
3. 환경변수 설정 (.env.local.example 참고)
4. Deploy

## 환경변수

| 변수 | 설명 |
|---|---|
| `SUPABASE_URL` | 기존 BNCT- 와 동일 |
| `SUPABASE_ANON_KEY` | 기존 BNCT- 와 동일 |
| `ADMIN_PASSWORD` | 관리자 페이지 접속 비밀번호 |
| `SAFETY_BASE_URL` | 결재 시스템 도메인 (재발송용) |
| `GMAIL_USER` | 이메일 재발송용 |
| `GMAIL_APP_PASSWORD` | Gmail 앱 비밀번호 |
| `APPROVER_NAME` | 승인담당자 이름 (이병문) |
| `APPROVER_EMAIL` | 승인담당자 이메일 |
| `CC_EMAIL` | 참조 이메일 (박형진) |
