'use client'
import { useRouter } from 'next/navigation'
import CategoryHeader from '@/components/CategoryHeader'
import { ghostButtonStyle } from '@/lib/styles'

export default function AlbumsError({ reset }: { error: Error; reset: () => void }) {
  const router = useRouter()
  return (
    <div style={{ height: '100vh', background: '#000', display: 'flex', flexDirection: 'column' }}>
      <CategoryHeader onLogoClick={() => router.push('/')} currentCategory="albums" />
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: '1.5rem',
        color: 'var(--meta-color)',
      }}>
        <p style={{ fontSize: '0.9rem' }}>앨범 목록을 불러오지 못했어요.</p>
        <button onClick={reset} style={ghostButtonStyle}>다시 시도</button>
      </div>
    </div>
  )
}
