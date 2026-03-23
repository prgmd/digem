'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import CategoryHeader from '@/components/CategoryHeader'

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section style={{ marginBottom: '3rem' }}>
    <h2 style={{ fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--meta-color)', marginBottom: '1.25rem' }}>
      {title}
    </h2>
    {children}
  </section>
)

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div style={{ display: 'flex', gap: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)', marginBottom: '1rem' }}>
    <span style={{ fontSize: '0.85rem', color: 'var(--meta-color)', minWidth: '120px', flexShrink: 0 }}>{label}</span>
    <span style={{ fontSize: '0.85rem', color: 'var(--text-color)', lineHeight: 1.7 }}>{children}</span>
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
      animation: isExiting ? 'pageFadeOut 0.35s ease forwards' : 'pageFadeIn 0.4s ease both',
    }}>
      <CategoryHeader onLogoClick={handleExitToHome} currentCategory="info" />

      <div style={{ flex: 1, overflowY: 'auto', padding: 'clamp(2rem, 5vw, 4rem) clamp(1.5rem, 6vw, 5rem)' }}>
        <div style={{ maxWidth: '720px' }}>

          <Section title="About">
            <Row label="서비스">
              음악 웹진 칼럼을 자동 수집·번역하여 아카이빙하는 개인 프로젝트입니다.
              원문 링크를 함께 제공하며, 번역은 참고용으로만 활용하시기 바랍니다.
            </Row>
            <Row label="수집 출처">Pitchfork, Rolling Stone</Row>
            <Row label="번역">Gemini API를 통한 자동 번역 (한국어)</Row>
          </Section>

          <Section title="저작권">
            <Row label="기사 콘텐츠">
              각 기사의 저작권은 원 출처에 있습니다. Pitchfork는 Condé Nast,
              Rolling Stone은 Penske Media Corporation 소유입니다.
              digem은 원문 출처 링크를 제공하며 어떠한 소유권도 주장하지 않습니다.
            </Row>
            <Row label="썸네일 이미지">
              각 썸네일 이미지의 저작권은 해당 사진가 및 에이전시에 있습니다.
              저작권 표기는 이미지 하단에 기재되어 있습니다.
            </Row>
            <Row label="번역문">
              자동 번역된 텍스트는 참고 목적으로만 제공됩니다.
              번역의 정확성을 보장하지 않으며, 원문 확인을 권장합니다.
            </Row>
          </Section>

          <Section title="폰트">
            <Row label="bjorkfont">
              로고, 뱃지, 액센트 요소에 사용. FontZone에서 무료 배포되는 서체로, 제작자 정보는 별도로 확인되지 않습니다.
            </Row>
            <Row label="Noto Serif KR">
              본문, UI 텍스트 전반에 사용. Google Fonts에서 제공하는 오픈소스 서체입니다.
            </Row>
          </Section>

        </div>
      </div>
    </div>
  )
}
