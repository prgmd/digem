import { supabase } from '@/lib/supabase'
import ArticlesClient, { Article } from '@/components/ArticlesClient'

export default async function ArticlesPage() {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .order('published_at', { ascending: false })

  const articles: Article[] = error || !data ? [] : data

  return <ArticlesClient articles={articles} />
}
