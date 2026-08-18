-- ============================================================
-- 칼럼(articles) 공개 차단 — 저작권 검토용 임시 조치
-- 실행 위치: Supabase 대시보드 > SQL Editor
-- 원복: supabase/articles-reopen.sql
-- ============================================================
--
-- 왜 프론트엔드 플래그만으로는 부족한가:
--   NEXT_PUBLIC_SUPABASE_ANON_KEY 는 브라우저 번들에 그대로 포함된다.
--   화면에서 칼럼을 숨겨도, 키를 꺼내 PostgREST 엔드포인트를
--   직접 호출하면 articles 전문을 그대로 받아갈 수 있다.
--   실제 차단은 반드시 DB 권한 계층에서 이루어져야 한다.
--
-- 왜 정책(policy) 삭제가 아니라 권한(grant) 회수인가:
--   기존 RLS 정책 이름에 의존하지 않아 환경 차이에 안전하고,
--   원복이 GRANT 한 줄로 대칭적으로 끝난다.
--   기존 정책 정의는 손대지 않으므로 그대로 보존된다.

-- 1) 조치 전 현재 상태 기록 (실행 결과를 캡처해 두면 원복 시 대조 가능)
select policyname, cmd, roles, qual
from pg_policies
where schemaname = 'public' and tablename = 'articles';

select grantee, privilege_type
from information_schema.role_table_grants
where table_schema = 'public' and table_name = 'articles'
order by grantee, privilege_type;

-- 2) 공개 롤의 읽기 권한 회수
--    anon           : 비로그인 방문자 (프론트엔드가 쓰는 롤)
--    authenticated  : 로그인 사용자 (현재 미사용이나 함께 차단)
revoke select on public.articles from anon;
revoke select on public.articles from authenticated;

-- 3) 수집 파이프라인은 계속 동작해야 하므로 service_role 은 유지
--    (service_role 은 RLS 및 일반 권한 검사를 우회하지만, 명시적으로 보장)
grant select, insert, update on public.articles to service_role;

-- 4) 검증 — anon/authenticated 행이 사라졌는지 확인
select grantee, privilege_type
from information_schema.role_table_grants
where table_schema = 'public' and table_name = 'articles'
order by grantee, privilege_type;

-- 기대 결과: grantee 목록에 anon / authenticated 의 SELECT 가 없어야 한다.
-- 추가 확인: 프론트엔드에서 /articles 호출 시 PostgREST 가
--            "permission denied for table articles" (42501) 를 반환하면 정상.
