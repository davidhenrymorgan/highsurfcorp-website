/**
 * High Surf Corp - Cloudflare Worker
 * Modular Hono-based architecture
 */

import { Hono } from "hono";
import { cors } from "hono/cors";
// Middleware
import { contextMiddleware } from "./middleware/context.js";
import { serveStatic, jsonResponse } from "./middleware/static.js";
import { serveAdmin } from "./middleware/static.js";

// Controllers
import { getIndex, getPost } from "./controllers/blog.js";
import { postContact } from "./controllers/contact.js";
import {
  generateBlogPost,
  getAdminPosts,
  getAdminPost,
  upsertPost,
  deletePost,
} from "./controllers/admin.js";
import {
  analyzeCompetitor,
  getCompetitors,
  getCompetitor,
  getCompetitorContent,
  deleteCompetitor,
  refreshCompetitor,
} from "./controllers/intelligence.js";
import { getLeads, updateLeadStatus, deleteLead } from "./controllers/leads.js";
import { handleResendWebhook } from "./controllers/webhooks.js";
import {
  listEmails,
  getEmail,
  sendEmail,
  updateEmail,
} from "./controllers/emails.js";
import { getSitemap } from "./controllers/sitemap.js";

const app = new Hono();

// ============================================================================
// GLOBAL MIDDLEWARE
// ============================================================================

app.use(
  "*",
  cors({
    // Add 'http://localhost:5173' to this list for local development
    origin: [
      "https://highsurfcorp.com",
      "http://localhost:8787",
      "http://localhost:5173",
    ],
    allowMethods: ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
    allowHeaders: ["Content-Type", "X-Admin-Key"],
    exposeHeaders: ["Content-Length"],
  }),
);

app.use("*", contextMiddleware);

// ============================================================================
// API ROUTES
// ============================================================================

// Contact form submission
app.post("/api/contact", postContact);

// Resend webhook (public - signature verified internally)
app.post("/api/webhooks/resend", handleResendWebhook);

// ============================================================================
// ADMIN API ROUTES (secured)
// ============================================================================

// Admin authentication middleware
const adminAuth = async (c, next) => {
  const adminKey = c.req.header("X-Admin-Key");

  if (!c.env.ADMIN_SECRET) {
    console.error("ADMIN_SECRET not configured");
    return jsonResponse(
      { success: false, error: "Admin API not configured" },
      503,
      c.req.raw,
    );
  }

  if (!adminKey || adminKey !== c.env.ADMIN_SECRET) {
    return jsonResponse(
      { success: false, error: "Unauthorized" },
      401,
      c.req.raw,
    );
  }

  await next();
};

// AI content generation
app.post("/api/admin/generate", adminAuth, generateBlogPost);

// Blog post CRUD
app.get("/api/admin/posts", adminAuth, getAdminPosts);
app.get("/api/admin/posts/:id", adminAuth, getAdminPost);
app.post("/api/admin/posts", adminAuth, upsertPost);
app.delete("/api/admin/posts/:id", adminAuth, deletePost);

// Competitor Intelligence
app.post("/api/admin/intelligence/analyze", adminAuth, analyzeCompetitor);
app.get("/api/admin/intelligence/competitors", adminAuth, getCompetitors);
app.get("/api/admin/intelligence/competitors/:id", adminAuth, getCompetitor);
app.get(
  "/api/admin/intelligence/competitors/:id/content",
  adminAuth,
  getCompetitorContent,
);
app.delete(
  "/api/admin/intelligence/competitors/:id",
  adminAuth,
  deleteCompetitor,
);
app.post(
  "/api/admin/intelligence/competitors/:id/refresh",
  adminAuth,
  refreshCompetitor,
);

// Lead Management
app.get("/api/admin/leads", adminAuth, getLeads);
app.patch("/api/admin/leads/:id", adminAuth, updateLeadStatus);
app.delete("/api/admin/leads/:id", adminAuth, deleteLead);

// Email Management
app.get("/api/admin/emails", adminAuth, listEmails);
app.get("/api/admin/emails/:id", adminAuth, getEmail);
app.post("/api/admin/emails/send", adminAuth, sendEmail);
app.patch("/api/admin/emails/:id", adminAuth, updateEmail);

// ============================================================================
// BLOG ROUTES
// ============================================================================

// Blog index
app.get("/blog", getIndex);

// Individual blog post
app.get("/blog/:slug", getPost);

// ============================================================================
// SEO ROUTES
// ============================================================================

// XML Sitemap (dynamic)
app.get("/sitemap.xml", getSitemap);

// ============================================================================
// STATIC PAGES (with component injection)
// ============================================================================

// Legal pages
app.get("/legal/:page", async (c) => {
  const page = c.req.param("page");
  if (page.endsWith(".html")) {
    return c.env.ASSETS.fetch(c.req.raw);
  }
  return serveStatic(c, `/legal/${page}`);
});

// Contact pages
app.get("/contact/:page", async (c) => {
  const page = c.req.param("page");
  if (page.endsWith(".html")) {
    return c.env.ASSETS.fetch(c.req.raw);
  }
  return serveStatic(c, `/contact/${page}`);
});

// Homepage
app.get("/", async (c) => {
  return serveStatic(c, "/index");
});

// ============================================================================
// ADMIN FRONTEND ROUTE
// ============================================================================

// Serve the React Admin Dashboard (SPA)
// This must be placed BEFORE the catch-all '*' route
app.get("/admin/*", serveAdmin);

// ============================================================================
// FALLBACK TO STATIC ASSETS
// ============================================================================

app.get("*", async (c) => {
  // Try to serve static asset
  const response = await c.env.ASSETS.fetch(c.req.raw);

  // If not found, serve 404 page with components
  if (response.status === 404) {
    return serveStatic(c, "/404");
  }

  return response;
});

// ============================================================================
// EXPORT
// ============================================================================

export default app;
