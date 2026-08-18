/**
 * 사이트 전체 암호 게이트 — 토큰 파생 및 비교 유틸.
 *
 * 설계 의도
 * - 쿠키에 암호 자체를 넣지 않는다. GATE_SECRET 으로 서명한 고정 토큰만 저장한다.
 *   쿠키가 유출돼도 암호를 역산할 수 없다.
 * - Edge 런타임(proxy)에서 동작해야 하므로 node:crypto 대신 Web Crypto 를 쓴다.
 *   (Buffer 도 없으므로 base64 인코딩을 직접 처리)
 * - 암호 비교도 원문끼리 하지 않고 HMAC 결과끼리 한다.
 *   길이가 항상 같아져 입력 길이가 새어나가지 않는다.
 *
 * 필요한 환경변수 (둘 다 NEXT_PUBLIC_ 아님 → 브라우저 번들에 포함되지 않음)
 *   SITE_PASSWORD  방문자가 입력할 암호
 *   GATE_SECRET    토큰 서명용 임의 문자열 (암호와 별개, 길고 랜덤하게)
 */

export const GATE_COOKIE = 'digem_gate'

/** HMAC-SHA256(secret, msg) 을 base64url 로 반환한다. */
async function hmacB64(secret: string, msg: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(msg))

  // Edge 런타임에는 Buffer 가 없어 base64url 을 직접 만든다.
  const bytes = new Uint8Array(sig)
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/** 쿠키에 저장될 토큰. GATE_SECRET 을 아는 서버만 만들 수 있다. */
export function deriveGateToken(secret: string): Promise<string> {
  return hmacB64(secret, 'digem-gate-v1')
}

/** 입력 암호가 맞는지 확인한다. 양쪽을 HMAC 으로 변환해 길이를 고정한 뒤 비교. */
export async function verifyPassword(
  input: string,
  password: string,
  secret: string,
): Promise<boolean> {
  const [a, b] = await Promise.all([
    hmacB64(secret, `pw:${input}`),
    hmacB64(secret, `pw:${password}`),
  ])
  return safeEqual(a, b)
}

/**
 * 상수 시간 비교.
 * 조기 반환하는 === 는 일치한 문자 수가 응답 시간에 드러날 수 있어 피한다.
 */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}
