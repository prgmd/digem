'use client'
import { useState, useEffect } from 'react'
import Spinner from '@/components/Spinner'

interface Article {
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

function renderContent(raw: string): string {
  return raw
    .split('\n')
    .filter(line => !line.match(/더\s*보기/))
    .join('\n')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // (대문자 시작 영문) 패턴을 인라인 주석으로 렌더링
    // ex) 현대화(Modernization), 찰리 XCX(Charli XCX) 모두 커버
    .replace(/\(([A-Z][A-Za-z0-9\s\-'&.,]{1,60})\)/g, '<span class="annotation">$1</span>')
    .replace(/\n/g, '<br />')
}

interface ArticleDetailProps {
  article: Article | null
  onBack?: () => void
}

export default function ArticleDetail({ article, onBack }: ArticleDetailProps) {
  const [language, setLanguage] = useState<'ko' | 'en'>('ko')
  const [ready, setReady] = useState(!article?.thumbnail_url)

  useEffect(() => {
    if (!article?.thumbnail_url) return
    const img = new window.Image()
    img.src = article.thumbnail_url
    img.onload = () => setReady(true)
    img.onerror = () => setReady(true)
  }, [article?.thumbnail_url])

  if (!article) {
    return (
      <main style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh'
      }}>
        <h1 style={{
          fontSize: '6rem',
          opacity: 0.3,
          fontWeight: 'normal',
          fontFamily: 'bjorkfont, sans-serif'
        }}>
          digem
        </h1>
      </main>
    )
  }

  const content = language === 'ko' ? article.content_ko : article.content_en

  if (!ready) {
    return (
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', animation: 'pageFadeIn 0.25s ease both' }}>
        <div style={{ opacity: 0.4 }}>
          <Spinner />
        </div>
      </main>
    )
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', animation: 'pageFadeIn 0.25s ease both' }}>
      {/* 고정 헤더: 뒤로가기 + 언어 토글 */}
      <div style={{
        display: 'flex',
        justifyContent: onBack ? 'space-between' : 'flex-end',
        alignItems: 'center',
        padding: '0 1.5rem',
        height: '44px',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        {onBack && (
          <button
            onClick={onBack}
            style={{ background: 'none', border: 'none', color: 'var(--meta-color)', fontSize: '0.9rem', cursor: 'pointer', padding: 0, transition: 'color 0.2s' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-color)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--meta-color)')}
          >
            ← 목록
          </button>
        )}
        <div>
          <button
            onClick={() => setLanguage('en')}
            style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: language === 'en' ? 600 : 300, background: 'none', border: 'none', color: language === 'en' ? 'var(--text-color)' : 'var(--meta-color)', fontSize: '0.9rem', cursor: 'pointer', marginRight: '1rem', transition: 'color 0.2s' }}
          >
            원문
          </button>
          <button
            onClick={() => setLanguage('ko')}
            style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: language === 'ko' ? 600 : 300, background: 'none', border: 'none', color: language === 'ko' ? 'var(--text-color)' : 'var(--meta-color)', fontSize: '0.9rem', cursor: 'pointer', transition: 'color 0.2s' }}
          >
            번역
          </button>
        </div>
      </div>

    <main style={{
      flex: 1,
      padding: 'clamp(1.25rem, 4vw, 3rem) clamp(1rem, 5vw, 4rem)',
      overflowY: 'auto',
      filter: 'blur(0.3px)',
      animation: 'fadeIn 0.5s'
    }}>
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>
      {/* 제목 */}
      <h1 style={{
        fontSize: '3rem',
        marginBottom: '1rem',
        lineHeight: 1.3
      }}>
        {language === 'en' ? article.title : (article.title_ko || article.title)}
      </h1>

      {/* 메타 */}
      <div style={{
        fontSize: '0.9rem',
        color: 'var(--meta-color)',
        marginBottom: '3rem',
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.25rem',
      }}>
        <span>{article.author}</span>
        <span style={{ margin: '0 0.25rem' }}>·</span>
        <span>{article.source}</span>
        <span style={{ margin: '0 0.25rem' }}>·</span>
        <span>{new Date(article.published_at).toLocaleDateString('ko-KR')}</span>
      </div>

      {/* 썸네일 */}
      {article.thumbnail_url && (
        <div style={{ marginBottom: '2rem' }}>
          <img
            src={article.thumbnail_url}
            alt={article.title}
            style={{
              width: '100%',
              maxHeight: '360px',
              objectFit: 'cover',
              borderRadius: '4px',
              display: 'block',
            }}
          />
          {article.thumbnail_credit && (
            <p style={{ fontSize: '0.8rem', color: 'var(--meta-color)', marginTop: '0.4rem', textAlign: 'left' }}>
              {article.thumbnail_credit}
            </p>
          )}
          {article.source_url && (
            <a
              href={article.source_url}
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              style={{
                display: 'inline-block',
                marginTop: '1rem',
                padding: '0.4rem 1rem',
                borderRadius: '2px',
                background: 'var(--meta-color)',
                color: '#000',
                fontSize: '0.85rem',
                textDecoration: 'none',
                transition: 'opacity 0.2s',
              }}
            >
              원문 보기 →
            </a>
          )}
        </div>
      )}

      {/* 본문 */}
      <div
        style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 300, fontSize: '1.3rem', lineHeight: 1.5, textAlign: 'left', wordBreak: 'keep-all' }}
        dangerouslySetInnerHTML={{ __html: renderContent(content) }}
      />
      </div>
    </main>
    </div>
  )
}
