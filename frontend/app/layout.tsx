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
      <head>
        <link rel="preload" href="/fonts/bjorkfont.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/Pretendard-Regular.otf" as="font" type="font/otf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/Pretendard-Bold.otf" as="font" type="font/otf" crossOrigin="anonymous" />
      </head>
      <body>
        <MeshBackground />
        {children}
      </body>
    </html>
  )
}
