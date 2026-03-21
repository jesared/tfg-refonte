import type { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

const routes = [
  '/',
  '/trophee',
  '/agenda',
  '/tableaux',
  '/classements',
  '/communaute',
  '/recompenses',
  '/inscription',
  '/contact',
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return routes.map((route) => ({
    url: new URL(route, siteUrl).toString(),
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));
}
