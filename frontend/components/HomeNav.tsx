import Link from 'next/link'

const LINKS = [
  { href: '/articles', label: 'Articles' },
  { href: '/albums',   label: 'Albums'   },
]

export default function HomeNav() {
  return (
    <nav className="hero-nav" style={{ display: 'flex', gap: '4rem', alignItems: 'center' }}>
      {LINKS.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          style={{
            fontSize: '1.5rem',
            color: 'var(--meta-color)',
            textDecoration: 'none',
          }}
        >
          {label}
        </Link>
      ))}
    </nav>
  )
}
