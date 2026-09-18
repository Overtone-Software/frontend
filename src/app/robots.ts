import type { MetadataRoute } from 'next';
import { SITE_URL } from './sitemap';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Nothing here is secret — it is all auth-gated anyway — but a crawler
        // spending its budget on pages that redirect to a login form helps nobody.
        disallow: ['/overview', '/calls', '/coverage', '/theses', '/usage', '/settings'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
