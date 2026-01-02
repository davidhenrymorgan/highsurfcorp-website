# High Surf Corp Website - Project Context

## Git Workflow (CRITICAL)

### Branch Strategy

- **`main`** - Production branch (synced to Cloudflare Worker and highsurfcorp.com)
  - NEVER commit directly to main
  - Only updated via merges from `development`
  - Protected branch - stays in sync with live site

- **`development`** - Primary working branch for local development
  - All work happens here or in feature branches created from here
  - Test thoroughly before merging to `main`

### Daily Workflow

**Start of EVERY coding session:**
```bash
git checkout development
git pull origin development
```

**After changes are complete and tested:**
```bash
git add .
git commit -m "feat: descriptive message"
git push origin development
```

### Deployment to Production

1. Work and test on `development` branch
2. When ready, merge: `git checkout main && git merge development`
3. Push: `git push origin main`
4. Deploy: `npx wrangler deploy`

## Project Overview

- **Type**: Marketing website with D1-powered dynamic blog
- **Hosting**: Cloudflare Workers (static assets + D1 database + dynamic blog rendering)
- **Domain**: highsurfcorp.com
- **CSS Framework**: Tailwind CSS (via CDN) - all pages
- **Migration Status**: Fully migrated from Webflow (January 2026)

## Architecture

- **Platform**: Cloudflare Workers with D1 database
- **Config**: `wrangler.toml` in project root
- **Static Files**: Homepage and other static pages served from `dist/` directory
- **Dynamic Blog**: Worker renders blog pages from D1 database at runtime
- **Database**: Cloudflare D1 (`highsurf-cms`) - blog content stored in SQL
- **Images**: Cloudflare R2 bucket (`highsurfcorp`) - all images served from R2
- **Worker Code**: `src/index.js` handles routing, blog rendering, contact form

### R2 Storage (Cloudflare R2 Bucket)

- **Bucket Name**: `highsurfcorp`
- **Access**: Public read access enabled
- **Public URL**: `https://pub-8a557d48118e46a38c0007cee5e58bd9.r2.dev`

**Directory Structure:**
- **Main images**: `highsurfcorp/images/` - Website homepage and general assets
- **Blog images**: `highsurfcorp/images/blog/` - Blog post images (thumbnails, hero images)

**Usage in HTML:**
```html
<img src="https://pub-8a557d48118e46a38c0007cee5e58bd9.r2.dev/images/blog/image.jpg" alt="...">
```

### D1 Database (Cloudflare D1)

- **Database Name**: `highsurf-cms`
- **Database ID**: `9c2d47fb-8c36-45be-9afe-9ea8f1a3e00f`
- **Binding**: `DB` (access via `env.DB` in Worker code)
- **Purpose**: CMS content storage (blog posts and topics)

**Database Schema:**
```sql
-- Topics/Categories table (65 records)
CREATE TABLE topics (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TEXT,
  updated_at TEXT,
  published_at TEXT
);

-- Blog Posts table (23 records)
CREATE TABLE posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  short_tag TEXT,
  hero_image TEXT,
  hero_image_url TEXT,          -- Canonical display image (added via migration 0003)
  thumbnail_image TEXT,
  featured INTEGER DEFAULT 0,
  short_preview TEXT,
  title_variation TEXT,
  meta_description TEXT,
  category TEXT,
  body TEXT,
  seo_description TEXT,
  introduction TEXT,
  description_variation TEXT,
  archived INTEGER DEFAULT 0,
  draft INTEGER DEFAULT 0,
  created_at TEXT,
  updated_at TEXT,
  published_at TEXT
);
```

**D1 Management Commands:**
```bash
# Query local database
npx wrangler d1 execute highsurf-cms --command="SELECT * FROM posts LIMIT 5"

# Query remote (production) database
npx wrangler d1 execute highsurf-cms --remote --command="SELECT COUNT(*) FROM posts"

# Run migrations
node src/migrate.js --remote
```

## Tech Stack

