import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/config';

const CATEGORIES = [
  'All',
  'Mutton Alternatives',
  'Chicken Alternatives',
  'Fish Alternatives',
  'Specialty Snacks',
  'Retail Packs',
  'Bulk Packs',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE_URL;
  const lastModified = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/wishlist`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.6,
    },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = CATEGORIES.map((cat) => ({
    url: `${baseUrl}/shop?category=${encodeURIComponent(cat)}`,
    lastModified,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticRoutes, ...categoryRoutes];
}
