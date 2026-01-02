/**
 * High Surf Corp - Cloudflare Worker
 * Dynamic blog powered by D1 + R2
 */

import sanitizeHtml from 'sanitize-html';

// ============================================================================
// CONSTANTS
// ============================================================================

const SCHEMA_JSON = `
<script type="application/ld+json">
{
  "@context": "http://schema.org",
  "@type": "LocalBusiness",
  "name": "High Surf Corp",
  "description": "High Surf Corp, a family-owned business with over 30 years of experience, specializes in coquina, granite, and limestone seawalls, also known as rock revetment and rip rap. Serving Brevard County including Melbourne Beach, Rockledge, Merritt Island, and Indialantic, we protect and beautify your coastal property with expert craftsmanship.",
  "url": "https://www.highsurfcorp.com",
  "telephone": "(321) 821-4895",
  "email": "crew@highsurfcorp.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "330 5th Ave",
    "addressLocality": "Indialantic",
    "addressRegion": "FL",
    "postalCode": "32903",
    "addressCountry": "US"
  },
  "image": "https://uploads-ssl.webflow.com/66aaf849b7e0643eadcda40c/66abc5832b3774453246b2e0_hscorp%209700-2-ai%20good-1.jpg",
  "sameAs": [
    "https://www.facebook.com/HighSurfCorp/"
  ],
  "openingHours": "Mo-Sa 08:00-18:00",
  "serviceArea": {
    "@type": "Place",
    "name": "Brevard County",
    "areaServed": [
      {
        "@type": "Place",
        "name": "Melbourne Beach"
      },
      {
        "@type": "Place",
        "name": "Rockledge"
      },
      {
        "@type": "Place",
        "name": "Merritt Island"
      },
      {
        "@type": "Place",
        "name": "Indialantic"
      },
      {
        "@type": "Place",
        "name": "Cocoa Beach"
      },
      {
        "@type": "Place",
        "name": "Palm Bay"
      },
      {
        "@type": "Place",
        "name": "Satellite Beach"
      },
      {
        "@type": "Place",
        "name": "Vero Beach"
      },
      {
        "@type": "Place",
        "name": "Sebastian"
      }
    ]
  },
  "offers": {
    "@type": "Offer",
    "url": "https://www.highsurfcorp.com/",
    "priceCurrency": "USD",
    "price": "Varies"
  }
}
</script>`;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format a date string to "Nov 05, 2024" format
 */
function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = months[date.getMonth()];
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();
  return `${month} ${day}, ${year}`;
}

/**
 * Calculate reading time from HTML content
 */
function calculateReadingTime(html) {
  if (!html) return "5 min read";
  // Strip HTML tags and count words
  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const wordCount = text.split(" ").length;
  const minutes = Math.ceil(wordCount / 200);
  return `${minutes} min read`;
}

/**
 * Escape HTML for safe insertion
 */
function escapeHtml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Extract first image URL from HTML content (for thumbnail fallback)
 */
function extractFirstImageUrl(html) {
  if (!html) return null;
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match ? match[1] : null;
}

// ============================================================================
// RESPONSE HELPERS
// ============================================================================

/**
 * Create an HTML response with caching headers and CSP
 * Note: Cloudflare automatically applies gzip/brotli compression at the edge
 */
function htmlResponse(html, cacheSeconds = 3600) {
  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": `public, max-age=${cacheSeconds}`,
      "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://code.iconify.design https://challenges.cloudflare.com https://www.googletagmanager.com https://connect.facebook.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https: blob:; font-src 'self' https://fonts.gstatic.com data:; connect-src 'self' https://www.google-analytics.com https://www.facebook.com https://challenges.cloudflare.com; frame-src 'self' https://challenges.cloudflare.com;",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "Referrer-Policy": "strict-origin-when-cross-origin"
    },
  });
}

/**
 * Create a JSON response with strict CORS
 */
function jsonResponse(data, status = 200) {
  // In production, you might want to check request.headers.get('Origin')
  // and only allow specific domains. For now, we lock it to the main domain.
  // Ideally, passing the env/request here would allow dynamic checking.
  // We'll default to the production domain or allow localhost for dev if needed (handled by logic below if we had request context).
  
  // Since we don't have request context here easily, we'll set it to the primary domain
  // or use a helper if we want to support localhost during dev.
  // For safety, let's hardcode the production domain, but note that local dev might need a relaxed header.
  // To keep it simple and safe:
  
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "https://highsurfcorp.com", 
      "Vary": "Origin"
    },
  });
}

/**
 * Create an error response (logs detail locally, returns generic message to user)
 */
function errorResponse(message, status, logDetail = null) {
  if (logDetail) {
    console.error(`[${status}] ${message}:`, logDetail);
  }
  return new Response(message, { status });
}

/**
 * Safe database query wrapper - catches D1 errors and returns 503
 * Never leaks SQL syntax to users
 */
async function safeDbQuery(db, sql, params = []) {
  try {
    const stmt = db.prepare(sql);
    if (params.length > 0) {
      return await stmt.bind(...params).all();
    }
    return await stmt.all();
  } catch (err) {
    console.error("D1 Database Error:", { message: err.message, sql });
    const error = new Error("Database unavailable");
    error.status = 503;
    throw error;
  }
}

/**
 * Safe database query for single result
 */
async function safeDbFirst(db, sql, params = []) {
  try {
    const stmt = db.prepare(sql);
    if (params.length > 0) {
      return await stmt.bind(...params).first();
    }
    return await stmt.first();
  } catch (err) {
    console.error("D1 Database Error:", { message: err.message, sql });
    const error = new Error("Database unavailable");
    error.status = 503;
    throw error;
  }
}

// ============================================================================
// REQUEST CONTEXT
// ============================================================================

/**
 * Create a request context with pre-rendered nav/footer components.
 * Call once per request, pass to all handlers.
 */
function createRequestContext(executionCtx) {
  return {
    nav: {
      home: null,
      blog: null,
      contact: null,
      legal: null,
    },
    footer: null,
    _initialized: false,
    // Expose waitUntil from Cloudflare context, or no-op if missing
    waitUntil: executionCtx ? executionCtx.waitUntil.bind(executionCtx) : (p) => p,
  };
}

/**
 * Initialize the context with pre-rendered components (lazy).
 * Call this before using nav/footer in handlers.
 */
function initContext(ctx) {
  if (ctx._initialized) return ctx;
  ctx.nav.home = getNavigationHTML({ activePage: "home" });
  ctx.nav.blog = getNavigationHTML({ activePage: "blog" });
  ctx.nav.contact = getNavigationHTML({ activePage: "contact" });
  ctx.nav.legal = getNavigationHTML({ activePage: "legal" });
  ctx.footer = getFooterHTML();
  ctx.mobileMenuScript = getMobileMenuScript();
  ctx._initialized = true;
  return ctx;
}

// ============================================================================
// REUSABLE COMPONENT TEMPLATES
// ============================================================================

/**
 * Returns the canonical navigation HTML
 * @param {Object} options - { activePage: 'home'|'blog'|'contact'|'legal' }
 */
