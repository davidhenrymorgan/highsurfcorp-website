/**
 * High Surf Corp - Cloudflare Worker
 * Dynamic blog powered by D1 + R2
 */

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

// ============================================================================
// BLOG POST TEMPLATE
// ============================================================================

function getBlogPostTemplate() {
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

    <!-- Navigation -->
    <div class="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 animate-slide-up [animation-delay:0.2s] opacity-0">
      <nav class="w-full max-w-4xl flex items-center justify-between px-2 py-2 pr-6 border border-white/10 bg-neutral-900/95 backdrop-blur-xl rounded-full shadow-2xl transition-all duration-300 text-white">
        <a href="/" class="flex items-center gap-3 pl-4 hover:opacity-80 transition-opacity">
          <div class="flex text-black bg-white w-8 h-8 rounded-full items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 1280 1024" class="w-[20px] h-[20px]" stroke-width="2">
              <path fill="currentColor" d="M889.528 963.542c-52.647-.537-99.46-4.81-146.393-6.416-30.117-1.03-60.223-2.424-90.275-4.87-58.234-4.739-115.574-13.54-169.943-36.344-34.842-14.613-66.005-35.168-94.31-59.933-50.112-43.845-91.157-95.007-122.398-153.999-22.13-41.788-36.066-86.341-43.96-132.669-17.712-103.953-.471-200.873 59.483-289.11 44.458-65.43 102.773-114.94 171.06-153.77 34.699-19.73 71.577-32.916 110.212-42.218 51.49-12.398 103.263-22.479 156.497-21.49 69.904 1.3 136.825 15.342 199.073 48.43 16.837 8.949 31.99 20.307 46.017 33.077 35.434 32.258 66.6 68.208 92.096 108.907 2.72 4.342 4.813 9.09 7.031 13.728.675 1.41 1.453 3.194.178 4.64-1.573 1.784-3.507.808-5.168.049-7.585-3.47-13.878-8.676-19.05-15.137-15.2-18.988-31.153-37.212-48.156-54.696-48.923-50.305-109.873-73.384-177.81-82.038-44.126-5.621-87.434-.396-129.71 11.45-39.615 11.1-74.792 31.582-105.706 58.98-51.448 45.599-84.84 102.731-106.158 167.447-12.555 38.112-20.597 77.23-25.257 117.082-7.66 65.517 10.932 122.62 52.823 173.297 37.798 45.726 83.477 81.443 133.944 111.724 67.522 40.515 139.078 71.814 214.572 93.982 49.617 14.569 100.202 25.116 151.347 32.4 28.41 4.046 57.172 5.923 85.927 6.454 43.17.796 85.807-3.638 127.834-13.702 9.805-2.348 19.153-6.062 28.682-9.238 5.1-1.7 10.204-3.47 15.632-3.741 2.791-.14 5.895-.37 7.274 2.849 1.253 2.925-.166 5.492-1.945 7.763-3.933 5.021-9.533 7.458-15.325 9.4-25.923 8.686-51.67 17.978-77.872 25.728-35.842 10.6-70.867 23.761-107.293 32.593-45.652 11.07-91.722 17.624-138.69 18.066-13.31.125-26.586 1.764-34.263 1.325"></path>
              <path fill="currentColor" d="M16.283 802.634c1.909-29.552 11.155-57.344 20.13-85.156 18.41-57.06 41.302-112.355 66.598-166.656 24.486-52.562 49.295-104.974 74.044-157.414 16.863-35.73 33.866-71.395 50.808-107.088 2.308-4.863 4.548-9.802 8.015-13.956 2.11-2.527 4.14-6.942 8.23-4.561 4.114 2.394 1.448 6.298.044 9.357-3.607 7.86-7.816 15.462-11.112 23.445-22.747 55.09-46.403 109.771-60.416 168.112-19.173 79.826-10.49 156.771 23.03 230.784 48.196 106.42 127.515 182.514 232.14 232.928 11.377 5.482 23.348 9.5 35.469 13.105 4.515 1.343 10.59 2.71 9.812 9.05-.71 5.79-6.564 5.725-11.113 6.534-7.01 1.245-13.962-.47-20.964-.465-52.575.04-105.15-.224-157.724-.21-36.442.01-72.185-6.267-107.671-13.204-40.717-7.96-78.914-23.217-112.407-48.35-29.121-21.852-45.27-51.09-46.897-87.859-.123-2.793-.016-5.597-.016-8.396"></path>
            </svg>
          </div>
          <span class="font-bold text-lg tracking-tight">High Surf Corp</span>
        </a>

        <div class="hidden md:flex items-center gap-8 text-sm font-medium text-white/60">
          <a href="/blog" class="text-white hover:text-white transition-colors">Journal</a>
          <a href="/#services" class="hover:text-white transition-colors">Services</a>
          <a href="/#about" class="hover:text-white transition-colors">About</a>
          <a href="/contact" class="hover:text-white transition-colors">Contact</a>
        </div>

        <div class="flex items-center gap-2">
          <button class="w-10 h-10 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors">
            <iconify-icon icon="solar:share-linear" width="20"></iconify-icon>
          </button>
          <button class="relative w-10 h-10 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors group">
            <iconify-icon icon="solar:menu-dots-square-linear" width="20"></iconify-icon>
          </button>
        </div>
      </nav>
    </div>

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
        <h1 class="text-4xl md:text-6xl lg:text-7xl font-semibold tracking-tighter text-neutral-900 mb-8 max-w-5xl mx-auto leading-[0.95] animate-slide-up [animation-delay:0.4s] opacity-0">
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
      <div class="relative w-full aspect-[4/3] md:aspect-[21/9] bg-neutral-100 rounded-3xl md:rounded-[2.5rem] overflow-hidden shadow-2xl">
        <img src="{{hero_image}}" alt="{{title}}" class="w-full h-full object-cover">
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

    <!-- Footer -->
    <footer class="bg-black text-white py-16 px-6 border-t border-white/10 relative z-10">
      <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div class="col-span-1 md:col-span-2">
          <div class="flex items-center gap-3 mb-6">
            <div class="flex text-black bg-white w-8 h-8 rounded-full items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 1280 1024" class="w-[20px] h-[20px]" stroke-width="2">
                <path fill="currentColor" d="M889.528 963.542c-52.647-.537-99.46-4.81-146.393-6.416-30.117-1.03-60.223-2.424-90.275-4.87-58.234-4.739-115.574-13.54-169.943-36.344-34.842-14.613-66.005-35.168-94.31-59.933-50.112-43.845-91.157-95.007-122.398-153.999-22.13-41.788-36.066-86.341-43.96-132.669-17.712-103.953-.471-200.873 59.483-289.11 44.458-65.43 102.773-114.94 171.06-153.77 34.699-19.73 71.577-32.916 110.212-42.218 51.49-12.398 103.263-22.479 156.497-21.49 69.904 1.3 136.825 15.342 199.073 48.43 16.837 8.949 31.99 20.307 46.017 33.077 35.434 32.258 66.6 68.208 92.096 108.907 2.72 4.342 4.813 9.09 7.031 13.728.675 1.41 1.453 3.194.178 4.64-1.573 1.784-3.507.808-5.168.049-7.585-3.47-13.878-8.676-19.05-15.137-15.2-18.988-31.153-37.212-48.156-54.696-48.923-50.305-109.873-73.384-177.81-82.038-44.126-5.621-87.434-.396-129.71 11.45-39.615 11.1-74.792 31.582-105.706 58.98-51.448 45.599-84.84 102.731-106.158 167.447-12.555 38.112-20.597 77.23-25.257 117.082-7.66 65.517 10.932 122.62 52.823 173.297 37.798 45.726 83.477 81.443 133.944 111.724 67.522 40.515 139.078 71.814 214.572 93.982 49.617 14.569 100.202 25.116 151.347 32.4 28.41 4.046 57.172 5.923 85.927 6.454 43.17.796 85.807-3.638 127.834-13.702 9.805-2.348 19.153-6.062 28.682-9.238 5.1-1.7 10.204-3.47 15.632-3.741 2.791-.14 5.895-.37 7.274 2.849 1.253 2.925-.166 5.492-1.945 7.763-3.933 5.021-9.533 7.458-15.325 9.4-25.923 8.686-51.67 17.978-77.872 25.728-35.842 10.6-70.867 23.761-107.293 32.593-45.652 11.07-91.722 17.624-138.69 18.066-13.31.125-26.586 1.764-34.263 1.325"></path>
                <path fill="currentColor" d="M16.283 802.634c1.909-29.552 11.155-57.344 20.13-85.156 18.41-57.06 41.302-112.355 66.598-166.656 24.486-52.562 49.295-104.974 74.044-157.414 16.863-35.73 33.866-71.395 50.808-107.088 2.308-4.863 4.548-9.802 8.015-13.956 2.11-2.527 4.14-6.942 8.23-4.561 4.114 2.394 1.448 6.298.044 9.357-3.607 7.86-7.816 15.462-11.112 23.445-22.747 55.09-46.403 109.771-60.416 168.112-19.173 79.826-10.49 156.771 23.03 230.784 48.196 106.42 127.515 182.514 232.14 232.928 11.377 5.482 23.348 9.5 35.469 13.105 4.515 1.343 10.59 2.71 9.812 9.05-.71 5.79-6.564 5.725-11.113 6.534-7.01 1.245-13.962-.47-20.964-.465-52.575.04-105.15-.224-157.724-.21-36.442.01-72.185-6.267-107.671-13.204-40.717-7.96-78.914-23.217-112.407-48.35-29.121-21.852-45.27-51.09-46.897-87.859-.123-2.793-.016-5.597-.016-8.396"></path>
              </svg>
            </div>
            <h2 class="text-2xl font-bold tracking-tight">High Surf Corp</h2>
          </div>
          <p class="text-white/50 max-w-sm mb-8 font-light leading-relaxed">
            Engineering resilience where the ocean meets the earth. Sustainable shoreline protection for the modern coast.
          </p>

          <div class="flex gap-4">
            <a href="/contact" class="bg-white text-black px-6 py-3 rounded-full font-medium hover:bg-neutral-200 transition-colors">
              Get a Quote
            </a>
          </div>
        </div>

        <div class="flex flex-col gap-4">
          <h4 class="font-bold tracking-tight text-lg mb-2">Explore</h4>
          <a href="/#about" class="text-white/60 hover:text-white transition-colors font-light">About Us</a>
          <a href="/#services" class="text-white/60 hover:text-white transition-colors font-light">Our Services</a>
          <a href="/blog" class="text-white/60 hover:text-white transition-colors font-light">Journal</a>
          <a href="/contact" class="text-white/60 hover:text-white transition-colors font-light">Contact</a>
        </div>

        <div class="flex flex-col gap-4">
          <h4 class="font-bold tracking-tight text-lg mb-2">Company</h4>
          <a href="tel:+13213380858" class="text-white/60 hover:text-white transition-colors font-light">(321) 338-0858</a>
          <a href="mailto:info@highsurfcorp.com" class="text-white/60 hover:text-white transition-colors font-light">info@highsurfcorp.com</a>
          <a href="/legal/privacy" class="text-white/60 hover:text-white transition-colors font-light">Privacy Policy</a>
          <a href="/legal/terms" class="text-white/60 hover:text-white transition-colors font-light">Terms of Service</a>
        </div>
      </div>

      <div class="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-sm text-white/40 font-light">
        <p>&copy; 2024 High Surf Corp. All rights reserved.</p>
        <div class="flex gap-6 mt-4 md:mt-0">
          <a href="https://www.facebook.com/highsurfcorp" target="_blank" class="hover:text-white transition-colors"><iconify-icon icon="brandico:facebook" width="16"></iconify-icon></a>
          <a href="https://www.instagram.com/highsurfcorp" target="_blank" class="hover:text-white transition-colors"><iconify-icon icon="brandico:instagram" width="16"></iconify-icon></a>
        </div>
      </div>
    </footer>

</body></html>`;
}

// ============================================================================
// RELATED POST CARD TEMPLATE
// ============================================================================

function getRelatedPostCard(post) {
  const date = formatDate(post.published_at);
  const category = post.category || post.short_tag || "Article";
  const shortDate = date.split(",")[0]; // "Nov 05"

  return `
    <a href="/blog/${post.slug}" class="group block">
      <div class="aspect-[4/3] bg-white rounded-2xl overflow-hidden mb-6 relative">
        <img src="${post.thumbnail_image || post.hero_image}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90" alt="${escapeHtml(post.title)}">
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

function getBlogIndexTemplate() {
  return `<!DOCTYPE html>
<html lang="en" class="scroll-smooth"><head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Journal | High Surf Corp</title>
    <meta name="description" content="Insights on shoreline protection, seawall construction, and coastal engineering from High Surf Corp.">
    <link rel="canonical" href="https://highsurfcorp.com/blog">
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
</head>
<body class="bg-white text-neutral-900 w-full overflow-x-hidden selection:bg-neutral-900 selection:text-white font-light antialiased">

    <!-- Navigation -->
    <div class="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 animate-slide-up [animation-delay:0.2s] opacity-0">
      <nav class="w-full max-w-4xl flex items-center justify-between px-2 py-2 pr-6 border border-white/10 bg-neutral-900/95 backdrop-blur-xl rounded-full shadow-2xl transition-all duration-300 text-white">
        <a href="/" class="flex items-center gap-3 pl-4 hover:opacity-80 transition-opacity">
          <div class="flex text-black bg-white w-8 h-8 rounded-full items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 1280 1024" class="w-[20px] h-[20px]" stroke-width="2">
              <path fill="currentColor" d="M889.528 963.542c-52.647-.537-99.46-4.81-146.393-6.416-30.117-1.03-60.223-2.424-90.275-4.87-58.234-4.739-115.574-13.54-169.943-36.344-34.842-14.613-66.005-35.168-94.31-59.933-50.112-43.845-91.157-95.007-122.398-153.999-22.13-41.788-36.066-86.341-43.96-132.669-17.712-103.953-.471-200.873 59.483-289.11 44.458-65.43 102.773-114.94 171.06-153.77 34.699-19.73 71.577-32.916 110.212-42.218 51.49-12.398 103.263-22.479 156.497-21.49 69.904 1.3 136.825 15.342 199.073 48.43 16.837 8.949 31.99 20.307 46.017 33.077 35.434 32.258 66.6 68.208 92.096 108.907 2.72 4.342 4.813 9.09 7.031 13.728.675 1.41 1.453 3.194.178 4.64-1.573 1.784-3.507.808-5.168.049-7.585-3.47-13.878-8.676-19.05-15.137-15.2-18.988-31.153-37.212-48.156-54.696-48.923-50.305-109.873-73.384-177.81-82.038-44.126-5.621-87.434-.396-129.71 11.45-39.615 11.1-74.792 31.582-105.706 58.98-51.448 45.599-84.84 102.731-106.158 167.447-12.555 38.112-20.597 77.23-25.257 117.082-7.66 65.517 10.932 122.62 52.823 173.297 37.798 45.726 83.477 81.443 133.944 111.724 67.522 40.515 139.078 71.814 214.572 93.982 49.617 14.569 100.202 25.116 151.347 32.4 28.41 4.046 57.172 5.923 85.927 6.454 43.17.796 85.807-3.638 127.834-13.702 9.805-2.348 19.153-6.062 28.682-9.238 5.1-1.7 10.204-3.47 15.632-3.741 2.791-.14 5.895-.37 7.274 2.849 1.253 2.925-.166 5.492-1.945 7.763-3.933 5.021-9.533 7.458-15.325 9.4-25.923 8.686-51.67 17.978-77.872 25.728-35.842 10.6-70.867 23.761-107.293 32.593-45.652 11.07-91.722 17.624-138.69 18.066-13.31.125-26.586 1.764-34.263 1.325"></path>
              <path fill="currentColor" d="M16.283 802.634c1.909-29.552 11.155-57.344 20.13-85.156 18.41-57.06 41.302-112.355 66.598-166.656 24.486-52.562 49.295-104.974 74.044-157.414 16.863-35.73 33.866-71.395 50.808-107.088 2.308-4.863 4.548-9.802 8.015-13.956 2.11-2.527 4.14-6.942 8.23-4.561 4.114 2.394 1.448 6.298.044 9.357-3.607 7.86-7.816 15.462-11.112 23.445-22.747 55.09-46.403 109.771-60.416 168.112-19.173 79.826-10.49 156.771 23.03 230.784 48.196 106.42 127.515 182.514 232.14 232.928 11.377 5.482 23.348 9.5 35.469 13.105 4.515 1.343 10.59 2.71 9.812 9.05-.71 5.79-6.564 5.725-11.113 6.534-7.01 1.245-13.962-.47-20.964-.465-52.575.04-105.15-.224-157.724-.21-36.442.01-72.185-6.267-107.671-13.204-40.717-7.96-78.914-23.217-112.407-48.35-29.121-21.852-45.27-51.09-46.897-87.859-.123-2.793-.016-5.597-.016-8.396"></path>
            </svg>
          </div>
          <span class="font-bold text-lg tracking-tight">High Surf Corp</span>
        </a>

        <div class="hidden md:flex items-center gap-8 text-sm font-medium text-white/60">
          <a href="/blog" class="text-white hover:text-white transition-colors">Journal</a>
          <a href="/#services" class="hover:text-white transition-colors">Services</a>
          <a href="/#about" class="hover:text-white transition-colors">About</a>
          <a href="/contact" class="hover:text-white transition-colors">Contact</a>
        </div>

        <div class="flex items-center gap-2">
          <a href="/contact" class="hidden md:block bg-white text-black px-4 py-2 rounded-full text-sm font-medium hover:bg-neutral-200 transition-colors">
            Get a Quote
          </a>
        </div>
      </nav>
    </div>

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
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-black text-white py-16 px-6 border-t border-white/10 relative z-10">
      <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div class="col-span-1 md:col-span-2">
          <div class="flex items-center gap-3 mb-6">
            <div class="flex text-black bg-white w-8 h-8 rounded-full items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 1280 1024" class="w-[20px] h-[20px]" stroke-width="2">
                <path fill="currentColor" d="M889.528 963.542c-52.647-.537-99.46-4.81-146.393-6.416-30.117-1.03-60.223-2.424-90.275-4.87-58.234-4.739-115.574-13.54-169.943-36.344-34.842-14.613-66.005-35.168-94.31-59.933-50.112-43.845-91.157-95.007-122.398-153.999-22.13-41.788-36.066-86.341-43.96-132.669-17.712-103.953-.471-200.873 59.483-289.11 44.458-65.43 102.773-114.94 171.06-153.77 34.699-19.73 71.577-32.916 110.212-42.218 51.49-12.398 103.263-22.479 156.497-21.49 69.904 1.3 136.825 15.342 199.073 48.43 16.837 8.949 31.99 20.307 46.017 33.077 35.434 32.258 66.6 68.208 92.096 108.907 2.72 4.342 4.813 9.09 7.031 13.728.675 1.41 1.453 3.194.178 4.64-1.573 1.784-3.507.808-5.168.049-7.585-3.47-13.878-8.676-19.05-15.137-15.2-18.988-31.153-37.212-48.156-54.696-48.923-50.305-109.873-73.384-177.81-82.038-44.126-5.621-87.434-.396-129.71 11.45-39.615 11.1-74.792 31.582-105.706 58.98-51.448 45.599-84.84 102.731-106.158 167.447-12.555 38.112-20.597 77.23-25.257 117.082-7.66 65.517 10.932 122.62 52.823 173.297 37.798 45.726 83.477 81.443 133.944 111.724 67.522 40.515 139.078 71.814 214.572 93.982 49.617 14.569 100.202 25.116 151.347 32.4 28.41 4.046 57.172 5.923 85.927 6.454 43.17.796 85.807-3.638 127.834-13.702 9.805-2.348 19.153-6.062 28.682-9.238 5.1-1.7 10.204-3.47 15.632-3.741 2.791-.14 5.895-.37 7.274 2.849 1.253 2.925-.166 5.492-1.945 7.763-3.933 5.021-9.533 7.458-15.325 9.4-25.923 8.686-51.67 17.978-77.872 25.728-35.842 10.6-70.867 23.761-107.293 32.593-45.652 11.07-91.722 17.624-138.69 18.066-13.31.125-26.586 1.764-34.263 1.325"></path>
                <path fill="currentColor" d="M16.283 802.634c1.909-29.552 11.155-57.344 20.13-85.156 18.41-57.06 41.302-112.355 66.598-166.656 24.486-52.562 49.295-104.974 74.044-157.414 16.863-35.73 33.866-71.395 50.808-107.088 2.308-4.863 4.548-9.802 8.015-13.956 2.11-2.527 4.14-6.942 8.23-4.561 4.114 2.394 1.448 6.298.044 9.357-3.607 7.86-7.816 15.462-11.112 23.445-22.747 55.09-46.403 109.771-60.416 168.112-19.173 79.826-10.49 156.771 23.03 230.784 48.196 106.42 127.515 182.514 232.14 232.928 11.377 5.482 23.348 9.5 35.469 13.105 4.515 1.343 10.59 2.71 9.812 9.05-.71 5.79-6.564 5.725-11.113 6.534-7.01 1.245-13.962-.47-20.964-.465-52.575.04-105.15-.224-157.724-.21-36.442.01-72.185-6.267-107.671-13.204-40.717-7.96-78.914-23.217-112.407-48.35-29.121-21.852-45.27-51.09-46.897-87.859-.123-2.793-.016-5.597-.016-8.396"></path>
              </svg>
            </div>
            <h2 class="text-2xl font-bold tracking-tight">High Surf Corp</h2>
          </div>
          <p class="text-white/50 max-w-sm mb-8 font-light leading-relaxed">
            Engineering resilience where the ocean meets the earth. Sustainable shoreline protection for the modern coast.
          </p>
          <a href="/contact" class="inline-block bg-white text-black px-6 py-3 rounded-full font-medium hover:bg-neutral-200 transition-colors">
            Get a Quote
          </a>
        </div>

        <div class="flex flex-col gap-4">
          <h4 class="font-bold tracking-tight text-lg mb-2">Explore</h4>
          <a href="/#about" class="text-white/60 hover:text-white transition-colors font-light">About Us</a>
          <a href="/#services" class="text-white/60 hover:text-white transition-colors font-light">Our Services</a>
          <a href="/blog" class="text-white/60 hover:text-white transition-colors font-light">Journal</a>
          <a href="/contact" class="text-white/60 hover:text-white transition-colors font-light">Contact</a>
        </div>

        <div class="flex flex-col gap-4">
          <h4 class="font-bold tracking-tight text-lg mb-2">Company</h4>
          <a href="tel:+13213380858" class="text-white/60 hover:text-white transition-colors font-light">(321) 338-0858</a>
          <a href="mailto:info@highsurfcorp.com" class="text-white/60 hover:text-white transition-colors font-light">info@highsurfcorp.com</a>
          <a href="/legal/privacy" class="text-white/60 hover:text-white transition-colors font-light">Privacy Policy</a>
          <a href="/legal/terms" class="text-white/60 hover:text-white transition-colors font-light">Terms of Service</a>
        </div>
      </div>

      <div class="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-sm text-white/40 font-light">
        <p>&copy; 2024 High Surf Corp. All rights reserved.</p>
        <div class="flex gap-6 mt-4 md:mt-0">
          <a href="https://www.facebook.com/highsurfcorp" target="_blank" class="hover:text-white transition-colors"><iconify-icon icon="brandico:facebook" width="16"></iconify-icon></a>
          <a href="https://www.instagram.com/highsurfcorp" target="_blank" class="hover:text-white transition-colors"><iconify-icon icon="brandico:instagram" width="16"></iconify-icon></a>
        </div>
      </div>
    </footer>

</body></html>`;
}

// ============================================================================
// RENDER FUNCTIONS
// ============================================================================

function renderBlogPost(post, relatedPosts) {
  const template = getBlogPostTemplate();
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
  html = html.replace(/\{\{hero_image\}\}/g, post.hero_image || "");
  html = html.replace(
    /\{\{meta_description\}\}/g,
    escapeHtml(post.meta_description || post.short_preview || ""),
  );
  html = html.replace(/\{\{body\}\}/g, post.body || "");
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

function renderBlogIndex(posts) {
  const template = getBlogIndexTemplate();

  // Find featured post
  const featuredPost = posts.find((p) => p.featured === 1);

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
              <img src="${featuredPost.hero_image}" alt="${escapeHtml(featuredPost.title)}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700">
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

  // Posts grid HTML
  const postsHtml = posts
    .filter((p) => p.featured !== 1)
    .map((post) => {
      const date = formatDate(post.published_at);
      const category = post.category || post.short_tag || "Article";
      const shortDate = date.split(",")[0];

      return `
        <a href="/blog/${post.slug}" class="group block">
          <div class="aspect-[4/3] bg-neutral-100 rounded-2xl overflow-hidden mb-6">
            <img src="${post.thumbnail_image || post.hero_image}" alt="${escapeHtml(post.title)}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
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

  let html = template;
  html = html.replace(/\{\{featured_section\}\}/g, featuredHtml);
  html = html.replace(/\{\{posts_grid\}\}/g, postsHtml);

  return html;
}

// ============================================================================
// ROUTE HANDLERS
// ============================================================================

async function handleBlogPost(url, env) {
  const slug = url.pathname.split("/blog/")[1].replace(/\/$/, "");

  if (!slug) {
    return handleBlogIndex(env);
  }

  // Query post from D1
  const post = await env.DB.prepare(
    "SELECT * FROM posts WHERE slug = ? AND draft = 0 AND archived = 0",
  )
    .bind(slug)
    .first();

  if (!post) {
    // Return 404
    return new Response("Post not found", { status: 404 });
  }

  // Query related posts
  const related = await env.DB.prepare(
    `SELECT slug, title, thumbnail_image, hero_image, category, short_tag, published_at
     FROM posts
     WHERE slug != ? AND draft = 0 AND archived = 0
     ORDER BY published_at DESC
     LIMIT 3`,
  )
    .bind(slug)
    .all();

  // Render template
  const html = renderBlogPost(post, related.results);

  return new Response(html, {
    headers: {
      "Content-Type": "text/html",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

async function handleBlogIndex(env) {
  // Query all posts
  const posts = await env.DB.prepare(
    `SELECT slug, title, thumbnail_image, hero_image, category, short_tag, short_preview, published_at, featured
     FROM posts
     WHERE draft = 0 AND archived = 0
     ORDER BY published_at DESC`,
  ).all();

  const html = renderBlogIndex(posts.results);

  return new Response(html, {
    headers: {
      "Content-Type": "text/html",
      "Cache-Control": "public, max-age=1800",
    },
  });
}

// ============================================================================
// MAIN EXPORT
// ============================================================================

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Route: /blog/:slug - Individual post
    if (url.pathname.match(/^\/blog\/[^/]+\/?$/)) {
      return handleBlogPost(url, env);
    }

    // Route: /blog - Blog index
    if (url.pathname === "/blog" || url.pathname === "/blog/") {
      return handleBlogIndex(env);
    }

    // Fallback to static assets
    return env.ASSETS
      ? env.ASSETS.fetch(request)
      : new Response("Not found", { status: 404 });
  },
};
