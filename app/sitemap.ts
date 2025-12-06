import { MetadataRoute } from 'next'
import { i18n } from '@/lib/i18n-config'

const baseUrl = 'https://ssdown.app'

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ['', '/x', '/tiktok', '/privacy']
  const sitemapEntries: MetadataRoute.Sitemap = []

  routes.forEach((route) => {
    // English (default) - Served at root URLs
    sitemapEntries.push({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: route === '' ? 1 : 0.8,
    })

    // Other languages - Served at /locale URLs
    i18n.locales.forEach((locale) => {
      if (locale === 'en') return // Skip English as it's handled at root
      sitemapEntries.push({
        url: `${baseUrl}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: route === '' ? 0.9 : 0.7,
      })
    })
  })

  return sitemapEntries
}
