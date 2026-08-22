import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: '/api/', disallow: '/dashboard/' },
    sitemap: `${process.env.NEXTAUTH_URL || 'https://sentinel.dev'}/sitemap.xml`,
  }
}
