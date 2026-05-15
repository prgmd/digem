'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import CategoryHeader from '@/components/CategoryHeader'

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section style={{ marginBottom: '3rem' }}>
    <h2
      className="mono"
      style={{
        fontSize: '0.72rem',
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        color: 'var(--text-color)',
        marginBottom: '1.25rem',
        paddingBottom: '0.5rem',
        borderBottom: '1px solid var(--border-bright)',
      }}
    >
      ── {title} ─────────────────────────────────────
    </h2>
    {children}
  </section>
)

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div
    style={{
      display: 'flex',
      gap: '1.5rem',
      paddingBottom: '0.9rem',
      borderBottom: '1px solid var(--border)',
      marginBottom: '0.9rem',
      alignItems: 'baseline',
    }}
  >
    <span
      className="mono"
      style={{
        fontSize: '0.7rem',
        color: 'var(--meta-color)',
        minWidth: '120px',
        flexShrink: 0,
        letterSpacing: '0.08em',
        textTransform: 'lowercase',
      }}
    >
      &gt; {label}
    </span>
    <span
      style={{
        fontFamily: 'Pretendard, sans-serif',
        fontSize: '0.92rem',
        fontWeight: 300,
        color: 'var(--text-color)',
        lineHeight: 1.75,
        wordBreak: 'keep-all',
      }}
    >
      {children}
    </span>
  </div>
)

export default function InfoPage() {
  const router = useRouter()
  const [isExiting, setIsExiting] = useState(false)

  const handleExitToHome = () => {
    setIsExiting(true)
    setTimeout(() => router.push('/'), 350)
  }

  return (
    <div style={{
      height: '100vh',
      background: '#000',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      animation: isExiting ? 'pageFadeOut 0.35s ease forwards' : 'pageFadeIn 0.4s steps(12, end) both',
    }}>
      <CategoryHeader onLogoClick={handleExitToHome} currentCategory="info" />

      <div style={{ flex: 1, overflowY: 'auto', padding: 'clamp(2rem, 5vw, 4rem) clamp(1.5rem, 6vw, 5rem)' }}>
        <div style={{ maxWidth: '720px' }}>

          <div
            className="mono"
            style={{
              fontSize: '0.7rem',
              color: 'var(--meta-dim)',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              marginBottom: '0.75rem',
            }}
          >
            // cat about.txt
          </div>
          <h1
            style={{
              fontFamily: 'Pretendard, sans-serif',
              fontWeight: 700,
              fontSize: 'clamp(2.5rem, 5vw, 3.8rem)',
              lineHeight: 1,
              marginBottom: '2.5rem',
              letterSpacing: '0.02em',
            }}
          >
            colophon<span className="caret" style={{ marginLeft: '0.2em' }} aria-hidden />
          </h1>

          <Section title="about">
            <Row label="service">
              음악 웹진 칼럼을 자동 수집·번역하여 아카이빙하는 개인 프로젝트입니다.
              원문 링크를 함께 제공하며, 번역은 참고용으로만 활용하시기 바랍니다.
            </Row>
            <Row label="sources">Pitchfork · Stereogum · Consequence · Bandcamp · Melon</Row>
            <Row label="engine">Gemini 2.5 Flash · Python pipeline · Apache Airflow · Supabase</Row>
          </Section>

          <Section title="copyright">
            <Row label="content">
              각 기사의 저작권은 원 출처에 있습니다. Pitchfork는 Condé Nast,
              Rolling Stone은 Penske Media Corporation 소유입니다.
              digem은 원문 출처 링크를 제공하며 어떠한 소유권도 주장하지 않습니다.
            </Row>
            <Row label="thumbnails">
              각 썸네일 이미지의 저작권은 해당 사진가 및 에이전시에 있습니다.
              저작권 표기는 이미지 하단에 기재되어 있습니다.
            </Row>
            <Row label="translations">
              자동 번역된 텍스트는 참고 목적으로만 제공됩니다.
              번역의 정확성을 보장하지 않으며, 원문 확인을 권장합니다.
            </Row>
          </Section>

          <Section title="fonts">
            <Row label="bjorkfont">
              로고, 뱃지, 액센트 요소에 사용. FontZone의 Björk [POST] 앨범 폰트를 이용했습니다.
            </Row>
            <Row label="Pretendard">
              본문, UI 텍스트 전반에 사용. orioncactus에서 제공하는 Pretendard 서체입니다.
            </Row>
            <Row label="mono">
              메타 / 터미널 표기에 사용. 시스템 monospace 스택 (Cascadia Mono · SF Mono · Consolas).
            </Row>
          </Section>

          <div
            className="mono"
            style={{
              textAlign: 'left',
              marginTop: '3rem',
              color: 'var(--meta-dim)',
              fontSize: '0.75rem',
              letterSpacing: '0.08em',
            }}
          >
            ─── EOF ─────────────────────────────────────
          </div>
        </div>
      </div>
    </div>
  )
}
