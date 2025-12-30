# High Surf Corp Website - Project Context

## Git Workflow (CRITICAL)

### Branch Strategy

- **`main`** - Production branch (synced to Cloudflare Worker and highsurfcorp.com)
  - ⚠️ **NEVER commit directly to main**
  - Only updated via Pull Requests from `development`
  - Protected branch - stays in sync with live site

- **`development`** - Primary working branch for local development
  - All work happens here or in feature branches created from here
  - Test thoroughly before merging to `main`

- **`feature/*`** or **`bugfix/*`** - Optional feature branches
  - Create from `development` for isolated work
  - Merge back to `development` when complete

### Daily Workflow

**Start of EVERY coding session:**
```bash
# Switch to development branch
git checkout development

# Pull latest changes
git pull origin development

# Start working directly on development
# OR create a feature branch (optional)
git checkout -b feature/descriptive-name
```

**After changes are complete and tested:**
```bash
# Stage changes
git add .

# Commit with descriptive message
git commit -m "feat: descriptive message"

# Push to remote
git push origin development  # or feature branch name

# Create PR to main when ready for production
```

### Deployment to Production

1. Work and test on `development` branch
2. When ready for production, create Pull Request: `development` → `main`
3. Review and merge PR
4. `main` branch auto-deploys to Cloudflare Worker (highsurfcorp.com)

## Project Overview
- **Type**: Static marketing website with blog + CMS database
- **Hosting**: Cloudflare Workers (static assets + D1 database)
- **Domain**: highsurfcorp.com
- **Source**: Migrated from Webflow CMS

### Architecture
- **Platform**: Cloudflare Workers
- **Config**: `wrangler.toml` in project root
- **Static Files**: Served from `dist/` directory
- **Database**: Cloudflare D1 (`highsurf-cms`) - blog content stored in SQL
- **Build Process**: Node.js scripts generate static HTML from CSV/D1 data

### R2 Storage (Cloudflare R2 Bucket)
- **Bucket Name**: `highsurfcorp`
- **Access**: Public read access enabled
- **Purpose**: All website images and static assets

**Directory Structure:**
- **Main images**: `highsurfcorp/images/` - Website homepage and general assets
- **Blog images**: `highsurfcorp/images/blog/` - Blog post images (thumbnails, hero images)

**API Endpoints:**
- **S3 API**: `https://8e25b417fafad849c042143bceb1e147.r2.cloudflarestorage.com/highsurfcorp`
- **Public Dev URL**: `https://pub-8a557d48118e46a38c0007cee5e58bd9.r2.dev`

**Usage in HTML:**
```html
<!-- Main website images -->
<img src="https://pub-8a557d48118e46a38c0007cee5e58bd9.r2.dev/images/logo.png" alt="Logo">

<!-- Blog images -->
<img src="https://pub-8a557d48118e46a38c0007cee5e58bd9.r2.dev/images/blog/post-thumbnail.jpg" alt="Post">
```

**Important Notes:**
- All image references should use the public dev URL for production
- Images are served via Cloudflare's global CDN for optimal performance
- Update image paths in CSV files and HTML templates to use R2 URLs
- No authentication required for public reads

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

# Re-run schema (creates/resets tables)
npx wrangler d1 execute highsurf-cms --remote --file=./schema.sql

# Re-seed data (regenerate from CSV first if needed)
node generate-seed.js
npx wrangler d1 execute highsurf-cms --remote --file=./seed.sql
```

**Data Flow:**
1. Source data: CSV files in `website-main/blog/`
2. `generate-seed.js` converts CSV → `seed.sql` (SQL INSERT statements)
3. `schema.sql` + `seed.sql` are executed against D1
4. Worker can query D1 via `env.DB` binding

### Homepage Stack
- **CSS Framework**: Tailwind CSS (via CDN) + Webflow CSS (hybrid for blog compatibility)
- **Fonts**: Montserrat (primary) + Poppins (secondary) via Google WebFont Loader
- **JavaScript**: Vanilla JS + IntersectionObserver for scroll animations
- **Analytics**: Google Analytics (G-93DQDPMR4J) + Meta Pixel (1712382146162316)
- **SEO**: LocalBusiness structured data (schema.org)
- **Design**: Modern, dark theme with glassmorphic elements and Tailwind utilities
- **Blog Integration**: Automatic widget injection via `generate-blog.js` (3 most recent posts)

### Blog System
- **Data Source**: CSV files exported from Webflow
  - Blog posts: `website-main/blog/Copy of High Surf Corp V4.20 - Blog Posts.csv` (23 posts)
  - Topics/categories: `website-main/blog/Copy of High Surf Corp V4.20 - Topics.csv` (65 topics)
- **Generator**: `generate-blog.js` (Node.js script)
- **Output**:
  - Blog index: `dist/blog/index.html`
  - Individual posts: `dist/blog/[slug]/index.html`
  - Homepage widget: Updates `dist/index.html` with 3 most recent posts

### Build & Deployment Workflow

**Regenerating Blog:**
```bash
node generate-blog.js
```

**Local Testing:**
```bash
npx wrangler dev
# Visit http://localhost:8787/
```

**Deploy to Production:**
```bash
# ⚠️ ONLY deploy from main branch (after PR merge)
git checkout main
git pull origin main
npx wrangler deploy
# Deploys to highsurfcorp-website.workers.dev and highsurfcorp.com
```

**Update Blog Content:**
1. Switch to development: `git checkout development`
2. Edit CSV: `website-main/blog/Copy of High Surf Corp V4.20 - Blog Posts.csv`
3. Run: `node generate-blog.js`
4. Test: `npx wrangler dev`
5. Commit: `git add . && git commit -m "feat: update blog content"`
6. Push: `git push origin development`
7. When ready: Create PR `development` → `main`, then deploy from `main`

### Project Structure
```
/
├── wrangler.toml              # Cloudflare Workers config (includes D1 binding)
├── generate-blog.js           # Blog static site generator (CSV → HTML)
├── generate-seed.js           # D1 seed generator (CSV → SQL)
├── schema.sql                 # D1 database schema (tables definition)
├── seed.sql                   # D1 seed data (generated, 88 INSERT statements)
├── dist/                      # Static assets (served by Workers)
│   ├── index.html            # Homepage (includes blog widget)
│   ├── blog/                 # Blog section
│   │   ├── index.html        # Blog listing page
│   │   └── [slug]/index.html # Individual blog posts (23)
│   ├── css/                  # Stylesheets
│   ├── js/                   # Client-side JavaScript
│   ├── _headers              # HTTP headers config
│   └── _redirects            # URL redirect rules
└── website-main/blog/        # Source CSV data
    ├── Copy of High Surf Corp V4.20 - Blog Posts.csv
    └── Copy of High Surf Corp V4.20 - Topics.csv

