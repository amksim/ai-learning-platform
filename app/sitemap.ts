import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://ai-learning45.netlify.app'

  // Основные страницы
  const routes = ['', '/courses', '/login', '/payment', '/profile', '/admin', '/projects'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  // Курсы по уровням
  const levels = ['beginner', 'intermediate', 'advanced']
  const levelRoutes = levels.map((level) => ({
    url: `${baseUrl}/courses/level/${level}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [...routes, ...levelRoutes]
}
