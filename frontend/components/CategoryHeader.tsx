'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface CategoryHeaderProps {
  onLogoClick: () => void
  currentCategory: 'articles' | 'albums'
}

const CATEGORIES = [
  { label: 'Articles', path: '/articles', key: 'articles' },
  { label: 'Albums',   path: '/albums',   key: 'albums'   },
] as const

export default function CategoryHeader({ onLogoClick, currentCategory }: CategoryHeaderProps) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuClosing, setMenuClosing] = useState(false)

  const closeMenu = () => {
    setMenuClosing(true)
    setTimeout(() => { setMenuOpen(false); setMenuClosing(false) }, 300)
  }

  const navigateTo = (path: string) => {
    sessionStorage.setItem('nofade', '1')
    closeMenu()
    setTimeout(() => router.push(path), 300)
  }

  return (
    <>
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        height: '60px',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        {/* 로고 */}
        <div onClick={onLogoClick} style={{ cursor: 'pointer', padding: '0.5rem 1.5rem 0.5rem 0', margin: '-0.5rem 0' }}>
          <span style={{ fontFamily: 'bjorkfont, sans-serif', fontSize: '2rem', color: 'var(--text-color)', lineHeight: 1 }}>
            d
          </span>
        </div>

        {/* 햄버거 */}
        <button
          onClick={() => menuOpen ? closeMenu() : setMenuOpen(true)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '5px', padding: '4px' }}
          aria-label="메뉴"
        >
          <span style={{ display: 'block', width: '24px', height: '2px', backgroundColor: 'var(--text-color)' }} />
          <span style={{ display: 'block', width: '24px', height: '2px', backgroundColor: 'var(--text-color)' }} />
          <span style={{ display: 'block', width: '24px', height: '2px', backgroundColor: 'var(--text-color)' }} />
        </button>
      </header>

      {/* 오른쪽 슬라이드 패널 */}
      {menuOpen && (
        <>
          <div onClick={closeMenu} style={{ position: 'fixed', inset: 0, zIndex: 25 }} />
          <nav style={{
            position: 'fixed',
            top: 0, right: 0,
            height: '100vh',
            width: '220px',
            backgroundColor: '#0a0a0a',
            borderLeft: '1px solid var(--border)',
            zIndex: 26,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: '2rem',
            padding: '0 2.5rem',
            animation: menuClosing
              ? 'menuSlideOutRight 0.3s cubic-bezier(0.4, 0, 1, 1) forwards'
              : 'menuSlideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
          }}>
            {CATEGORIES.map(cat => (
              <span
                key={cat.key}
                onClick={cat.key !== currentCategory ? () => navigateTo(cat.path) : undefined}
                style={{
                  fontSize: '1.1rem',
                  color: cat.key === currentCategory ? 'var(--text-color)' : 'var(--meta-color)',
                  cursor: cat.key !== currentCategory ? 'pointer' : 'default',
                }}
              >
                {cat.label}
              </span>
            ))}
          </nav>
        </>
      )}
    </>
  )
}
