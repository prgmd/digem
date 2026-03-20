'use client'

interface Article {
  id: number
  title: string
  title_ko?: string
  author: string
  source: string
  source_url?: string
  published_at: string
  category: string
}

function SourceBadge({ source }: { source: string }) {
  const s = source.toLowerCase()
  if (s === 'pitchfork') {
    return (
      <img
        src="/files/pitchfork.svg"
        alt="Pitchfork"
        style={{ width: 18, height: 18, objectFit: 'contain', flexShrink: 0, opacity: 0.7, marginTop: 1, filter: 'invert(1)' }}
      />
    )
  }
  const abbr = s === 'rolling stone' ? 'RS' : source.slice(0, 2).toUpperCase()
  return (
    <span style={{ fontSize: '0.65rem', opacity: 0.6, flexShrink: 0, letterSpacing: '0.05em' }}>
      {abbr}
    </span>
  )
}

interface SidebarProps {
  articles: Article[]
  selectedId: number | null
  onSelect: (id: number) => void
  sources: string[]
  selectedSource: string | null
  onSourceSelect: (source: string | null) => void
  fullWidth?: boolean
}

export default function Sidebar({
  articles,
  selectedId,
  onSelect,
  sources,
  selectedSource,
  onSourceSelect,
  fullWidth,
}: SidebarProps) {
  const allSources = [null, ...sources]

  return (
    <aside style={{
      width: fullWidth ? '100%' : '480px',
      height: '100%',
      borderRight: fullWidth ? 'none' : '1px solid var(--border)',
      padding: '2rem',
      overflowY: 'auto',
      flexShrink: 0,
    }}>
      {/* 출처 탭 */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
        {allSources.map(src => (
          <button
            key={src ?? 'all'}
            onClick={() => onSourceSelect(src)}
            style={{
              background: selectedSource === src ? 'var(--selected-bg)' : 'none',
              border: '1px solid var(--border)',
              color: selectedSource === src ? 'var(--text-color)' : 'var(--meta-color)',
              fontSize: '0.85rem',
              padding: '0.35rem 0.85rem',
              cursor: 'pointer',
              textTransform: 'uppercase',
              transition: 'background-color 0.15s, color 0.15s',
            }}
          >
            {src ?? 'All'}
          </button>
        ))}
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
              color: selectedId === article.id ? 'var(--text-color)' : 'inherit',
              transition: 'background-color 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
            onMouseEnter={(e) => {
              if (selectedId !== article.id) e.currentTarget.style.backgroundColor = 'var(--hover-bg)'
            }}
            onMouseLeave={(e) => {
              if (selectedId !== article.id) e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <SourceBadge source={article.source} />
            <span>{article.title_ko || article.title}</span>
          </li>
        ))}
      </ul>
    </aside>
  )
}
