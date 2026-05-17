'use client'
import { useState, useEffect, useRef } from 'react'
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

function renderContent(raw: string, lang: 'ko' | 'en' = 'ko'): string {
  let result = raw
    .split('\n')
    .filter(line => !line.match(/더\s*보기/))
    .join('\n')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')

  if (lang === 'ko') {
    result = result
      .replace(/"([^"]+)"/g, '<span class="inline-quote">"$1"</span>')
      .replace(/^### (.+)$/gm, '<p class="content-h3">$1</p>')
  }

  return result
    .replace(/`([^`]+)`/g, '<span class="annotation">$1</span>')
    .replace(/\n/g, '<br />')
}

const fmtDate = (iso: string) => {
  const d = new Date(iso)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}.${m}.${day}`
}

interface ArticleDetailProps {
  article: Article | null
  onBack?: () => void
}

export default function ArticleDetail({ article, onBack }: ArticleDetailProps) {
  const [language, setLanguage] = useState<'ko' | 'en'>('ko')
  const [ready, setReady] = useState(!article?.thumbnail_url)
  const [progress, setProgress] = useState(0)
  const mainRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!article?.thumbnail_url) { setReady(true); return }
    setReady(false)
    const img = new window.Image()
    img.src = article.thumbnail_url
    img.onload = () => setReady(true)
    img.onerror = () => setReady(true)
  }, [article?.thumbnail_url])

  useEffect(() => {
    const el = mainRef.current
    if (!el) return
    const onScroll = () => {
      const max = el.scrollHeight - el.clientHeight
      if (max <= 0) { setProgress(0); return }
      setProgress(Math.min(100, Math.max(0, (el.scrollTop / max) * 100)))
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => el.removeEventListener('scroll', onScroll)
  }, [article?.id, ready, language])

  if (!article) {
    return (
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        height: '100vh'
      }}>
        <h1
          className="glitch-on-hover hero-empty"
          style={{
            fontSize: 'clamp(3.5rem, 12vw, 6rem)',
            opacity: 0.22,
            fontWeight: 'normal',
            fontFamily: 'bjorkfont, sans-serif',
            userSelect: 'none',
            cursor: 'default',
            lineHeight: 1,
          }}
        >
          digem
        </h1>
        <p
          className="mono"
          style={{
            fontSize: '0.72rem',
            color: 'var(--meta-dim)',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
          }}
        >
          // select a record →
        </p>
      </main>
    )
  }

  const content = language === 'ko' ? article.content_ko : article.content_en

  if (!ready) {
    return (
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', animation: 'pageFadeIn 0.25s ease both' }}>
        <Spinner />
      </main>
    )
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', position: 'relative', animation: 'pageFadeIn 0.25s steps(12, end) both' }}>
      {/* 진행 바 */}
      <div className="reading-progress" style={{ width: `${progress}%` }} />

      {/* 헤더: 뒤로/언어 토글 */}
      <div style={{
        display: 'flex',
        justifyContent: onBack ? 'space-between' : 'flex-end',
        alignItems: 'center',
        padding: '0 1.25rem',
        height: '46px',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        {onBack && (
          <button
            onClick={onBack}
            className="bracket-btn"
            style={{ fontSize: '0.72rem' }}
          >
            ← list
          </button>
        )}
        <div style={{ display: 'flex', gap: '0.3rem' }}>
          <button
            onClick={() => setLanguage('en')}
            className={`bracket-btn ${language === 'en' ? 'is-active' : ''}`}
          >
            en
          </button>
          <button
            onClick={() => setLanguage('ko')}
            className={`bracket-btn ${language === 'ko' ? 'is-active' : ''}`}
          >
            ko
          </button>
        </div>
      </div>

    <main
      ref={mainRef}
      style={{
        flex: 1,
        padding: 'clamp(1.25rem, 4vw, 3rem) clamp(1rem, 5vw, 4rem)',
        overflowY: 'auto',
        animation: 'fadeIn 0.5s steps(14, end) both',
      }}
    >
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>

      {/* 카테고리 라벨 */}
      <div
        className="mono"
        style={{
          fontSize: '0.7rem',
          color: 'var(--meta-color)',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          marginBottom: '0.7rem',
        }}
      >
        // {article.category || 'article'} · #{String(article.id).padStart(4, '0')}
      </div>

      {/* 제목 */}
      <h1 style={{
        fontSize: 'clamp(1.8rem, 3.5vw, 2.85rem)',
        marginBottom: '1.5rem',
        lineHeight: 1.25,
        fontWeight: 700,
        wordBreak: 'keep-all',
      }}>
        {language === 'en' ? article.title : (article.title_ko || article.title)}
      </h1>

      {/* 메타 — 터미널 블록 */}
      <div
        style={{
          marginBottom: '2.5rem',
          padding: '0.85rem 1rem',
          border: '1px solid var(--border)',
          borderLeft: '2px solid var(--meta-color)',
          background: 'rgba(232, 213, 160, 0.015)',
        }}
      >
        <div className="terminal-line">
          <span className="terminal-key">src</span>{article.source}
        </div>
        <div className="terminal-line">
          <span className="terminal-key">by</span>{article.author || '—'}
        </div>
        <div className="terminal-line">
          <span className="terminal-key">date</span>{fmtDate(article.published_at)}
        </div>
        {article.source_url && (
          <div className="terminal-line">
            <span className="terminal-key">link</span>
            <a
              href={article.source_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: 'var(--text-color)',
                textDecoration: 'underline',
                textDecorationStyle: 'dotted',
                textUnderlineOffset: '3px',
              }}
            >
              {(() => {
                try { return new URL(article.source_url).hostname.replace(/^www\./, '') } catch { return article.source_url }
              })()}
              <span style={{ marginLeft: '0.35em', opacity: 0.6 }}>↗</span>
            </a>
          </div>
        )}
      </div>

      {/* 썸네일 */}
      {article.thumbnail_url && (
        <div style={{ marginBottom: '2.5rem' }}>
          <div className="dither" style={{ overflow: 'hidden', border: '1px solid var(--border)' }}>
            <img
              src={article.thumbnail_url}
              alt={article.title}
              style={{
                width: '100%',
                maxHeight: '420px',
                objectFit: 'cover',
                display: 'block',
              }}
            />
          </div>
          {article.thumbnail_credit && (
            <p
              className="mono"
              style={{
                fontSize: '0.7rem',
                color: 'var(--meta-dim)',
                marginTop: '0.5rem',
                letterSpacing: '0.04em',
                textAlign: 'left',
              }}
            >
              ◇ {article.thumbnail_credit}
            </p>
          )}
        </div>
      )}

      {/* 본문 */}
      <div
        style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 300, fontSize: 'clamp(1rem, 2.6vw, 1.2rem)', lineHeight: 1.7, textAlign: 'left', wordBreak: 'keep-all' }}
        dangerouslySetInnerHTML={{ __html: renderContent(content, language) }}
      />

      {/* 끝 표식 */}
      <div
        className="mono"
        style={{
          textAlign: 'center',
          marginTop: '3rem',
          paddingTop: '2rem',
          borderTop: '1px solid var(--border)',
          color: 'var(--meta-dim)',
          fontSize: 'clamp(0.65rem, 2vw, 0.8rem)',
          letterSpacing: '0.2em',
          wordBreak: 'keep-all',
        }}
      >
        ── ◆ EOF ◆ ──
      </div>
      </div>
    </main>
    </div>
  )
}
