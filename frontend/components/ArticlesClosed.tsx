'use client'
import { useRouter } from 'next/navigation'
import CategoryHeader from '@/components/CategoryHeader'

/**
 * 칼럼 섹션 임시 비공개 안내 화면.
 * 404 대신 상태를 명시해 "사라진 것"이 아니라 "닫아둔 것"임을 알린다.
 */
export default function ArticlesClosed() {
  const router = useRouter()

  return (
    <div style={{ height: '100vh', background: '#000', display: 'flex', flexDirection: 'column' }}>
      <CategoryHeader onLogoClick={() => router.push('/')} currentCategory="articles" />
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: '1.75rem', padding: '2rem',
      }}>
        <div
          className="mono"
          style={{
            color: 'var(--text-color)',
            fontSize: '0.85rem',
            lineHeight: 1.9,
            letterSpacing: '0.06em',
            textAlign: 'left',
            maxWidth: '520px',
            width: '100%',
          }}
        >
          <div>&gt; status: 503 · section temporarily closed</div>
          <div style={{ color: 'var(--meta-color)' }}>&gt; reason: copyright review in progress</div>
          <div style={{ color: 'var(--meta-dim)' }}>&gt; eta: undetermined</div>
        </div>

        <p
          style={{
            fontFamily: 'Pretendard, sans-serif',
            fontSize: '0.92rem',
            fontWeight: 300,
            color: 'var(--meta-color)',
            lineHeight: 1.8,
            maxWidth: '520px',
            wordBreak: 'keep-all',
            textAlign: 'left',
          }}
        >
          칼럼 섹션은 원문 매체의 저작권 정책을 재검토하는 동안 비공개로 전환했습니다.
          각 기사의 저작권은 원 출처에 있으며, 원문은 해당 매체에서 직접 확인하실 수 있습니다.
          정리가 끝나는 대로 적법한 형태로 다시 열겠습니다.
        </p>

        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button onClick={() => router.push('/albums')} className="bracket-btn" style={{ fontSize: '0.85rem' }}>
            albums
          </button>
          <button onClick={() => router.push('/info')} className="bracket-btn" style={{ fontSize: '0.85rem' }}>
            info
          </button>
        </div>
      </div>
    </div>
  )
}
