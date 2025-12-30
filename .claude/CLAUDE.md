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
- **Type**: Static marketing website with blog
- **Hosting**: Cloudflare Workers (static assets only, no custom Worker code)
- **Domain**: highsurfcorp.com
- **Source**: Migrated from Webflow CMS

### Architecture
- **Platform**: Cloudflare Workers
- **Config**: `wrangler.toml` in project root
- **Static Files**: Served from `dist/` directory
- **Build Process**: Node.js scripts generate static HTML from CSV data

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
├── wrangler.toml              # Cloudflare Workers config
├── generate-blog.js           # Blog static site generator
├── dist/                      # Static assets (served by Workers)
│   ├── index.html            # Homepage (includes blog widget)
│   ├── blog/                 # Blog section
│   │   ├── index.html        # Blog listing page
│   │   └── [slug]/index.html # Individual blog posts (23)
│   ├── css/                  # Stylesheets
│   ├── js/                   # Client-side JavaScript
│   ├── images/               # Image assets
│   ├── _headers              # HTTP headers config
│   └── _redirects            # URL redirect rules
└── website-main/blog/        # Source CSV data
    ├── Copy of High Surf Corp V4.20 - Blog Posts.csv
    └── Copy of High Surf Corp V4.20 - Topics.csv
```

### Key Configuration Files
- **wrangler.toml**: Cloudflare Workers deployment config
  - `directory = "./dist"` - Static assets location
  - `html_handling = "auto-trailing-slash"` - URL normalization
  - `not_found_handling = "404-page"` - Custom 404 page

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
- **No database**: All content is pre-rendered at build time
- **No Workers code**: Pure static asset serving
- **SEO-friendly**: All content server-rendered in HTML
- **Cache-friendly**: Static files cached at Cloudflare edge
- **Framework**: Modern Tailwind CSS + Node.js build scripts

### Recent Changes (December 2024)

**Homepage Rebuild:**
- Replaced Webflow-based homepage with modern Tailwind CSS design
- Maintained blog integration and automatic widget updates
- Implemented hybrid CSS approach (Tailwind for homepage, Webflow for blog pages)
- Added structured data and enhanced analytics

**Key Files:**
- `dist/index.html` - New Tailwind-based homepage
- `dist/index-old-webflow.html` - Backup of original Webflow homepage
- `generate-blog.js` - Updated to work with new Tailwind structure
- `generate-blog.js.backup` - Backup of original blog generator
- `dist/home.html` - Original Tailwind template (can be deleted after verification)

## Code Quality Standards

- Test locally before committing: `npx wrangler dev`
- Verify blog generation: `node generate-blog.js`
- Commit messages: Clear, descriptive, conventional commits format
- Always work on `development` branch (never commit directly to `main`)
- All changes must be tested before pushing
- Only deploy to production from `main` branch after PR review
