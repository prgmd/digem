import HomeNav from '@/components/HomeNav'

export default function Home() {
  return (
    <main className="home-screen">
      <div className="home-panel">
        <h1 className="hero-logo">digem.</h1>
        <p className="hero-tagline">dig your uncut gems</p>
        <HomeNav />
      </div>
    </main>
  )
}