- **CSS Framework**: Tailwind CSS (via CDN) on all pages
- **Icons**: Iconify (via CDN)
- **Fonts**: Montserrat (primary), Inter (blog), Poppins (secondary)
- **JavaScript**: Vanilla JS + IntersectionObserver for scroll animations
- **Analytics**: Google Analytics (G-93DQDPMR4J) + Meta Pixel (1712382146162316)
- **SEO**: LocalBusiness structured data (schema.org)
- **Email**: Resend API for contact form submissions
- **Security**: 
  - Cloudflare Turnstile (Anti-spam for Contact Form)
  - Content Security Policy (CSP) headers
  - `sanitize-html` for blog content
- **Design**: Dark theme (bg-neutral-950) with pill-shaped navigation

## Blog System (D1 Dynamic)

- **Rendering**: Dynamic at runtime via Cloudflare Worker (`src/index.js`)
- **Template**: aura.build design with Tailwind CSS (embedded in Worker)
- **Database**: D1 (`highsurf-cms`) with 23 posts, 65 topics
- **Routes**:
  - `/blog` - Blog index page (dynamically rendered)
  - `/blog/:slug` - Individual post pages (dynamically rendered)
- **Data Source (for seeding)**: CSV files in `website-main/blog/`

**Note:** The `generate-blog.js` script generates static blog files to `dist/blog/` but these are gitignored. Blog pages are served dynamically by the Worker from D1.

## Build & Deployment Workflow

**Local Testing:**
```bash
# Run Unit Tests
npx vitest run

# Run Dev Server
npx wrangler dev
# Visit http://localhost:8787/
# Blog pages are rendered dynamically from local D1
```

**Deploy to Production:**
```bash
git checkout main
git pull origin main
npx wrangler deploy
```

**Update Blog Content in D1:**
```bash
# Edit CSV files in website-main/blog/
node generate-seed.js
npx wrangler d1 execute highsurf-cms --remote --file=./seed.sql
```

## Project Structure

```
/
├── wrangler.toml              # Cloudflare Workers config (D1 binding, static assets)
├── src/
│   ├── index.js               # Worker code: routing, blog rendering, contact form
│   └── migrate.js             # Database migration runner
├── test/
│   └── index.test.js          # Unit tests (Vitest)
├── migrations/                 # Versioned D1 schema migrations
│   ├── 0001_initial_schema.sql
│   ├── 0002_schema_migrations.sql
│   └── 0003_add_hero_image_url.sql
├── scripts/
│   ├── fix-image-urls.js      # URL transformation utility (Webflow → R2)
│   ├── optimize-images.js     # Image compression utility
│   ├── backfill-hero-image-url.js  # Populate hero_image_url from body
│   ├── upload-blog-images.js  # Upload local blog images to R2 bucket
│   └── remove-dead-code.sh    # Cleanup script for unused files
├── generate-blog.js           # Blog image downloader + static file generator (gitignored output)
├── generate-seed.js           # D1 seed generator (CSV → SQL)
├── schema.sql                 # D1 database schema (reference only, use migrations)
├── seed.sql                   # D1 seed data (generated from CSV)
├── head-code.html             # Analytics snippet (Google + Meta)
├── footer-code.html           # LocalBusiness schema.org structured data
├── dist/                      # Static assets (served by Workers)
│   ├── index.html             # Homepage (Tailwind CSS)
│   ├── 404.html               # Custom 404 page (Tailwind CSS)
│   ├── contact/               # Contact pages (Tailwind CSS)
│   │   ├── brevard-county-free-estimate.html
│   │   └── success.html
│   ├── legal/                 # Legal pages (Tailwind CSS)
│   │   ├── privacy-policy.html
│   │   └── terms-conditions.html
│   ├── images/                # Static images
│   │   └── blog/              # Downloaded blog images (cached)
│   ├── _headers               # HTTP headers config (cache-control)
│   └── _redirects             # URL redirect rules
└── website-main/blog/         # Source CSV data
    ├── Copy of High Surf Corp V4.20 - Blog Posts.csv
    └── Copy of High Surf Corp V4.20 - Topics.csv
```

**Important Notes:**
- `dist/blog/` is gitignored - blog pages are rendered dynamically by the Worker
- `dist/css/` and `dist/js/` directories no longer exist - Tailwind CSS via CDN
- All static pages use Tailwind CSS via CDN script tag

## Worker Routes (src/index.js)