function getNavigationHTML(options = {}) {
  const { activePage = "" } = options;

  const homeClass =
    activePage === "home" ? "text-white" : "text-white/60 hover:text-white";
  const blogClass =
    activePage === "blog" ? "text-white" : "text-white/60 hover:text-white";
  const contactClass =
    activePage === "contact" ? "text-white" : "text-white/60 hover:text-white";

  return `
    <!-- Navigation (Pill Shaped) -->
    <div class="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 animate-slide-up [animation-delay:0.5s] opacity-0">
      <nav class="flex transition-all duration-300 bg-neutral-900/80 mix-blend-normal w-full max-w-4xl border-white/10 border rounded-full pt-2 pr-6 pb-2 pl-7 shadow-2xl backdrop-blur-xl items-center justify-between">
        <!-- Logo Area -->
        <a href="/" class="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 1280 1024" width="36" height="29" class="w-[36px] h-[29px]" style="color: rgb(250, 250, 250);">
            <path d="M889.52793,963.54244c-52.64646-.53723-99.45921-4.81069-146.39274-6.41648-30.11735-1.03034-60.22339-2.42364-90.27508-4.86938-58.23404-4.7394-115.57374-13.54139-169.94279-36.34464-34.84196-14.61321-66.00519-35.16778-94.31054-59.93326-50.11185-43.84467-91.15683-95.00661-122.39817-153.99851-22.13031-41.78797-36.06525-86.34137-43.95908-132.66898-17.71283-103.95354-.47165-200.87368,59.48288-289.11103,44.45757-65.42995,102.7728-114.93871,171.0591-153.76822,34.69939-19.73102,71.57753-32.91664,110.21223-42.21907,51.49075-12.3979,103.26317-22.47845,156.49692-21.48905,69.90399,1.29922,136.82564,15.3412,199.07293,48.42837,16.83698,8.94957,31.9905,20.30759,46.01737,33.07742,35.43421,32.25885,66.59963,68.20869,92.09568,108.90757,2.72007,4.34213,4.81287,9.08954,7.03175,13.72801.67435,1.40962,1.45227,3.19335.17727,4.64022-1.57219,1.78393-3.50697.80761-5.16716.04828-7.58506-3.46938-13.87835-8.67591-19.05013-15.13643-15.20034-18.9885-31.15343-37.21216-48.15647-54.69582-48.9225-50.30523-109.87305-73.38396-177.8093-82.03822-44.12649-5.6212-87.43492-.396-129.71052,11.44975-39.61506,11.1003-74.79197,31.58225-105.70572,58.98072-51.44864,45.59827-84.83953,102.73041-106.15858,167.44651-12.55496,38.11181-20.59707,77.23002-25.2565,117.08211-7.66017,65.51707,10.93192,122.62047,52.82228,173.29697,37.79815,45.72602,83.47697,81.4429,133.94422,111.72416,67.52264,40.51485,139.07834,71.81402,214.57243,93.9815,49.61661,14.56899,100.20186,25.11567,151.34718,32.39986,28.40991,4.04622,57.1718,5.92355,85.92685,6.45384,43.1689.79626,85.80667-3.63717,127.83368-13.70196,9.80497-2.34807,19.15311-6.06132,28.68237-9.23803,5.10022-1.7003,10.20386-3.46949,15.63124-3.74076,2.79163-.13966,5.89594-.36964,7.27459,2.8488,1.25299,2.92523-.16563,5.49196-1.94463,7.76308-3.93334,5.02147-9.53337,7.45848-15.32583,9.39946-25.9225,8.68683-51.67038,17.97868-77.87202,25.7283-35.84209,10.60134-70.86689,23.76153-107.29311,32.59394-45.65143,11.06943-91.72144,17.62352-138.68989,18.06522-13.30878.1251-26.58521,1.76465-34.26271,1.32578Z" fill="#ffffff"></path>
            <path d="M16.28316,802.63361c1.90842-29.55209,11.1553-57.34348,20.12905-85.15522,18.41082-57.05965,41.30256-112.35522,66.59847-166.65638,24.48598-52.56248,49.29555-104.97411,74.0444-157.41351,16.86311-35.7307,33.86549-71.39552,50.80772-107.08878,2.30823-4.86296,4.54826-9.80211,8.01536-13.95524,2.11013-2.52762,4.14062-6.94236,8.22992-4.56178,4.11361,2.39476,1.44747,6.29858.04389,9.35703-3.60744,7.86063-7.81583,15.4625-11.11217,23.44576-22.74684,55.08952-46.40318,109.77075-60.4158,168.11154-19.17303,79.8261-10.4903,156.77144,23.02918,230.78363,48.19681,106.42036,127.51613,182.51452,232.14147,232.92845,11.37682,5.48185,23.34748,9.50082,35.46803,13.10535,4.51515,1.34274,10.58987,2.70862,9.81264,9.04953-.70953,5.78911-6.5643,5.7251-11.11292,6.53352-7.00997,1.24584-13.96241-.46954-20.96463-.46423-52.5746.03941-105.14938-.2238-157.72404-.20958-36.44205.00985-72.18444-6.26739-107.67079-13.20517-40.71678-7.96041-78.91344-23.21633-112.40694-48.34939-29.12122-21.85199-45.2696-51.08945-46.8966-87.85908-.12362-2.79353-.01625-5.59743-.01625-8.39645Z" fill="#ffffff"></path>
          </svg>
        </a>

        <!-- Links -->
        <div class="hidden md:flex gap-8 text-sm font-medium items-center">
          <a href="/" class="${homeClass} transition-colors">Home</a>
          <a href="/#process" class="text-white/60 hover:text-white transition-colors">Our Process</a>
          <a href="/blog" class="${blogClass} transition-colors">Blog</a>
          <a href="/contact/brevard-county-free-estimate" class="${contactClass} transition-colors">Contact</a>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-2">
          <a href="/contact/brevard-county-free-estimate" class="hidden md:block bg-white text-black px-4 py-2 rounded-full text-sm font-medium hover:bg-neutral-200 transition-colors">
            Get a Quote
          </a>
          <button id="mobile-menu-button" class="md:hidden relative w-12 h-12 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors group" aria-label="Open navigation menu">
            <iconify-icon icon="solar:menu-dots-square-linear" width="20"></iconify-icon>
            <span class="absolute top-2 right-2 w-1.5 h-1.5 bg-white rounded-full scale-0 group-hover:scale-100 transition-transform duration-300"></span>
          </button>
        </div>
      </nav>
    </div>

    <!-- Mobile Navigation Drawer -->
    <div id="mobile-nav-drawer" class="fixed inset-0 z-[60] pointer-events-none">
      <!-- Backdrop -->
      <div id="mobile-nav-backdrop" class="absolute inset-0 bg-black/80 backdrop-blur-sm opacity-0 transition-opacity duration-300"></div>

      <!-- Drawer -->
      <div id="mobile-nav-content" class="absolute top-0 right-0 h-full w-[80%] max-w-sm bg-neutral-900 shadow-2xl transform translate-x-full transition-transform duration-300 ease-out">
        <div class="flex flex-col h-full p-6">
          <!-- Close Button -->
          <div class="flex justify-end mb-8">
            <button id="mobile-nav-close" class="w-12 h-12 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors" aria-label="Close navigation menu">
              <iconify-icon icon="solar:close-circle-linear" width="24"></iconify-icon>
            </button>
          </div>

          <!-- Navigation Links -->
          <nav class="flex flex-col gap-6 text-lg font-medium">
            <a href="/" class="text-white hover:text-white/70 transition-colors py-3 border-b border-white/10">Home</a>
            <a href="/#process" class="text-white/80 hover:text-white transition-colors py-3 border-b border-white/10">Our Process</a>
            <a href="/blog" class="text-white/80 hover:text-white transition-colors py-3 border-b border-white/10">Blog</a>
            <a href="/contact/brevard-county-free-estimate" class="text-white/80 hover:text-white transition-colors py-3 border-b border-white/10">Contact</a>

            <!-- CTA Button -->
            <a href="/contact/brevard-county-free-estimate" class="mt-8 w-full bg-white text-neutral-900 font-semibold py-4 px-6 rounded-xl hover:bg-white/90 transition-colors text-center">
              Get a Free Estimate
            </a>
          </nav>
        </div>
      </div>
    </div>
  `;
}

/**
 * Returns the canonical footer HTML
 */
