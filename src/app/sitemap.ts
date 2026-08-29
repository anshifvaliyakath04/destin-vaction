import type { MetadataRoute } from 'next';
import { SITE_URL, publicDestinations } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: `${SITE_URL}/`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${SITE_URL}/planner`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.85,
    },
    ...publicDestinations.map((destination) => ({
      url: `${SITE_URL}/destination?id=${destination.id}`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
      images: [`${SITE_URL}${destination.image}`],
    })),
  ];
}