| Route | Handler | Description |
|-------|---------|-------------|
| `/` | Static asset | Homepage (index.html) |
| `/blog` | `handleBlogIndex()` | Dynamic blog index from D1 |
| `/blog/:slug` | `handleBlogPost()` | Dynamic blog post from D1 |
| `/legal/*` | `handleStaticPageWithComponents()` | Legal pages with injected nav/footer, Cached |
| `/contact/*` | `handleStaticPageWithComponents()` | Contact pages with injected nav/footer, Cached |
| `/api/contact` | `handleContactForm()` | Contact form submission (POST) + Turnstile |
| `*` | Static asset | All other static files from dist/ |

## Key Configuration Files

- **wrangler.toml**: Cloudflare Workers deployment config
  - `directory = "./dist"` - Static assets location
  - `html_handling = "none"` - Worker handles all routing
  - `run_worker_first = true` - Routes through Worker for page transformation
  - `[[d1_databases]]` - D1 binding (`DB` → `highsurf-cms`)
  - Resend API key set via: `npx wrangler secret put RESEND_API_KEY`
  - Turnstile Secret set via: `npx wrangler secret put TURNSTILE_SECRET_KEY`

## Common Tasks

**Adding a New Blog Post:**
1. On `development` branch: Add row to CSV: `website-main/blog/Copy of High Surf Corp V4.20 - Blog Posts.csv`
2. Run: `node generate-seed.js` to generate SQL
3. Update remote D1: `npx wrangler d1 execute highsurf-cms --remote --file=./seed.sql`
4. (Optional) Download images: `node generate-blog.js`
5. Test: `npx wrangler dev`
6. Commit and push, then deploy from `main`

**Updating Static Pages:**
All static pages (homepage, contact, legal, 404) use Tailwind CSS via CDN. Edit the HTML files directly in `dist/`.

**Running Database Migrations:**
```bash
# Local
node src/migrate.js

# Remote (production)
node src/migrate.js --remote
```

## Technical Details

- **Contact Form**: Sends via Resend API to crew@highsurfcorp.com
- **Blog Caching**: 1 hour for posts, 30 min for index
- **Static Asset Caching**: Configured in `dist/_headers` (1-year immutable)
- **Page Transformation**: Legal/contact pages get Tailwind CDN and nav/footer injected at runtime
- **Mobile Navigation**: Slide-out drawer with backdrop blur

## Design System

- **Background**: `bg-neutral-950` (dark theme)
- **Text**: `text-neutral-50` (white), `text-white/60` (muted)
- **Accent**: Emerald for links, white for CTAs
- **Navigation**: Pill-shaped with `backdrop-blur-xl`, `rounded-full`
- **Cards**: `bg-neutral-800/50`, `border-white/10`, hover effects
- **Animations**: `animate-slide-up` for entrance effects

## Performance Optimizations (January 2026)

### Homepage Optimizations
- **Removed dead CSS**: Deleted references to non-existent Webflow CSS files (normalize.css, components.css)
- **Consolidated fonts**: Replaced WebFont.js with single Google Fonts load (Montserrat, Inter, Poppins - only used weights)
- **Deduplicated Iconify**: Removed duplicate iconify.min.js, kept only iconify-icon.min.js
- **Resource hints**: Added preconnect/dns-prefetch for R2, Tailwind CDN, Iconify, Vimeo
- **Video optimization**: Changed hero video from 1080p to 720p, added poster image
- **Lazy loading**: Added `loading="lazy"` to blog card images

### Image Error Handling
All blog images now have proper error handling:
- Featured post (blog index): `onerror` hides broken images, gradient background fallback
- Blog post hero: `onerror` hides broken images, gradient background fallback
- Grid/related posts: Already had `onerror` handlers

### R2 Image Management

**Upload blog images to R2:**
```bash
node scripts/upload-blog-images.js
```

**Verify R2 bucket status:**
```bash
npx wrangler r2 bucket info highsurfcorp
```

**Important Notes:**
- All blog images are stored in R2 at `images/blog/` path
- Image filenames may contain URL-encoded characters (`%20`, `%2520`)
- Webflow CDN fallbacks have been removed (account being cancelled)
- Database `hero_image_url` values point directly to R2 public URLs

## Code Quality Standards

- Test locally before committing: `npx wrangler dev`
- Commit messages: Clear, descriptive, conventional commits format
- Always work on `development` branch (never commit directly to `main`)
- All changes must be tested before pushing
- Only deploy to production from `main` branch
