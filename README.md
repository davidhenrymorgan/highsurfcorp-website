# High Surf Corp Website

Static website with blog for High Surf Corp - a family-owned business specializing in coquina, granite, and limestone seawalls in Brevard County, Florida.

**Live Site:** https://highsurfcorp.com

## Quick Start

```bash
# Clone and install
git clone https://github.com/davidhenrymorgan/highsurfcorp-website.git
cd highsurfcorp-website
npm install

# Switch to development branch
git checkout development

# Run local dev server
npx wrangler dev
# Visit http://localhost:8787/
```

## Project Structure

```
├── wrangler.toml           # Cloudflare Workers config (includes D1 binding)
├── generate-blog.js        # Blog generator (CSV → HTML)
├── generate-seed.js        # D1 seed generator (CSV → SQL)
├── schema.sql              # D1 database schema
├── seed.sql                # D1 seed data (generated)
├── dist/                   # Static site files
│   ├── index.html          # Homepage (Tailwind CSS)
│   ├── blog/               # Blog pages (23 posts)
│   ├── contact/            # Contact pages
│   ├── legal/              # Legal pages
│   ├── css/                # Stylesheets
│   └── js/                 # JavaScript
└── website-main/blog/      # Source CSV data
```

## Tech Stack

- **Hosting:** Cloudflare Workers (static assets)
- **Database:** Cloudflare D1 (`highsurf-cms`)
- **Images:** Cloudflare R2 bucket
- **CSS:** Tailwind (homepage) + Webflow (blog pages)
- **Build:** Node.js scripts

## Git Workflow

- **`main`** - Production (auto-deploys to highsurfcorp.com)
- **`development`** - Active development branch

**Never commit directly to main.** Always work on `development` and create PRs.

## Common Tasks

### Regenerate Blog from CSV
```bash
node generate-blog.js
```

### Deploy to Production
```bash
# Only from main branch after PR merge
git checkout main
git pull origin main
npx wrangler deploy
```

### D1 Database Commands
```bash
# Query local database
npx wrangler d1 execute highsurf-cms --command="SELECT * FROM posts LIMIT 5"

# Query remote (production) database
npx wrangler d1 execute highsurf-cms --remote --command="SELECT COUNT(*) FROM posts"

# Re-seed database from CSV
node generate-seed.js
npx wrangler d1 execute highsurf-cms --remote --file=./schema.sql
npx wrangler d1 execute highsurf-cms --remote --file=./seed.sql
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
