'use client'
import { useState } from 'react'

interface Article {
  id: number
  title: string
  title_ko?: string
  author: string
  source: string
  source_url?: string
  thumbnail_url?: string
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

  return (
    <main style={{
      flex: 1,
      padding: 'clamp(1.25rem, 4vw, 3rem) clamp(1rem, 5vw, 4rem)',
      overflowY: 'auto',
      height: '100%',
      filter: 'blur(0.3px)',
      animation: 'fadeIn 0.5s'
    }}>
      <div style={{ maxWidth: '760px' }}>
      {/* 모바일 뒤로가기 + 언어 토글 */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: onBack ? 'space-between' : 'flex-end', alignItems: 'center' }}>
        {onBack && (
          <button
            onClick={onBack}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--meta-color)',
              fontSize: '0.9rem',
              cursor: 'pointer',
            }}
          >
            ← 목록
          </button>
        )}
        <div>
          <button
            onClick={() => setLanguage('en')}
            style={{
              background: 'none',
              border: 'none',
              color: language === 'en' ? 'var(--text-color)' : 'var(--meta-color)',
              fontSize: '0.9rem',
              cursor: 'pointer',
              marginRight: '1rem',
              fontWeight: language === 'en' ? 'bold' : 'normal'
            }}
          >
            원문
          </button>
          <button
            onClick={() => setLanguage('ko')}
            style={{
              background: 'none',
              border: 'none',
              color: language === 'ko' ? 'var(--text-color)' : 'var(--meta-color)',
              fontSize: '0.9rem',
              cursor: 'pointer',
              fontWeight: language === 'ko' ? 'bold' : 'normal'
            }}
          >
            번역
          </button>
        </div>
      </div>

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
        <img
          src={article.thumbnail_url}
          alt={article.title}
          style={{
            width: '100%',
            maxHeight: '360px',
            objectFit: 'cover',
            marginBottom: '2rem',
            borderRadius: '4px',
          }}
        />
      )}

      {/* 본문 */}
      <div
        style={{ fontSize: '1.1rem', lineHeight: 1.8, maxWidth: '720px' }}
        dangerouslySetInnerHTML={{ __html: renderContent(content) }}
      />
      </div>
    </main>
  )
}
