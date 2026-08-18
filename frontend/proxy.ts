import { NextResponse, type NextRequest } from 'next/server'
import { GATE_COOKIE, deriveGateToken, safeEqual } from '@/lib/gate'

/**
 * 사이트 전체 암호 게이트.
 *
 * 동작 조건
 *   SITE_PASSWORD + GATE_SECRET 이 모두 설정돼 있을 때만 게이트가 켜진다.
 *   - 로컬 개발: 미설정 시 그냥 통과 (편의)
 *   - 프로덕션: 미설정 시 503 으로 차단 (조용한 fail-open 방지)
 *
 * 게이트를 통과하지 못한 요청은 /gate 로 리다이렉트된다.
 * 검색엔진 크롤러도 동일하게 막히므로 색인이 발생하지 않는다.
 */

/** 게이트 화면 자체와 그 처리 경로는 열려 있어야 한다. */
function isOpenPath(pathname: string): boolean {
  if (pathname === '/gate' || pathname === '/api/gate') return true
  if (pathname === '/robots.txt' || pathname === '/favicon.ico') return true
  // 게이트 화면이 정상적으로 렌더되려면 폰트는 열어둔다.
  if (pathname.startsWith('/fonts/')) return true
  return false
}

export async function proxy(req: NextRequest) {
  const password = process.env.SITE_PASSWORD
  const secret = process.env.GATE_SECRET

  if (!password || !secret) {
    if (process.env.NODE_ENV === 'production') {
      return new NextResponse(
        'gate misconfigured: SITE_PASSWORD / GATE_SECRET not set',
        { status: 503, headers: { 'content-type': 'text/plain; charset=utf-8' } },
      )
    }
    return NextResponse.next()
  }

  const { pathname } = req.nextUrl
  if (isOpenPath(pathname)) return NextResponse.next()

  const cookie = req.cookies.get(GATE_COOKIE)?.value
  if (cookie && safeEqual(cookie, await deriveGateToken(secret))) {
    return NextResponse.next()
  }

  const url = req.nextUrl.clone()
  url.pathname = '/gate'
  url.search = pathname === '/' ? '' : `?next=${encodeURIComponent(pathname)}`
  return NextResponse.redirect(url)
}

export const config = {
  // 정적 자산(_next/static, _next/image)은 게이트 화면 렌더에 필요하므로 제외한다.
  // 보호 대상은 페이지와 데이터이지 CSS/JS 청크가 아니다.
  matcher: ['/((?!_next/static|_next/image).*)'],
}
