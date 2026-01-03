/**
 * Sitemap Controller
 * Generates XML sitemap dynamically from D1 database
 */

import { safeDbQuery } from "../utils/db.js";

/**
 * Generate XML sitemap with all published blog posts
 */
export async function getSitemap(c) {
  const db = c.env.DB;
  const baseUrl = "https://highsurfcorp.com";

  // Get all published posts
  const result = await safeDbQuery(
    db,
    `SELECT slug, updated_at, published_at
     FROM posts
     WHERE draft = 0 AND archived = 0
     ORDER BY published_at DESC`,
  );
  const posts = result.results || [];

  // Current date for static pages
  const today = new Date().toISOString().split("T")[0];

  // Build XML sitemap
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/blog</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/contact/brevard-county-free-estimate</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl}/legal/privacy-policy</loc>
    <lastmod>${today}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>${baseUrl}/legal/terms-conditions</loc>
    <lastmod>${today}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
${posts
  .map(
    (post) => `  <url>
    <loc>${baseUrl}/blog/${post.slug}</loc>
    <lastmod>${(post.updated_at || post.published_at || today).split("T")[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`,
  )
  .join("\n")}
</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
