# High Surf Corp Website & AI CMS

Marketing website with D1-powered dynamic blog and **AI-powered Admin Dashboard** for High Surf Corp - a family-owned business specializing in coquina, granite, and limestone seawalls in Brevard County, Florida.

**Live Site:** https://highsurfcorp.com
**Admin Panel:** https://highsurfcorp.com/admin

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

# Run local dev server (public site + API)
npx wrangler dev
# Visit http://localhost:8787/
```

### Admin Dashboard Development
```bash
# Terminal 1: Backend worker
npx wrangler dev

# Terminal 2: Admin frontend with hot reload
cd admin-ui && npm install && npm run dev
# Visit http://localhost:5173/
```

## Project Structure

```
├── wrangler.toml              # Cloudflare Workers config (D1, AI, Assets)
├── admin-ui/                  # Admin Dashboard (React + Vite)
│   ├── src/                   # React components
│   ├── vite.config.js         # Build config (output: ../dist/admin)
│   └── package.json           # React 19, Vite 7, Tailwind 3
├── src/                       # Backend Worker (Hono)
│   ├── index.js               # Hono app router
│   ├── migrate.js             # Database migration runner
│   ├── utils/                 # Helpers & DB wrappers
│   ├── views/                 # HTML templates (nav, footer, blog)
│   ├── controllers/
│   │   ├── blog.js            # Public blog rendering
│   │   ├── contact.js         # Contact form
│   │   └── admin.js           # Admin API + AI generation
│   └── middleware/            # Context injection, static serving
├── migrations/                # Versioned D1 schema migrations
├── scripts/                   # Utility scripts
├── dist/                      # Static assets (served by Worker)
│   ├── index.html             # Homepage
│   ├── admin/                 # Compiled Admin UI (gitignored)
│   ├── contact/               # Contact pages
│   ├── legal/                 # Legal pages
│   └── images/                # Static images
└── website-main/blog/         # Source CSV data for seeding
```

**Notes:**
- Blog pages are rendered dynamically from D1 - `dist/blog/` is gitignored
- Admin UI is built by Vite - `dist/admin/` is gitignored

## Tech Stack

**Backend:**
- **Framework:** Hono (modular routing on Cloudflare Workers)
- **Hosting:** Cloudflare Workers
- **Database:** Cloudflare D1 (`highsurf-cms`)
- **Images:** Cloudflare R2 bucket (`highsurfcorp`)
- **AI:** Cloudflare Workers AI (`@cf/meta/llama-3-8b-instruct`)
- **Email:** Resend API for contact form
- **Security:** Cloudflare Turnstile, CSP Headers, HTML Sanitization

**Frontend (Public):**
- **CSS:** Tailwind CSS (via CDN)
- **Blog Template:** aura.build design with dynamic rendering

**Frontend (Admin):**
- **Framework:** React 19 + Vite 7
- **Styling:** Tailwind CSS 3 (bundled)
- **Icons:** Iconify React (Solar icons)

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
npx wrangler secret put ADMIN_SECRET
```
Variables in `wrangler.toml` or `vars`:
- `TURNSTILE_SITE_KEY` (public key)

For local admin development, create `admin-ui/.env.local`:
```
VITE_API_URL=http://localhost:8787/api/admin
VITE_ADMIN_KEY=your_local_password
```

### Update Blog Content in D1
```bash
# Edit CSV, regenerate seed, update D1
node generate-seed.js
npx wrangler d1 execute highsurf-cms --remote --file=./seed.sql
```

### Build Everything
```bash
# Builds admin UI + downloads blog images
npm run build

# Or build admin UI only:
npm run build:admin
```

### Deploy to Production
```bash
# Only from main branch after merge
git checkout main
git merge development
git push origin main
npm run deploy  # Builds everything + deploys
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