function getFooterHTML() {
  return `
    <!-- Footer -->
    <footer class="z-10 text-white bg-black border-white/10 border-t pt-16 pr-6 pb-16 pl-6 relative">
      <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div class="col-span-1 md:col-span-2">
          <div class="flex mb-6 gap-x-2 gap-y-2 items-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="#ffffff" viewBox="0.21 0.98 242.24 60.25" class="w-[234px] h-[60px]">
              <g>
                <path fill="#ffffff" d="M150.15 27.87c1.98 1.21 3.07 3.17 4.24 5.07.58.95 1.19 1.89 1.84 2.93h-4.55c-1.11-1.65-2.26-3.37-3.41-5.08-.07-.1-.14-.19-.2-.3-1.05-1.82-2.55-2.69-4.8-2.22v7.61h-3.75c-.13-1.08-.14-17.37-.02-18.6.29-.18.61-.08.92-.08 2.36-.01 4.72 0 7.08 0 1 0 1.99.08 2.98.21 2.53.35 3.92 1.89 4.23 4.33.34 2.71-.94 5.22-4.22 5.8-.11.02-.24.02-.34.33m-6.88-2.81c1.83 0 3.54.03 5.26 0 1.42-.03 2.27-.84 2.31-2.2.04-1.45-.67-2.24-1.96-2.4-1.85-.23-3.71-.07-5.6-.1v4.71Z"></path>
                <path fill="#ffffff" d="M82.97 22.41c-1.29.23-2.46.45-3.66.67-.24-.13-.29-.41-.43-.66-.74-1.36-1.83-2.18-3.43-2.21-1.17-.02-2.32-.03-3.36.62-1.21.75-2 1.83-2.3 3.21-.37 1.7-.4 3.43.06 5.1.96 3.45 4 4.34 6.39 3.72 1.05-.27 2.05-.65 2.96-1.35v-2.37c-1.34-.12-2.73.02-4.17-.09-.12-1.07-.1-2.08-.03-3.13h7.96c.06.06.09.09.11.12s.06.07.06.1v7.23c-.48.57-1.13.96-1.8 1.31-1.63.87-3.38 1.45-5.23 1.56-3.06.19-5.9-.4-8.08-2.76-1.34-1.45-2.01-3.23-2.28-5.16-.21-1.51-.13-3.01.18-4.51.81-3.98 4.13-6.78 8.08-6.89 1.2-.03 2.39-.05 3.58.21 2.86.63 4.6 2.37 5.4 5.28Z"></path>
                <path fill="#ffffff" d="M227.72 35.82c-1.42.28-2.85 0-4.3.14-1.23-1.82-2.44-3.6-3.64-5.38-.11-.17-.22-.33-.32-.5-1.05-1.73-2.62-2.18-4.59-1.82v7.59h-3.67V17.3c.19-.22.49-.11.75-.11h7.67c.92 0 1.83.11 2.74.25 1.97.29 3.24 1.44 3.84 3.31a5.54 5.54 0 0 1-.04 3.53c-.61 1.79-1.91 2.78-3.69 3.22-.18.05-.4 0-.53.16-.08.2.05.32.18.4 1.38.89 2.29 2.21 3.12 3.56s1.76 2.64 2.48 4.07zm-12.85-10.78c1.95 0 3.85.05 5.75-.02.79-.03 1.38-.55 1.7-1.32.66-1.62-.3-3.18-2.11-3.31-1.07-.08-2.15-.03-3.23-.04h-2.12v4.7Zm-4.8 1.37c-.01 1.87-.16 3.49-.89 5-1.2 2.51-3.13 4.06-5.85 4.64-1.91.4-3.83.35-5.67-.25-2.38-.79-4.13-2.37-5.01-4.78-1.14-3.12-1.16-6.25.2-9.3 1.21-2.72 3.37-4.31 6.3-4.72 1.7-.24 3.4-.19 5.08.37 2.9.97 4.58 3.01 5.48 5.84.36 1.13.19 2.3.35 3.2Zm-3.95.18c0-.48.05-.96 0-1.43-.33-2.62-1.64-4.82-4.78-5-2.24-.13-4.1.91-4.87 2.88-.98 2.49-1 4.99.2 7.4.87 1.76 2.41 2.59 4.36 2.59s3.43-.86 4.35-2.61c.62-1.19.83-2.48.75-3.81Z"/><path fill="#ffffff" d="M106.06 29.95c1.17-.36 2.31-.21 3.41-.44.3.24.32.61.44.94q.885 2.535 3.6 2.61c.93.03 1.84-.03 2.66-.53.82-.49 1.31-1.19 1.22-2.17-.09-.95-.69-1.43-1.58-1.71-1.37-.44-2.75-.78-4.13-1.16-1.43-.4-2.75-.99-3.8-2.11-1.85-1.98-1.67-5.86 1.27-7.52.66-.37 1.37-.64 2.13-.76 2.07-.33 4.13-.37 6.12.47 2.09.88 3.25 2.63 3.24 5.04h-3.7c-.11-.32-.2-.71-.38-1.04-.37-.69-.88-1.17-1.72-1.34-1.05-.22-2.05-.18-3.08.06-.45.11-.8.35-1.09.69-.48.58-.46 1.26.05 1.83.56.63 1.34.83 2.11 1.05 1.49.43 3.01.76 4.48 1.26 1.69.56 3.05 1.57 3.62 3.36 1.06 3.35-.66 6.69-4.15 7.47-1.94.44-3.85.42-5.81.04-2.31-.45-4.74-2.58-4.91-6.04"></path>
                <path fill="#ffffff" d="M99.67 35.89h-3.73v-8.08h-7.43v8.07h-3.78V17.24h3.64s.02.03.05.06c.02.03.07.06.07.09v7.14h7.39v-7.2c.68-.25 1.31-.11 1.93-.14.6-.02 1.19 0 1.86 0zm-40.74.01H55.2v-8.11h-7.36v8.07c-1.26.14-2.45.06-3.62.06-.24-1-.33-14.7-.13-18.62.59-.23 1.23-.08 1.84-.11.59-.02 1.18 0 1.85 0v7.36c1.25.1 2.43.04 3.61.05 1.2.01 2.4 0 3.58 0 .05-.04.08-.07.1-.1.03-.03.07-.06.07-.09v-7.13c1.27-.19 2.49-.03 3.78-.11v18.72Zm63.47-18.66h3.73c.16.42.08.82.08 1.21 0 3.36.01 6.72.01 10.07 0 .68.08 1.35.18 2.02.11.76.51 1.32 1.12 1.77 1.19.88 3.39.98 4.66.21.69-.42 1.09-1.04 1.23-1.82.12-.75.21-1.5.2-2.26V17.25h3.63c.23.22.13.52.13.78 0 3.64.02 7.28 0 10.91 0 .8-.06 1.6-.19 2.38-.34 2.02-1.44 3.95-4.36 4.64-1.86.44-3.72.37-5.58.05-2.35-.41-4.44-2.28-4.66-5.18-.11-1.43-.21-2.87-.2-4.31.01-2.72 0-5.44 0-8.16v-1.14Z"></path>
                <path fill="#ffffff" d="M227.72 35.82v-.13c.19 0 .28-.11.29-.29V17.36c.37-.26.7-.16 1-.16h6.6c.8 0 1.59.08 2.39.18 2.39.3 3.99 2.12 4.34 4.45.16 1.1.18 2.25-.24 3.32-.82 2.11-2.31 3.33-4.63 3.58-1.84.2-3.67.13-5.61.19v6.99c-1.45.02-2.79.12-4.13-.08Zm4.15-15.48v5.34c1.49.11 2.92 0 4.34-.14.72-.07 1.37-.39 1.81-1.03 1.08-1.59.28-3.6-1.62-3.99-1.46-.3-2.94-.14-4.53-.18M191.3 22.4c-1.24.29-2.43.56-3.66.85-.43-.85-.71-1.71-1.5-2.29-1.33-.97-3.72-1.03-5.06-.08-.89.63-1.47 1.47-1.72 2.5-.6 2.41-.64 4.82.32 7.16.66 1.61 1.96 2.36 3.63 2.47s2.93-.63 3.71-2.12c.29-.56.49-1.16.76-1.81 1.19.38 2.35.74 3.5 1.11-.49 2.96-2.7 5.46-5.82 5.92-1.02.15-2.04.22-3.09.09-3.35-.44-5.56-2.3-6.68-5.4-1.18-3.26-.98-6.54.56-9.64 1.22-2.44 3.36-3.81 6.04-4.19 1.83-.26 3.66-.13 5.38.72 1.96.96 3.09 2.54 3.63 4.7Z"></path>
                <path fill="#ffffff" d="M156.46 17.24h12.7v3.07h-8.86c-.15.8-.07 1.55-.08 2.29-.01.71 0 1.42 0 2.2h7.68v3.09c-.75.2-1.58.06-2.4.08-.88.02-1.76 0-2.64 0h-2.6v7.89c-1.31.11-2.52.04-3.8.05V17.23Z"></path>
                <path fill="#ffffff" d="M60.97 17.22h3.64v18.66h-3.69c-.2-1.17-.16-17.86.05-18.66m173.76 23.79h1.85c1.23 1.98 2.46 3.96 3.69 5.95.06-.02.11-.04.17-.06v-5.88h1.71c.22.84.29 6.82.1 9.45h-1.97c-1.15-1.84-2.34-3.75-3.69-5.92v5.89c-.65.16-1.23.08-1.86.09V41ZM128.6 50.5h-2.01c-1.21-1.94-2.4-3.85-3.58-5.75-.06.02-.11.04-.17.07v5.65c-.63.12-1.2.08-1.83.03v-9.41c.53-.31 1.13 0 1.73-.18 1.45 1.95 2.46 4.12 3.99 6.21v-6.1h1.87z"></path>
                <path fill="#ffffff" d="M192.23 40.98c1.66 0 3.22-.02 4.77 0 .68.01 1.38.09 1.93.53 1.77 1.39 1.15 3.88-.34 4.5-.24.1-.55.12-.73.49.58.54 1.13 1.16 1.53 1.88.39.69.95 1.28 1.21 2.11h-2.23c-.57-.85-1.2-1.72-1.75-2.63-.56-.91-1.27-1.42-2.48-1.18v3.8h-1.92v-9.51Zm1.92 4.02c1 0 1.88.05 2.75-.02.75-.06 1.06-.48 1.05-1.19 0-.64-.31-1.06-1-1.12-.93-.07-1.88-.13-2.8.05v2.27Zm-47.81 5.51h-1.84v-9.56c1.82.05 3.64-.1 5.46.11 2.06.24 2.61 2.2 2.08 3.66-.17.47-.44.85-.88 1.09-.34.19-.68.37-1.11.6 1.24 1.15 2 2.58 2.9 4.05h-2.3c-.59-.85-1.2-1.77-1.86-2.67-.83-1.15-.85-1.14-2.41-1.15-.08 1.24 0 2.5-.05 3.86Zm.07-7.87V45c.93 0 1.81.05 2.68-.01.83-.06 1.23-.62 1.12-1.38-.08-.55-.5-.92-1.19-.96-.83-.04-1.67 0-2.61 0Zm-51.22 7.83c-.65-.95-1.32-1.88-1.93-2.86-.54-.87-1.29-1.11-2.3-.92v3.73c-.63.24-1.22.04-1.79.15-.22-.94-.29-6.57-.12-9.47.31-.24.68-.12 1.02-.13 1.08-.02 2.16 0 3.24 0 .48 0 .95.04 1.42.15 1.26.31 1.9 1 2.06 2.31.13 1.05-.4 2.04-1.37 2.56-.24.13-.48.24-.83.42 1.24 1.17 2.01 2.59 2.91 4.06zM90.92 45c1 0 1.88.05 2.75-.01.74-.05 1.11-.5 1.11-1.16s-.36-1.11-1.1-1.17c-.9-.06-1.81-.01-2.76-.01v2.36Z"></path>
                <path fill="#ffffff" d="M180.96 45.68c-.07-.79.1-1.61.47-2.37.92-1.89 2.82-2.79 4.98-2.45 2.17.34 3.51 1.84 3.81 4.01.17 1.2.07 2.4-.49 3.5-.59 1.15-1.48 1.91-2.8 2.2-3.62.81-6.15-1.51-5.97-4.89m7.28.07c-.04-.44-.04-.88-.14-1.3-.25-1.13-1.15-1.82-2.31-1.91-1.22-.09-2.35.7-2.57 1.68-.26 1.11-.32 2.2.09 3.28.62 1.62 2.62 2.09 3.93.96.84-.73 1-1.68 1-2.71m44.54 0c.04.83-.07 1.58-.36 2.29-.88 2.15-2.78 2.93-5.09 2.64-2.42-.3-3.55-2.04-3.81-3.99-.24-1.82.07-3.53 1.53-4.81 1.5-1.32 3.27-1.42 5.04-.7 1.77.71 2.57 2.17 2.69 4.03.01.2 0 .4 0 .53Zm-4.6-3.22c-1.27 0-2.09.61-2.44 1.84a5.1 5.1 0 0 0 0 2.82c.34 1.19 1.36 1.92 2.56 1.9 1-.01 2.29-1.17 2.35-2.19.05-.76.14-1.49 0-2.25-.25-1.32-1.13-2.11-2.47-2.12M87.09 45.82c-.04 1.2-.24 2.42-1.08 3.41-1.15 1.35-2.69 1.67-4.34 1.45-2.18-.28-3.34-1.48-3.76-3.7-.29-1.54-.17-3.03.74-4.35 1.09-1.58 3.04-2.19 5.11-1.68 1.77.44 3.05 1.99 3.28 3.98.03.28.03.56.05.89m-7.28-.02c.03.35.02.76.11 1.15.29 1.3 1.31 2.14 2.53 2.13 1.23 0 2.2-.87 2.49-2.16.17-.75.18-1.49.02-2.25-.3-1.41-1.2-2.17-2.59-2.14-1.35.03-2.27.86-2.48 2.27-.05.31-.05.64-.07 1Zm81.91 4.69h-7.28v-9.48c1.14-.11 2.33-.03 3.5-.05 1.16-.01 2.31 0 3.41 0 .3.26.27.54.26.82v.8h-5.09c-.17.74-.1 1.39-.06 2.15h4.71v1.65c-1.52.06-3.06 0-4.65.04-.19.79-.06 1.58-.1 2.46h5.02c.38.32.25.62.28.88.02.23 0 .46 0 .73m-55.99-5.79v1.66h-4.61c-.25.87-.11 1.68-.1 2.55h5.1c.28.53.12 1.03.16 1.58h-7.26v-9.47h6.93c.27.44.02.96.2 1.61-1.74.02-3.4 0-5.1.01v2.06h4.69Zm65.06-.95h-1.88c-.65-1.22-1.5-1.59-2.69-1.15-.35.13-.68.28-.71.71-.04.49.29.74.68.87.68.22 1.37.42 2.07.58.47.11.91.3 1.33.52 1.08.57 1.6 1.57 1.48 2.77-.12 1.15-1.01 2.2-2.12 2.47-.98.24-1.95.29-2.96.1-1.39-.26-2.16-1.09-2.57-2.36-.07-.22-.1-.46-.17-.76.6-.09 1.18-.17 1.68-.25.33.18.3.45.4.66.54 1.12 1.82 1.54 2.94.99.55-.27.81-.7.75-1.23-.06-.52-.39-.72-.87-.84-.66-.15-1.29-.4-1.95-.56-.47-.12-.9-.32-1.32-.55-1.5-.85-1.71-2.92-.43-4.06 1.27-1.13 4.09-1.17 5.36-.04.59.52.9 1.2.98 2.15Zm-104.92-.06c-.62.18-1.25.12-1.86.12-.68-1.26-1.69-1.67-2.81-1.16-.29.13-.57.3-.59.68-.02.36.18.58.48.77.35.22.75.26 1.13.38.68.21 1.4.35 2.06.61 1.33.52 1.98 1.58 1.86 2.88-.13 1.4-.95 2.27-2.38 2.6-.87.21-1.72.21-2.6.06-1.48-.25-2.35-1.08-2.66-2.53-.03-.15-.08-.31-.11-.46 0-.03.02-.07.05-.16.51-.08 1.06-.16 1.55-.24.4.19.36.56.52.83.57.98 1.78 1.35 2.81.86.55-.27.86-.72.83-1.2-.04-.59-.46-.79-.95-.92-.58-.15-1.15-.3-1.72-.48-.42-.13-.83-.28-1.23-.47-.93-.45-1.48-1.13-1.53-2.23-.06-1.12.48-1.88 1.37-2.34 1.43-.73 2.93-.71 4.37.02.89.45 1.22 1.1 1.43 2.38Zm72.22-2.66c.02.19.04.35.04.5v1.03h-5.07c-.23.73-.1 1.39-.1 2.15h4.71v1.65h-4.61c-.24.87-.06 1.68-.14 2.56h5.18c.43.5.11 1 .32 1.57-1.31.08-2.49.03-3.67.04h-3.67v-9.51h7Z"/><path class="Layer_1-2__cls-5" d="M75.73 50.51h-1.82v-4h-3.8v3.92c-.65.2-1.24.08-1.9.09v-9.49h1.81v3.65h3.83v-3.67h1.76c.22.89.29 6.47.11 9.51Z"/><path class="Layer_1-2__cls-2" d="M210.79 50.5h-2.08c-.28-.66-.58-1.35-.88-2.07h-3.75c-.24.64-.48 1.31-.75 2.04-.64.14-1.3.08-2.1.04 1.25-3.22 2.47-6.36 3.7-9.51H207c1.24 3.11 2.5 6.26 3.79 9.5m-6.04-3.72c.93-.04 1.65.11 2.4-.15-.39-1.1-.76-2.13-1.15-3.22-.61 1.01-.88 2.1-1.25 3.37m-89.68 2.13v1.56h-6.72v-9.38h1.91c.16 1.28.04 2.59.07 3.89.02 1.27 0 2.55 0 3.93z"></path><path class="Layer_1-2__cls-5" d="M177.15 50.49h-1.97v-7.84h-2.7c-.19-.57-.1-1.07-.1-1.62h7.5c.15.48.06.98.07 1.57h-2.79c-.03 1.38-.01 2.69-.02 3.99v3.91Z"/><path class="Layer_1-2__cls-2" d="M218.12 41.02v1.53c-.89.2-1.81-.03-2.77.15v7.7c-.67.24-1.28.14-1.95.1v-7.74c-.94-.28-1.86 0-2.8-.19-.16-.49-.07-.99-.06-1.55zm3.52 9.49c-.65.04-1.27.07-1.9-.02v-9.48h1.9v9.51Z"/><path class="Layer_1-2__cls-4" d="M116.87 50.54v-9.48c.57-.2 1.16-.06 1.81-.09v9.51c-.53.15-1.12.03-1.81.07Z"/></g></svg>
          </div>
          <p class="text-white/50 max-w-xs mb-8 font-light">
            Family-owned since 1997. Protecting Brevard County's shorelines with coquina, granite, and limestone revetments.
          </p>

          <div class="flex flex-col sm:flex-row gap-4">
            <input type="email" placeholder="Email address" class="bg-white/5 border border-white/10 rounded-full px-6 py-3 w-full sm:w-64 focus:outline-none focus:border-white/30 transition-colors placeholder:text-white/20 font-light">
            <button class="bg-white text-black px-6 py-3 rounded-full font-medium hover:bg-neutral-200 transition-colors whitespace-nowrap">
              Connect
            </button>
          </div>
        </div>

        <div class="flex flex-col gap-4">
          <h4 class="font-bold tracking-tight text-lg mb-2">High Surf Corp</h4>
          <a href="/" class="text-white/60 hover:text-white transition-colors font-light">Home</a>
          <a href="/#process" class="text-white/60 hover:text-white transition-colors font-light">Our Process</a>
          <a href="/blog" class="text-white/60 hover:text-white transition-colors font-light">Blog</a>
          <a href="/contact/brevard-county-free-estimate" class="text-white/60 hover:text-white transition-colors font-light">Free Estimate</a>
        </div>

        <div class="flex flex-col gap-4">
          <h4 class="font-bold tracking-tight text-lg mb-2">Contact</h4>
          <a href="mailto:crew@highsurfcorp.com" class="text-white/60 hover:text-white transition-colors font-light">crew@highsurfcorp.com</a>
          <a href="tel:+13218214895" class="text-white/60 hover:text-white transition-colors font-light">(321) 821-4895</a>
          <p class="text-white/60 font-light">330 5th Ave<br>Indialantic, FL 32903</p>
        </div>

        <div class="flex flex-col gap-4">
          <h4 class="font-bold tracking-tight text-lg mb-2">Legal</h4>
          <a href="/legal/privacy-policy" class="text-white/60 hover:text-white transition-colors font-light">Privacy Policy</a>
          <a href="/legal/terms-conditions" class="text-white/60 hover:text-white transition-colors font-light">Terms & Conditions</a>
        </div>
      </div>

      <div class="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-sm text-white/40 font-light">
        <p class="text-white/40 text-sm">&copy; 2026 High Surf Corp. All Rights Reserved.</p>
        <div class="flex gap-6 mt-4 md:mt-0"></div>
      </div>
    </footer>
  `;
}

