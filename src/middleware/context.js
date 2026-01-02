/**
 * Context middleware - Pre-renders nav/footer/analytics once per request
 */

import {
  getNavigationHTML,
  getFooterHTML,
  getAnalyticsHTML,
  getMobileMenuScript,
} from "../views/components.js";

/**
 * Middleware that initializes shared components on the Hono context.
 * Call this once at the start of request processing.
 *
 * Sets:
 * - c.get('nav') -> { home, blog, contact, legal }
 * - c.get('footer') -> footer HTML
 * - c.get('analytics') -> analytics HTML
 * - c.get('mobileMenuScript') -> mobile menu JS
 */
export async function contextMiddleware(c, next) {
  // Pre-render all navigation variants
  const nav = {
    home: getNavigationHTML({ activePage: "home" }),
    blog: getNavigationHTML({ activePage: "blog" }),
    contact: getNavigationHTML({ activePage: "contact" }),
    legal: getNavigationHTML({ activePage: "legal" }),
  };

  // Pre-render footer and analytics
  const footer = getFooterHTML();
  const analytics = getAnalyticsHTML();
  const mobileMenuScript = getMobileMenuScript();

  // Set on context for use by handlers
  c.set("nav", nav);
  c.set("footer", footer);
  c.set("analytics", analytics);
  c.set("mobileMenuScript", mobileMenuScript);

  await next();
}

/**
 * Helper to get a context object compatible with existing templates
 * @param {Context} c - Hono context
 * @returns {Object} Context object with nav, footer, analytics, mobileMenuScript
 */
export function getTemplateContext(c) {
  return {
    nav: c.get("nav"),
    footer: c.get("footer"),
    analytics: c.get("analytics"),
    mobileMenuScript: c.get("mobileMenuScript"),
  };
}
