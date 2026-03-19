'use client'
import { useState } from 'react'

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

interface ArticleDetailProps {
  article: Article | null
}

export default function ArticleDetail({ article }: ArticleDetailProps) {
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
      padding: '3rem 4rem',
      overflowY: 'auto',
      height: '100vh',
      filter: 'blur(0.3px)',
      animation: 'fadeIn 0.5s'
    }}>
      {/* 언어 토글 */}
      <div style={{ marginBottom: '2rem', textAlign: 'right' }}>
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

      {/* 제목 */}
      <h1 style={{
        fontSize: '2.5rem',
        marginBottom: '1rem',
        lineHeight: 1.3
      }}>
        {article.title}
      </h1>

      {/* 메타 */}
      <div style={{
        fontSize: '0.9rem',
        color: 'var(--meta-color)',
        marginBottom: '3rem'
      }}>
        <span>{article.author}</span>
        <span style={{ margin: '0 0.5rem' }}>·</span>
        <span>{article.source}</span>
        <span style={{ margin: '0 0.5rem' }}>·</span>
        <span>{new Date(article.published_at).toLocaleDateString('ko-KR')}</span>
      </div>

      {/* 본문 */}
      <div style={{
        fontSize: '1.1rem',
        lineHeight: 1.8,
        whiteSpace: 'pre-wrap'
      }}>
        {content}
      </div>
    </main>
  )
}
