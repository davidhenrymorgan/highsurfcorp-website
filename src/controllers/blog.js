/**
 * Blog route handlers
 */

import sanitizeHtml from "sanitize-html";
import { safeDbQuery, safeDbFirst } from "../utils/db.js";
import {
  formatDate,
  calculateReadingTime,
  escapeHtml,
} from "../utils/helpers.js";
import {
  getBlogPostTemplate,
  getBlogIndexTemplate,
  getRelatedPostCard,
} from "../views/templates.js";
import { getTemplateContext } from "../middleware/context.js";
import { htmlResponse, errorResponse } from "../middleware/static.js";

/**
 * Render a blog post with data
 * @param {Object} post - Post from database
 * @param {Array} relatedPosts - Related posts
 * @param {Object} ctx - Template context
 */
function renderBlogPost(post, relatedPosts, ctx) {
  const template = getBlogPostTemplate(ctx);
  const category = post.category || post.short_tag || "Article";
  const publishedDate = formatDate(post.published_at);
  const readingTime = calculateReadingTime(post.body);
  const postUrl = `https://highsurfcorp.com/blog/${post.slug}`;

  // Render related posts
  const relatedHtml = relatedPosts.map((p) => getRelatedPostCard(p)).join("");

  // Handle conditional short_preview
  let html = template;

  // Replace simple placeholders
  html = html.replace(/\{\{title\}\}/g, escapeHtml(post.title));
  html = html.replace(/\{\{slug\}\}/g, post.slug);
  html = html.replace(/\{\{category\}\}/g, escapeHtml(category));
  html = html.replace(/\{\{published_date\}\}/g, publishedDate);
  html = html.replace(/\{\{reading_time\}\}/g, readingTime);
  html = html.replace(
    /\{\{hero_image\}\}/g,
    post.hero_image_url || post.hero_image || "",
  );
  html = html.replace(
    /\{\{meta_description\}\}/g,
    escapeHtml(post.meta_description || post.short_preview || ""),
  );

  // Sanitize body content to prevent Stored XSS
  const sanitizedBody = sanitizeHtml(post.body || "", {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      "img",
      "figure",
      "figcaption",
      "h1",
      "h2",
      "span",
      "div",
    ]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      "*": ["class", "style"],
      img: ["src", "alt", "width", "height", "loading"],
      a: ["href", "target", "rel"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
  });

  html = html.replace(/\{\{body\}\}/g, sanitizedBody);
  html = html.replace(/\{\{related_posts\}\}/g, relatedHtml);
  html = html.replace(/\{\{encoded_url\}\}/g, encodeURIComponent(postUrl));
  html = html.replace(/\{\{encoded_title\}\}/g, encodeURIComponent(post.title));

  // Handle conditional short_preview
  if (post.short_preview) {
    html = html.replace(/\{\{#if short_preview\}\}/g, "");
    html = html.replace(/\{\{\/if\}\}/g, "");
    html = html.replace(
      /\{\{short_preview\}\}/g,
      escapeHtml(post.short_preview),
    );
  } else {
    // Remove the entire short_preview section
    html = html.replace(/\{\{#if short_preview\}\}[\s\S]*?\{\{\/if\}\}/g, "");
  }

  return html;
}

/**
 * Render blog index page
 * @param {Array} posts - Posts from database
 * @param {Object} ctx - Template context
 * @param {Object} pagination - Pagination info
 */
function renderBlogIndex(posts, ctx, pagination = { page: 1, totalPages: 1 }) {
  const template = getBlogIndexTemplate(ctx);

  // Find featured post (only show on first page)
  const featuredPost =
    pagination.page === 1 ? posts.find((p) => p.featured === 1) : null;

  // Featured section HTML
  let featuredHtml = "";
  if (featuredPost) {
    const date = formatDate(featuredPost.published_at);
    const category =
      featuredPost.category || featuredPost.short_tag || "Featured";
    featuredHtml = `
      <section class="py-8 px-6">
        <div class="max-w-7xl mx-auto">
          <a href="/blog/${featuredPost.slug}" class="group block">
            <div class="relative aspect-[21/9] bg-neutral-100 rounded-3xl overflow-hidden mb-8">
              <img src="${featuredPost.hero_image_url || featuredPost.thumbnail_image || featuredPost.hero_image || ""}" alt="${escapeHtml(featuredPost.title)}" onerror="this.onerror=null;this.style.display='none'" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700">
              <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div class="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                <div class="flex items-center gap-3 mb-4">
                  <span class="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium text-white uppercase tracking-wider">${escapeHtml(category)}</span>
                  <span class="text-white/60 text-sm">${date}</span>
                </div>
                <h2 class="text-3xl md:text-5xl font-semibold text-white tracking-tight max-w-3xl leading-tight">${escapeHtml(featuredPost.title)}</h2>
              </div>
            </div>
          </a>
        </div>
      </section>
    `;
  }

  // Posts grid HTML (exclude featured post on first page)
  const postsHtml = posts
    .filter((p) => !(pagination.page === 1 && p.featured === 1))
    .map((post) => {
      const date = formatDate(post.published_at);
      const category = post.category || post.short_tag || "Article";
      const shortDate = date.split(",")[0];
      const imgSrc =
        post.hero_image_url || post.thumbnail_image || post.hero_image || "";

      return `
        <a href="/blog/${post.slug}" class="group block">
          <div class="aspect-[4/3] bg-gradient-to-br from-neutral-200 to-neutral-300 rounded-2xl overflow-hidden mb-6">
            ${
              imgSrc
                ? `<img
                src="${imgSrc}"
                loading="lazy"
                decoding="async"
                width="600"
                height="450"
                onerror="this.onerror=null;this.style.display='none'"
                alt="${escapeHtml(post.title)}"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">`
                : ""
            }
          </div>
          <div class="flex items-center gap-2 text-xs font-medium text-neutral-400 uppercase tracking-wider mb-2">
            <span>${escapeHtml(category)}</span>
            <span class="w-1 h-1 rounded-full bg-neutral-300"></span>
            <span>${shortDate}</span>
          </div>
          <h3 class="text-lg font-semibold text-neutral-900 leading-tight group-hover:text-neutral-600 transition-colors">${escapeHtml(post.title)}</h3>
          ${post.short_preview ? `<p class="mt-2 text-sm text-neutral-500 line-clamp-2">${escapeHtml(post.short_preview)}</p>` : ""}
        </a>
      `;
    })
    .join("");

  // Pagination HTML
  let paginationHtml = "";
  if (pagination.totalPages > 1) {
    const { page, totalPages } = pagination;
    paginationHtml = `
      <nav class="flex justify-center items-center gap-4 mt-16" aria-label="Pagination">
        ${page > 1 ? `<a href="/blog?page=${page - 1}" class="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors">← Previous</a>` : `<span class="px-4 py-2 text-sm font-medium text-neutral-300">← Previous</span>`}
        <span class="text-sm text-neutral-500">Page ${page} of ${totalPages}</span>
        ${page < totalPages ? `<a href="/blog?page=${page + 1}" class="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors">Next →</a>` : `<span class="px-4 py-2 text-sm font-medium text-neutral-300">Next →</span>`}
      </nav>
    `;
  }

  let html = template;
  html = html.replace(/\{\{featured_section\}\}/g, featuredHtml);
  html = html.replace(/\{\{posts_grid\}\}/g, postsHtml);
  html = html.replace(/\{\{pagination\}\}/g, paginationHtml);

  return html;
}

/**
 * GET /blog/:slug - Individual blog post
 */
export async function getPost(c) {
  try {
    const ctx = getTemplateContext(c);
    const slug = c.req.param("slug");

    if (!slug) {
      return getIndex(c);
    }

    // Query post from D1
    const post = await safeDbFirst(
      c.env.DB,
      "SELECT * FROM posts WHERE slug = ? AND draft = 0 AND archived = 0",
      [slug],
    );

    if (!post) {
      return errorResponse("Post not found", 404);
    }

    // Query related posts
    const related = await safeDbQuery(
      c.env.DB,
      `SELECT slug, title, thumbnail_image, hero_image, hero_image_url, category, short_tag, published_at
       FROM posts
       WHERE slug != ? AND draft = 0 AND archived = 0
       ORDER BY published_at DESC
       LIMIT 3`,
      [slug],
    );

    // Render template
    const html = renderBlogPost(post, related.results, ctx);

    return htmlResponse(html, 3600);
  } catch (err) {
    // Database errors throw with status 503
    if (err.status === 503) {
      return errorResponse("Service temporarily unavailable", 503);
    }
    throw err;
  }
}

/**
 * GET /blog - Blog index page
 */
export async function getIndex(c) {
  try {
    const ctx = getTemplateContext(c);

    // Parse pagination parameters
    const url = new URL(c.req.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
    const limit = 20;
    const offset = (page - 1) * limit;

    // Get total count for pagination
    const countResult = await safeDbQuery(
      c.env.DB,
      "SELECT COUNT(*) as total FROM posts WHERE draft = 0 AND archived = 0",
    );
    const totalPosts = countResult.results[0]?.total || 0;
    const totalPages = Math.ceil(totalPosts / limit);

    // Query paginated posts
    const posts = await safeDbQuery(
      c.env.DB,
      `SELECT slug, title, thumbnail_image, hero_image, hero_image_url, category, short_tag, short_preview, published_at, featured
       FROM posts
       WHERE draft = 0 AND archived = 0
       ORDER BY published_at DESC
       LIMIT ? OFFSET ?`,
      [limit, offset],
    );

    const pagination = { page, totalPages, totalPosts };
    const html = renderBlogIndex(posts.results, ctx, pagination);

    return htmlResponse(html, 1800);
  } catch (err) {
    // Database errors throw with status 503
    if (err.status === 503) {
      return errorResponse("Service temporarily unavailable", 503);
    }
    throw err;
  }
}
