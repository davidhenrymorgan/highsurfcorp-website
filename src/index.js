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
          <a href="/" class="hover:text-white transition-colors">Home</a>
          <a href="/#process" class="hover:text-white transition-colors">Our Process</a>
          <a href="/blog" class="text-white hover:text-white transition-colors">Blog</a>
          <a href="/contact/brevard-county-free-estimate.html" class="hover:text-white transition-colors">Free Estimate</a>
        </div>

        <div class="flex items-center gap-2">
          <a href="/contact/brevard-county-free-estimate.html" class="hidden md:block bg-white text-black px-4 py-2 rounded-full text-sm font-medium hover:bg-neutral-200 transition-colors">
            Get a Quote
          </a>
          <button class="relative w-10 h-10 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors group md:hidden">
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
    <footer class="z-10 text-white bg-black border-white/10 border-t pt-16 pr-6 pb-16 pl-6 relative">
      <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div class="col-span-1 md:col-span-2">
          <div class="flex mb-6 gap-x-2 gap-y-2 items-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 242.44 61.96" class="w-[234px] h-[60px]" stroke-width="2" style="width: 234px; height: 60px; color: rgb(255, 255, 255);">
              <g>
                <path d="m150.15,27.87c1.98,1.21,3.07,3.17,4.24,5.07.58.95,1.19,1.89,1.84,2.93h-4.55c-1.11-1.65-2.26-3.37-3.41-5.08-.07-.1-.14-.19-.2-.3-1.05-1.82-2.55-2.69-4.8-2.22v7.61h-3.75c-.13-1.08-.14-17.37-.02-18.6.29-.18.61-.08.92-.08,2.36-.01,4.72,0,7.08,0,1,0,1.99.08,2.98.21,2.53.35,3.92,1.89,4.23,4.33.34,2.71-.94,5.22-4.22,5.8-.11.02-.24.02-.34.33Zm-6.88-2.81c1.83,0,3.54.03,5.26,0,1.42-.03,2.27-.84,2.31-2.2.04-1.45-.67-2.24-1.96-2.4-1.85-.23-3.71-.07-5.6-.1v4.71Z"></path>
                <path d="m82.97,22.41c-1.29.23-2.46.45-3.66.67-.24-.13-.29-.41-.43-.66-.74-1.36-1.83-2.18-3.43-2.21-1.17-.02-2.32-.03-3.36.62-1.21.75-2,1.83-2.3,3.21-.37,1.7-.4,3.43.06,5.1.96,3.45,4,4.34,6.39,3.72,1.05-.27,2.05-.65,2.96-1.35v-2.37c-1.34-.12-2.73.02-4.17-.09-.12-1.07-.1-2.08-.03-3.13h7.96c.06.06.09.09.11.12.02.03.06.07.06.1,0,2.4,0,4.79,0,7.23-.48.57-1.13.96-1.8,1.31-1.63.87-3.38,1.45-5.23,1.56-3.06.19-5.9-.4-8.08-2.76-1.34-1.45-2.01-3.23-2.28-5.16-.21-1.51-.13-3.01.18-4.51.81-3.98,4.13-6.78,8.08-6.89,1.2-.03,2.39-.05,3.58.21,2.86.63,4.6,2.37,5.4,5.28Z"></path>
                <path d="m99.67,35.89h-3.73v-8.08h-7.43v8.07h-3.78v-18.64h3.64s.02.03.05.06c.02.03.07.06.07.09,0,2.36,0,4.71,0,7.14h7.39v-7.2c.68-.25,1.31-.11,1.93-.14.6-.02,1.19,0,1.86,0v18.7Z"></path>
                <path d="m58.93,35.9h-3.73v-8.11h-7.36v8.07c-1.26.14-2.45.06-3.62.06-.24-1-.33-14.7-.13-18.62.59-.23,1.23-.08,1.84-.11.59-.02,1.18,0,1.85,0v7.36c1.25.1,2.43.04,3.61.05,1.2.01,2.4,0,3.58,0,.05-.04.08-.07.1-.1.03-.03.07-.06.07-.09,0-2.36,0-4.71,0-7.13,1.27-.19,2.49-.03,3.78-.11v18.72Z"></path>
                <path d="m60.97,17.22h3.64v18.66h-3.69c-.2-1.17-.16-17.86.05-18.66Z"></path>
                <path d="m70.45,15.25c-.29-.06-.56-.2-.81-.37-.51-.34-.9-.79-1.28-1.26-.49-.6-.93-1.25-1.47-1.81-.36-.37-.71-.74-1.07-1.1-.7-.68-1.41-1.35-2.13-2.02-.33-.31-.74-.53-1.13-.76-.64-.38-1.28-.75-1.94-1.09-.42-.22-.87-.39-1.32-.55-.61-.21-1.2-.47-1.84-.6-.91-.19-1.81-.39-2.72-.56-.49-.1-.99-.17-1.49-.23-.41-.05-.82-.06-1.24-.09-.17-.01-.35-.04-.52-.03-.44,0-.88,0-1.32.04-.45.03-.9.09-1.34.15-.5.06-.99.12-1.49.2-.42.06-.84.16-1.27.22-.92.13-1.78.49-2.64.83-.26.1-.52.22-.78.34-.09.04-.2,0-.28.11-.07.09-.21.12-.31.18-.1.06-.2.11-.31.17-.11.06-.22.11-.32.17-.11.06-.21.12-.32.18-.83.47-1.63.98-2.39,1.56-.38.29-.74.61-1.1.92-.15.13-.31.25-.45.39-.17.17-.31.36-.47.54-.23.27-.47.53-.7.81-.34.4-.69.81-1.01,1.22-.61.77-1.17,1.57-1.65,2.42-.35.62-.69,1.26-.99,1.92-.48,1.07-.93,2.15-1.37,3.24-.19.47-.31.97-.45,1.46-.18.65-.36,1.3-.52,1.95-.12.47-.2.94-.3,1.41-.06.3-.14.6-.2.9-.05.26-.08.53-.11.8-.04.3-.09.6-.13.89-.04.3-.07.6-.11.9-.01.1-.02.19-.03.29-.02.18-.04.35-.04.53-.02.59-.05,1.18-.03,1.76,0,.35.08.69.13,1.03.03.25.06.5.1.74.04.24.07.48.13.72.14.52.27,1.04.44,1.55.24.72.59,1.39.97,2.06.4.71.85,1.39,1.34,2.03.41.53.83,1.05,1.26,1.57.61.73,1.29,1.4,1.98,2.05.37.36.77.69,1.17,1.02.69.59,1.46,1.07,2.2,1.58.48.34.94.7,1.43,1.03.47.31.95.6,1.43.88.54.32,1.09.64,1.64.94.47.26.95.51,1.43.77.28.15.55.3.84.44.49.25.99.49,1.49.73.27.13.55.26.82.38.56.25,1.13.5,1.7.74.46.19.93.38,1.4.56.7.26,1.4.52,2.1.77.69.24,1.38.49,2.08.7.65.2,1.31.35,1.97.52.53.14,1.06.27,1.58.41.54.15,1.07.31,1.61.45.24.06.49.1.74.14.34.06.68.1,1.03.16.37.06.75.13,1.12.19.47.08.95.17,1.42.26.49.09.97.17,1.46.25.34.05.69.08,1.03.12.29.03.57.08.86.11.19.02.38.03.58.05.42.04.83.08,1.25.11.24.02.49.04.73.04.86.02,1.73.05,2.59.04.58,0,1.16-.07,1.74-.11.32-.02.64-.05.96-.08.39-.04.78-.1,1.17-.15.43-.05.87-.09,1.3-.16.57-.09,1.14-.19,1.7-.32.66-.16,1.32-.37,1.98-.57.33-.1.65-.23.99-.32.2-.06.4-.08.61-.1.07,0,.15.02.23.04.14.05.19.18.17.32-.07.42-.36.67-.71.83-.42.19-.87.35-1.31.51-.49.18-.99.37-1.49.54-.48.17-.98.31-1.46.47-.21.07-.42.15-.64.22-.75.24-1.5.49-2.25.73-.36.11-.73.2-1.09.31-.5.16-.99.32-1.48.5-.46.16-.94.25-1.41.37-.52.13-1.04.29-1.56.42-.64.17-1.28.33-1.92.48-.36.09-.72.17-1.09.24-.46.09-.92.16-1.38.23-.34.05-.69.08-1.03.12-.35.04-.7.08-1.06.11-.2.02-.4.03-.6.04-.38.02-.76.05-1.14.07-.02,0-.04,0-.06,0-.58.01-1.15.03-1.73.04-.49.01-.99.03-1.48.03-.33,0-.67-.02-1-.03-.45,0-.9,0-1.35,0-.41,0-.81-.02-1.22-.04-.57-.02-1.15-.05-1.72-.08-.32-.02-.64-.04-.96-.06-.12,0-.24,0-.36-.01-.53-.01-1.06-.02-1.59-.04-.31-.01-.63-.05-.94-.06-.16,0-.32,0-.48-.01-.37-.01-.75-.02-1.12-.04-.47-.02-.94-.05-1.4-.08-.5-.03-.99-.05-1.49-.08-.37-.02-.75-.05-1.12-.08-.42-.03-.84-.08-1.27-.11-.37-.03-.75-.05-1.12-.08-.46-.04-.92-.1-1.38-.15-.28-.03-.56-.05-.85-.09-.48-.06-.97-.13-1.45-.2-.48-.08-.96-.17-1.44-.26-.26-.05-.51-.12-.76-.19-.57-.15-1.14-.3-1.71-.46-.77-.22-1.52-.47-2.26-.76-.94-.37-1.85-.82-2.71-1.36-.4-.25-.82-.49-1.23-.73-.16-.09-.35-.15-.5-.25-.39-.28-.77-.58-1.16-.88-.27-.21-.54-.42-.81-.63-.27-.22-.53-.43-.79-.66-.33-.3-.64-.61-.96-.91-.25-.24-.51-.47-.75-.73-.43-.45-.86-.92-1.28-1.38-.32-.36-.63-.72-.93-1.09-.65-.78-1.26-1.59-1.82-2.43-.51-.76-.99-1.53-1.43-2.32-.43-.77-.88-1.53-1.25-2.34-.29-.61-.59-1.22-.87-1.84-.11-.26-.17-.54-.25-.81-.11-.34-.21-.69-.32-1.03-.13-.41-.27-.82-.37-1.24-.12-.49-.21-1-.31-1.49-.05-.25-.13-.5-.18-.75-.11-.57-.22-1.14-.32-1.71-.03-.15-.03-.3-.04-.44-.03-.5-.05-.99-.09-1.49-.04-.63-.1-1.26-.13-1.89-.01-.25.02-.5.04-.75,0-.04.01-.09.02-.13.02-.36.02-.72.05-1.09.03-.38.04-.77.12-1.13.1-.44.11-.89.19-1.34.06-.35.13-.69.2-1.04.02-.08.03-.16.05-.25.1-.52.26-1.03.39-1.55.12-.44.25-.86.43-1.28.16-.37.28-.75.44-1.11.12-.28.26-.55.39-.82.18-.37.36-.75.54-1.13.06-.13.13-.27.2-.4.28-.48.54-.97.83-1.44.29-.48.6-.95.91-1.41.22-.32.48-.63.72-.94.37-.48.73-.99,1.13-1.44.54-.61,1.1-1.19,1.67-1.76.42-.41.86-.81,1.3-1.19.69-.59,1.39-1.17,2.09-1.74.44-.36.89-.71,1.36-1.04.29-.2.61-.36.91-.54.37-.22.74-.44,1.11-.66.41-.24.81-.5,1.23-.73.42-.23.86-.42,1.3-.63.28-.14.55-.28.83-.41.23-.11.46-.2.69-.29.45-.17.9-.35,1.36-.5.59-.19,1.18-.35,1.77-.52.16-.05.33-.07.49-.12.1-.03.18-.09.28-.11.66-.16,1.32-.32,1.99-.47.48-.11.96-.21,1.45-.3.43-.08.86-.14,1.29-.21.31-.05.62-.1.93-.14.26-.04.52-.06.79-.09.33-.04.65-.07.98-.11.19-.02.37-.04.56-.05.39-.02.77-.04,1.16-.05.72-.01,1.45-.03,2.17-.03.43,0,.85.04,1.28.07.24.01.48.02.72.04.26.02.52.06.79.09.38.05.75.09,1.13.14.23.03.46.07.68.12.5.1.99.2,1.49.3.74.15,1.47.34,2.18.57,1.24.41,2.44.91,3.62,1.46.97.45,1.89.99,2.73,1.65.3.24.64.44.93.7.44.38.85.8,1.27,1.2.18.17.36.35.54.53.69.69,1.33,1.43,1.94,2.19.46.57.93,1.13,1.38,1.71.67.86,1.28,1.76,1.74,2.75.05.12.1.24.16.35.07.13.08.24-.06.35Z" fill="currentColor"></path>
                <path d="m.25,50.94c.02-.82.14-1.63.31-2.43.21-.96.5-1.9.81-2.84.14-.43.25-.86.38-1.29.04-.13.1-.25.14-.37.03-.1.05-.2.09-.29.24-.57.37-1.17.59-1.75.3-.81.62-1.61.94-2.41.21-.53.43-1.06.65-1.59.2-.48.4-.96.61-1.44.34-.79.69-1.57,1.04-2.35.08-.19.17-.38.26-.56.22-.47.45-.93.68-1.4.38-.79.77-1.58,1.15-2.37.32-.68.64-1.35.96-2.03.41-.88.82-1.77,1.23-2.65.31-.68.63-1.36.94-2.04.4-.85.79-1.7,1.19-2.54.31-.65.62-1.31.94-1.96.49-1.01.99-2.01,1.48-3.01.14-.3.27-.6.52-.83.03-.03.06-.06.09-.08.16-.12.25-.12.4-.01.12.09.17.27.1.42-.09.21-.19.41-.29.61-.32.67-.63,1.34-.95,2.02-.01.02-.03.05-.03.07-.03.4-.25.73-.39,1.08-.35.88-.73,1.75-1.08,2.63-.37.95-.73,1.92-1.07,2.88-.35,1.01-.66,2.03-.91,3.07-.15.66-.32,1.32-.45,1.99-.11.56-.17,1.13-.25,1.7-.03.25-.02.51-.09.75-.12.43-.04.86-.07,1.29-.02.24-.04.48-.03.71,0,.37.04.73.06,1.1,0,.05,0,.1.01.15.05.49.09.97.15,1.46.06.45.12.9.2,1.35.05.29.13.58.19.87.17.79.4,1.56.66,2.32.3.91.64,1.8,1.06,2.66.34.7.68,1.4,1.05,2.08.28.53.59,1.04.93,1.54.52.78,1.07,1.55,1.62,2.31.29.4.63.77.94,1.15.67.82,1.41,1.59,2.17,2.32.42.4.85.77,1.29,1.14.44.38.89.75,1.35,1.1.52.39,1.06.76,1.59,1.13.83.57,1.68,1.09,2.55,1.57,1.04.58,2.11,1.1,3.23,1.48.42.14.84.28,1.26.43.14.05.27.13.38.22.25.2.16.48-.05.67-.07.07-.18.1-.28.13-.43.11-.87.09-1.31.04-.05,0-.1,0-.15,0-.92,0-1.84,0-2.76,0-1.98,0-3.96.02-5.95.03-.45,0-.9-.02-1.36-.04-.31,0-.62-.03-.93-.04-.44-.01-.88-.02-1.32-.04-.3-.01-.6-.01-.88-.08-.45-.11-.91-.07-1.36-.18-.3-.07-.62-.08-.93-.13-.28-.04-.55-.07-.83-.12-.36-.07-.71-.15-1.07-.22-.03,0-.05,0-.08-.01-.63-.03-1.21-.28-1.82-.4-.17-.03-.32-.13-.49-.16-.56-.09-1.06-.35-1.59-.53-.37-.13-.74-.27-1.09-.44-.72-.34-1.45-.64-2.12-1.08-.41-.27-.83-.53-1.21-.84-.5-.4-.95-.85-1.36-1.35-.39-.49-.72-1-.99-1.57-.29-.61-.52-1.25-.59-1.93-.04-.35-.07-.7-.1-1.06Z" fill="currentColor"></path>
              </g>
            </svg>
          </div>
          <p class="text-white/50 max-w-xs mb-8 font-light">
            Family-owned since 1997. Protecting Brevard County's shorelines with coquina, granite, and limestone revetments.
          </p>
          <div class="flex gap-4">
            <input type="email" placeholder="Email address" class="bg-white/5 border border-white/10 rounded-full px-6 py-3 w-64 focus:outline-none focus:border-white/30 transition-colors placeholder:text-white/20 font-light">
            <button class="bg-white text-black px-6 py-3 rounded-full font-medium hover:bg-neutral-200 transition-colors">
              Connect
            </button>
          </div>
        </div>

        <div class="flex flex-col gap-4">
          <h4 class="font-bold tracking-tight text-lg mb-2">High Surf Corp</h4>
          <a href="/" class="text-white/60 hover:text-white transition-colors font-light">Home</a>
          <a href="/#process" class="text-white/60 hover:text-white transition-colors font-light">Our Process</a>
          <a href="/blog" class="text-white/60 hover:text-white transition-colors font-light">Blog</a>
          <a href="/contact/brevard-county-free-estimate.html" class="text-white/60 hover:text-white transition-colors font-light">Free Estimate</a>
        </div>

        <div class="flex flex-col gap-4">
          <h4 class="font-bold tracking-tight text-lg mb-2">Contact</h4>
          <a href="mailto:crew@highsurfcorp.com" class="text-white/60 hover:text-white transition-colors font-light">crew@highsurfcorp.com</a>
          <a href="tel:+13218214895" class="text-white/60 hover:text-white transition-colors font-light">(321) 821-4895</a>
          <p class="text-white/60 font-light">330 5th Ave<br>Indialantic, FL 32903</p>
        </div>

        <div class="flex flex-col gap-4">
          <h4 class="font-bold tracking-tight text-lg mb-2">Legal</h4>
          <a href="/legal/privacy-policy.html" class="text-white/60 hover:text-white transition-colors font-light">Privacy Policy</a>
          <a href="/legal/terms-conditions.html" class="text-white/60 hover:text-white transition-colors font-light">Terms & Conditions</a>
        </div>
      </div>

      <div class="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-sm text-white/40 font-light">
        <p class="text-white/40 text-sm">© 2026 High Surf Corp. All Rights Reserved.</p>
        <div class="flex gap-6 mt-4 md:mt-0"></div>
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
          <a href="/" class="hover:text-white transition-colors">Home</a>
          <a href="/#process" class="hover:text-white transition-colors">Our Process</a>
          <a href="/blog" class="text-white hover:text-white transition-colors">Blog</a>
          <a href="/contact/brevard-county-free-estimate.html" class="hover:text-white transition-colors">Free Estimate</a>
        </div>

        <div class="flex items-center gap-2">
          <a href="/contact/brevard-county-free-estimate.html" class="hidden md:block bg-white text-black px-4 py-2 rounded-full text-sm font-medium hover:bg-neutral-200 transition-colors">
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
    <footer class="z-10 text-white bg-black border-white/10 border-t pt-16 pr-6 pb-16 pl-6 relative">
      <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div class="col-span-1 md:col-span-2">
          <div class="flex mb-6 gap-x-2 gap-y-2 items-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 242.44 61.96" class="w-[234px] h-[60px]" stroke-width="2" style="width: 234px; height: 60px; color: rgb(255, 255, 255);">
              <g>
                <path d="m150.15,27.87c1.98,1.21,3.07,3.17,4.24,5.07.58.95,1.19,1.89,1.84,2.93h-4.55c-1.11-1.65-2.26-3.37-3.41-5.08-.07-.1-.14-.19-.2-.3-1.05-1.82-2.55-2.69-4.8-2.22v7.61h-3.75c-.13-1.08-.14-17.37-.02-18.6.29-.18.61-.08.92-.08,2.36-.01,4.72,0,7.08,0,1,0,1.99.08,2.98.21,2.53.35,3.92,1.89,4.23,4.33.34,2.71-.94,5.22-4.22,5.8-.11.02-.24.02-.34.33Zm-6.88-2.81c1.83,0,3.54.03,5.26,0,1.42-.03,2.27-.84,2.31-2.2.04-1.45-.67-2.24-1.96-2.4-1.85-.23-3.71-.07-5.6-.1v4.71Z"></path>
                <path d="m82.97,22.41c-1.29.23-2.46.45-3.66.67-.24-.13-.29-.41-.43-.66-.74-1.36-1.83-2.18-3.43-2.21-1.17-.02-2.32-.03-3.36.62-1.21.75-2,1.83-2.3,3.21-.37,1.7-.4,3.43.06,5.1.96,3.45,4,4.34,6.39,3.72,1.05-.27,2.05-.65,2.96-1.35v-2.37c-1.34-.12-2.73.02-4.17-.09-.12-1.07-.1-2.08-.03-3.13h7.96c.06.06.09.09.11.12.02.03.06.07.06.1,0,2.4,0,4.79,0,7.23-.48.57-1.13.96-1.8,1.31-1.63.87-3.38,1.45-5.23,1.56-3.06.19-5.9-.4-8.08-2.76-1.34-1.45-2.01-3.23-2.28-5.16-.21-1.51-.13-3.01.18-4.51.81-3.98,4.13-6.78,8.08-6.89,1.2-.03,2.39-.05,3.58.21,2.86.63,4.6,2.37,5.4,5.28Z"></path>
                <path d="m99.67,35.89h-3.73v-8.08h-7.43v8.07h-3.78v-18.64h3.64s.02.03.05.06c.02.03.07.06.07.09,0,2.36,0,4.71,0,7.14h7.39v-7.2c.68-.25,1.31-.11,1.93-.14.6-.02,1.19,0,1.86,0v18.7Z"></path>
                <path d="m58.93,35.9h-3.73v-8.11h-7.36v8.07c-1.26.14-2.45.06-3.62.06-.24-1-.33-14.7-.13-18.62.59-.23,1.23-.08,1.84-.11.59-.02,1.18,0,1.85,0v7.36c1.25.1,2.43.04,3.61.05,1.2.01,2.4,0,3.58,0,.05-.04.08-.07.1-.1.03-.03.07-.06.07-.09,0-2.36,0-4.71,0-7.13,1.27-.19,2.49-.03,3.78-.11v18.72Z"></path>
                <path d="m60.97,17.22h3.64v18.66h-3.69c-.2-1.17-.16-17.86.05-18.66Z"></path>
                <path d="m70.45,15.25c-.29-.06-.56-.2-.81-.37-.51-.34-.9-.79-1.28-1.26-.49-.6-.93-1.25-1.47-1.81-.36-.37-.71-.74-1.07-1.1-.7-.68-1.41-1.35-2.13-2.02-.33-.31-.74-.53-1.13-.76-.64-.38-1.28-.75-1.94-1.09-.42-.22-.87-.39-1.32-.55-.61-.21-1.2-.47-1.84-.6-.91-.19-1.81-.39-2.72-.56-.49-.1-.99-.17-1.49-.23-.41-.05-.82-.06-1.24-.09-.17-.01-.35-.04-.52-.03-.44,0-.88,0-1.32.04-.45.03-.9.09-1.34.15-.5.06-.99.12-1.49.2-.42.06-.84.16-1.27.22-.92.13-1.78.49-2.64.83-.26.1-.52.22-.78.34-.09.04-.2,0-.28.11-.07.09-.21.12-.31.18-.1.06-.2.11-.31.17-.11.06-.22.11-.32.17-.11.06-.21.12-.32.18-.83.47-1.63.98-2.39,1.56-.38.29-.74.61-1.1.92-.15.13-.31.25-.45.39-.17.17-.31.36-.47.54-.23.27-.47.53-.7.81-.34.4-.69.81-1.01,1.22-.61.77-1.17,1.57-1.65,2.42-.35.62-.69,1.26-.99,1.92-.48,1.07-.93,2.15-1.37,3.24-.19.47-.31.97-.45,1.46-.18.65-.36,1.3-.52,1.95-.12.47-.2.94-.3,1.41-.06.3-.14.6-.2.9-.05.26-.08.53-.11.8-.04.3-.09.6-.13.89-.04.3-.07.6-.11.9-.01.1-.02.19-.03.29-.02.18-.04.35-.04.53-.02.59-.05,1.18-.03,1.76,0,.35.08.69.13,1.03.03.25.06.5.1.74.04.24.07.48.13.72.14.52.27,1.04.44,1.55.24.72.59,1.39.97,2.06.4.71.85,1.39,1.34,2.03.41.53.83,1.05,1.26,1.57.61.73,1.29,1.4,1.98,2.05.37.36.77.69,1.17,1.02.69.59,1.46,1.07,2.2,1.58.48.34.94.7,1.43,1.03.47.31.95.6,1.43.88.54.32,1.09.64,1.64.94.47.26.95.51,1.43.77.28.15.55.3.84.44.49.25.99.49,1.49.73.27.13.55.26.82.38.56.25,1.13.5,1.7.74.46.19.93.38,1.4.56.7.26,1.4.52,2.1.77.69.24,1.38.49,2.08.7.65.2,1.31.35,1.97.52.53.14,1.06.27,1.58.41.54.15,1.07.31,1.61.45.24.06.49.1.74.14.34.06.68.1,1.03.16.37.06.75.13,1.12.19.47.08.95.17,1.42.26.49.09.97.17,1.46.25.34.05.69.08,1.03.12.29.03.57.08.86.11.19.02.38.03.58.05.42.04.83.08,1.25.11.24.02.49.04.73.04.86.02,1.73.05,2.59.04.58,0,1.16-.07,1.74-.11.32-.02.64-.05.96-.08.39-.04.78-.1,1.17-.15.43-.05.87-.09,1.3-.16.57-.09,1.14-.19,1.7-.32.66-.16,1.32-.37,1.98-.57.33-.1.65-.23.99-.32.2-.06.4-.08.61-.1.07,0,.15.02.23.04.14.05.19.18.17.32-.07.42-.36.67-.71.83-.42.19-.87.35-1.31.51-.49.18-.99.37-1.49.54-.48.17-.98.31-1.46.47-.21.07-.42.15-.64.22-.75.24-1.5.49-2.25.73-.36.11-.73.2-1.09.31-.5.16-.99.32-1.48.5-.46.16-.94.25-1.41.37-.52.13-1.04.29-1.56.42-.64.17-1.28.33-1.92.48-.36.09-.72.17-1.09.24-.46.09-.92.16-1.38.23-.34.05-.69.08-1.03.12-.35.04-.7.08-1.06.11-.2.02-.4.03-.6.04-.38.02-.76.05-1.14.07-.02,0-.04,0-.06,0-.58.01-1.15.03-1.73.04-.49.01-.99.03-1.48.03-.33,0-.67-.02-1-.03-.45,0-.9,0-1.35,0-.41,0-.81-.02-1.22-.04-.57-.02-1.15-.05-1.72-.08-.32-.02-.64-.04-.96-.06-.12,0-.24,0-.36-.01-.53-.01-1.06-.02-1.59-.04-.31-.01-.63-.05-.94-.06-.16,0-.32,0-.48-.01-.37-.01-.75-.02-1.12-.04-.47-.02-.94-.05-1.4-.08-.5-.03-.99-.05-1.49-.08-.37-.02-.75-.05-1.12-.08-.42-.03-.84-.08-1.27-.11-.37-.03-.75-.05-1.12-.08-.46-.04-.92-.1-1.38-.15-.28-.03-.56-.05-.85-.09-.48-.06-.97-.13-1.45-.2-.48-.08-.96-.17-1.44-.26-.26-.05-.51-.12-.76-.19-.57-.15-1.14-.3-1.71-.46-.77-.22-1.52-.47-2.26-.76-.94-.37-1.85-.82-2.71-1.36-.4-.25-.82-.49-1.23-.73-.16-.09-.35-.15-.5-.25-.39-.28-.77-.58-1.16-.88-.27-.21-.54-.42-.81-.63-.27-.22-.53-.43-.79-.66-.33-.3-.64-.61-.96-.91-.25-.24-.51-.47-.75-.73-.43-.45-.86-.92-1.28-1.38-.32-.36-.63-.72-.93-1.09-.65-.78-1.26-1.59-1.82-2.43-.51-.76-.99-1.53-1.43-2.32-.43-.77-.88-1.53-1.25-2.34-.29-.61-.59-1.22-.87-1.84-.11-.26-.17-.54-.25-.81-.11-.34-.21-.69-.32-1.03-.13-.41-.27-.82-.37-1.24-.12-.49-.21-1-.31-1.49-.05-.25-.13-.5-.18-.75-.11-.57-.22-1.14-.32-1.71-.03-.15-.03-.3-.04-.44-.03-.5-.05-.99-.09-1.49-.04-.63-.1-1.26-.13-1.89-.01-.25.02-.5.04-.75,0-.04.01-.09.02-.13.02-.36.02-.72.05-1.09.03-.38.04-.77.12-1.13.1-.44.11-.89.19-1.34.06-.35.13-.69.2-1.04.02-.08.03-.16.05-.25.1-.52.26-1.03.39-1.55.12-.44.25-.86.43-1.28.16-.37.28-.75.44-1.11.12-.28.26-.55.39-.82.18-.37.36-.75.54-1.13.06-.13.13-.27.2-.4.28-.48.54-.97.83-1.44.29-.48.6-.95.91-1.41.22-.32.48-.63.72-.94.37-.48.73-.99,1.13-1.44.54-.61,1.1-1.19,1.67-1.76.42-.41.86-.81,1.3-1.19.69-.59,1.39-1.17,2.09-1.74.44-.36.89-.71,1.36-1.04.29-.2.61-.36.91-.54.37-.22.74-.44,1.11-.66.41-.24.81-.5,1.23-.73.42-.23.86-.42,1.3-.63.28-.14.55-.28.83-.41.23-.11.46-.2.69-.29.45-.17.9-.35,1.36-.5.59-.19,1.18-.35,1.77-.52.16-.05.33-.07.49-.12.1-.03.18-.09.28-.11.66-.16,1.32-.32,1.99-.47.48-.11.96-.21,1.45-.3.43-.08.86-.14,1.29-.21.31-.05.62-.1.93-.14.26-.04.52-.06.79-.09.33-.04.65-.07.98-.11.19-.02.37-.04.56-.05.39-.02.77-.04,1.16-.05.72-.01,1.45-.03,2.17-.03.43,0,.85.04,1.28.07.24.01.48.02.72.04.26.02.52.06.79.09.38.05.75.09,1.13.14.23.03.46.07.68.12.5.1.99.2,1.49.3.74.15,1.47.34,2.18.57,1.24.41,2.44.91,3.62,1.46.97.45,1.89.99,2.73,1.65.3.24.64.44.93.7.44.38.85.8,1.27,1.2.18.17.36.35.54.53.69.69,1.33,1.43,1.94,2.19.46.57.93,1.13,1.38,1.71.67.86,1.28,1.76,1.74,2.75.05.12.1.24.16.35.07.13.08.24-.06.35Z" fill="currentColor"></path>
                <path d="m.25,50.94c.02-.82.14-1.63.31-2.43.21-.96.5-1.9.81-2.84.14-.43.25-.86.38-1.29.04-.13.1-.25.14-.37.03-.1.05-.2.09-.29.24-.57.37-1.17.59-1.75.3-.81.62-1.61.94-2.41.21-.53.43-1.06.65-1.59.2-.48.4-.96.61-1.44.34-.79.69-1.57,1.04-2.35.08-.19.17-.38.26-.56.22-.47.45-.93.68-1.4.38-.79.77-1.58,1.15-2.37.32-.68.64-1.35.96-2.03.41-.88.82-1.77,1.23-2.65.31-.68.63-1.36.94-2.04.4-.85.79-1.7,1.19-2.54.31-.65.62-1.31.94-1.96.49-1.01.99-2.01,1.48-3.01.14-.3.27-.6.52-.83.03-.03.06-.06.09-.08.16-.12.25-.12.4-.01.12.09.17.27.1.42-.09.21-.19.41-.29.61-.32.67-.63,1.34-.95,2.02-.01.02-.03.05-.03.07-.03.4-.25.73-.39,1.08-.35.88-.73,1.75-1.08,2.63-.37.95-.73,1.92-1.07,2.88-.35,1.01-.66,2.03-.91,3.07-.15.66-.32,1.32-.45,1.99-.11.56-.17,1.13-.25,1.7-.03.25-.02.51-.09.75-.12.43-.04.86-.07,1.29-.02.24-.04.48-.03.71,0,.37.04.73.06,1.1,0,.05,0,.1.01.15.05.49.09.97.15,1.46.06.45.12.9.2,1.35.05.29.13.58.19.87.17.79.4,1.56.66,2.32.3.91.64,1.8,1.06,2.66.34.7.68,1.4,1.05,2.08.28.53.59,1.04.93,1.54.52.78,1.07,1.55,1.62,2.31.29.4.63.77.94,1.15.67.82,1.41,1.59,2.17,2.32.42.4.85.77,1.29,1.14.44.38.89.75,1.35,1.1.52.39,1.06.76,1.59,1.13.83.57,1.68,1.09,2.55,1.57,1.04.58,2.11,1.1,3.23,1.48.42.14.84.28,1.26.43.14.05.27.13.38.22.25.2.16.48-.05.67-.07.07-.18.1-.28.13-.43.11-.87.09-1.31.04-.05,0-.1,0-.15,0-.92,0-1.84,0-2.76,0-1.98,0-3.96.02-5.95.03-.45,0-.9-.02-1.36-.04-.31,0-.62-.03-.93-.04-.44-.01-.88-.02-1.32-.04-.3-.01-.6-.01-.88-.08-.45-.11-.91-.07-1.36-.18-.3-.07-.62-.08-.93-.13-.28-.04-.55-.07-.83-.12-.36-.07-.71-.15-1.07-.22-.03,0-.05,0-.08-.01-.63-.03-1.21-.28-1.82-.4-.17-.03-.32-.13-.49-.16-.56-.09-1.06-.35-1.59-.53-.37-.13-.74-.27-1.09-.44-.72-.34-1.45-.64-2.12-1.08-.41-.27-.83-.53-1.21-.84-.5-.4-.95-.85-1.36-1.35-.39-.49-.72-1-.99-1.57-.29-.61-.52-1.25-.59-1.93-.04-.35-.07-.7-.1-1.06Z" fill="currentColor"></path>
              </g>
            </svg>
          </div>
          <p class="text-white/50 max-w-xs mb-8 font-light">
            Family-owned since 1997. Protecting Brevard County's shorelines with coquina, granite, and limestone revetments.
          </p>
          <div class="flex gap-4">
            <input type="email" placeholder="Email address" class="bg-white/5 border border-white/10 rounded-full px-6 py-3 w-64 focus:outline-none focus:border-white/30 transition-colors placeholder:text-white/20 font-light">
            <button class="bg-white text-black px-6 py-3 rounded-full font-medium hover:bg-neutral-200 transition-colors">
              Connect
            </button>
          </div>
        </div>

        <div class="flex flex-col gap-4">
          <h4 class="font-bold tracking-tight text-lg mb-2">High Surf Corp</h4>
          <a href="/" class="text-white/60 hover:text-white transition-colors font-light">Home</a>
          <a href="/#process" class="text-white/60 hover:text-white transition-colors font-light">Our Process</a>
          <a href="/blog" class="text-white/60 hover:text-white transition-colors font-light">Blog</a>
          <a href="/contact/brevard-county-free-estimate.html" class="text-white/60 hover:text-white transition-colors font-light">Free Estimate</a>
        </div>

        <div class="flex flex-col gap-4">
          <h4 class="font-bold tracking-tight text-lg mb-2">Contact</h4>
          <a href="mailto:crew@highsurfcorp.com" class="text-white/60 hover:text-white transition-colors font-light">crew@highsurfcorp.com</a>
          <a href="tel:+13218214895" class="text-white/60 hover:text-white transition-colors font-light">(321) 821-4895</a>
          <p class="text-white/60 font-light">330 5th Ave<br>Indialantic, FL 32903</p>
        </div>

        <div class="flex flex-col gap-4">
          <h4 class="font-bold tracking-tight text-lg mb-2">Legal</h4>
          <a href="/legal/privacy-policy.html" class="text-white/60 hover:text-white transition-colors font-light">Privacy Policy</a>
          <a href="/legal/terms-conditions.html" class="text-white/60 hover:text-white transition-colors font-light">Terms & Conditions</a>
        </div>
      </div>

      <div class="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-sm text-white/40 font-light">
        <p class="text-white/40 text-sm">© 2026 High Surf Corp. All Rights Reserved.</p>
        <div class="flex gap-6 mt-4 md:mt-0"></div>
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
