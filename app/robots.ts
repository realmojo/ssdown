import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
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
    sitemap: 'https://ssdown.app/sitemap.xml',
  }
}
