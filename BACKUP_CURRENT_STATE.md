# 현재 프로젝트 상태 백업 (2025-08-10)

## 주요 기능
1. **AI 이력서 분석 시스템**
   - Google Gemini 기반 한국어 자연어 처리
   - 실시간 프리뷰 및 프로필 업데이트
   - 음성 입력 지원

2. **회사 추천 시스템**
   - 9개 업종별 265개 정리된 회사 데이터
   - 우선순위 기반 매칭 알고리즘 (분야>경력>학력>고용형태)
   - 자격증 보너스 시스템

3. **인증 및 사용자 관리**
   - Replit Auth 통합
   - PostgreSQL 세션 저장소
   - 개인/기업 이중 인증 플로우

## API 엔드포인트
- `/api/auth/user` - 사용자 정보
- `/api/individual-profiles/me` - 내 프로필
- `/api/parse-resume` - AI 이력서 분석
- `/api/individual-profiles/ai-resume` - 프로필 업데이트
- `/api/job-categories` - 직종 카테고리
- `/api/user/job-categories` - 사용자 선택 직종
- `/api/recommendations` - 회사 추천
- `/api/jobs/recommended` - 구인공고 추천

## 현재 페이지 구조
- `/` - 대시보드 (로그인 시) / 랜딩 (로그아웃 시)
- `/individual/profile-setup` - 프로필 설정
- `/individual/profile-view` - 프로필 확인 (통합된 "내정보")
- `/individual/job-categories` - 직종 선택
- `/individual/company-recommendations` - 회사 추천
- `/individual/saved-jobs` - 찜한공고

## 데이터베이스 스키마
- users: 사용자 기본 정보
- individual_profiles: 개인 상세 프로필
- sessions: 세션 저장소
- user_job_categories: 사용자 직종 선택
- companies: 회사 정보 (265개)

## 핵심 컴포넌트
- AIResumeWriter: AI 이력서 작성
- JobCategorySelector: 직종 선택
- ResumePreview: 이력서 미리보기
- MobileNav: 하단 네비게이션

모든 기능은 정상 작동하며 데이터 동기화 문제도 해결된 상태입니다.