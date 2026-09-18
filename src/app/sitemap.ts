import type { MetadataRoute } from 'next';

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://overtone-rho.vercel.app';

/**
 * Only the public pages.
 *
 * The dashboard is behind auth and would be a dead end for a crawler, so it is
 * deliberately absent rather than listed and then blocked.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ['', '/features', '/how-it-works', '/pricing', '/contact', '/privacy', '/terms'];
  const lastModified = new Date();
  return pages.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency: path === '' ? 'weekly' : 'monthly',
    priority: path === '' ? 1 : 0.7,
  }));
}
