# Troubleshooting Guide

## Error 1016: Origin DNS Error

If you're getting **Error 1016** when accessing your custom domain (e.g., `www.highsurfcorp.com`), this means Cloudflare cannot resolve the DNS for your domain. This is almost always caused by incorrect custom domain configuration.

### Symptoms
- Worker is accessible at `https://highsurfcorp-website.idavidmorganh.workers.dev/` ✅
- Custom domain shows Error 1016 ❌
- DNS lookup returns SERVFAIL

### Root Cause
The custom domain was not properly added as a **Custom Domain** in Workers, or there's a conflicting DNS record.

### Quick Fix (3 Steps)

#### Step 1: Remove Conflicting DNS Records
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Click on `highsurfcorp.com` domain
3. Click **DNS** → **Records**
4. Look for any records named `www` or `@`
5. **Delete** any existing CNAME, A, or AAAA records for these hostnames

**Why?** Workers Custom Domains automatically create DNS records. Manual DNS records conflict with this.

#### Step 2: Remove Incorrectly Added Custom Domains
1. In Cloudflare Dashboard, click **Workers & Pages**
2. Click on `highsurfcorp-website`
3. Click **Settings** → **Domains & Routes**
4. If `www.highsurfcorp.com` is listed under **Routes** (not Custom Domains), delete it
5. If it's listed under **Custom Domains** but showing errors, delete it

#### Step 3: Add Custom Domains Correctly
1. Still in **Settings** → **Domains & Routes**
2. Click **Add** → **Custom Domain**
3. Enter: `www.highsurfcorp.com`
4. Click **Add Custom Domain**
5. Cloudflare automatically creates DNS records and SSL certificates
6. Wait 1-2 minutes for DNS propagation

**Repeat for apex domain:**
7. Click **Add** → **Custom Domain**
8. Enter: `highsurfcorp.com`
9. Click **Add Custom Domain**

### Verify the Fix

Check that DNS is working:
```bash
nslookup www.highsurfcorp.com
```

Should return Cloudflare IPs (not SERVFAIL).

Test in browser:
- `https://www.highsurfcorp.com` should show your site
- `https://highsurfcorp.com` should show your site

### Important: Custom Domains vs Routes

**Custom Domains (Use this for static sites):**
- ✅ Cloudflare automatically creates DNS records
- ✅ Cloudflare automatically issues SSL certificates
- ✅ Worker acts as the origin server
- ✅ All paths route to your Worker
- ❌ Cannot use wildcards (*.highsurfcorp.com)
- ❌ Requires Cloudflare nameservers

**Routes (Don't use this for static sites):**
- ❌ Requires manual DNS record creation
- ❌ Requires manual certificate management
- ❌ Worker acts as middleware (not origin)
- ✅ Supports path patterns like `/api/*`
- ✅ Can use wildcards

For your use case (hosting a static website), always use **Custom Domains**.

## Common Issues

### Issue: "This hostname is already in use"
**Solution:** The hostname has an existing CNAME, A, or AAAA record. Go to DNS → Records and delete it first.

### Issue: Certificate shows "Initializing" for more than 10 minutes
**Solution:**
1. Delete the custom domain
2. Wait 5 minutes
3. Re-add the custom domain
4. Check that your domain uses Cloudflare nameservers

### Issue: "Your zone must be on Cloudflare"
**Solution:** Your domain's nameservers must point to Cloudflare. Check DNS → Nameservers section and update at your domain registrar if needed.

### Issue: DNS shows SERVFAIL
**Solution:** This means no DNS records exist. Add the custom domain via Workers & Pages dashboard (not manually via DNS).

## Verification Checklist

- [ ] Domain uses Cloudflare nameservers
- [ ] No manual CNAME/A/AAAA records for www or apex domain
- [ ] Custom domains added via Workers & Pages → Custom Domains (not Routes)
- [ ] SSL certificate shows "Active" (not "Initializing")
- [ ] DNS lookup returns Cloudflare IPs
- [ ] Site loads in browser without Error 1016

## Still Having Issues?

1. Check [Cloudflare Status](https://www.cloudflarestatus.com/) for outages
2. Review [Error 1016 documentation](https://developers.cloudflare.com/support/troubleshooting/http-status-codes/cloudflare-1xxx-errors/error-1016/)
3. Check Cloudflare Dashboard → Analytics → Security Events for any blocks
4. Try in incognito mode or different browser
5. Clear browser cache and DNS cache:
   ```bash
   # macOS
   sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder

   # Windows
   ipconfig /flushdns
   ```

## Need More Help?

- [Cloudflare Workers Custom Domains Documentation](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)
- [Cloudflare Community Forums](https://community.cloudflare.com/)
- Open an issue on this repo with screenshots of your DNS and Workers configuration
