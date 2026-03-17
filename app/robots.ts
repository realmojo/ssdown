import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/x',
          '/x/',
          '/tiktok',
          '/tiktok/',
          '/instagram',
          '/instagram/',
          '/facebook',
          '/facebook/',
          '/dailymotion',
          '/dailymotion/',
          '/9gag',
          '/9gag/',
        ],
      },
      {
        userAgent: 'GPTBot',
        allow: '/',
        disallow: ['/api/'],
      },
      {
        userAgent: 'ClaudeBot',
        allow: '/',
        disallow: ['/api/'],
      },
      {
        userAgent: 'PerplexityBot',
        allow: '/',
        disallow: ['/api/'],
      },
      {
        userAgent: 'Google-Extended',
        allow: '/',
        disallow: ['/api/'],
      },
    ],
    sitemap: [
      'https://ssdown.app/sitemap.xml',
      'https://ssdown.app/sitemap-static.xml',
      'https://ssdown.app/sitemap-software.xml',
    ],
  }
}
