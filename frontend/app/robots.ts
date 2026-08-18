import type { MetadataRoute } from 'next'

// 게이트가 켜져 있으면 크롤러는 어차피 못 들어오지만,
// 게이트를 끈 상태에서도 색인되지 않도록 명시해 둔다.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', disallow: '/' }],
  }
}