/**
 * Returns the mobile menu JavaScript
 */
function getMobileMenuScript() {
  return `
    <script>
      // Mobile Navigation Drawer
      (function() {
        const menuButton = document.getElementById('mobile-menu-button');
        const closeButton = document.getElementById('mobile-nav-close');
        const drawer = document.getElementById('mobile-nav-drawer');
        const backdrop = document.getElementById('mobile-nav-backdrop');
        const content = document.getElementById('mobile-nav-content');
        const navLinks = document.querySelectorAll('#mobile-nav-content a');

        function openDrawer() {
          drawer.classList.remove('pointer-events-none');
          drawer.classList.add('pointer-events-auto');
          setTimeout(() => {
            backdrop.classList.remove('opacity-0');
            backdrop.classList.add('opacity-100');
            content.classList.remove('translate-x-full');
            content.classList.add('translate-x-0');
          }, 10);
          document.body.style.overflow = 'hidden';
        }

        function closeDrawer() {
          backdrop.classList.remove('opacity-100');
          backdrop.classList.add('opacity-0');
          content.classList.remove('translate-x-0');
          content.classList.add('translate-x-full');
          setTimeout(() => {
            drawer.classList.remove('pointer-events-auto');
            drawer.classList.add('pointer-events-none');
            document.body.style.overflow = '';
          }, 300);
        }

        if (menuButton) {
          menuButton.addEventListener('click', openDrawer);
        }

        if (closeButton) {
          closeButton.addEventListener('click', closeDrawer);
        }

        if (backdrop) {
          backdrop.addEventListener('click', closeDrawer);
        }

        // Close drawer when clicking navigation links
        navLinks.forEach(link => {
          link.addEventListener('click', closeDrawer);
        });

        // Close on escape key
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape' && !drawer.classList.contains('pointer-events-none')) {
            closeDrawer();
          }
        });
      })();
    </script>
  `;
}

