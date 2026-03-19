'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import CategoryHeader from '@/components/CategoryHeader'
import Sidebar from '@/components/Sidebar'
import ArticleDetail from '@/components/ArticleDetail'

interface Article {
  id: number
  title: string
  author: string
  source: string
  published_at: string
  category: string
  content_en: string
  content_ko: string
}

const SOURCES = ['Pitchfork', 'Rolling Stone', 'NME', 'The Wire', 'Stereogum']

const ARTICLES: Article[] = []

export default function ArticlesPage() {
  const router = useRouter()
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [selectedSource, setSelectedSource] = useState<string | null>(null)
  const [isExiting, setIsExiting] = useState(false)
  const [fadeIn] = useState(() => {
    const skip = sessionStorage.getItem('nofade')
    if (skip) { sessionStorage.removeItem('nofade'); return false }
    return true
  })

  const handleExitToHome = () => {
    setIsExiting(true)
    setTimeout(() => router.push('/'), 350)
  }

  const filteredArticles = selectedSource
    ? ARTICLES.filter((a: Article) => a.source.toLowerCase() === selectedSource.toLowerCase())
    : ARTICLES

  const currentArticle = ARTICLES.find((a: Article) => a.id === selectedId) || null

  return (
    <div style={{
      height: '100vh',
      background: '#000',
      display: 'flex',
      flexDirection: 'column',
      animation: isExiting ? 'pageFadeOut 0.35s ease forwards' : (fadeIn ? 'pageFadeIn 0.4s ease both' : undefined),
    }}>
      <CategoryHeader onLogoClick={handleExitToHome} currentCategory="articles" />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <Sidebar
          articles={filteredArticles}
          selectedId={selectedId}
          onSelect={setSelectedId}
          sources={SOURCES}
          selectedSource={selectedSource}
          onSourceSelect={setSelectedSource}
        />
        <ArticleDetail article={currentArticle} />
      </div>
    </div>
  )
}
