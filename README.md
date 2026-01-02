# High Surf Corp Website

Marketing website with D1-powered dynamic blog for High Surf Corp - a family-owned business specializing in coquina, granite, and limestone seawalls in Brevard County, Florida.

**Live Site:** https://highsurfcorp.com

## Quick Start

```bash
# Clone and install
git clone https://github.com/davidhenrymorgan/highsurfcorp-website.git
cd highsurfcorp-website
npm install

# Run tests
npx vitest run

# Switch to development branch
git checkout development

# Run local dev server
npx wrangler dev
# Visit http://localhost:8787/
# Blog pages rendered dynamically from D1
```

## Project Structure

```
├── wrangler.toml           # Cloudflare Workers config (D1 binding)
├── src/
│   ├── index.js            # Worker: blog routing, contact form, template rendering
│   └── migrate.js          # Database migration runner
├── migrations/             # Versioned D1 schema migrations
├── scripts/
│   ├── fix-image-urls.js   # URL transformation utility
│   ├── optimize-images.js  # Image compression
│   └── backfill-hero-image-url.js
├── generate-blog.js        # Blog image downloader (output gitignored)
├── generate-seed.js        # D1 seed generator (CSV → SQL)
├── dist/                   # Static site files
│   ├── index.html          # Homepage (Tailwind CSS)
│   ├── 404.html            # Custom 404 page
│   ├── contact/            # Contact pages
│   ├── legal/              # Legal pages
│   └── images/             # Static images
└── website-main/blog/      # Source CSV data
```

**Note:** Blog pages (`/blog`, `/blog/:slug`) are rendered dynamically by the Worker from D1. The `dist/blog/` directory is gitignored.

## Tech Stack

- **Hosting:** Cloudflare Workers (static + dynamic)
- **Database:** Cloudflare D1 (`highsurf-cms`) - 23 posts, 65 topics
- **Images:** Cloudflare R2 bucket (`highsurfcorp`)
- **CSS:** Tailwind CSS (via CDN) - all pages
- **Security:** Cloudflare Turnstile (Contact Form), CSP Headers, HTML Sanitization
- **Email:** Resend API for contact form
- **Blog Template:** aura.build design with dynamic rendering

## Git Workflow

- **`main`** - Production (deploys to highsurfcorp.com)
- **`development`** - Active development branch

**Never commit directly to main.** Always work on `development` and merge when ready.

## Common Tasks

### Environment Setup
Required secrets for production:
```bash
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put TURNSTILE_SECRET_KEY
```
Variables in `wrangler.toml` or `vars`:
- `TURNSTILE_SITE_KEY` (public key)

### Update Blog Content in D1
```bash
# Edit CSV, regenerate seed, update D1
node generate-seed.js
npx wrangler d1 execute highsurf-cms --remote --file=./seed.sql
```

### Deploy to Production
```bash
# Only from main branch after merge
git checkout main
git merge development
git push origin main
npx wrangler deploy
```

### D1 Database Commands
```bash
# Query local database
npx wrangler d1 execute highsurf-cms --command="SELECT * FROM posts LIMIT 5"

# Query remote (production) database
npx wrangler d1 execute highsurf-cms --remote --command="SELECT COUNT(*) FROM posts"

# Run migrations
node src/migrate.js --remote
```

## Analytics

- **Google Analytics:** G-93DQDPMR4J
- **Meta Pixel:** 1712382146162316
- **Schema.org:** LocalBusiness structured data

## Troubleshooting

See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for DNS and custom domain issues.

## Contact

- **Phone:** (321) 821-4895
- **Email:** crew@highsurfcorp.com
- **Address:** 330 5th Ave, Indialantic, FL 32903
