import ArticlesClient from '@/components/ArticlesClient'
import { MOCK_ARTICLES } from '../mockData'

export default function DevArticlesPage() {
  return (
    <ArticlesClient
      articles={MOCK_ARTICLES}
      currentPage={1}
      totalPages={1}
      selectedSource={null}
    />
  )
}
