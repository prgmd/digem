import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'digem — access',
  robots: { index: false, follow: false },
}

/**
 * 암호 입력 화면.
 *
 * 순수 서버 컴포넌트 + 일반 form POST 로 구현했다.
 * 클라이언트 JS 없이 동작하므로 암호 검증이 브라우저로 새어나갈 여지가 없다.
 */
export default async function GatePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>
}) {
  const { error, next } = await searchParams
  const dest = next && next.startsWith('/') && !next.startsWith('//') ? next : '/'

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '2rem',
      padding: '2rem',
    }}>
      <span
        style={{
          fontFamily: 'bjorkfont, sans-serif',
          fontSize: 'clamp(3.5rem, 12vw, 5.5rem)',
          color: 'var(--text-color)',
          lineHeight: 1,
          userSelect: 'none',
        }}
      >
        digem.
      </span>

      <div
        className="mono"
        style={{
          fontSize: '0.8rem',
          color: 'var(--meta-color)',
          letterSpacing: '0.06em',
          lineHeight: 1.9,
          textAlign: 'left',
          width: '100%',
          maxWidth: '340px',
        }}
      >
        <div>&gt; private deployment</div>
        <div style={{ color: 'var(--meta-dim)' }}>&gt; enter passphrase to continue</div>
      </div>

      <form
        method="POST"
        action="/api/gate"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.6rem',
          width: '100%',
          maxWidth: '340px',
        }}
      >
        <input type="hidden" name="next" value={dest} />
        <input
          type="password"
          name="password"
          autoFocus
          required
          autoComplete="current-password"
          aria-label="passphrase"
          className="mono"
          style={{
            background: '#0a0a0a',
            border: '1px solid var(--border-bright)',
            color: 'var(--text-color)',
            fontSize: '0.9rem',
            letterSpacing: '0.12em',
            padding: '0.7rem 0.9rem',
            outline: 'none',
            width: '100%',
          }}
        />
        <button type="submit" className="bracket-btn" style={{ fontSize: '0.85rem', padding: '0.6rem' }}>
          enter
        </button>
      </form>

      {error && (
        <p
          className="mono"
          style={{
            fontSize: '0.78rem',
            color: 'var(--text-color)',
            letterSpacing: '0.05em',
            margin: 0,
          }}
        >
          &gt; denied · incorrect passphrase
        </p>
      )}
    </div>
  )
}
