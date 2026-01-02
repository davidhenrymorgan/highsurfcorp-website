# High Surf Corp - Deployment Checklist

Deployment guide for the High Surf Corp website and admin panel.

## Pre-Deployment Verification

### 1. Branch Setup
```bash
# Ensure on development branch
git checkout development

# Pull latest changes
git pull origin development
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Build Everything
```bash
npm run build  # Builds admin UI + downloads blog images
```

Verify build output:
```bash
ls dist/admin/index.html && ls dist/admin/assets/
```

### 4. Local Testing
```bash
# Start local dev server
npx wrangler dev

# Test these URLs:
# - http://localhost:8787/ (homepage)
# - http://localhost:8787/blog (blog index)
# - http://localhost:8787/blog/[any-slug] (blog post)
# - http://localhost:8787/contact/brevard-county-free-estimate (contact form)
# - http://localhost:8787/admin/ (admin dashboard)
# - http://localhost:8787/admin/edit/[post-id] (post editor)
```

### 5. Verification Checklist

#### Public Site
- [ ] Homepage loads without console errors
- [ ] Blog pages render correctly with images
- [ ] Contact form submission works (via Resend API)
- [ ] Mobile navigation opens/closes correctly
- [ ] Legal pages load correctly
- [ ] 404 page displays with countdown redirect

#### Admin Panel
- [ ] Admin dashboard loads at `/admin/`
- [ ] Can view list of blog posts
- [ ] Can open and edit a post
- [ ] Can save changes to a post
- [ ] AI generation modal opens (click "Generate with AI")
- [ ] AI generates outline when form submitted
- [ ] Can create draft from AI outline
- [ ] Authentication works (401 on invalid/missing admin key)

## Environment Variables

### Required Secrets
Verify secrets are set before deployment:
```bash
npx wrangler secret list
```

| Secret | Purpose |
|--------|---------|
| `ADMIN_SECRET` | Admin API authentication key |
| `RESEND_API_KEY` | Email API for contact form |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile form protection |

### Setting Secrets
```bash
npx wrangler secret put ADMIN_SECRET
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put TURNSTILE_SECRET_KEY
```

### Admin UI Environment (Development)
Create `admin-ui/.env.local` for local development:
```
VITE_API_URL=http://localhost:8787/api/admin
VITE_ADMIN_KEY=your-admin-secret
```

## Image Optimization (Optional)

```bash
# Optimize images in dist/images/
npm run optimize:images
```

## Commit & Push

### 6. Commit Changes
```bash
# If admin UI changed, ensure it's built first
git add .
git commit -m "feat: descriptive commit message"
```

### 7. Push to Development
```bash
git push origin development
```

## Production Deployment

### 8. Merge and Deploy
```bash
# Switch to main
git checkout main
git pull origin main

# Merge development
git merge development

# Push to main
git push origin main

# Deploy to production
npx wrangler deploy
```

### 9. Production Verification

#### Public Site
- [ ] https://highsurfcorp.com - Homepage loads
- [ ] https://highsurfcorp.com/blog - Blog index works
- [ ] https://highsurfcorp.com/contact/brevard-county-free-estimate - Form works
- [ ] Run Lighthouse audit (target: 90+)
- [ ] Check browser console for errors

#### Admin Panel
- [ ] https://highsurfcorp.com/admin/ - Admin panel loads
- [ ] Can authenticate with admin key
- [ ] Dashboard displays posts from D1
- [ ] Can edit and save a post
- [ ] AI generation works (uses Cloudflare Workers AI)
- [ ] Post CRUD operations function correctly

## Rollback Plan

If issues occur after deployment:

### Option 1: Revert Commit
```bash
git checkout main
git revert HEAD
git push origin main
npx wrangler deploy
```

### Option 2: Cloudflare Dashboard
1. Go to Cloudflare Dashboard > Workers
2. Select `highsurfcorp-website` worker
3. Go to Deployments
4. Click "Rollback" on previous working deployment

## Admin Panel Troubleshooting

### 401 Unauthorized Errors
- Verify `ADMIN_SECRET` is set: `npx wrangler secret list`
- Ensure client-side admin key matches server secret
- Check `X-Admin-Key` header is being sent with requests

### Admin Panel Blank/Not Loading
- Rebuild admin UI: `cd admin-ui && npm run build && cd ..`
- Verify `dist/admin/index.html` exists
- Check browser console for JS errors
- Verify Vite config has `base: '/admin/'`

### AI Generation Not Working
- Verify AI binding in `wrangler.toml` exists
- Check Cloudflare Workers AI quota/limits
- Review worker logs: `npx wrangler tail`
- AI may timeout on complex requests (30s typical)

### Post Save Failures
- Check D1 database connection: `npx wrangler d1 execute highsurf-cms --remote --command="SELECT 1"`
- Verify required fields (title, slug) are provided
- Check for duplicate slug conflicts
- Review network tab for detailed error responses

## Scripts Reference

| Command | Description |
|---------|-------------|
| `npm run build` | Build admin UI + download blog images |
| `npm run build:admin` | Build admin UI only (to dist/admin/) |
| `npm run optimize:images` | Compress images in dist/ |
| `npm run dev` | Build + local dev server |
| `npm run deploy` | Build + deploy to production |

### Admin UI Commands
| Command | Description |
|---------|-------------|
| `cd admin-ui && npm run dev` | Start admin frontend dev server (port 5173) |

## Content Management

### Creating Blog Posts (Admin Panel)
1. Go to https://highsurfcorp.com/admin/
2. Click "Generate with AI" to create AI-assisted content
3. Review and edit the generated outline
4. Click "Create Draft" to save to D1
5. Edit and publish from the dashboard

### Manual Post Creation
1. Go to https://highsurfcorp.com/admin/
2. Create a new post via the dashboard
3. Fill in title, slug, content, and metadata
4. Save and publish

### Database Migrations
When schema changes are needed:
```bash
# Create migration file in migrations/
# Then run:
node src/migrate.js --remote
```

## Admin Panel Architecture

The admin panel is a React SPA served at `/admin/*`:

```
admin-ui/
├── src/
│   ├── pages/
│   │   ├── Dashboard.jsx    # Post list & management
│   │   └── EditPost.jsx     # Post editor
│   └── components/
│       ├── Layout.jsx       # Sidebar navigation
│       └── GenerateModal.jsx # AI content generation
├── vite.config.js           # Build config (outDir: ../dist/admin)
└── package.json             # React 19, Vite 7
```

### Admin API Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/posts` | GET | List all posts |
| `/api/admin/posts/:id` | GET | Get single post |
| `/api/admin/posts` | POST | Create/update post |
| `/api/admin/posts/:id` | DELETE | Delete post |
| `/api/admin/generate` | POST | AI content generation |

All admin endpoints require `X-Admin-Key` header.
