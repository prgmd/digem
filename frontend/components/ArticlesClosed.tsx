import Link from 'next/link'
import CategoryHeader from '@/components/CategoryHeader'

/**
 * 칼럼 섹션 임시 비공개 안내 화면.
 * 404 대신 상태를 명시해 "사라진 것"이 아니라 "닫아둔 것"임을 알린다.
 */
export default function ArticlesClosed() {
  return (
    <div className="page-shell">
      <CategoryHeader currentCategory="articles" />
      <div className="terminal-screen">
        <div className="terminal-block">
          <div>&gt; status: closed</div>
          <div className="is-muted">&gt; reason: copyright review in progress</div>
          <div className="is-muted">&gt; eta: undetermined</div>
        </div>

        <p className="terminal-note">
          칼럼 섹션은 원문 매체의 저작권 정책을 재검토하는 동안 비공개로 전환했습니다.
          각 기사의 저작권은 원 출처에 있으며, 원문은 해당 매체에서 직접 확인하실 수 있습니다.
          정리가 끝나는 대로 적법한 형태로 다시 열겠습니다.
        </p>

        <div className="terminal-actions">
          <Link href="/albums" className="bracket-btn">albums</Link>
          <Link href="/info" className="bracket-btn">info</Link>
        </div>
      </div>
    </div>
  )
}
