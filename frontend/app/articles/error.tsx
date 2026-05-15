'use client'
import { useRouter } from 'next/navigation'
import CategoryHeader from '@/components/CategoryHeader'

export default function ArticlesError({ reset }: { error: Error; reset: () => void }) {
  const router = useRouter()
  return (
    <div style={{ height: '100vh', background: '#000', display: 'flex', flexDirection: 'column' }}>
      <CategoryHeader onLogoClick={() => router.push('/')} currentCategory="articles" />
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: '1rem',
      }}>
        <div
          className="mono"
          style={{
            color: 'var(--text-color)',
            fontSize: '0.85rem',
            letterSpacing: '0.06em',
            textAlign: 'left',
            minWidth: '300px',
          }}
        >
          <div>&gt; error: failed to load articles</div>
          <div style={{ color: 'var(--meta-color)' }}>&gt; status: 500 · connection refused</div>
          <div style={{ color: 'var(--meta-dim)' }}>&gt; hint: retry?</div>
        </div>
        <button onClick={reset} className="bracket-btn" style={{ fontSize: '0.85rem' }}>
          retry
        </button>
      </div>
    </div>
  )
}
