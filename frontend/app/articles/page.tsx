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

const DUMMY_ARTICLES: Article[] = [
  {
    id: 1,
    title: 'Ratboys Are Playing the Long Game',
    author: 'Unknown',
    source: 'pitchfork',
    published_at: '2026-02-01',
    category: 'Interview',
    content_en: 'Before I can even touch the doorbell, I\'m greeted by the enthusiastic barking of two dogs inside. Within seconds, Ratboys guitarist Dave Sagan opens the door, apologizing for the noise while ushering me into the warmth of his Chicago apartment...',
    content_ko: '문을 두드리기도 전에 집 안에서 두 마리의 개가 열정적으로 짖는 소리가 들린다. 몇 초 후, Ratboys의 기타리스트 Dave Sagan이 문을 열며 소음에 대해 사과하면서 나를 따뜻한 시카고 아파트 안으로 안내한다...'
  },
  {
    id: 2,
    title: "Bob Weir's Cosmic Touch",
    author: 'Unknown',
    source: 'pitchfork',
    published_at: '2026-01-28',
    category: 'Afterword',
    content_en: 'The biggest fan of Grateful Dead guitarist and singer Bob Weir may have been the late Japanese composer Domo Arigato, who passed away at age 78. His admiration for Weir\'s unconventional rhythm guitar approach shaped his own experimental compositions...',
    content_ko: '도모얼 78세의 나이로 세상을 떠난 그레이트풀 데드의 기타리스트이자 싱어 Bob Weir의 가장 큰 팬은 일본 작곡가였을 것이다. Weir의 파격적인 리듬 기타 접근 방식에 대한 그의 존경은 자신의 실험적인 작곡에 영향을 미쳤다...'
  },
  {
    id: 3,
    title: "Inside Pitchfork's First-Ever Best New Music Party",
    author: 'Olivier Lafontant',
    source: 'pitchfork',
    published_at: '2026-02-01',
    category: 'Photo Gallery',
    content_en: 'The night before Music\'s Biggest Night, Pitchfork hosted its inaugural Best New Music party at a historic venue in downtown Los Angeles. The intimate gathering celebrated the year\'s most exciting new artists...',
    content_ko: '음악계 최대의 밤(Music\'s Biggest Night)을 하루 앞두고, Pitchfork는 로스앤젤레스 다운타운의 역사적인 공연장에서 첫 번째 Best New Music 파티를 개최했다. 친밀한 모임은 올해 가장 흥미진진한 신인 아티스트들을 축하했다...'
  }
]

const SOURCES = ['Pitchfork', 'Rolling Stone', 'NME', 'The Wire', 'Stereogum']

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
    ? DUMMY_ARTICLES.filter(a => a.source.toLowerCase() === selectedSource.toLowerCase())
    : DUMMY_ARTICLES

  const currentArticle = DUMMY_ARTICLES.find(a => a.id === selectedId) || null

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
