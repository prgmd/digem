import Link from 'next/link'
import { ARTICLES_ENABLED } from '@/lib/features'

const LINKS = [
  { href: '/albums', label: 'browse albums' },
  // 칼럼 섹션 비공개 중에는 진입점 자체를 노출하지 않는다.
  ...(ARTICLES_ENABLED ? [{ href: '/articles', label: 'articles' }] : []),
]

export default function HomeNav() {
  return (
    <nav className="hero-nav" aria-label="메뉴">
      {LINKS.map(({ href, label }) => (
        <Link key={href} href={href} className="home-nav-btn">
          {label}
          <span aria-hidden="true">→</span>
        </Link>
      ))}
    </nav>
  )
}