R2 Bucket (highsurfcorp):      # Image assets stored in Cloudflare R2
├── images/                    # Main website images
└── images/blog/               # Blog post images (thumbnails, hero images)

D1 Database (highsurf-cms):    # Blog content stored in Cloudflare D1
├── topics (65 records)        # Blog categories/topics
└── posts (23 records)         # Blog post content
```

### Key Configuration Files
- **wrangler.toml**: Cloudflare Workers deployment config
  - `directory = "./dist"` - Static assets location
  - `html_handling = "auto-trailing-slash"` - URL normalization
  - `not_found_handling = "404-page"` - Custom 404 page
  - `[[d1_databases]]` - D1 binding (`DB` → `highsurf-cms`)
- **schema.sql**: D1 database table definitions (posts, topics)
- **generate-seed.js**: Converts CSV data → SQL INSERT statements

### CSV Data Structure
**Blog Posts CSV (23 posts):**
- Name, Slug, Published On, Created On
- Categories / topics, Short preview, Meta description
- Thumbnail image, Hero image
- Post body (rich HTML content)
- Feature? (boolean flag for featured posts)

**Topics CSV (65 topics):**
- Name, Slug, Published On
- Used as categories for blog posts

### Common Tasks

**Adding a New Blog Post:**
1. On `development` branch: Add row to CSV: `website-main/blog/Copy of High Surf Corp V4.20 - Blog Posts.csv`
2. Run: `node generate-blog.js`
3. Test: `npx wrangler dev`
4. Commit: `git add . && git commit -m "feat: add new blog post"`
5. Push: `git push origin development`
6. When ready: Create PR `development` → `main` for production deployment

**Updating Homepage Blog Widget:**
- Automatically shows 3 most recent posts (sorted by "Published On" date)
- Updated when `generate-blog.js` runs
- No manual intervention needed

### Technical Details
- **Database**: Cloudflare D1 (`highsurf-cms`) stores blog posts and topics
- **Static Generation**: Blog HTML pre-rendered at build time from CSV data
- **No Workers code yet**: Currently pure static asset serving (D1 ready for future dynamic features)
- **SEO-friendly**: All content server-rendered in HTML
- **Cache-friendly**: Static files cached at Cloudflare edge
- **Framework**: Modern Tailwind CSS + Node.js build scripts

### Recent Changes (December 2025)

**Homepage Rebuild:**
- Replaced Webflow-based homepage with modern Tailwind CSS design
- Maintained blog integration and automatic widget updates
- Implemented hybrid CSS approach (Tailwind for homepage, Webflow for blog pages)
- Added structured data and enhanced analytics

**Performance Optimization (December 30, 2025):**
- **File Cleanup**: Removed 10 obsolete/unused HTML files (~900KB saved)
  - Deleted: home.html, old-home.html, index-old-webflow.html
  - Deleted: styleguide.html, example-content.html, reviews.html
  - Deleted: coquina-rock-revetment.html, detail_brevard-county-coquina-seawall.html, detail_topics.html
- **Font Optimization**: Removed 21 unnecessary Google Font loads from homepage (~300KB network savings)
  - Homepage now only loads Montserrat + Poppins (via WebFont.load)
  - Blog pages retain all 21 fonts for proper Webflow styling (injected via generate-blog.js)
  - Expected performance: 0.5-1.5 seconds faster page load on homepage
- **Bug Fix**: Renamed webflow.js to fix blog page console errors
  - Changed: dist/js/high-surf-corp-v4-20-f4e9b7ff34488e0aa6.js → dist/js/webflow.js

**Key Files:**
- `dist/index.html` - Tailwind-based homepage (optimized, no extra fonts)
- `dist/js/webflow.js` - Webflow JavaScript (renamed from hashed filename)
- `generate-blog.js` - Injects all fonts into blog pages only (not homepage)

**D1 Database Migration (December 30, 2025):**
- Added Cloudflare D1 database (`highsurf-cms`) for CMS content storage
- Created `schema.sql` with `posts` (23 records) and `topics` (65 records) tables
- Created `generate-seed.js` to convert CSV data → SQL INSERT statements
- Generated `seed.sql` with 88 INSERT statements from CSV data
- Migrated all blog content to both local and remote D1 databases
- Deleted obsolete `migrate-to-d1.js` (was just a copy of generate-blog.js)
- D1 binding configured in `wrangler.toml` as `DB` for future Worker code

## Code Quality Standards

- Test locally before committing: `npx wrangler dev`
- Verify blog generation: `node generate-blog.js`
- Commit messages: Clear, descriptive, conventional commits format
- Always work on `development` branch (never commit directly to `main`)
- All changes must be tested before pushing
- Only deploy to production from `main` branch after PR review
