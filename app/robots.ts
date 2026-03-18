import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  // Use the environment variable if defined, otherwise fallback to a default production URL
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lotusenterprises.info/'

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/Admin/', '/Admin/dashboard/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
