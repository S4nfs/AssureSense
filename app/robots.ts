import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://assuresense.vercel.app' // Update with your actual domain

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/api/', '/debug/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
