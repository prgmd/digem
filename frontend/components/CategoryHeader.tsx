'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface CategoryHeaderProps {
  onLogoClick: () => void
  currentCategory: 'articles' | 'albums' | 'info'
}

const CATEGORIES = [
  { label: 'articles', path: '/articles', key: 'articles' },
  { label: 'albums',   path: '/albums',   key: 'albums'   },
] as const

const INFO_ITEM = { label: 'info', path: '/info', key: 'info' } as const

export default function CategoryHeader({ onLogoClick, currentCategory }: CategoryHeaderProps) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuClosing, setMenuClosing] = useState(false)
  const [logoHover, setLogoHover] = useState(false)
  const [burgerHover, setBurgerHover] = useState(false)

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
      <header className="category-header" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        height: '60px',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
        position: 'relative',
        gap: '1rem',
      }}>
        {/* 로고 */}
        <div
          onClick={onLogoClick}
          onMouseEnter={() => setLogoHover(true)}
          onMouseLeave={() => setLogoHover(false)}
          style={{
            cursor: 'pointer',
            padding: '0.5rem 1.5rem 0.5rem 0',
            margin: '-0.5rem 0',
            display: 'flex',
            alignItems: 'center',
            gap: '0.55rem',
          }}
        >
          <span
            className="glitch-on-hover"
            style={{
              fontFamily: 'Pretendard, sans-serif',
              fontWeight: 700,
              fontSize: '1.8rem',
              color: logoHover ? 'var(--text-bright)' : 'var(--text-color)',
              lineHeight: 1,
              transition: 'color 0.08s steps(2, end)',
              letterSpacing: '0.05em',
            }}
          >
            d
          </span>
          <span
            className="mono"
            style={{
              fontSize: '0.65rem',
              letterSpacing: '0.18em',
              color: 'var(--meta-dim)',
              textTransform: 'uppercase',
              opacity: logoHover ? 1 : 0.5,
              transition: 'opacity 0.12s steps(3, end)',
            }}
          >
            // {currentCategory}
          </span>
        </div>

        {/* 중앙 라이브 표시 */}
        <div
          className="mono"
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '0.65rem',
            color: 'var(--meta-dim)',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            pointerEvents: 'none',
          }}
        >
          <span
            style={{
              display: 'inline-block',
              width: 6,
              height: 6,
              background: 'var(--text-color)',
              animation: 'caretBlink 1.4s steps(2, end) infinite',
            }}
          />
          live
        </div>

        {/* 햄버거 */}
        <button
          onClick={() => menuOpen ? closeMenu() : setMenuOpen(true)}
          onMouseEnter={() => setBurgerHover(true)}
          onMouseLeave={() => setBurgerHover(false)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            gap: '5px',
            padding: '4px',
            opacity: burgerHover ? 0.6 : 1,
            transition: 'opacity 0.12s steps(3, end)',
          }}
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
            width: 'fit-content',
            minWidth: '240px',
            backgroundColor: '#0a0a0a',
            borderLeft: '1px solid var(--border)',
            zIndex: 26,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-start',
            gap: '0.4rem',
            padding: '0 2.5rem',
            animation: menuClosing
              ? 'menuSlideOutRight 0.3s steps(14, end) forwards'
              : 'menuSlideInRight 0.35s steps(14, end)',
          }}>
            <div
              className="mono"
              style={{
                fontSize: '0.7rem',
                letterSpacing: '0.18em',
                color: 'var(--meta-dim)',
                textTransform: 'uppercase',
                marginBottom: '1.2rem',
              }}
            >
              // navigate
            </div>
            {CATEGORIES.map(cat => {
              const isCurrent = cat.key === currentCategory
              return (
                <span
                  key={cat.key}
                  onClick={!isCurrent ? () => navigateTo(cat.path) : undefined}
                  className="mono"
                  style={{
                    fontSize: '1.15rem',
                    color: isCurrent ? 'var(--text-color)' : 'var(--meta-color)',
                    cursor: !isCurrent ? 'pointer' : 'default',
                    transition: 'color 0.08s steps(2, end), background 0.08s steps(2, end)',
                    padding: '0.4rem 0.8rem 0.4rem 1.4rem',
                    position: 'relative',
                    width: '100%',
                    letterSpacing: '0.06em',
                  }}
                  onMouseEnter={e => {
                    if (!isCurrent) {
                      (e.currentTarget as HTMLElement).style.color = 'var(--bg-color)'
                      ;(e.currentTarget as HTMLElement).style.background = 'var(--text-color)'
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isCurrent) {
                      (e.currentTarget as HTMLElement).style.color = 'var(--meta-color)'
                      ;(e.currentTarget as HTMLElement).style.background = 'transparent'
                    }
                  }}
                >
                  <span style={{ position: 'absolute', left: 0, opacity: isCurrent ? 1 : 0.4 }}>
                    {isCurrent ? '▶' : '·'}
                  </span>
                  {cat.label}
                </span>
              )
            })}

            <div
              style={{
                color: 'var(--meta-dim)',
                fontFamily: 'var(--mono)',
                fontSize: '0.7rem',
                margin: '1.1rem 0 0.5rem',
                letterSpacing: '0.06em',
                width: '100%',
              }}
            >
              ─────────────────
            </div>

            {(() => {
              const isCurrent = INFO_ITEM.key === currentCategory
              return (
                <span
                  onClick={!isCurrent ? () => navigateTo(INFO_ITEM.path) : undefined}
                  className="mono"
                  style={{
                    fontSize: '1.15rem',
                    color: isCurrent ? 'var(--text-color)' : 'var(--meta-color)',
                    cursor: !isCurrent ? 'pointer' : 'default',
                    transition: 'color 0.08s steps(2, end), background 0.08s steps(2, end)',
                    padding: '0.4rem 0.8rem 0.4rem 1.4rem',
                    position: 'relative',
                    width: '100%',
                    letterSpacing: '0.06em',
                  }}
                  onMouseEnter={e => {
                    if (!isCurrent) {
                      (e.currentTarget as HTMLElement).style.color = 'var(--bg-color)'
                      ;(e.currentTarget as HTMLElement).style.background = 'var(--text-color)'
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isCurrent) {
                      (e.currentTarget as HTMLElement).style.color = 'var(--meta-color)'
                      ;(e.currentTarget as HTMLElement).style.background = 'transparent'
                    }
                  }}
                >
                  <span style={{ position: 'absolute', left: 0, opacity: isCurrent ? 1 : 0.4 }}>
                    {isCurrent ? '▶' : '·'}
                  </span>
                  {INFO_ITEM.label}
                </span>
              )
            })()}
          </nav>
        </>
      )}
    </>
  )
}
