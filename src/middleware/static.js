/**
 * Static page middleware - Transforms static pages with nav/footer/analytics
 */

import { SCHEMA_JSON } from "../views/components.js";

/**
 * Content Security Policy header
 */
const CSP_HEADER =
  "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://code.iconify.design https://challenges.cloudflare.com https://www.googletagmanager.com https://connect.facebook.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https: blob:; font-src 'self' https://fonts.gstatic.com data:; connect-src 'self' https://www.google-analytics.com https://www.facebook.com https://challenges.cloudflare.com; frame-src 'self' https://challenges.cloudflare.com;";

/**
 * Create an HTML response with caching headers and CSP
 * @param {string} html - HTML content
 * @param {number} cacheSeconds - Cache duration in seconds
 */
export function htmlResponse(html, cacheSeconds = 3600) {
  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": `public, max-age=${cacheSeconds}`,
      "Content-Security-Policy": CSP_HEADER,
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "Referrer-Policy": "strict-origin-when-cross-origin",
    },
  });
}

/**
 * Create a JSON response with strict CORS
 * @param {Object} data - Response data
 * @param {number} status - HTTP status code
 * @param {Request} request - Original request (for CORS origin detection)
 */
export function jsonResponse(data, status = 200, request = null) {
  let allowedOrigin = "https://highsurfcorp.com";

  if (request) {
    const origin = request.headers.get("Origin");
    // Allow localhost for development
    if (
      origin &&
      (origin.includes("localhost") ||
        origin.includes("127.0.0.1") ||
        origin.includes(":8787"))
    ) {
      allowedOrigin = origin;
    } else if (
      origin === "https://highsurfcorp.com" ||
      origin === "https://www.highsurfcorp.com"
    ) {
      allowedOrigin = origin;
    }
  }

  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": allowedOrigin,
      Vary: "Origin",
    },
  });
}

/**
 * Create an error response
 * @param {string} message - Error message
 * @param {number} status - HTTP status code
 * @param {*} logDetail - Optional detail to log
 */
export function errorResponse(message, status, logDetail = null) {
  if (logDetail) {
    console.error(`[${status}] ${message}:`, logDetail);
  }
  return new Response(message, { status });
}

/**
 * Serve static page with component injection
 * Transforms static HTML with nav/footer/analytics
 *
 * @param {Context} c - Hono context
 * @param {string} overridePath - Optional path override (for 404 handling)
 */
export async function serveStatic(c, overridePath = null) {
  const pathname = overridePath || new URL(c.req.url).pathname;

  // Try to find in cache first
  const cacheKey = new Request(c.req.url, c.req.raw);
  const cache = caches.default;
  let response = await cache.match(cacheKey);

  if (response) {
    return response;
  }

  // Get pre-rendered components from context
  const nav = c.get("nav");
  const footer = c.get("footer");
  const analytics = c.get("analytics");
  const mobileMenuScript = c.get("mobileMenuScript");

  // Ensure pathname has .html extension for asset lookup
  let assetPath = pathname;
  if (!pathname.endsWith(".html")) {
    assetPath = pathname + ".html";
  }

  // Create a new request with the correct asset path
  const assetUrl = new URL(c.req.url);
  assetUrl.pathname = assetPath;
  const assetRequest = new Request(assetUrl.toString(), c.req.raw);

  // Fetch the original static file
  response = await c.env.ASSETS.fetch(assetRequest);

  if (!response.ok) {
    return response;
  }

  let html = await response.text();

  // Determine active page for nav highlighting
  let activePage = "home";
  if (pathname.includes("/contact/")) activePage = "contact";
  else if (pathname.includes("/legal/")) activePage = "legal";

  // Get pre-rendered nav from context
  const navHtml = nav[activePage] || nav.home;

  // Remove existing analytics code to avoid duplicates
  // Google Analytics
  html = html.replace(
    /\s*<script[^>]*googletagmanager[^>]*><\/script>\s*<script>[\s\S]*?gtag\('config',\s*'G-93DQDPMR4J'\);[\s\S]*?<\/script>/gi,
    "",
  );
  // Meta Pixel
  html = html.replace(
    /[\s\S]*?/gi,
    "",
  );

  // Add required dependencies to <head>
  let headAdditions = `
    ${SCHEMA_JSON}
    ${analytics}
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
    const siteKey = c.env.TURNSTILE_SITE_KEY || "0x4AAAAAAAKFXRoBq6SEZCw";
    const widgetHtml = `<div class="cf-turnstile mb-6" data-sitekey="${siteKey}" data-theme="dark"></div>`;

    html = html.replace(
      /<button\s+type="submit"/,
      `${widgetHtml}\n<button type="submit"`,
    );
  }

  // Inject dependencies before </head>
  html = html.replace("</head>", headAdditions + "</head>");

  // Replace navigation with standardized nav
  const webflowNavPattern = /<header class="nav_wrap">[\s\S]*?<\/header>/;
  const pillNavPattern =
    /[\s\S]*?[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;

  if (webflowNavPattern.test(html)) {
    html = html.replace(webflowNavPattern, navHtml);
  } else if (pillNavPattern.test(html)) {
    html = html.replace(pillNavPattern, navHtml);
  } else {
    // If no nav found, inject after <body>
    html = html.replace(/<body[^>]*>/, "$&\n" + navHtml);
  }

  // Replace footer with standardized footer
  html = html.replace(/<footer[\s\S]*?<\/footer>/, footer);

  // Remove existing mobile menu script to avoid duplicates
  html = html.replace(
    /<script>\s*\/\/\s*Mobile Navigation Drawer[\s\S]*?\}\)\(\);\s*<\/script>/g,
    "",
  );

  // Inject mobile menu script before </body>
  html = html.replace("</body>", mobileMenuScript + "</body>");

  // Create final response
  const finalResponse = htmlResponse(html, 3600);

  // Cache the transformed response
  c.executionCtx.waitUntil(cache.put(cacheKey, finalResponse.clone()));

  return finalResponse;
}

/**
 * Serve Admin Dashboard (SPA)
 * Handles routing for the React Admin App
 */
export async function serveAdmin(c) {
  // If requesting a specific file (css/js/png), serve it directly
  if (c.req.path.includes('.')) {
    return c.env.ASSETS.fetch(c.req.raw);
  }
  
  // Otherwise, serve the React app's index.html for all routes (client-side routing)
  // We need to rewrite the request to point to /admin/index.html in the assets bucket
  const url = new URL(c.req.url);
  url.pathname = '/admin/index.html';
  
  return c.env.ASSETS.fetch(new Request(url, c.req.raw));
}