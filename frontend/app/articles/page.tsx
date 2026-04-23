import { supabase } from '@/lib/supabase'
import ArticlesClient, { Article } from '@/components/ArticlesClient'

const PAGE_SIZE = 20

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ source?: string; page?: string }>
}) {
  const { source, page: pageStr } = await searchParams
  const page = Math.max(1, Number(pageStr ?? 1))

  let query = supabase
    .from('articles')
    .select('*', { count: 'exact' })
    .eq('translation_status', 'success')
    .order('published_at', { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)

  if (source) {
    query = query.eq('source', source)
  }

  const { data, error, count } = await query

  const articles: Article[] = error || !data ? [] : data
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
