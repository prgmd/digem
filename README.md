# dig-em.com
음악 칼럼 자동 수집 및 번역 아카이빙 서비스

---

## 실행 (가상환경 설정)
```
git clone https://github.com/prgmd/digem.git
python -m venv venv
source venv/Scripts/activate
pip install -r requirements.txt
```

---

## 📌 프로젝트 개요

**목적:**
- 음악 웹진(Pitchfork 등) 칼럼 자동 수집
- Gemini API를 통한 자동 번역
- 앨범 정보 및 차트 데이터 아카이빙

## 📅 개발 진행 상황
### **2026-02-28 (Day 1)**
#### ✅ 완료
- [x] Supabase 프로젝트 생성 및 DB 스키마 설계
  - albums, artists, genres, articles, lyrics, chart_history 테이블 생성
  - 다대다 관계 설계 (album_artists, album_genres, article_albums 등)
- [x] Upstash Redis 생성 (Seoul region)
- [x] GitHub 레포지토리 생성 및 기본 구조 세팅
- [x] 프로젝트 의존성 설정 (requirements.txt)
- [x] 환경변수 템플릿 작성 (.env.example)
- [x] Pitchfork RSS 크롤러 구현 (v0.1)
  - RSS 피드 파싱 (feedparser)
  - 기사 메타데이터 추출 (제목, 저자, 날짜, 요약, 썸네일)
  - 전문 크롤링 (BeautifulSoup)
  - figcaption 필터링 (사진 캡션 제외)
  - 저작권 문구 이후 컨텐츠 제외

### **2026-03-04 (Day 2)**
#### ✅ 완료
- [x] Gemini 2.5 Flash 번역 모듈 구현
  - 제목 번역 (아티스트명 원문 병기)
  - 본문 번역 (음악 용어 보존)
  - 재시도 로직 (타임아웃 대응)
- [x] Supabase 데이터 저장 로직 구현
  - articles 테이블 INSERT
  - 중복 체크 (source_url 기준)
  - 새 칼럼만 필터링
- [x] 전체 파이프라인 통합 및 테스트
  - RSS 파싱 → 크롤링 → 번역 → DB 저장
  - 3개 칼럼 성공적으로 저장 확인
- [x] 카테고리 필터링 기능 추가
  - Photo Gallery 제외
  - Interview, Afterword 등만 수집
- [x] 파일 구조 개선
  - scripts 폴더 단일화
  - pitchfork_scraper.py, google_translator.py, database_loader.py

#### 🚧 이슈
- [x] 간헐적 Gemini API 타임아웃 (504 에러)
  - 해결 방안: 재시도 로직 강화 필요

#### 📋 다음 단계
- [ ] 재시도 로직 개선 (Exponential Backoff)
- [ ] Cloudflare R2 백업 로직 구현
- [ ] DLQ 패턴 구현 (Upstash Redis)
- [ ] 다른 웹진 크롤러 추가 (Stereogum, Consequence)
- [ ] GitHub Actions 워크플로우 작성

### **2026-03-19 (Day 3)**
#### ✅ 완료
- [x] Next.js 프론트엔드 초기 세팅 (`digem/frontend`)
  - `digem-test` 작업 내용 전체 이식 (로고 이미지 제외)
  - 불필요 코드 제거 (Tailwind 임포트, Geist 폰트, grain 애니메이션, 픽셀 그리드 오버레이 등)
- [x] 디자인 토큰 정립 (globals.css)
  - 색상 4종으로 통일: 옅은 베이지(`#E8D5A0`), 검정(`#000`), 짙은 초록(`#0a3d2e`), 메타(`#8a7a5a`)
  - CSS 커스텀 프로퍼티 (`--text-color`, `--meta-color`, `--border`, `--hover-bg`, `--selected-bg` 등)
- [x] Animated Mesh Gradient 배경 구현
  - `MeshBackground.tsx` 컴포넌트 생성 (blurred div 3개)
  - `requestAnimationFrame` + lerp(0.04)로 마우스 추적 그래디언트 이동
  - `layout.tsx`에 전역 적용
- [x] 페이지 전환 애니메이션 통일
  - 홈 입장: `heroSlideUp`, `heroSlideInLeft`, `heroSlideInRight` 순차 애니메이션
  - 카테고리 페이지 입장: `pageFadeIn 0.4s`, 퇴장: `pageFadeOut 0.35s`
  - 카테고리 간 이동 시 전환 효과 제거 (`sessionStorage` `nofade` 플래그)
- [x] Articles 페이지 리디자인
  - 출처 필터를 드롭다운 단일 선택 방식으로 변경 (All 포함)
  - 햄버거 버튼 → 오른쪽 슬라이드 패널 네비게이션 (`menuSlideInRight/OutRight`)
  - 좌측 사이드바 너비 확장 (`480px`)
- [x] Albums 페이지 신규 생성
  - 지역 / 유형 / 연도 / 월 필터 (select)
  - 앨범 그리드 (`auto-fill minmax(180px, 1fr)`), 카드별 staggered fadeIn
- [x] `CategoryHeader` 공유 컴포넌트 추출
  - 로고(좌) + 햄버거(우) + 오른쪽 슬라이드 패널을 단일 컴포넌트로 분리
  - Props: `onLogoClick`, `currentCategory`
  - Articles, Albums 페이지에 공통 적용

#### 🚧 이슈
- [x] 카테고리 간 이동 시 메시 그래디언트 플래시 현상
  - 해결: `sessionStorage` 플래그로 카테고리→카테고리 이동 시 `pageFadeIn` 스킵

#### 📋 다음 단계
- [ ] 백엔드 API 연동 (articles, albums 실데이터 연결)
- [ ] Albums 페이지 앨범 아트 이미지 처리
- [ ] 모바일 반응형 레이아웃 대응