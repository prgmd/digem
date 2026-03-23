'use client'
import { useState, useEffect } from 'react'

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
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', opacity: 0.4 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            border: '2px solid var(--meta-color)',
            borderTopColor: 'var(--text-color)',
            animation: 'spin 0.8s linear infinite',
          }} />
        </div>
      </main>
    )
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
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
            style={{ background: 'none', border: 'none', color: 'var(--meta-color)', fontSize: '0.9rem', cursor: 'pointer', padding: 0 }}
          >
            ← 목록
          </button>
        )}
        <div>
          <button
            onClick={() => setLanguage('en')}
            style={{ background: 'none', border: 'none', color: language === 'en' ? 'var(--text-color)' : 'var(--meta-color)', fontSize: '0.9rem', cursor: 'pointer', marginRight: '1rem', fontWeight: language === 'en' ? 'bold' : 'normal' }}
          >
            원문
          </button>
          <button
            onClick={() => setLanguage('ko')}
            style={{ background: 'none', border: 'none', color: language === 'ko' ? 'var(--text-color)' : 'var(--meta-color)', fontSize: '0.9rem', cursor: 'pointer', fontWeight: language === 'ko' ? 'bold' : 'normal' }}
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
        fontSize: '2.5rem',
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
        {article.source_url && (
          <>
            <span style={{ margin: '0 0.25rem' }}>·</span>
            <a
              href={article.source_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--meta-color)', textDecoration: 'underline', textUnderlineOffset: '3px' }}
            >
              원문 보기
            </a>
          </>
        )}
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
        </div>
      )}

      {/* 본문 */}
      <div
        style={{ fontSize: '1.1rem', lineHeight: 1.8, maxWidth: '720px', textAlign: 'justify', wordBreak: 'keep-all' }}
        dangerouslySetInnerHTML={{ __html: renderContent(content) }}
      />
      </div>
    </main>
    </div>
  )
}
