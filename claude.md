# High Surf Corp Website - Project Context

## Git Workflow (CRITICAL)

**⚠️ ALWAYS CREATE A NEW BRANCH BEFORE ANY CHANGES**

```bash
# Start of EVERY coding session (before any edits):
git checkout -b feature/descriptive-name

# After changes are complete and tested:
git add .
git commit -m "descriptive message"
git push origin feature/descriptive-name
# Then create PR for review
```

**NEVER commit directly to main** - Current session is the ONLY exception (initial setup/sync)

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
npx wrangler deploy
# Deploys to highsurfcorp-website.workers.dev and highsurfcorp.com
```

**Update Blog Content:**
1. Edit CSV: `website-main/blog/Copy of High Surf Corp V4.20 - Blog Posts.csv`
2. Run: `node generate-blog.js`
3. Test: `npx wrangler dev`
4. Deploy: `npx wrangler deploy`

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
1. Add row to CSV: `website-main/blog/Copy of High Surf Corp V4.20 - Blog Posts.csv`
2. Run: `node generate-blog.js`
3. Commit: `git add dist/ && git commit -m "feat: add new blog post"`
4. Deploy: `npx wrangler deploy`

**Updating Homepage Blog Widget:**
- Automatically shows 3 most recent posts (sorted by "Published On" date)
- Updated when `generate-blog.js` runs
- No manual intervention needed

### Technical Details
- **No database**: All content is pre-rendered at build time
- **No Workers code**: Pure static asset serving
- **SEO-friendly**: All content server-rendered in HTML
- **Cache-friendly**: Static files cached at Cloudflare edge
- **Framework**: Webflow export + custom Node.js build scripts

## Code Quality Standards

- Test locally before committing: `npx wrangler dev`
- Verify blog generation: `node generate-blog.js`
- Commit messages: Clear, descriptive, conventional commits format
- Always work in feature branches (never main)
- All changes must be tested before pushing
