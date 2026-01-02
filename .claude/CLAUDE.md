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
4. Deploy: `npm run deploy` (builds admin UI + blog images, then deploys)

## Project Overview

- **Type**: Marketing website + Dynamic Blog + **AI Admin Dashboard**
- **Hosting**: Cloudflare Workers (static assets + D1 database + dynamic rendering)
- **Domain**: highsurfcorp.com
- **Admin URL**: highsurfcorp.com/admin
- **CSS Framework**: Tailwind CSS (via CDN for public site, bundled for admin)
- **Migration Status**: Fully migrated from Webflow (January 2026) - Webflow account cancelled

## Architecture

- **Platform**: Cloudflare Workers with D1 database
- **Framework**: Hono (modular routing framework)
- **Admin Frontend**: React + Vite SPA (served at `/admin/*`)
- **Config**: `wrangler.toml` in project root
- **Static Files**: Homepage and other static pages served from `dist/` directory
- **Dynamic Blog**: Worker renders blog pages from D1 database at runtime
- **Database**: Cloudflare D1 (`highsurf-cms`) - blog content stored in SQL
- **Images**: Cloudflare R2 bucket (`highsurfcorp`) - all images served from R2
- **AI**: Cloudflare Workers AI (Llama 3-8B) for content generation
- **Worker Code**: Modular Hono-based architecture in `src/`

### Admin Dashboard Architecture (January 2026)

The Admin Panel is a Single Page Application (SPA) built with React.

- **Source**: `admin-ui/` directory
- **Build Output**: `dist/admin/` (gitignored, built by Vite)
- **Serving**: Worker serves `dist/admin/index.html` for any `/admin/*` request
- **API**: Communicates with Worker via `/api/admin/*` endpoints
- **Auth**: Secured via `X-Admin-Key` header (validated against `ADMIN_SECRET`)
- **AI**: Cloudflare Workers AI (`@cf/meta/llama-3-8b-instruct`) for blog content generation

**Admin UI Structure:**
```
admin-ui/
├── src/
│   ├── main.jsx              # React entry point
│   ├── App.jsx               # Root component with routing
│   ├── index.css             # Global styles + Tailwind
│   ├── pages/
│   │   ├── Dashboard.jsx     # Analytics overview with stats cards & chart
│   │   ├── Posts.jsx         # Blog post list with preview modal
│   │   ├── Leads.jsx         # Lead/inquiry + Email inbox (tabbed interface)
│   │   ├── Intelligence.jsx  # Competitor analysis
│   │   └── EditPost.jsx      # Blog post editor
│   └── components/
│       ├── Layout.jsx        # Sidebar + header layout
│       ├── GenerateModal.jsx # AI content generation modal
│       ├── PreviewModal.jsx  # Blog post preview modal
│       ├── ReplyModal.jsx    # Email reply compose modal
│       ├── StatsCards.jsx    # Dashboard stats cards
│       └── AnalyticsChart.jsx # Traffic/leads chart (recharts)
├── vite.config.js            # Build config (outDir: ../dist/admin)
├── tailwind.config.js        # Admin-specific Tailwind config
└── package.json              # React 19, Vite 7, Tailwind 3, recharts
```

### Modular Architecture (January 2026 Refactor)

The codebase uses a clean separation of concerns:

```
src/
├── index.js                 # Hono app router (~150 lines)
├── utils/
│   ├── helpers.js           # formatDate, escapeHtml, calculateReadingTime, slugify
│   └── db.js                # safeDbQuery, safeDbFirst (D1 error handling)
├── views/
│   ├── components.js        # SCHEMA_JSON, nav, footer, analytics, mobile menu
│   └── templates.js         # Blog post/index page templates
├── controllers/
│   ├── blog.js              # getIndex, getPost handlers
│   ├── contact.js           # postContact handler (saves to leads table + sends email)
│   ├── admin.js             # Admin API: AI generation, blog CRUD
│   ├── leads.js             # Lead management API: list, update status, delete
│   ├── emails.js            # Email management API: list, get, send, update status
│   ├── webhooks.js          # Resend webhook handler (inbound email capture)
│   └── intelligence.js      # Competitor analysis with Firecrawl v2
└── middleware/
    ├── context.js           # Pre-render nav/footer/analytics per request
    └── static.js            # Static page transformation + response helpers + serveAdmin
```