/**
 * Transform static HTML pages with reusable nav/footer components
 */
/**
 * Transform static HTML pages with reusable nav/footer components
 * Implements Cache API and Turnstile Injection
 */
async function handleStaticPageWithComponents(request, env, pathname, ctx) {
  // Try to find in cache first
  const cacheKey = new Request(request.url, request);
  const cache = caches.default;
  let response = await cache.match(cacheKey);

  if (response) {
    return response;
  }

  // Initialize context if needed (renders nav/footer once)
  initContext(ctx);

  // Ensure pathname has .html extension for asset lookup
  let assetPath = pathname;
  if (!pathname.endsWith(".html")) {
    assetPath = pathname + ".html";
  }

  // Create a new request with the correct asset path
  const assetUrl = new URL(request.url);
  assetUrl.pathname = assetPath;
  const assetRequest = new Request(assetUrl.toString(), request);

  // Fetch the original static file
  response = await env.ASSETS.fetch(assetRequest);

  if (!response.ok) {
    return response;
  }

  let html = await response.text();

  // Determine active page for nav highlighting
  let activePage = "";
  if (pathname.includes("/contact/")) activePage = "contact";
  if (pathname.includes("/legal/")) activePage = "legal";

  // Get pre-rendered nav from context
  const navHtml = ctx.nav[activePage] || ctx.nav.home;

  // Add required dependencies to <head> if not present
  let headAdditions = `
    ${SCHEMA_JSON}
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js"></script>
    <style>
      @keyframes slideUpFade {
        0% { opacity: 0; transform: translateY(20px); }
        100% { opacity: 1; transform: translateY(0); }
      }
      .animate-slide-up { animation: slideUpFade 0.8s ease-out forwards; }
    </style>
  `;

  // Inject Turnstile if on contact page
  if (activePage === "contact") {
    headAdditions += `
      <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
    `;
    
    // Inject widget before submit button
    // Use test key "0x4AAAAAAAKFXRoBq6SEZCw" if env var not set (Safe for dev/prod if not configured)
    const siteKey = env.TURNSTILE_SITE_KEY || "0x4AAAAAAAKFXRoBq6SEZCw"; 
    const widgetHtml = `<div class="cf-turnstile mb-6" data-sitekey="${siteKey}" data-theme="dark"></div>`;
    
    // Inject before the submit button
    html = html.replace(/<button\s+type="submit"/, `${widgetHtml}\n<button type="submit"`);
  }

  // Inject Tailwind CDN and other scripts before </head>
  html = html.replace("</head>", headAdditions + "</head>");

  // Replace Webflow navigation with standardized nav from context
  const navPattern = /<header class="nav_wrap">[\s\S]*?<\/header>/;
  if (navPattern.test(html)) {
    html = html.replace(navPattern, navHtml);
  } else {
    // If no Webflow nav found, inject our nav after <body>
    html = html.replace(/<body[^>]*>/, "$&\n" + navHtml);
  }

  // Replace Webflow footer with standardized footer from context
  html = html.replace(
    /<footer[\s\S]*?<\/footer>/,
    ctx.footer,
  );

  // Inject mobile menu script before </body>
  html = html.replace("</body>", ctx.mobileMenuScript + "</body>");

  // Create final response with headers
  const finalResponse = htmlResponse(html, 3600);
  
  // Cache the transformed response
  // Use waitUntil so it doesn't block the return
  ctx.waitUntil(cache.put(cacheKey, finalResponse.clone()));

  return finalResponse;
}

// ============================================================================
// BLOG POST TEMPLATE
// ============================================================================

