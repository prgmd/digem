'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import CategoryHeader from '@/components/CategoryHeader'
import Sidebar from '@/components/Sidebar'
import ArticleDetail from '@/components/ArticleDetail'

export interface Article {
  id: number
  title: string
  title_ko?: string
  author: string
  source: string
  source_url?: string
  thumbnail_url?: string
  thumbnail_credit?: string
  published_at: string
  category: string
  content_en: string
  content_ko: string
}

const SOURCES = ['Pitchfork', 'Rolling Stone']

interface Props {
  articles: Article[]
}

export default function ArticlesClient({ articles }: Props) {
  const router = useRouter()
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [selectedSource, setSelectedSource] = useState<string | null>(null)
  const [isExiting, setIsExiting] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [fadeIn] = useState(() => {
    if (typeof sessionStorage === 'undefined') return true
    const skip = sessionStorage.getItem('nofade')
    if (skip) { sessionStorage.removeItem('nofade'); return false }
    return true
  })

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const handleExitToHome = () => {
    setIsExiting(true)
    setTimeout(() => router.push('/'), 350)
  }

  const filteredArticles = selectedSource
    ? articles.filter(a => a.source.toLowerCase() === selectedSource.toLowerCase())
    : articles

  const currentArticle = articles.find(a => a.id === selectedId) || null

  const showSidebar = !isMobile || selectedId === null
  const showDetail = !isMobile || selectedId !== null

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
        {showSidebar && (
          <Sidebar
            articles={filteredArticles}
            selectedId={selectedId}
            onSelect={setSelectedId}
            sources={SOURCES}
            selectedSource={selectedSource}
            onSourceSelect={setSelectedSource}
            fullWidth={isMobile}
          />
        )}
        {showDetail && (
          <ArticleDetail
            key={currentArticle?.id ?? 'empty'}
            article={currentArticle}
            onBack={isMobile ? () => setSelectedId(null) : undefined}
          />
        )}
      </div>
    </div>
  )
}
