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

const SVG_SOURCES: Record<string, string> = {
  pitchfork: '/files/pitchfork.svg',
  stereogum: '/files/stereogum.svg',
  consequence: '/files/consequence.svg',
  bandcamp: '/files/bandcamp.svg',
}

const INVERT_SOURCES = new Set(['pitchfork', 'bandcamp'])

function SourceBadge({ source }: { source: string }) {
  const s = source.toLowerCase()
  if (SVG_SOURCES[s]) {
    return (
      <img
        src={SVG_SOURCES[s]}
        alt={source}
        style={{ width: 18, height: 18, objectFit: 'contain', flexShrink: 0, opacity: 0.7, marginTop: 1, filter: INVERT_SOURCES.has(s) ? 'invert(1)' : undefined }}
      />
    )
  }
  return (
    <span style={{ fontSize: '0.65rem', opacity: 0.6, flexShrink: 0, letterSpacing: '0.05em' }}>
      {source.slice(0, 2).toUpperCase()}
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
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  fullWidth?: boolean
}

export default function Sidebar({
  articles,
  selectedId,
  onSelect,
  sources,
  selectedSource,
  onSourceSelect,
  currentPage,
  totalPages,
  onPageChange,
  fullWidth,
}: SidebarProps) {
  return (
    <aside style={{
      width: fullWidth ? '100%' : '480px',
      height: '100%',
      borderRight: fullWidth ? 'none' : '1px solid var(--border)',
      padding: fullWidth ? '1rem' : '2rem',
      overflowY: 'auto',
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* 출처 드롭다운 */}
      <select
        value={selectedSource ?? ''}
        onChange={(e) => onSourceSelect(e.target.value || null)}
        style={{
          background: 'transparent',
          border: '1px solid var(--border)',
          color: 'var(--text-color)',
          fontFamily: 'Pretendard, sans-serif',
          fontSize: '1.05rem',
          padding: '0.35rem 0.6rem',
          cursor: 'pointer',
          marginBottom: '2rem',
          appearance: 'none',
          width: '100%',
        }}
      >
        <option value="">All</option>
        {sources.map(src => (
          <option key={src} value={src} style={{ background: '#000' }}>
            {src.charAt(0).toUpperCase() + src.slice(1)}
          </option>
        ))}
      </select>

      <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '0 0 1.5rem' }} />

      {/* 칼럼 목록 */}
      <ul style={{ listStyle: 'none', flex: 1 }}>
        {articles.length === 0 && (
          <li style={{ color: 'var(--meta-color)', fontSize: '1.05rem', padding: '1rem 0' }}>
            해당하는 글이 없어요.
          </li>
        )}
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
            <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 300, fontSize: '1.2rem' }}>
              {article.title_ko || article.title}
            </span>
          </li>
        ))}
      </ul>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <>
          <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '1rem 0' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              style={{
                background: 'none',
                border: '1px solid var(--border)',
                color: currentPage <= 1 ? 'var(--meta-color)' : 'var(--text-color)',
                fontFamily: 'Pretendard, sans-serif',
                padding: '0.3rem 0.7rem',
                cursor: currentPage <= 1 ? 'default' : 'pointer',
                fontSize: '1.05rem',
              }}
            >
              ←
            </button>
            <span style={{ fontSize: '1.0rem', color: 'var(--meta-color)', fontFamily: 'Pretendard, sans-serif' }}>
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              style={{
                background: 'none',
                border: '1px solid var(--border)',
                color: currentPage >= totalPages ? 'var(--meta-color)' : 'var(--text-color)',
                fontFamily: 'Pretendard, sans-serif',
                padding: '0.3rem 0.7rem',
                cursor: currentPage >= totalPages ? 'default' : 'pointer',
                fontSize: '1.05rem',
              }}
            >
              →
            </button>
          </div>
        </>
      )}
    </aside>
  )
}
