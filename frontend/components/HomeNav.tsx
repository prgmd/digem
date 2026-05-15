import Link from 'next/link'

const LINKS = [
  { href: '/articles', label: 'articles' },
  { href: '/albums',   label: 'albums'   },
]

export default function HomeNav() {
  return (
    <nav
      className="hero-nav"
      style={{
        display: 'flex',
        gap: '2.5rem',
        alignItems: 'center',
        fontFamily: 'var(--mono)',
      }}
    >
      {LINKS.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className="bracket-btn"
          style={{
            fontSize: '0.92rem',
            letterSpacing: '0.12em',
            color: 'var(--text-color)',
            textDecoration: 'none',
            padding: '0.45rem 0.8rem',
          }}
        >
          {label}
        </Link>
      ))}
    </nav>
  )
}
