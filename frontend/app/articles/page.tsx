import type { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import { ARTICLES_ENABLED, VISIBLE_SOURCES } from '@/lib/features'
import ArticlesClient, { Article } from '@/components/ArticlesClient'
import ArticlesClosed from '@/components/ArticlesClosed'

const PAGE_SIZE = 20

// 비공개 상태에서는 검색엔진 색인도 막는다.
export const metadata: Metadata = ARTICLES_ENABLED
  ? {}
  : { robots: { index: false, follow: false } }

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ source?: string; page?: string }>
}) {
  // 저작권 검토 중 비공개. DB 조회 전에 차단해 본문이 서버로도 나오지 않게 한다.
  if (!ARTICLES_ENABLED) return <ArticlesClosed />

  const { source, page: pageStr } = await searchParams
  const page = Math.max(1, Number(pageStr ?? 1))

  let query = supabase
    .from('articles')
    .select('id,title,title_ko,author,source,source_url,thumbnail_url,thumbnail_credit,published_at', { count: 'exact' })
    .eq('translation_status', 'success')
    // 노출 허용된 출처만. URL의 ?source= 를 조작해도 여기서 걸린다.
    .in('source', VISIBLE_SOURCES as unknown as string[])
    .order('published_at', { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)

  // 허용 목록에 없는 source 가 들어오면 무시한다.
  if (source && (VISIBLE_SOURCES as unknown as string[]).includes(source)) {
    query = query.eq('source', source)
  }

  const { data, error, count } = await query

  if (error) throw error

  const articles: Article[] = data ?? []
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  return (
    <ArticlesClient
      key={`${source ?? 'all'}-${page}`}
      articles={articles}
      currentPage={page}
      totalPages={totalPages}
      selectedSource={source ?? null}
    />
  )
}
