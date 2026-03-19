'use client'
import { useState } from 'react'

interface Article {
  id: number
  title: string
  author: string
  source: string
  published_at: string
  category: string
}

interface SidebarProps {
  articles: Article[]
  selectedId: number | null
  onSelect: (id: number) => void
  sources: string[]
  selectedSource: string | null
  onSourceSelect: (source: string | null) => void
}

export default function Sidebar({
  articles,
  selectedId,
  onSelect,
  sources,
  selectedSource,
  onSourceSelect,
}: SidebarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)

  return (
    <aside style={{
      width: '480px',
      height: '100%',
      borderRight: '1px solid var(--border)',
      padding: '2rem',
      overflowY: 'auto',
    }}>
      {/* 출처 드롭다운 */}
      <div style={{ marginBottom: '2rem', position: 'relative' }}>
        <button
          onClick={() => setDropdownOpen(prev => !prev)}
          style={{
            width: '100%',
            background: 'none',
            border: '1px solid var(--border)',
            color: 'var(--text-color)',
            fontSize: '0.9rem',
            cursor: 'pointer',
            padding: '0.5rem 0.75rem',
            textAlign: 'left',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>{selectedSource ?? 'All'}</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--meta-color)' }}>{dropdownOpen ? '▲' : '▼'}</span>
        </button>

        {dropdownOpen && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            width: '100%',
            backgroundColor: '#0d0d0d',
            border: '1px solid var(--border)',
            borderTop: 'none',
            zIndex: 10,
          }}>
            <div
              onClick={() => { onSourceSelect(null); setDropdownOpen(false) }}
              style={{
                padding: '0.5rem 0.75rem',
                cursor: 'pointer',
                fontSize: '0.9rem',
                color: selectedSource === null ? 'var(--text-color)' : 'var(--meta-color)',
                fontWeight: selectedSource === null ? 'bold' : 'normal',
              }}
            >
              All
            </div>
            {sources.map(src => (
              <div
                key={src}
                onClick={() => { onSourceSelect(src); setDropdownOpen(false) }}
                style={{
                  padding: '0.5rem 0.75rem',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  color: selectedSource === src ? 'var(--text-color)' : 'var(--meta-color)',
                  fontWeight: selectedSource === src ? 'bold' : 'normal',
                }}
              >
                {src}
              </div>
            ))}
          </div>
        )}
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '1.5rem 0' }} />

      {/* 칼럼 목록 */}
      <ul style={{ listStyle: 'none' }}>
        {articles.map(article => (
          <li
            key={article.id}
            onClick={() => onSelect(article.id)}
            style={{
              padding: '1rem',
              marginBottom: '0.5rem',
              cursor: 'pointer',
              borderRadius: '4px',
              backgroundColor: selectedId === article.id ? 'var(--selected-bg)' : 'transparent',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => {
              if (selectedId !== article.id) e.currentTarget.style.backgroundColor = 'var(--hover-bg)'
            }}
            onMouseLeave={(e) => {
              if (selectedId !== article.id) e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            • {article.title}
          </li>
        ))}
      </ul>
    </aside>
  )
}