function getBlogPostTemplate(ctx) {
  return `<!DOCTYPE html>
<html lang="en" class="scroll-smooth"><head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{title}} | High Surf Corp</title>
    <meta name="description" content="{{meta_description}}">
    <meta property="og:title" content="{{title}}">
    <meta property="og:description" content="{{meta_description}}">
    <meta property="og:image" content="{{hero_image}}">
    <meta property="og:type" content="article">
    <link rel="canonical" href="https://highsurfcorp.com/blog/{{slug}}">
    <!-- LCP Optimization: Preconnect to critical origins -->
    <link rel="preconnect" href="https://pub-8a557d48118e46a38c0007cee5e58bd9.r2.dev" crossorigin>
    <link rel="dns-prefetch" href="https://pub-8a557d48118e46a38c0007cee5e58bd9.r2.dev">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <!-- LCP Optimization: Preload hero image -->
    <link rel="preload" as="image" href="{{hero_image}}" fetchpriority="high">
    ${SCHEMA_JSON}
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://code.iconify.design/3/3.1.0/iconify.min.js"></script>
    <script src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
      body { font-family: 'Inter', sans-serif; }
      .font-serif, .font-bricolage { font-family: 'Inter', sans-serif !important; }
      .hide-scrollbar::-webkit-scrollbar { display: none; }
      .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      .grid-lines {
        position: fixed;
        inset: 0;
        width: 100%;
        max-width: 80rem;
        margin: 0 auto;
        pointer-events: none;
        z-index: 5;
        display: flex;
        justify-content: space-between;
        padding: 0 1.5rem;
        opacity: 0.05;
      }
      @media (min-width: 768px) { .grid-lines { padding: 0 3rem; } }
      .grid-line { width: 1px; height: 100%; background-color: #000; }

      @keyframes slideUpFade {
        0% { opacity: 0; transform: translateY(20px); }
        100% { opacity: 1; transform: translateY(0); }
      }
      .animate-slide-up { animation: slideUpFade 0.8s ease-out forwards; }

      @keyframes animationIn {
        0% { opacity: 0; transform: translateY(20px); filter: blur(4px); }
        100% { opacity: 1; transform: translateY(0); filter: blur(0px); }
      }

      .drop-cap::first-letter {
        float: left;
        font-size: 4.5rem;
        line-height: 0.8;
        font-weight: 600;
        margin-right: 0.75rem;
        margin-top: 0.25rem;
      }

      /* Blog body styles */
      .blog-body h2 { font-size: 1.875rem; font-weight: 600; margin-top: 2rem; margin-bottom: 1rem; color: #171717; }
      .blog-body h3 { font-size: 1.5rem; font-weight: 600; margin-top: 1.5rem; margin-bottom: 0.75rem; color: #171717; }
      .blog-body h4 { font-size: 1.25rem; font-weight: 600; margin-top: 1.25rem; margin-bottom: 0.5rem; color: #171717; }
      .blog-body h5 { font-size: 1.125rem; font-weight: 600; margin-top: 1rem; margin-bottom: 0.5rem; color: #171717; }
      .blog-body p { margin-bottom: 1.5rem; line-height: 1.8; }
      .blog-body ul, .blog-body ol { margin-bottom: 1.5rem; padding-left: 1.5rem; }
      .blog-body li { margin-bottom: 0.5rem; line-height: 1.7; }
      .blog-body blockquote { border-left: 3px solid #171717; padding-left: 1.5rem; margin: 2rem 0; font-style: italic; font-size: 1.25rem; }
      .blog-body figure { margin: 2rem -1.5rem; }
      .blog-body figure img { width: 100%; height: auto; border-radius: 1rem; }
      .blog-body figcaption { text-align: center; font-size: 0.875rem; color: #737373; margin-top: 0.75rem; }
      .blog-body strong { font-weight: 600; color: #171717; }
      .blog-body a { color: #171717; text-decoration: underline; }
      .blog-body a:hover { opacity: 0.7; }
    </style>
    <script>
      (function () {
        const style = document.createElement("style");
        style.textContent = \`
          .animate-on-scroll { animation-play-state: paused !important; }
          .animate-on-scroll.animate { animation-play-state: running !important; }
        \`;
        document.head.appendChild(style);
        const once = true;
        if (!window.__inViewIO) {
          window.__inViewIO = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                entry.target.classList.add("animate");
                if (once) window.__inViewIO.unobserve(entry.target);
              }
            });
          }, { threshold: 0.05, rootMargin: "0px 0px -5% 0px" });
        }
        window.initInViewAnimations = function (selector = ".animate-on-scroll") {
          document.querySelectorAll(selector).forEach((el) => {
            window.__inViewIO.observe(el);
          });
        };
        document.addEventListener("DOMContentLoaded", () => initInViewAnimations());
      })();
    </script>
</head>
<body class="bg-white text-neutral-900 w-full overflow-x-hidden selection:bg-neutral-900 selection:text-white relative font-light antialiased">

    <!-- Vertical Lines -->
    <div class="grid-lines">
      <div class="grid-line"></div>
      <div class="grid-line hidden md:block"></div>
      <div class="grid-line hidden md:block"></div>
      <div class="grid-line"></div>
    </div>

    ${ctx.nav.blog}

    <!-- Blog Header Section -->
    <header class="relative pt-32 pb-16 md:pt-48 md:pb-24 px-6">
      <div class="max-w-7xl mx-auto text-center relative z-10">
        <!-- Category / Date -->
        <div class="inline-flex items-center gap-3 px-3 py-1.5 rounded-full border border-neutral-200 bg-neutral-50/50 text-xs font-medium text-neutral-500 mb-8 animate-slide-up [animation-delay:0.3s] opacity-0">
          <span class="uppercase tracking-wider">{{category}}</span>
          <span class="w-1 h-1 rounded-full bg-neutral-300"></span>
          <span>{{published_date}}</span>
        </div>

        <!-- Title -->
        <h1 class="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-semibold tracking-tighter text-neutral-900 mb-8 max-w-5xl mx-auto leading-[0.95] animate-slide-up [animation-delay:0.4s] opacity-0">
          {{title}}
        </h1>

        <!-- Reading Time -->
        <div class="flex items-center justify-center gap-4 animate-slide-up [animation-delay:0.5s] opacity-0">
          <div class="text-sm text-neutral-500">
            <span>{{reading_time}}</span>
          </div>
        </div>
      </div>
    </header>

    <!-- Full Width Hero Image -->
    <div class="w-full max-w-[95rem] mx-auto px-4 md:px-8 mb-20 md:mb-32 animate-slide-up [animation-delay:0.6s] opacity-0">
      <div class="relative w-full aspect-[4/3] sm:aspect-video md:aspect-[21/9] bg-gradient-to-br from-neutral-200 to-neutral-300 rounded-3xl md:rounded-[2.5rem] overflow-hidden shadow-2xl">
        <img src="{{hero_image}}" alt="{{title}}" class="w-full h-full object-cover" fetchpriority="high" onerror="this.onerror=null;this.style.display='none'">
        <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
      </div>
    </div>

    <!-- Article Content -->
    <article class="relative z-10 px-6 pb-32">
      <div class="max-w-2xl mx-auto">

        <!-- Introduction -->
        {{#if short_preview}}
        <div class="text-xl md:text-2xl leading-relaxed font-light text-neutral-600 mb-12 animate-on-scroll [animation:animationIn_0.8s_ease-out_0.2s_both]">
          <p class="drop-cap text-neutral-900">{{short_preview}}</p>
        </div>
        <div class="w-full h-px bg-neutral-100 mb-12 animate-on-scroll"></div>
        {{/if}}

        <!-- Body Text -->
        <div class="blog-body prose prose-neutral prose-lg text-neutral-600 font-light leading-8">
          {{body}}
        </div>

        <!-- Tags -->
        <div class="mt-20 pt-8 border-t border-neutral-100 flex flex-wrap gap-2 animate-on-scroll">
          {{#if category}}
          <span class="px-3 py-1 bg-neutral-50 border border-neutral-200 rounded-full text-xs font-medium text-neutral-500 uppercase tracking-wide">{{category}}</span>
          {{/if}}
          <span class="px-3 py-1 bg-neutral-50 border border-neutral-200 rounded-full text-xs font-medium text-neutral-500 uppercase tracking-wide">Seawall</span>
          <span class="px-3 py-1 bg-neutral-50 border border-neutral-200 rounded-full text-xs font-medium text-neutral-500 uppercase tracking-wide">Florida</span>
        </div>

        <!-- Share -->
        <div class="mt-12 flex items-center justify-between animate-on-scroll">
          <div class="flex items-center gap-4">
            <button onclick="navigator.clipboard.writeText(window.location.href)" class="w-12 h-12 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-500 hover:border-black hover:text-black transition-all">
              <iconify-icon icon="solar:copy-linear" width="20"></iconify-icon>
            </button>
            <a href="https://twitter.com/intent/tweet?url={{encoded_url}}&text={{encoded_title}}" target="_blank" class="w-12 h-12 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-500 hover:border-black hover:text-black transition-all">
              <iconify-icon icon="brandico:twitter-bird" width="18"></iconify-icon>
            </a>
            <a href="https://www.linkedin.com/shareArticle?mini=true&url={{encoded_url}}&title={{encoded_title}}" target="_blank" class="w-12 h-12 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-500 hover:border-black hover:text-black transition-all">
              <iconify-icon icon="brandico:linkedin" width="18"></iconify-icon>
            </a>
          </div>
          <span class="text-sm text-neutral-400 font-medium">Share this article</span>
        </div>
      </div>
    </article>

    <!-- Related Articles -->
    <section class="bg-[#f8f8f8] border-t border-neutral-200 py-24 px-6">
      <div class="max-w-7xl mx-auto">
        <div class="flex justify-between items-end mb-12">
          <h3 class="text-2xl font-semibold tracking-tight text-neutral-900">Read Next</h3>
          <a href="/blog" class="text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors flex items-center gap-2">
            View Journal <iconify-icon icon="solar:arrow-right-linear"></iconify-icon>
          </a>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          {{related_posts}}
        </div>
      </div>
    </section>

    ${ctx.footer}

    ${ctx.mobileMenuScript}

</body></html>`;
}

// ============================================================================
// RELATED POST CARD TEMPLATE
// ============================================================================

