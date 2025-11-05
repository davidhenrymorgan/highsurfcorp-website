# High Surf Corp Website

Static website for High Surf Corp - a family-owned business specializing in coquina, granite, and limestone seawalls in Brevard County, Florida.

## Project Structure

```
.
├── dist/              # Static site files (exported from Webflow)
│   ├── css/          # Stylesheets
│   ├── js/           # JavaScript files
│   ├── images/       # Image assets
│   ├── fonts/        # Custom fonts
│   ├── contact/      # Contact pages
│   ├── legal/        # Legal pages (privacy, terms)
│   └── *.html        # HTML pages
├── head-code.html    # Tracking codes for <head> (Google Analytics, Meta Pixel)
├── footer-code.html  # Schema.org structured data for footer
└── wrangler.toml     # Cloudflare configuration
```

## Deployment to Cloudflare Workers

> **Why Workers?** As of 2024, Cloudflare Workers with static assets is the recommended approach for new projects. Workers offers more features (Durable Objects, Cron Triggers, advanced observability) while maintaining the same cost structure as Pages for static hosting.

### Prerequisites

Install Wrangler (Cloudflare CLI):
```bash
npm install -g wrangler
```

### Deploy via Wrangler CLI (Recommended)

1. Login to Cloudflare:
   ```bash
   wrangler login
   ```

2. Deploy the site:
   ```bash
   wrangler deploy
   ```

   This will:
   - Upload your static assets from the `dist/` directory
   - Deploy to `highsurfcorp-website.workers.dev`
   - Apply your `_headers` and `_redirects` configuration

3. Your site will be live at: `https://highsurfcorp-website.workers.dev`

### Alternative: Deploy via Dashboard

You can also deploy through the Cloudflare Dashboard:

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Workers & Pages**
3. Click **Create** → **Create Worker**
4. Use the Wrangler CLI for easier deployment (recommended)

## Custom Domain Setup

After deployment, connect your custom domain to your Worker:

1. In the [Cloudflare Dashboard](https://dash.cloudflare.com/), go to **Workers & Pages**
2. Click on your `highsurfcorp-website` Worker
3. Go to **Settings** → **Domains & Routes**
4. Click **Add** and enter your domain (e.g., `highsurfcorp.com` and `www.highsurfcorp.com`)
5. Since your domain is already on Cloudflare, DNS will be configured automatically!

**Important:** Workers requires that your domain's nameservers are managed by Cloudflare (which you've already done!).

## Tracking & Analytics

The site includes:
- **Google Analytics** (ID: G-93DQDPMR4J)
- **Meta Pixel** (ID: 1712382146162316)
- **Schema.org Structured Data** for local business SEO

These are configured in `head-code.html` and `footer-code.html`.

## Making Updates

1. Make changes to files in the `dist/` directory
2. Test locally (see Local Development section below)
3. Deploy changes:
   ```bash
   wrangler deploy
   ```
4. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Description of changes"
   git push origin main
   ```

**Note:** Unlike Pages, Workers doesn't have automatic Git deployment by default. You deploy directly via Wrangler CLI.

## Local Development

### Option 1: Wrangler Dev Server (Recommended)

Run a local development server that mimics the Cloudflare Workers environment:

```bash
wrangler dev
```

This will start a local server (usually at `http://localhost:8787`) with hot-reloading.

### Option 2: Simple Static Server

Alternatively, use a basic static server:

```bash
# Using Python
python3 -m http.server 8000 --directory dist

# Using Node.js
npx http-server dist -p 8000
```

Then visit `http://localhost:8000`

## Security Headers

The site includes security headers via `dist/_headers`:
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Referrer-Policy
- Cache-Control for static assets

## Support

- **Phone**: (321) 821-4895
- **Email**: crew@highsurfcorp.com
- **Address**: 330 5th Ave, Indialantic, FL 32903
