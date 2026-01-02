# High Surf Corp - Deployment Checklist

Deployment guide for the High Surf Corp website.

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

### 3. Local Testing
```bash
# Start local dev server
npx wrangler dev

# Test these URLs:
# - http://localhost:8787/ (homepage)
# - http://localhost:8787/blog (blog index)
# - http://localhost:8787/blog/[any-slug] (blog post)
# - http://localhost:8787/contact/brevard-county-free-estimate (contact form)
```

### 4. Verification Checklist

- [ ] Homepage loads without console errors
- [ ] Blog pages render correctly with images
- [ ] Contact form submission works (via Resend API)
- [ ] Mobile navigation opens/closes correctly
- [ ] Legal pages load correctly
- [ ] 404 page displays with countdown redirect

## Image Optimization (Optional)

```bash
# Optimize images in dist/images/
npm run optimize:images
```

## Commit & Push

### 5. Commit Changes
```bash
git add .
git commit -m "feat: descriptive commit message"
```

### 6. Push to Development
```bash
git push origin development
```

## Production Deployment

### 7. Merge and Deploy
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

### 8. Production Verification
After deployment, verify on production:

- [ ] https://highsurfcorp.com - Homepage loads
- [ ] https://highsurfcorp.com/blog - Blog index works
- [ ] https://highsurfcorp.com/contact/brevard-county-free-estimate - Form works
- [ ] Run Lighthouse audit (target: 90+)
- [ ] Check browser console for errors

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

## Scripts Reference

| Command | Description |
|---------|-------------|
| `npm run build` | Download blog images |
| `npm run optimize:images` | Compress images in dist/ |
| `npm run dev` | Build + local dev server |
| `npm run deploy` | Build + deploy to production |

## Database Updates

To update blog content in D1:
```bash
# Edit CSV files in website-main/blog/
node generate-seed.js
npx wrangler d1 execute highsurf-cms --remote --file=./seed.sql
```

To run migrations:
```bash
node src/migrate.js --remote
```
