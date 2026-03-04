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