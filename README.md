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

## Deployment to Cloudflare Pages

### Option 1: Deploy via Cloudflare Dashboard (Recommended)

1. Log in to your [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Pages** in the sidebar
3. Click **Create a project**
4. Select **Connect to Git**
5. Choose your GitHub account and select the `highsurfcorp-website` repository
6. Configure the build settings:
   - **Production branch**: `main`
   - **Build command**: Leave empty (static site)
   - **Build output directory**: `dist`
7. Click **Save and Deploy**

### Option 2: Deploy via Wrangler CLI

1. Install Wrangler (Cloudflare CLI):
   ```bash
   npm install -g wrangler
   ```

2. Login to Cloudflare:
   ```bash
   wrangler login
   ```

3. Deploy the site:
   ```bash
   wrangler pages deploy dist --project-name=highsurfcorp-website
   ```

## Custom Domain Setup

After deployment, connect your custom domain:

1. In Cloudflare Pages, go to your project
2. Click **Custom domains**
3. Add your domain (e.g., `highsurfcorp.com` and `www.highsurfcorp.com`)
4. Cloudflare will automatically configure DNS if your domain is already on Cloudflare

Since you've already transferred your domain to Cloudflare, the DNS setup should be automatic!

## Tracking & Analytics

The site includes:
- **Google Analytics** (ID: G-93DQDPMR4J)
- **Meta Pixel** (ID: 1712382146162316)
- **Schema.org Structured Data** for local business SEO

These are configured in `head-code.html` and `footer-code.html`.

## Making Updates

1. Make changes to files in the `dist/` directory
2. Test locally by opening HTML files in a browser
3. Commit and push changes:
   ```bash
   git add .
   git commit -m "Description of changes"
   git push origin main
   ```
4. Cloudflare Pages will automatically rebuild and deploy

## Local Development

Since this is a static HTML site, you can:

1. Open files directly in a browser, or
2. Run a local server:
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