function getRelatedPostCard(post) {
  const date = formatDate(post.published_at);
  const category = post.category || post.short_tag || "Article";
  const shortDate = date.split(",")[0]; // "Nov 05"
  const imgSrc =
    post.hero_image_url || post.thumbnail_image || post.hero_image || "";

  return `
    <a href="/blog/${post.slug}" class="group block">
      <div class="aspect-[4/3] bg-gradient-to-br from-neutral-200 to-neutral-300 rounded-2xl overflow-hidden mb-6 relative">
        ${imgSrc ? `<img src="${imgSrc}" loading="lazy" onerror="this.onerror=null;this.style.display='none'" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90" alt="${escapeHtml(post.title)}">` : ""}
      </div>
      <div class="flex items-center gap-2 text-xs font-medium text-neutral-400 uppercase tracking-wider mb-2">
        <span>${escapeHtml(category)}</span>
        <span class="w-1 h-1 rounded-full bg-neutral-300"></span>
        <span>${shortDate}</span>
      </div>
      <h4 class="text-lg font-semibold text-neutral-900 leading-tight group-hover:text-neutral-600 transition-colors">
        ${escapeHtml(post.title)}
      </h4>
    </a>
  `;
}

// ============================================================================
// BLOG INDEX TEMPLATE
// ============================================================================

function getBlogIndexTemplate(ctx) {
  return `<!DOCTYPE html>
<html lang="en" class="scroll-smooth"><head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Journal | High Surf Corp</title>
    <meta name="description" content="Insights on shoreline protection, seawall construction, and coastal engineering from High Surf Corp.">
    <link rel="canonical" href="https://highsurfcorp.com/blog">
    <!-- LCP Optimization: Preconnect to critical origins -->
    <link rel="preconnect" href="https://pub-8a557d48118e46a38c0007cee5e58bd9.r2.dev" crossorigin>
    <link rel="dns-prefetch" href="https://pub-8a557d48118e46a38c0007cee5e58bd9.r2.dev">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
      body { font-family: 'Inter', sans-serif; }
      @keyframes slideUpFade {
        0% { opacity: 0; transform: translateY(20px); }
        100% { opacity: 1; transform: translateY(0); }
      }
      .animate-slide-up { animation: slideUpFade 0.8s ease-out forwards; }
    </style>
    ${SCHEMA_JSON}
</head>
<body class="bg-white text-neutral-900 w-full overflow-x-hidden selection:bg-neutral-900 selection:text-white font-light antialiased">

    ${ctx.nav.blog}

    <!-- Header -->
    <header class="relative pt-32 pb-16 md:pt-40 md:pb-20 px-6">
      <div class="max-w-7xl mx-auto text-center">
        <h1 class="text-5xl md:text-7xl font-semibold tracking-tighter text-neutral-900 mb-6 animate-slide-up [animation-delay:0.3s] opacity-0">
          Journal
        </h1>
        <p class="text-lg text-neutral-500 max-w-2xl mx-auto animate-slide-up [animation-delay:0.4s] opacity-0">
          Insights on shoreline protection, seawall construction, and coastal engineering
        </p>
      </div>
    </header>

    <!-- Featured Post -->
    {{featured_section}}

    <!-- All Posts Grid -->
    <section class="py-16 px-6">
      <div class="max-w-7xl mx-auto">
        <h2 class="text-2xl font-semibold tracking-tight text-neutral-900 mb-12">All Articles</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {{posts_grid}}
        </div>
        {{pagination}}
      </div>
    </section>

    ${ctx.footer}

    ${ctx.mobileMenuScript}

</body></html>`;
}

// ============================================================================
// RENDER FUNCTIONS
// ============================================================================

function renderBlogPost(post, relatedPosts, ctx) {
  const template = getBlogPostTemplate(ctx);
  const category = post.category || post.short_tag || "Article";
  const publishedDate = formatDate(post.published_at);
  const readingTime = calculateReadingTime(post.body);
  const postUrl = `https://highsurfcorp.com/blog/${post.slug}`;

  // Render related posts
  const relatedHtml = relatedPosts.map((p) => getRelatedPostCard(p)).join("");

  // Handle conditional short_preview
  let html = template;

  // Replace simple placeholders
  html = html.replace(/\{\{title\}\}/g, escapeHtml(post.title));
  html = html.replace(/\{\{slug\}\}/g, post.slug);
  html = html.replace(/\{\{category\}\}/g, escapeHtml(category));
  html = html.replace(/\{\{published_date\}\}/g, publishedDate);
  html = html.replace(/\{\{reading_time\}\}/g, readingTime);
  html = html.replace(
    /\{\{hero_image\}\}/g,
    post.hero_image_url || post.hero_image || "",
  );
  html = html.replace(
    /\{\{meta_description\}\}/g,
    escapeHtml(post.meta_description || post.short_preview || ""),
  );
  
  // Sanitize body content to prevent Stored XSS
  const sanitizedBody = sanitizeHtml(post.body || "", {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      'img', 'figure', 'figcaption', 'h1', 'h2', 'span', 'div'
    ]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      '*': ['class', 'style'],
      'img': ['src', 'alt', 'width', 'height', 'loading'],
      'a': ['href', 'target', 'rel']
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  });
  
  html = html.replace(/\{\{body\}\}/g, sanitizedBody);
  html = html.replace(/\{\{related_posts\}\}/g, relatedHtml);
  html = html.replace(/\{\{encoded_url\}\}/g, encodeURIComponent(postUrl));
  html = html.replace(/\{\{encoded_title\}\}/g, encodeURIComponent(post.title));

  // Handle conditional short_preview
  if (post.short_preview) {
    html = html.replace(/\{\{#if short_preview\}\}/g, "");
    html = html.replace(/\{\{\/if\}\}/g, "");
    html = html.replace(
      /\{\{short_preview\}\}/g,
      escapeHtml(post.short_preview),
    );
  } else {
    // Remove the entire short_preview section
    html = html.replace(/\{\{#if short_preview\}\}[\s\S]*?\{\{\/if\}\}/g, "");
  }

  return html;
}

function renderBlogIndex(posts, ctx, pagination = { page: 1, totalPages: 1 }) {
  const template = getBlogIndexTemplate(ctx);

  // Find featured post (only show on first page)
  const featuredPost =
    pagination.page === 1 ? posts.find((p) => p.featured === 1) : null;

  // Featured section HTML
  let featuredHtml = "";
  if (featuredPost) {
    const date = formatDate(featuredPost.published_at);
    const category =
      featuredPost.category || featuredPost.short_tag || "Featured";
    featuredHtml = `
      <section class="py-8 px-6">
        <div class="max-w-7xl mx-auto">
          <a href="/blog/${featuredPost.slug}" class="group block">
            <div class="relative aspect-[21/9] bg-neutral-100 rounded-3xl overflow-hidden mb-8">
              <img src="${featuredPost.hero_image_url || featuredPost.thumbnail_image || featuredPost.hero_image || ""}" alt="${escapeHtml(featuredPost.title)}" onerror="this.onerror=null;this.style.display='none'" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700">
              <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div class="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                <div class="flex items-center gap-3 mb-4">
                  <span class="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium text-white uppercase tracking-wider">${escapeHtml(category)}</span>
                  <span class="text-white/60 text-sm">${date}</span>
                </div>
                <h2 class="text-3xl md:text-5xl font-semibold text-white tracking-tight max-w-3xl leading-tight">${escapeHtml(featuredPost.title)}</h2>
              </div>
            </div>
          </a>
        </div>
      </section>
    `;
  }

  // Posts grid HTML (exclude featured post on first page)
  const postsHtml = posts
    .filter((p) => !(pagination.page === 1 && p.featured === 1))
    .map((post) => {
      const date = formatDate(post.published_at);
      const category = post.category || post.short_tag || "Article";
      const shortDate = date.split(",")[0];
      const imgSrc =
        post.hero_image_url || post.thumbnail_image || post.hero_image || "";

      return `
        <a href="/blog/${post.slug}" class="group block">
          <div class="aspect-[4/3] bg-gradient-to-br from-neutral-200 to-neutral-300 rounded-2xl overflow-hidden mb-6">
            ${imgSrc ? `<img src="${imgSrc}" loading="lazy" onerror="this.onerror=null;this.style.display='none'" alt="${escapeHtml(post.title)}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">` : ""}
          </div>
          <div class="flex items-center gap-2 text-xs font-medium text-neutral-400 uppercase tracking-wider mb-2">
            <span>${escapeHtml(category)}</span>
            <span class="w-1 h-1 rounded-full bg-neutral-300"></span>
            <span>${shortDate}</span>
          </div>
          <h3 class="text-lg font-semibold text-neutral-900 leading-tight group-hover:text-neutral-600 transition-colors">${escapeHtml(post.title)}</h3>
          ${post.short_preview ? `<p class="mt-2 text-sm text-neutral-500 line-clamp-2">${escapeHtml(post.short_preview)}</p>` : ""}
        </a>
      `;
    })
    .join("");

  // Pagination HTML
  let paginationHtml = "";
  if (pagination.totalPages > 1) {
    const { page, totalPages } = pagination;
    paginationHtml = `
      <nav class="flex justify-center items-center gap-4 mt-16" aria-label="Pagination">
        ${page > 1 ? `<a href="/blog?page=${page - 1}" class="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors">← Previous</a>` : `<span class="px-4 py-2 text-sm font-medium text-neutral-300">← Previous</span>`}
        <span class="text-sm text-neutral-500">Page ${page} of ${totalPages}</span>
        ${page < totalPages ? `<a href="/blog?page=${page + 1}" class="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors">Next →</a>` : `<span class="px-4 py-2 text-sm font-medium text-neutral-300">Next →</span>`}
      </nav>
    `;
  }

  let html = template;
  html = html.replace(/\{\{featured_section\}\}/g, featuredHtml);
  html = html.replace(/\{\{posts_grid\}\}/g, postsHtml);
  html = html.replace(/\{\{pagination\}\}/g, paginationHtml);

  return html;
}

// ============================================================================
// ROUTE HANDLERS
// ============================================================================

async function handleBlogPost(request, url, env, ctx) {
  try {
    // Initialize context (renders nav/footer once)
    initContext(ctx);

    const slug = url.pathname.split("/blog/")[1].replace(/\/$/, "");

    if (!slug) {
      return handleBlogIndex(request, env, ctx);
    }

    // Query post from D1 (safe - never leaks SQL errors)
    const post = await safeDbFirst(
      env.DB,
      "SELECT * FROM posts WHERE slug = ? AND draft = 0 AND archived = 0",
      [slug],
    );

    if (!post) {
      return errorResponse("Post not found", 404);
    }

    // Query related posts (safe - never leaks SQL errors)
    const related = await safeDbQuery(
      env.DB,
      `SELECT slug, title, thumbnail_image, hero_image, hero_image_url, category, short_tag, published_at
       FROM posts
       WHERE slug != ? AND draft = 0 AND archived = 0
       ORDER BY published_at DESC
       LIMIT 3`,
      [slug],
    );

    // Render template with context (with gzip compression)
    const html = renderBlogPost(post, related.results, ctx);

    return htmlResponse(html, 3600);
  } catch (err) {
    // Database errors throw with status 503
    if (err.status === 503) {
      return errorResponse("Service temporarily unavailable", 503);
    }
    // Re-throw unexpected errors
    throw err;
  }
}

async function handleBlogIndex(request, env, ctx) {
  try {
    // Initialize context (renders nav/footer once)
    initContext(ctx);

    // Parse pagination parameters
    const url = new URL(request.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
    const limit = 20;
    const offset = (page - 1) * limit;

    // Get total count for pagination
    const countResult = await safeDbQuery(
      env.DB,
      "SELECT COUNT(*) as total FROM posts WHERE draft = 0 AND archived = 0",
    );
    const totalPosts = countResult.results[0]?.total || 0;
    const totalPages = Math.ceil(totalPosts / limit);

    // Query paginated posts (safe - never leaks SQL errors)
    // Now: remove body, and include hero_image_url
    const posts = await safeDbQuery(
      env.DB,
      `SELECT slug, title, thumbnail_image, hero_image, hero_image_url, category, short_tag, short_preview, published_at, featured
       FROM posts
       WHERE draft = 0 AND archived = 0
       ORDER BY published_at DESC
       LIMIT ? OFFSET ?`,
      [limit, offset],
    );

    const pagination = { page, totalPages, totalPosts };
    const html = renderBlogIndex(posts.results, ctx, pagination);

    return htmlResponse(html, 1800);
  } catch (err) {
    // Database errors throw with status 503
    if (err.status === 503) {
      return errorResponse("Service temporarily unavailable", 503);
    }
    throw err;
  }
}

// ============================================================================
// CONTACT FORM HANDLER
// ============================================================================

async function handleContactForm(request, env) {
  try {
    // Parse form data
    const formData = await request.formData();
    const name = formData.get("name");
    const zip = formData.get("zip") || "";
    const email = formData.get("email");
    const phone = formData.get("phone");
    const budget = formData.get("budget") || "";
    const message = formData.get("message") || "";
    const turnstileToken = formData.get("cf-turnstile-response");

    // Validate required fields
    if (!name || !email || !phone) {
      return jsonResponse(
        {
          success: false,
          error: "Please fill in all required fields (Name, Email, Phone)",
        },
        400,
      );
    }

    // Verify Turnstile Token (if secret is configured)
    if (env.TURNSTILE_SECRET_KEY) {
      if (!turnstileToken) {
        return jsonResponse(
          { success: false, error: "Missing security check token" },
          400,
        );
      }

      const turnstileVerify = await fetch(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            secret: env.TURNSTILE_SECRET_KEY,
            response: turnstileToken,
            remoteip: request.headers.get("CF-Connecting-IP"),
          }),
        },
      );

      const turnstileOutcome = await turnstileVerify.json();
      if (!turnstileOutcome.success) {
        console.error("Turnstile failure:", turnstileOutcome);
        return jsonResponse(
          { success: false, error: "Security check failed. Please refresh and try again." },
          400,
        );
      }
    } else {
      console.warn("TURNSTILE_SECRET_KEY not set - skipping security check");
    }

    // Basic email validation
    if (!email.includes("@")) {
      return jsonResponse(
        { success: false, error: "Please enter a valid email address" },
        400,
      );
    }

    // Format budget for display
    const budgetDisplay = budget
      ? {
          "10-20k": "$10k - $20k",
          "50-100k": "$50k - $100k",
          "100k+": "$100k+",
        }[budget] || budget
      : "";

    // Format email HTML
    const emailHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #000; color: #fff; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
          .field { margin-bottom: 20px; }
          .label { font-weight: 600; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px; }
          .value { font-size: 16px; color: #111827; }
          .budget { display: inline-block; background: #10b981; color: white; padding: 8px 16px; border-radius: 6px; font-weight: 600; }
          .footer { background: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 8px 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2 style="margin: 0; font-size: 20px;">New Contact Form Submission</h2>
          </div>

          <div class="content">
            <div class="field">
              <div class="label">Name</div>
              <div class="value">${escapeHtml(name)}</div>
            </div>

            <div class="field">
              <div class="label">Email</div>
              <div class="value"><a href="mailto:${escapeHtml(email)}" style="color: #2563eb;">${escapeHtml(email)}</a></div>
            </div>

            <div class="field">
              <div class="label">Phone</div>
              <div class="value"><a href="tel:${escapeHtml(phone)}" style="color: #2563eb;">${escapeHtml(phone)}</a></div>
            </div>

            ${
              zip
                ? `
            <div class="field">
              <div class="label">Zip Code</div>
              <div class="value">${escapeHtml(zip)}</div>
            </div>
            `
                : ""
            }

            ${
              budgetDisplay
                ? `
            <div class="field">
              <div class="label">Project Budget</div>
              <div class="value"><span class="budget">${escapeHtml(budgetDisplay)}</span></div>
            </div>
            `
                : ""
            }

            ${
              message
                ? `
            <div class="field">
              <div class="label">Message</div>
              <div class="value" style="white-space: pre-wrap;">${escapeHtml(message)}</div>
            </div>
            `
                : ""
            }
          </div>

          <div class="footer">
            Submitted from: <strong>Homepage Contact Form</strong><br>
            ${new Date().toLocaleString("en-US", { timeZone: "America/New_York" })} EST
          </div>
        </div>
      </body>
      </html>
    `;

    // Check for Resend API key
    if (!env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured");
      return jsonResponse(
        {
          success: false,
          error:
            "Email service not configured. Please call us at (321) 821-4895.",
        },
        500,
      );
    }

    // Send email via Resend
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "High Surf Corp Website <website@send.highsurfcorp.com>",
        to: ["crew@highsurfcorp.com"],
        reply_to: email,
        subject: `New Lead: ${name}${budgetDisplay ? ` (${budgetDisplay})` : ""} - ${zip || "No Zip"}`,
        html: emailHTML,
      }),
    });

    if (!resendResponse.ok) {
      const errorText = await resendResponse.text();
      console.error("Resend API error:", errorText);
      throw new Error("Failed to send email");
    }

    const resendData = await resendResponse.json();
    console.log("Email sent successfully:", resendData.id);

    return jsonResponse({
      success: true,
      message: "Thank you! We'll contact you within 24 hours.",
    });
  } catch (error) {
    console.error("Form submission error:", error);
    return jsonResponse(
      {
        success: false,
        error:
          "Something went wrong. Please call us at (321) 821-4895 or try again later.",
      },
      500,
    );
  }
}

// ============================================================================
// MAIN EXPORT
// ============================================================================

export default {
  async fetch(request, env, executionCtx) {
    const url = new URL(request.url);

    // Create request context once (lazy-initialized when needed)
    const ctx = createRequestContext(executionCtx);

    // Route: /api/contact - Contact form submission
    if (url.pathname === "/api/contact" && request.method === "POST") {
      return handleContactForm(request, env);
    }

    // Route: /blog/:slug - Individual post
    if (url.pathname.match(/^\/blog\/[^/]+\/?$/)) {
      return handleBlogPost(request, url, env, ctx);
    }

    // Route: /blog - Blog index
    if (url.pathname === "/blog" || url.pathname === "/blog/") {
      return handleBlogIndex(request, env, ctx);
    }

    // Route: Legal pages - Transform with reusable components
    // Skip paths ending in .html (internal asset fetches) to prevent redirect loops
    if (
      url.pathname.startsWith("/legal/") &&
      url.pathname !== "/legal/" &&
      !url.pathname.endsWith(".html")
    ) {
      return handleStaticPageWithComponents(request, env, url.pathname, ctx);
    }

    // Route: Contact pages - Transform with reusable components
    // Skip paths ending in .html (internal asset fetches) to prevent redirect loops
    if (
      url.pathname.startsWith("/contact/") &&
      url.pathname !== "/contact/" &&
      !url.pathname.endsWith(".html")
    ) {
      return handleStaticPageWithComponents(request, env, url.pathname, ctx);
    }

    // Route: Homepage - map / to /index.html
    if (url.pathname === "/" || url.pathname === "") {
      const assetUrl = new URL(request.url);
      assetUrl.pathname = "/index.html";
      const assetRequest = new Request(assetUrl.toString(), request);
      return env.ASSETS.fetch(assetRequest);
    }

    // Fallback to static assets
    return env.ASSETS
      ? env.ASSETS.fetch(request)
      : errorResponse("Not found", 404);
  },
};
