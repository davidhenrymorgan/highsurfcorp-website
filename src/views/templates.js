/**
 * Page-level templates for blog pages
 */

import {
  SCHEMA_JSON,
  getAnalyticsHTML,
  getMobileMenuScript,
} from "./components.js";
import { formatDate, escapeHtml } from "../utils/helpers.js";

/**
 * Blog post page template
 * @param {Object} ctx - Context with pre-rendered nav/footer
 */
export function getBlogPostTemplate(ctx) {
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
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": "{{title}}",
      "image": "{{hero_image}}",
      "datePublished": "{{published_at}}",
      "dateModified": "{{updated_at}}",
      "author": {
        "@type": "Organization",
        "name": "High Surf Corp",
        "url": "https://highsurfcorp.com"
      },
      "publisher": {
        "@type": "Organization",
        "name": "High Surf Corp",
        "url": "https://highsurfcorp.com",
        "logo": {
          "@type": "ImageObject",
          "url": "https://pub-8a557d48118e46a38c0007cee5e58bd9.r2.dev/images/highsurf-logo.png"
        }
      },
      "description": "{{meta_description}}",
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": "https://highsurfcorp.com/blog/{{slug}}"
      }
    }
    </script>
    ${ctx.analytics}
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
    <!-- Skip to content link for accessibility -->
    <a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-neutral-900 focus:text-white focus:px-4 focus:py-2 focus:rounded focus:outline-none focus:ring-2 focus:ring-neutral-900">Skip to main content</a>

    <!-- Vertical Lines -->
    <div class="grid-lines">
      <div class="grid-line"></div>
      <div class="grid-line hidden md:block"></div>
      <div class="grid-line hidden md:block"></div>
      <div class="grid-line"></div>
    </div>

    ${ctx.nav.blog}

    <!-- Blog Header Section -->
    <header id="main-content" class="relative pt-32 pb-16 md:pt-48 md:pb-24 px-6">
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

/**
 * Related post card template
 * @param {Object} post - Post object from database
 */
export function getRelatedPostCard(post) {
  const date = formatDate(post.published_at);
  const category = post.category || post.short_tag || "Article";
  const shortDate = date.split(",")[0]; // "Nov 05"
  const imgSrc =
    post.hero_image_url || post.thumbnail_image || post.hero_image || "";

  return `
    <a href="/blog/${post.slug}" class="group block">
      <div class="aspect-[4/3] bg-gradient-to-br from-neutral-200 to-neutral-300 rounded-2xl overflow-hidden mb-6 relative">
        ${
          imgSrc
            ? `<img
            src="${imgSrc}"
            loading="lazy"
            decoding="async"
            width="600"
            height="450"
            onerror="this.onerror=null;this.style.display='none'"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
            alt="${escapeHtml(post.title)}">`
            : ""
        }
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

/**
 * Blog index page template
 * @param {Object} ctx - Context with pre-rendered nav/footer
 */
export function getBlogIndexTemplate(ctx) {
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
    ${ctx.analytics}
</head>
<body class="bg-white text-neutral-900 w-full overflow-x-hidden selection:bg-neutral-900 selection:text-white font-light antialiased">
    <!-- Skip to content link for accessibility -->
    <a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-neutral-900 focus:text-white focus:px-4 focus:py-2 focus:rounded focus:outline-none focus:ring-2 focus:ring-neutral-900">Skip to main content</a>

    ${ctx.nav.blog}

    <!-- Header -->
    <header id="main-content" class="relative pt-32 pb-16 md:pt-40 md:pb-20 px-6">
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
