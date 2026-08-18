import Link from 'next/link'
import { ARTICLES_ENABLED } from '@/lib/features'

const LINKS = [
  // 칼럼 섹션 비공개 중에는 진입점 자체를 노출하지 않는다.
  ...(ARTICLES_ENABLED ? [{ href: '/articles', label: 'articles' }] : []),
  { href: '/albums', label: 'albums' },
]

export default function HomeNav() {
  return (
    <nav
      className="hero-nav"
      style={{
        display: 'flex',
        gap: '1.2rem',
        alignItems: 'center',
        fontFamily: 'var(--mono)',
      }}
    >
      {LINKS.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className="home-nav-btn"
        >
          {label}
        </Link>
      ))}
    </nav>
  )
}