**Key Patterns:**
- **Context Middleware**: Pre-renders nav/footer/analytics once per request via `c.get('nav')`, `c.get('footer')`, etc.
- **Template Context**: Use `getTemplateContext(c)` from `middleware/context.js` to get pre-rendered components
- **Response Helpers**: `htmlResponse()`, `jsonResponse()`, `errorResponse()` in `middleware/static.js`
- **Database Access**: Use `c.env.DB` in Hono handlers, wrap with `safeDbQuery`/`safeDbFirst`

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

-- Leads/Contact form submissions table (added via migration 0005)
CREATE TABLE leads (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  zip TEXT,
  budget TEXT,
  message TEXT,
  status TEXT DEFAULT 'new',    -- new, contacted, closed
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Emails table for inbound/outbound email storage (added via migration 0007)
CREATE TABLE emails (
  id TEXT PRIMARY KEY,
  message_id TEXT UNIQUE NOT NULL,
  from_email TEXT NOT NULL,
  from_name TEXT,
  to_email TEXT NOT NULL,
  subject TEXT,
  html_body TEXT,
  text_body TEXT,
  thread_id TEXT,
  in_reply_to TEXT,
  direction TEXT DEFAULT 'inbound',  -- inbound, outbound
  status TEXT DEFAULT 'unread',      -- unread, read, replied
  lead_id TEXT,                      -- Auto-linked to leads by email match
  created_at TEXT DEFAULT (datetime('now'))
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

### Public Site
- **CSS Framework**: Tailwind CSS (via CDN)
- **Icons**: Iconify (via CDN)
- **Fonts**: Montserrat (primary), Inter (blog), Poppins (secondary)
- **JavaScript**: Vanilla JS + IntersectionObserver for scroll animations
- **Analytics**: Google Analytics (G-93DQDPMR4J) + Meta Pixel (1712382146162316)
- **SEO**: LocalBusiness structured data (schema.org)
- **Email**: Resend API for contact form submissions
- **Design**: Dark theme (bg-neutral-950) with pill-shaped navigation

### Admin Dashboard
- **Framework**: React 19 + Vite 7
- **Styling**: Tailwind CSS 3 (bundled, not CDN)
- **Icons**: Iconify React (@iconify/react) - Solar icon set
- **State**: React Hooks (useState, useEffect)
- **Design**: Dark theme (bg-gray-950) with glassmorphism effects

### Backend
- **Runtime**: Cloudflare Workers
- **Framework**: Hono
- **Database**: D1 (SQLite)
- **AI Model**: `@cf/meta/llama-3-8b-instruct` (Cloudflare Workers AI)

## Blog System (D1 Dynamic)

- **Rendering**: Dynamic at runtime via Cloudflare Worker (`src/index.js`)
- **Template**: aura.build design with Tailwind CSS (embedded in Worker)
- **Database**: D1 (`highsurf-cms`) with 23 posts, 65 topics
- **Routes**:
  - `/blog` - Blog index page (dynamically rendered)
  - `/blog/:slug` - Individual post pages (dynamically rendered)
**Note:** The `generate-blog.js` script downloads blog images to `dist/blog/` but these are gitignored. Blog pages are served dynamically by the Worker from D1. All content is managed via the Admin Panel.

## Build & Deployment Workflow

**Local Testing:**
```bash
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

**Manage Blog Content:**
Use the Admin Panel at https://highsurfcorp.com/admin/ for all content management:
- Create posts with AI assistance
- Edit existing posts
- Publish/unpublish content

## Project Structure

```
/
├── wrangler.toml              # Cloudflare Workers config (D1, AI, Assets bindings)
├── package.json               # Backend dependencies: hono, resend, sanitize-html
├── admin-ui/                  # Admin Dashboard Frontend (React + Vite)
│   ├── src/                   # React components
│   │   ├── main.jsx           # React entry point
│   │   ├── App.jsx            # Root component
│   │   ├── pages/             # Page components
│   │   │   └── Dashboard.jsx  # Blog post list & management
│   │   └── components/        # Reusable components
│   │       ├── Layout.jsx     # Sidebar + header layout
│   │       └── GenerateModal.jsx  # AI content generation
│   ├── vite.config.js         # Build config (outDir: ../dist/admin)
│   ├── tailwind.config.js     # Admin Tailwind config
│   ├── package.json           # Frontend dependencies
│   └── .env.local             # Dev environment variables
├── src/                       # Backend Worker code (Hono)
│   ├── index.js               # Hono app router entry point
│   ├── migrate.js             # Database migration runner
│   ├── utils/
│   │   ├── helpers.js         # formatDate, escapeHtml, calculateReadingTime, slugify
│   │   └── db.js              # safeDbQuery, safeDbFirst (D1 wrappers)
│   ├── views/
│   │   ├── components.js      # SCHEMA_JSON, nav, footer, analytics, mobile menu
│   │   └── templates.js       # Blog post/index page templates
│   ├── controllers/
│   │   ├── blog.js            # getIndex, getPost (public blog)
│   │   ├── contact.js         # postContact (Turnstile + Resend)
│   │   └── admin.js           # Admin API: AI generation, CRUD
│   └── middleware/
│       ├── context.js         # contextMiddleware, getTemplateContext
│       └── static.js          # serveStatic, serveAdmin, response helpers
├── migrations/                # Versioned D1 schema migrations
│   ├── 0001_initial_schema.sql
│   ├── 0002_schema_migrations.sql
│   ├── 0003_add_hero_image_url.sql
│   ├── 0004_competitors.sql
│   ├── 0005_create_leads_table.sql
│   ├── 0006_competitors_content.sql
│   └── 0007_create_emails_table.sql
├── scripts/                   # Utility scripts
│   ├── fix-image-urls.js
│   ├── optimize-images.js
│   ├── backfill-hero-image-url.js
│   ├── upload-blog-images.js
│   └── remove-dead-code.sh
├── generate-blog.js           # Blog image downloader (output gitignored)
├── schema.sql                 # D1 schema reference
├── dist/                      # Static assets (served by Workers)
│   ├── index.html             # Homepage
│   ├── 404.html               # Custom 404 page
│   ├── admin/                 # Compiled Admin UI (gitignored, built by Vite)
│   │   ├── index.html         # React SPA entry
│   │   └── assets/            # JS/CSS bundles
│   ├── contact/               # Contact pages
│   ├── legal/                 # Legal pages
│   ├── images/                # Static images
│   ├── _headers               # HTTP headers config
│   └── _redirects             # URL redirect rules
```

**Important Notes:**
- `dist/blog/` is gitignored - blog pages are rendered dynamically by the Worker
- `dist/admin/` is gitignored - built by Vite from `admin-ui/` source
- `dist/css/` and `dist/js/` directories no longer exist - Tailwind CSS via CDN
- All static pages use Tailwind CSS via CDN script tag
- Worker code is modular - edit specific files rather than one monolithic file

## Worker Routes (src/index.js)

Hono-based routing with modular handlers:

### Public Routes
| Route | Handler | File | Description |
|-------|---------|------|-------------|
| `GET /` | `serveStatic(c, '/index')` | `middleware/static.js` | Homepage with component injection |
| `GET /blog` | `getIndex(c)` | `controllers/blog.js` | Dynamic blog index from D1 |
| `GET /blog/:slug` | `getPost(c)` | `controllers/blog.js` | Dynamic blog post from D1 |
| `GET /legal/:page` | `serveStatic(c)` | `middleware/static.js` | Legal pages with nav/footer |
| `GET /contact/:page` | `serveStatic(c)` | `middleware/static.js` | Contact pages with Turnstile |
| `POST /api/contact` | `postContact(c)` | `controllers/contact.js` | Contact form (Turnstile + Resend) |
| `POST /api/webhooks/resend` | `handleResendWebhook(c)` | `controllers/webhooks.js` | Resend inbound email webhook |
| `GET /admin/*` | `serveAdmin(c)` | `middleware/static.js` | React Admin SPA |
| `GET *` | Fallback | `src/index.js` | Static assets or 404 page |

### Admin API Routes (Protected)
All admin routes require `X-Admin-Key` header matching `ADMIN_SECRET`.

| Route | Handler | File | Description |
|-------|---------|------|-------------|
| `POST /api/admin/generate` | `generateBlogPost(c)` | `controllers/admin.js` | AI content generation |
| `GET /api/admin/posts` | `getAdminPosts(c)` | `controllers/admin.js` | List all posts |
| `GET /api/admin/posts/:id` | `getAdminPost(c)` | `controllers/admin.js` | Get single post |
| `POST /api/admin/posts` | `upsertPost(c)` | `controllers/admin.js` | Create/update post |
| `DELETE /api/admin/posts/:id` | `deletePost(c)` | `controllers/admin.js` | Delete post |
| `GET /api/admin/leads` | `getLeads(c)` | `controllers/leads.js` | List all leads |
| `PATCH /api/admin/leads/:id` | `updateLeadStatus(c)` | `controllers/leads.js` | Update lead status |
| `DELETE /api/admin/leads/:id` | `deleteLead(c)` | `controllers/leads.js` | Delete a lead |
| `GET /api/admin/emails` | `listEmails(c)` | `controllers/emails.js` | List emails with pagination |
| `GET /api/admin/emails/:id` | `getEmail(c)` | `controllers/emails.js` | Get single email |
| `POST /api/admin/emails/send` | `sendEmail(c)` | `controllers/emails.js` | Send reply email |
| `PATCH /api/admin/emails/:id` | `updateEmail(c)` | `controllers/emails.js` | Update email status |

**Adding New Routes:**
```javascript
// In src/index.js
import { myHandler } from './controllers/myController.js';
app.get('/my-route', myHandler);
```

## Key Configuration Files

- **wrangler.toml**: Cloudflare Workers deployment config
  - `directory = "./dist"` - Static assets location
  - `html_handling = "none"` - Worker handles all routing
  - `run_worker_first = true` - Routes through Worker for page transformation
  - `[[d1_databases]]` - D1 binding (`DB` → `highsurf-cms`)
  - `[ai]` - AI binding for Cloudflare Workers AI
  - Secrets set via wrangler:
    - `npx wrangler secret put RESEND_API_KEY`
    - `npx wrangler secret put RESEND_WEBHOOK_SECRET`
    - `npx wrangler secret put ADMIN_SECRET`
    - `npx wrangler secret put TURNSTILE_SECRET_KEY`

- **admin-ui/vite.config.js**: Vite build configuration
  - `base: '/admin/'` - URL base path for admin assets
  - `build.outDir: '../dist/admin'` - Output to worker assets directory

## Common Tasks

**Running Admin Dashboard Locally:**
```bash
# Terminal 1: Start backend worker (port 8787)
npx wrangler dev

# Terminal 2: Start admin frontend (port 5173)
cd admin-ui && npm run dev
```
Visit http://localhost:5173 for admin dashboard with hot reload.

**Building Admin UI:**
```bash
npm run build:admin
# Or build everything (admin + blog images):
npm run build
```
Output goes to `dist/admin/`. The `npm run build` and `npm run deploy` scripts automatically build the admin UI.

**Adding a New Blog Post:**
1. Go to highsurfcorp.com/admin
2. Click "Generate with AI" and enter topic/keywords
3. Review generated outline, click "Create Draft"
4. Edit content, add hero image URL, set metadata
5. Toggle status to Published and save

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
- **Consolidated fonts**: Single Google Fonts load (Montserrat, Inter, Poppins - only used weights)
- **Single Iconify**: Using iconify-icon.min.js only
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
- Database `hero_image_url` values point directly to R2 public URLs

## Code Quality Standards

- Test locally before committing: `npx wrangler dev`
- Commit messages: Clear, descriptive, conventional commits format
- Always work on `development` branch (never commit directly to `main`)
- All changes must be tested before pushing
- Only deploy to production from `main` branch

## Developer Guide (Hono Architecture)

### Creating a New Controller

```javascript
// src/controllers/example.js
import { htmlResponse, jsonResponse } from '../middleware/static.js';
import { getTemplateContext } from '../middleware/context.js';
import { safeDbQuery } from '../utils/db.js';

export async function getExample(c) {
  const ctx = getTemplateContext(c);  // Get pre-rendered nav/footer
  const db = c.env.DB;                // Access D1 database

  // Query database
  const results = await safeDbQuery(db, 'SELECT * FROM posts LIMIT 5');

  // Return HTML or JSON
  return htmlResponse('<html>...</html>', 3600);
  // OR: return jsonResponse({ data: results }, 200, c.req.raw);
}
```

### Registering Routes

```javascript
// src/index.js
import { getExample } from './controllers/example.js';

// Add route
app.get('/example', getExample);
app.post('/api/example', postExample);
```

### Modifying Components

- **Navigation**: Edit `src/views/components.js` → `getNavigationHTML()`
- **Footer**: Edit `src/views/components.js` → `getFooterHTML()`
- **Analytics**: Edit `src/views/components.js` → `getAnalyticsHTML()`
- **Blog Templates**: Edit `src/views/templates.js`

### Key Files by Purpose

| Purpose | File |
|---------|------|
| Add new API endpoint | `src/controllers/` + `src/index.js` |
| Modify blog rendering | `src/controllers/blog.js` + `src/views/templates.js` |
| Change nav/footer | `src/views/components.js` |
| Add database query | `src/utils/db.js` |
| Modify static page injection | `src/middleware/static.js` |
| Add global middleware | `src/middleware/context.js` |

### Environment Variables

Access via `c.env.VARIABLE_NAME` in Hono handlers:
- `c.env.DB` - D1 database binding
- `c.env.ASSETS` - Static assets binding
- `c.env.AI` - Cloudflare Workers AI binding
- `c.env.ADMIN_SECRET` - Admin API authentication key
- `c.env.RESEND_API_KEY` - Email API key (secret)
- `c.env.RESEND_WEBHOOK_SECRET` - Resend webhook signature verification (secret)
- `c.env.TURNSTILE_SITE_KEY` - Cloudflare Turnstile public key
- `c.env.TURNSTILE_SECRET_KEY` - Cloudflare Turnstile secret key

**Admin Frontend Environment (admin-ui/.env.local):**
- `VITE_API_URL` - Backend API URL (dev: `http://localhost:8787/api/admin`)
- `VITE_ADMIN_KEY` - Admin authentication key

### Admin Development

**Adding a new Admin API endpoint:**
```javascript
// src/controllers/admin.js
export async function myNewHandler(c) {
  const db = c.env.DB;
  // Your logic here
  return jsonResponse({ success: true }, 200, c.req.raw);
}

// src/index.js - Add to admin routes section
app.post("/api/admin/my-endpoint", adminAuth, myNewHandler);
```

**Modifying the AI prompt:**
Edit `src/controllers/admin.js` → `generateBlogPost()` function to change:
- System prompt (AI personality/expertise)
- User prompt (output format/structure)
- Max tokens (default: 1024)

**Adding new Admin UI components:**
1. Create component in `admin-ui/src/components/`
2. Import into `Dashboard.jsx` or `Layout.jsx`
3. Build: `npm run build:admin` (or `npm run build` to include blog images)

**Key Admin Files:**
| Purpose | File |
|---------|------|
| Admin API handlers | `src/controllers/admin.js` |
| Lead management API | `src/controllers/leads.js` |
| Email management API | `src/controllers/emails.js` |
| Inbound email webhook | `src/controllers/webhooks.js` |
| Competitor intelligence API | `src/controllers/intelligence.js` |
| AI generation logic | `src/controllers/admin.js` → `generateBlogPost()` |
| Admin SPA routing | `src/middleware/static.js` → `serveAdmin()` |
| React dashboard | `admin-ui/src/pages/Dashboard.jsx` |
| Blog posts list | `admin-ui/src/pages/Posts.jsx` |
| Leads + Email inbox UI | `admin-ui/src/pages/Leads.jsx` |
| React layout | `admin-ui/src/components/Layout.jsx` |
| AI modal | `admin-ui/src/components/GenerateModal.jsx` |
| Post preview modal | `admin-ui/src/components/PreviewModal.jsx` |
| Email reply modal | `admin-ui/src/components/ReplyModal.jsx` |

## Resend Email Integration (January 2026)

### Overview
Inbound email capture via Resend webhooks. Emails sent to `*@send.highsurfcorp.com` are captured and displayed in the admin dashboard alongside leads.

### Architecture
- **Webhook Endpoint**: `POST /api/webhooks/resend` (public, signature-verified)
- **Admin API**: `GET/POST/PATCH /api/admin/emails/*` (protected)
- **Admin UI**: Email Inbox tab in Leads page (`admin-ui/src/pages/Leads.jsx`)

### Webhook Flow
1. Email arrives at `*@send.highsurfcorp.com`
2. Resend sends webhook to `/api/webhooks/resend` with svix signature
3. Worker verifies signature using HMAC-SHA256 (base64-decoded secret)
4. Worker fetches full email content via Resend API
5. Email stored in D1 `emails` table
6. Auto-links to lead if `from_email` matches existing lead

### Key Files
- `src/controllers/webhooks.js` - Svix signature verification, webhook handling
- `src/controllers/emails.js` - Email CRUD API
- `admin-ui/src/pages/Leads.jsx` - Tabbed interface (Form Submissions / Email Inbox)
- `admin-ui/src/components/ReplyModal.jsx` - Reply compose modal

### Resend Dashboard Setup (Required)
1. Register webhook at https://resend.com/webhooks:
   - URL: `https://highsurfcorp.com/api/webhooks/resend`
   - Event: `email.received`
2. Enable Receiving on domain `send.highsurfcorp.com`
3. Add MX record in Cloudflare DNS:
   - Type: MX
   - Name: `send`
   - Content: `inbound-smtp.resend.com`
   - Priority: 10

### Signature Verification
Uses svix headers for webhook verification:
```javascript
// Headers: svix-id, svix-timestamp, svix-signature
const signedContent = `${svixId}.${svixTimestamp}.${rawBody}`;
const secret = webhookSecret.replace('whsec_', '');
const secretBytes = Uint8Array.from(atob(secret), c => c.charCodeAt(0));
// HMAC-SHA256 with crypto.subtle
```
