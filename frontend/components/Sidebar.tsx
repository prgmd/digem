'use client'

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
