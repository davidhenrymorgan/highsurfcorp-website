# High Surf Corp - Deployment Checklist

Performance optimization deployment guide. Follow these steps to deploy changes safely.

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
- [ ] Contact form validation works (webflow.js loading)
- [ ] Mobile navigation opens/closes correctly
- [ ] All aria-labels are present (check with dev tools)
- [ ] Legal pages load correctly

## Build & Optimize

### 5. Run Minification (Optional - for production)
```bash
# Minify CSS and JS in-place
npm run minify
```

### 6. Image Optimization (Optional)
```bash
# Optimize images in dist/images/
npm run optimize:images
```

## Commit & Push

### 7. Commit Changes
```bash
git add .
git commit -m "perf: performance optimization - LCP, accessibility, dead code removal

- Fix broken JS references in 5 HTML files
- Remove 2.88 MB of dead code (unused images, fonts)
- Add LCP optimization (preconnect, preload, fetchpriority)
- Add accessibility fixes (aria-labels)
- Add build pipeline with minification

Generated with Claude Code"
```

### 8. Push to Development
```bash
git push origin development
```

## Production Deployment

### 9. Create Pull Request
```bash
# Using GitHub CLI
gh pr create --title "Performance Optimization" --body "
## Summary
- Fixed broken JS references causing form issues
- Removed 2.88 MB of dead code
- Added LCP optimizations
- Added accessibility improvements
- Added minification build pipeline

## Testing
- [x] Local testing passed
- [x] Blog pages render correctly
- [x] Contact form works
"
```

### 10. Merge and Deploy
```bash
# After PR approval, switch to main
git checkout main
git pull origin main

# Merge development
git merge development

# Push to main (triggers Cloudflare build)
git push origin main

# Deploy to production
npx wrangler deploy
```

### 11. Production Verification
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

## Performance Targets

| Metric | Before | Target | How to Verify |
|--------|--------|--------|---------------|
| Performance Score | 80 | 95+ | PageSpeed Insights |
| FCP | 4.0s | <1.5s | PageSpeed Insights |
| LCP | Error | <2.5s | PageSpeed Insights |
| Accessibility | 73 | 90+ | Lighthouse |
| Bundle Size | 14 MB | ~11 MB | `du -sh dist/` |

## Scripts Reference

| Command | Description |
|---------|-------------|
| `npm run build` | Regenerate blog widget |
| `npm run minify` | Minify CSS + JS |
| `npm run minify:css` | Minify CSS only |
| `npm run minify:js` | Minify JS only |
| `npm run optimize:images` | Optimize images in dist/ |
| `npm run dev` | Local development |
| `npm run deploy` | Deploy to production |
| `npm run deploy:prod` | Build, minify, then deploy |
