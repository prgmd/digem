import CategoryHeader from '@/components/CategoryHeader'
import { ARTICLES_ENABLED } from '@/lib/features'

export default function InfoPage() {
  return (
    <div className="page-shell info-screen">
      <CategoryHeader currentCategory="info" />

      <main className="info-scroll">
        <div className="info-content">
          <header className="info-intro">
            <h1>colophon</h1>
            <p>digem은 신보를 모아 정리하는 비영리 개인 프로젝트입니다.</p>
          </header>

          <section className="info-section">
            <h2>Sources</h2>
            <div className="info-copy">
              <p>앨범 정보는 Melon에서 가져옵니다.</p>
              {ARTICLES_ENABLED ? (
                <p>칼럼 출처는 Pitchfork, Stereogum, Consequence입니다.</p>
              ) : (
                <p>칼럼은 원문 매체의 저작권 정책을 검토하는 동안 비공개입니다.</p>
              )}
            </div>
          </section>

          <section className="info-section">
            <h2>Copyright</h2>
            <div className="info-copy">
              <p>
                글과 앨범 커버의 저작권은 각 권리자에게 있습니다. 원문 링크를 함께 제공하고,
                커버는 원 출처 이미지를 참조합니다.
              </p>
              <p>
                수정이나 삭제가 필요하면 <a href="https://github.com/prgmd/digem/issues" target="_blank" rel="noopener noreferrer">GitHub 이슈로 알려주세요</a>.
              </p>
            </div>
          </section>

          <section className="info-section">
            <h2>Fonts</h2>
            <p className="info-copy">FontZone의 Bjork [POST] 앨범 폰트, Pretendard, IBM Plex Mono.</p>
          </section>
        </div>
      </main>
    </div>
  )
}
