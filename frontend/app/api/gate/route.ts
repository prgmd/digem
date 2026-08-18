import { NextResponse, type NextRequest } from 'next/server'
import { GATE_COOKIE, deriveGateToken, verifyPassword } from '@/lib/gate'

/** 암호 검증 후 게이트 쿠키를 발급한다. 실패하면 /gate 로 되돌린다. */
export async function POST(req: NextRequest) {
  const password = process.env.SITE_PASSWORD
  const secret = process.env.GATE_SECRET

  if (!password || !secret) {
    return new NextResponse('gate misconfigured', { status: 503 })
  }

  const form = await req.formData()
  const input = String(form.get('password') ?? '')
  const requested = String(form.get('next') ?? '/')

  // 오픈 리다이렉트 방지 — 내부 절대경로만 허용한다.
  const dest = requested.startsWith('/') && !requested.startsWith('//') ? requested : '/'

  const url = req.nextUrl.clone()
  url.search = ''

  if (!(await verifyPassword(input, password, secret))) {
    url.pathname = '/gate'
    url.search = dest === '/' ? '?error=1' : `?error=1&next=${encodeURIComponent(dest)}`
    // 303: POST 결과를 GET 으로 전환해 새로고침 시 재전송을 막는다.
    return NextResponse.redirect(url, { status: 303 })
  }

  url.pathname = dest
  const res = NextResponse.redirect(url, { status: 303 })
  res.cookies.set(GATE_COOKIE, await deriveGateToken(secret), {
    httpOnly: true,                                   // JS 로 읽을 수 없음
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,                        // 30일
  })
  return res
}
