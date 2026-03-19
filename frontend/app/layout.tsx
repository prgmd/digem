import './globals.css'
import type { Metadata, Viewport } from 'next'
import MeshBackground from '@/components/MeshBackground'

export const metadata: Metadata = {
  title: 'dig-em',
  description: 'dig your uncut gems',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>
        <MeshBackground />
        {children}
      </body>
    </html>
  )
}
