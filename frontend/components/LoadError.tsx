'use client'
import CategoryHeader from '@/components/CategoryHeader'

interface Props {
  section: 'albums' | 'articles'
  error: Error & { digest?: string }
  reset: () => void
}

export default function LoadError({ section, error, reset }: Props) {
  return (
    <div className="page-shell">
      <CategoryHeader currentCategory={section} />
      <div className="terminal-screen">
        <div className="terminal-block">
          <div>&gt; error: failed to load {section}</div>
          <div className="is-muted">&gt; detail: {error.message || 'unknown'}</div>
          {error.digest && <div className="is-muted">&gt; digest: {error.digest}</div>}
        </div>
        <button onClick={reset} className="bracket-btn">retry</button>
      </div>
    </div>
  )
}
