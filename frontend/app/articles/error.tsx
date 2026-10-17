'use client'
import CategoryHeader from '@/components/CategoryHeader'

export default function ArticlesError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div style={{ height: '100vh', background: 'transparent', display: 'flex', flexDirection: 'column' }}>
      <CategoryHeader currentCategory="articles" />
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: '1rem',
      }}>
        <div
          className="mono"
          style={{
            color: 'var(--ink)',
            fontSize: '0.85rem',
            letterSpacing: '0.06em',
            textAlign: 'left',
            minWidth: '300px',
          }}
        >
          <div>&gt; error: failed to load articles</div>
          <div style={{ color: 'var(--ink-muted)' }}>&gt; status: 500 · connection refused</div>
          <div style={{ color: 'var(--ink-muted)' }}>&gt; hint: retry?</div>
        </div>
        <button onClick={reset} className="bracket-btn" style={{ fontSize: '0.85rem' }}>
          retry
        </button>
      </div>
    </div>
  )
}
