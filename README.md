# dig-em.com
음악 칼럼 자동 수집 및 번역 아카이빙 서비스

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

#### 🚧 진행 중
- [ ] Pitchfork 크롤러 고도화
  - 다양한 게시글 타입 테스트
  - 본문 추출 로직 강화

#### 📋 다음 단계
- [ ] 다른 웹진 크롤러 추가 (Stereogum, Consequence)
- [ ] Gemini 번역 모듈 구현
- [ ] Supabase 데이터 삽입 로직
- [ ] DLQ 패턴 구현 (Redis)
- [ ] GitHub Actions 워크플로우 작성