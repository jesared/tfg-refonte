import type { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

const routes = [
  '/actualites',
  '/agenda',
  '/classements',
  '/contact',
  '/profile',
  '/recompenses',
  '/salles',
  '/tableaux',
  '/trophee',
  '/users',
  '/admin',
  '/admin/classements',
  '/admin/tournois',
  '/admin/inscriptions',
  '/admin/utilisateurs',
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
