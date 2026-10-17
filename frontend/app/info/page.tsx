import CategoryHeader from '@/components/CategoryHeader'
import { ARTICLES_ENABLED } from '@/lib/features'

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section style={{ marginBottom: '2.5rem' }}>
    <h2
      className="mono info-section-title"
      style={{
        fontSize: '0.72rem',
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        color: 'var(--ink)',
        marginBottom: '1.25rem',
        paddingBottom: '0.5rem',
        borderBottom: '1px solid var(--line-strong)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        width: '100%',
      }}
    >
      <span>── {title}</span>
      <span
        aria-hidden
        style={{
          flex: 1,
          color: 'var(--line-strong)',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
        }}
      >
        ──────────────────────────────────────────────────
      </span>
    </h2>
    {children}
  </section>
)

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div
    className="info-row"
    style={{
      display: 'flex',
      gap: '1.5rem',
      paddingBottom: '0.9rem',
      borderBottom: '1px solid var(--line)',
      marginBottom: '0.9rem',
      alignItems: 'baseline',
    }}
  >
    <span
      className="mono info-row-label"
      style={{
        fontSize: '0.7rem',
        color: 'var(--ink-muted)',
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
        fontFamily: 'var(--font-text)',
        fontSize: '0.92rem',
        fontWeight: 400,
        color: 'var(--ink)',
        lineHeight: 1.75,
        wordBreak: 'keep-all',
      }}
    >
      {children}
    </span>
  </div>
)

export default function InfoPage() {
  return (
    <div style={{
      height: '100vh',
      background: 'transparent',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <CategoryHeader currentCategory="info" />

      <div style={{ flex: 1, overflowY: 'auto', padding: 'clamp(2rem, 5vw, 4rem) clamp(1.5rem, 6vw, 5rem)' }}>
        <div style={{ maxWidth: '720px' }}>

          <h1
            style={{
              fontFamily: 'var(--font-text)',
              fontWeight: 700,
              fontSize: 'clamp(2.5rem, 5vw, 3.8rem)',
              lineHeight: 1,
              marginBottom: '2.5rem',
              letterSpacing: '0.02em',
            }}
          >
            colophon<span className="caret" style={{ marginLeft: '0.2em' }} aria-hidden />
          </h1>

          {!ARTICLES_ENABLED && (
            <Section title="notice">
              <Row label="columns">
                칼럼 섹션은 현재 <strong>비공개</strong>입니다. 원문 매체의 저작권 정책을
                재검토하는 동안 일시적으로 닫아두었습니다. 정리가 끝나는 대로
                적법한 형태로 다시 공개할 예정입니다.
              </Row>
              <Row label="status">
                앨범 정보 섹션은 정상적으로 이용하실 수 있습니다.
              </Row>
            </Section>
          )}

          <Section title="about">
            <Row label="service">
              음악 신보 정보를 정리해 아카이빙하는 비영리 개인 프로젝트입니다.
              어떠한 광고·구독·유료 기능도 운영하지 않습니다.
            </Row>
            <Row label="sources">Melon{ARTICLES_ENABLED && ' · Pitchfork · Stereogum · Consequence'}</Row>
            <Row label="engine">Python pipeline · GitHub Actions · Supabase{ARTICLES_ENABLED && ' · Gemini 2.5 Flash'}</Row>
          </Section>

          <Section title="copyright">
            <Row label="content">
              각 저작물의 저작권은 원 출처에 있습니다. digem은 어떠한 소유권도 주장하지 않으며,
              원문 출처 링크를 함께 제공합니다.
            </Row>
            <Row label="artwork">
              앨범 아트워크의 저작권은 해당 아티스트 및 음반사에 있습니다.
              digem은 이미지를 복제·재호스팅하지 않고 원 출처를 참조합니다.
            </Row>
            <Row label="takedown">
              게재된 내용에 대해 삭제 또는 수정을 요청하시려면 아래 연락처로 알려주시기 바랍니다.
              확인 후 신속히 조치하겠습니다.
            </Row>
            <Row label="contact">
              <a
                href="https://github.com/prgmd/digem/issues"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--ink)', textDecorationStyle: 'dotted', textUnderlineOffset: '3px' }}
              >
                github.com/prgmd/digem/issues
              </a>
            </Row>
            {ARTICLES_ENABLED && (
              <Row label="translations">
                자동 번역된 텍스트는 참고 목적으로만 제공됩니다.
                번역의 정확성을 보장하지 않으며, 원문 확인을 권장합니다.
              </Row>
            )}
          </Section>

          <Section title="fonts">
            <Row label="bjorkfont">
              로고, 뱃지, 액센트 요소에 사용. FontZone의 Björk [POST] 앨범 폰트를 이용했습니다.
            </Row>
            <Row label="Pretendard">
              본문, UI 텍스트 전반에 사용. orioncactus에서 제공하는 Pretendard 서체입니다.
            </Row>
            <Row label="IBM Plex Mono">
              메타 / 터미널 표기에 사용. IBM이 공개한 IBM Plex Mono 서체입니다.
            </Row>
          </Section>

        </div>
      </div>
    </div>
  )
}
