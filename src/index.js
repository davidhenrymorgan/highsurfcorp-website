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
// RESPONSE HELPERS
// ============================================================================

/**
 * Create an HTML response with caching headers
 */
function htmlResponse(html, cacheSeconds = 3600) {
  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": `public, max-age=${cacheSeconds}`,
    },
  });
}

/**
 * Create a JSON response
 */
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
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
            <path d="M889.52793,963.54244c-52.64646-.53723-99.45921-4.81069-146.39274-6.41648-30.11735-1.03034-60.22339-2.42364-90.27508-4.86938-58.23404-4.7394-115.57374-13.54139-169.94279-36.34464-34.84196-14.61321-66.00519-35.16778-94.31054-59.93326-50.11185-43.84467-91.15683-95.00661-122.39817-153.99851-22.13031-41.78797-36.06525-86.34137-43.95908-132.66898-17.71283-103.95354-.47165-200.87368,59.48288-289.11103,44.45757-65.42995,102.7728-114.93871,171.0591-153.76822,34.69939-19.73102,71.57753-32.91664,110.21223-42.21907,51.49075-12.3979,103.26317-22.47845,156.49692-21.48905,69.90399,1.29922,136.82564,15.3412,199.07293,48.42837,16.83698,8.94957,31.9905,20.30759,46.01737,33.07742,35.43421,32.25885,66.59963,68.20869,92.09568,108.90757,2.72007,4.34213,4.81287,9.08954,7.03175,13.72801.67435,1.40962,1.45227,3.19335.17727,4.64022-1.57219,1.78393-3.50697.80761-5.16716.04828-7.58506-3.46938-13.87835-8.67591-19.05013-15.13643-15.20034-18.9885-31.15343-37.21216-48.15647-54.69582-48.9225-50.30523-109.87305-73.38396-177.8093-82.03822-44.12649-5.6212-87.43492-.396-129.71052,11.44975-39.61506,11.1003-74.79197,31.58225-105.70572,58.98072-51.44864,45.59827-84.83953,102.73041-106.15858,167.44651-12.55496,38.11181-20.59707,77.23002-25.2565,117.08211-7.66017,65.51707,10.93192,122.62047,52.82228,173.29697,37.79815,45.72602,83.47697,81.4429,133.94422,111.72416,67.52264,40.51485,139.07834,71.81402,214.57243,93.9815,49.61661,14.56899,100.20186,25.11567,151.34718,32.39986,28.40991,4.04622,57.1718,5.92355,85.92685,6.45384,43.1689.79626,85.80667-3.63717,127.83368-13.70196,9.80497-2.34807,19.15311-6.06132,28.68237-9.23803,5.10022-1.7003,10.20386-3.46949,15.63124-3.74076,2.79163-.13966,5.89594-.36964,7.27459,2.8488,1.25299,2.92523-.16563,5.49196-1.94463,7.76308-3.93334,5.02147-9.53337,7.45848-15.32583,9.39946-25.9225,8.68683-51.67038,17.97868-77.87202,25.7283-35.84209,10.60134-70.86689,23.76153-107.29311,32.59394-45.65143,11.06943-91.72144,17.62352-138.68989,18.06522-13.30878.1251-26.58521,1.76465-34.26271,1.32578Z" fill="currentColor"></path>
            <path d="M16.28316,802.63361c1.90842-29.55209,11.1553-57.34348,20.12905-85.15522,18.41082-57.05965,41.30256-112.35522,66.59847-166.65638,24.48598-52.56248,49.29555-104.97411,74.0444-157.41351,16.86311-35.7307,33.86549-71.39552,50.80772-107.08878,2.30823-4.86296,4.54826-9.80211,8.01536-13.95524,2.11013-2.52762,4.14062-6.94236,8.22992-4.56178,4.11361,2.39476,1.44747,6.29858.04389,9.35703-3.60744,7.86063-7.81583,15.4625-11.11217,23.44576-22.74684,55.08952-46.40318,109.77075-60.4158,168.11154-19.17303,79.8261-10.4903,156.77144,23.02918,230.78363,48.19681,106.42036,127.51613,182.51452,232.14147,232.92845,11.37682,5.48185,23.34748,9.50082,35.46803,13.10535,4.51515,1.34274,10.58987,2.70862,9.81264,9.04953-.70953,5.78911-6.5643,5.7251-11.11292,6.53352-7.00997,1.24584-13.96241-.46954-20.96463-.46423-52.5746.03941-105.14938-.2238-157.72404-.20958-36.44205.00985-72.18444-6.26739-107.67079-13.20517-40.71678-7.96041-78.91344-23.21633-112.40694-48.34939-29.12122-21.85199-45.2696-51.08945-46.8966-87.85908-.12362-2.79353-.01625-5.59743-.01625-8.39645Z" fill="currentColor"></path>
          </svg>
        </a>

        <!-- Links -->
        <div class="hidden md:flex gap-8 text-sm font-medium items-center">
          <a href="/" class="${homeClass} transition-colors">Home</a>
          <a href="/#process" class="text-white/60 hover:text-white transition-colors">Our Process</a>
          <a href="/blog" class="${blogClass} transition-colors">Blog</a>
          <a href="/contact/brevard-county-free-estimate.html" class="${contactClass} transition-colors">Contact</a>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-2">
          <a href="/contact/brevard-county-free-estimate.html" class="hidden md:block bg-white text-black px-4 py-2 rounded-full text-sm font-medium hover:bg-neutral-200 transition-colors">
            Get a Quote
          </a>
          <button id="mobile-menu-button" class="md:hidden relative w-12 h-12 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors group">
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
            <button id="mobile-nav-close" class="w-12 h-12 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors">
              <iconify-icon icon="solar:close-circle-linear" width="24"></iconify-icon>
            </button>
          </div>

          <!-- Navigation Links -->
          <nav class="flex flex-col gap-6 text-lg font-medium">
            <a href="/" class="text-white hover:text-white/70 transition-colors py-3 border-b border-white/10">Home</a>
            <a href="/#process" class="text-white/80 hover:text-white transition-colors py-3 border-b border-white/10">Our Process</a>
            <a href="/blog" class="text-white/80 hover:text-white transition-colors py-3 border-b border-white/10">Blog</a>
            <a href="/contact/brevard-county-free-estimate.html" class="text-white/80 hover:text-white transition-colors py-3 border-b border-white/10">Contact</a>

            <!-- CTA Button -->
            <a href="/contact/brevard-county-free-estimate.html" class="mt-8 w-full bg-white text-neutral-900 font-semibold py-4 px-6 rounded-xl hover:bg-white/90 transition-colors text-center">
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
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 242.44 61.96" class="w-[234px] h-[60px]" style="color: rgb(255, 255, 255);">
              <g>
                <path d="m150.15,27.87c1.98,1.21,3.07,3.17,4.24,5.07.58.95,1.19,1.89,1.84,2.93h-4.55c-1.11-1.65-2.26-3.37-3.41-5.08-.07-.1-.14-.19-.2-.3-1.05-1.82-2.55-2.69-4.8-2.22v7.61h-3.75c-.13-1.08-.14-17.37-.02-18.6.29-.18.61-.08.92-.08,2.36-.01,4.72,0,7.08,0,1,0,1.99.08,2.98.21,2.53.35,3.92,1.89,4.23,4.33.34,2.71-.94,5.22-4.22,5.8-.11.02-.24.02-.34.33Zm-6.88-2.81c1.83,0,3.54.03,5.26,0,1.42-.03,2.27-.84,2.31-2.2.04-1.45-.67-2.24-1.96-2.4-1.85-.23-3.71-.07-5.6-.1v4.71Z"></path>
                <path d="m82.97,22.41c-1.29.23-2.46.45-3.66.67-.24-.13-.29-.41-.43-.66-.74-1.36-1.83-2.18-3.43-2.21-1.17-.02-2.32-.03-3.36.62-1.21.75-2,1.83-2.3,3.21-.37,1.7-.4,3.43.06,5.1.96,3.45,4,4.34,6.39,3.72,1.05-.27,2.05-.65,2.96-1.35v-2.37c-1.34-.12-2.73.02-4.17-.09-.12-1.07-.1-2.08-.03-3.13h7.96c.06.06.09.09.11.12.02.03.06.07.06.1,0,2.4,0,4.79,0,7.23-.48.57-1.13.96-1.8,1.31-1.63.87-3.38,1.45-5.23,1.56-3.06.19-5.9-.4-8.08-2.76-1.34-1.45-2.01-3.23-2.28-5.16-.21-1.51-.13-3.01.18-4.51.81-3.98,4.13-6.78,8.08-6.89,1.2-.03,2.39-.05,3.58.21,2.86.63,4.6,2.37,5.4,5.28Z"></path>
                <path d="m70.45,15.25c-.29-.06-.56-.2-.81-.37-.51-.34-.9-.79-1.28-1.26-.49-.6-.93-1.25-1.47-1.81-.36-.37-.71-.74-1.07-1.1-.7-.68-1.41-1.35-2.13-2.02-.33-.31-.74-.53-1.13-.76-.64-.38-1.28-.75-1.94-1.09-.42-.22-.87-.39-1.32-.55-.61-.21-1.2-.47-1.84-.6-.91-.19-1.81-.39-2.72-.56-.49-.1-.99-.17-1.49-.23-.41-.05-.82-.06-1.24-.09-.17-.01-.35-.04-.52-.03-.44,0-.88,0-1.32.04-.45.03-.9.09-1.34.15-.5.06-.99.12-1.49.2-.42.06-.84.16-1.27.22-.92.13-1.78.49-2.64.83-.26.1-.52.22-.78.34-.09.04-.2,0-.28.11-.07.09-.21.12-.31.18-.1.06-.2.11-.31.17-.11.06-.22.11-.32.17-.11.06-.21.12-.32.18-.83.47-1.63.98-2.39,1.56-.38.29-.74.61-1.1.92-.15.13-.31.25-.45.39-.17.17-.31.36-.47.54-.23.27-.47.53-.7.81-.34.4-.69.81-1.01,1.22-.61.77-1.17,1.57-1.65,2.42-.35.62-.69,1.26-.99,1.92-.48,1.07-.93,2.15-1.37,3.24-.19.47-.31.97-.45,1.46-.18.65-.36,1.3-.52,1.95-.12.47-.2.94-.3,1.41-.06.3-.14.6-.2.9-.05.26-.08.53-.11.8-.04.3-.09.6-.13.89-.04.3-.07.6-.11.9-.01.1-.02.19-.03.29-.02.18-.04.35-.04.53-.02.59-.05,1.18-.03,1.76,0,.35.08.69.13,1.03.03.25.06.5.1.74.04.24.07.48.13.72.14.52.27,1.04.44,1.55.24.72.59,1.39.97,2.06.4.71.85,1.39,1.34,2.03.41.53.83,1.05,1.26,1.57.61.73,1.29,1.4,1.98,2.05.37.36.77.69,1.17,1.02.69.59,1.46,1.07,2.2,1.58.48.34.94.7,1.43,1.03.47.31.95.6,1.43.88.54.32,1.09.64,1.64.94.47.26.95.51,1.43.77.28.15.55.3.84.44.49.25.99.49,1.49.73.27.13.55.26.82.38.56.25,1.13.5,1.7.74.46.19.93.38,1.4.56.7.26,1.4.52,2.1.77.69.24,1.38.49,2.08.7.65.2,1.31.35,1.97.52.53.14,1.06.27,1.58.41.54.15,1.07.31,1.61.45.24.06.49.1.74.14.34.06.68.1,1.03.16.37.06.75.13,1.12.19.47.08.95.17,1.42.26.49.09.97.17,1.46.25.34.05.69.08,1.03.12.29.03.57.08.86.11.19.02.38.03.58.05.42.04.83.08,1.25.11.24.02.49.04.73.04.86.02,1.73.05,2.59.04.58,0,1.16-.07,1.74-.11.32-.02.64-.05.96-.08.39-.04.78-.1,1.17-.15.43-.05.87-.09,1.3-.16.57-.09,1.14-.19,1.7-.32.66-.16,1.32-.37,1.98-.57.33-.1.65-.23.99-.32.2-.06.4-.08.61-.1.07,0,.15.02.23.04.14.05.19.18.17.32-.07.42-.36.67-.71.83-.42.19-.87.35-1.31.51-.49.18-.99.37-1.49.54-.48.17-.98.31-1.46.47-.21.07-.42.15-.64.22-.75.24-1.5.49-2.25.73-.36.11-.73.2-1.09.31-.5.16-.99.32-1.48.5-.46.16-.94.25-1.41.37-.52.13-1.04.29-1.56.42-.64.17-1.28.33-1.92.48-.36.09-.72.17-1.09.24-.46.09-.92.16-1.38.23-.34.05-.69.08-1.03.12-.35.04-.7.08-1.06.11-.2.02-.4.03-.6.04-.38.02-.76.05-1.14.07-.02,0-.04,0-.06,0-.58.01-1.15.03-1.73.04-.49.01-.99.03-1.48.03-.33,0-.67-.02-1-.03-.45,0-.9,0-1.35,0-.41,0-.81-.02-1.22-.04-.57-.02-1.15-.05-1.72-.08-.32-.02-.64-.04-.96-.06-.12,0-.24,0-.36-.01-.53-.01-1.06-.02-1.59-.04-.31-.01-.63-.05-.94-.06-.16,0-.32,0-.48-.01-.37-.01-.75-.02-1.12-.04-.47-.02-.94-.05-1.4-.08-.5-.03-.99-.05-1.49-.08-.37-.02-.75-.05-1.12-.08-.42-.03-.84-.08-1.27-.11-.37-.03-.75-.05-1.12-.08-.46-.04-.92-.1-1.38-.15-.28-.03-.56-.05-.85-.09-.48-.06-.97-.13-1.45-.2-.48-.08-.96-.17-1.44-.26-.26-.05-.51-.12-.76-.19-.57-.15-1.14-.3-1.71-.46-.77-.22-1.52-.47-2.26-.76-.94-.37-1.85-.82-2.71-1.36-.4-.25-.82-.49-1.23-.73-.16-.09-.35-.15-.5-.25-.39-.28-.77-.58-1.16-.88-.27-.21-.54-.42-.81-.63-.27-.22-.53-.43-.79-.66-.33-.3-.64-.61-.96-.91-.25-.24-.51-.47-.75-.73-.43-.45-.86-.92-1.28-1.38-.32-.36-.63-.72-.93-1.09-.65-.78-1.26-1.59-1.82-2.43-.51-.76-.99-1.53-1.43-2.32-.43-.77-.88-1.53-1.25-2.34-.29-.61-.59-1.22-.87-1.84-.11-.26-.17-.54-.25-.81-.11-.34-.21-.69-.32-1.03-.13-.41-.27-.82-.37-1.24-.12-.49-.21-1-.31-1.49-.05-.25-.13-.5-.18-.75-.11-.57-.22-1.14-.32-1.71-.03-.15-.03-.3-.04-.44-.03-.5-.05-.99-.09-1.49-.04-.63-.1-1.26-.13-1.89-.01-.25.02-.5.04-.75,0-.04.01-.09.02-.13.02-.36.02-.72.05-1.09.03-.38.04-.77.12-1.13.1-.44.11-.89.19-1.34.06-.35.13-.69.2-1.04.02-.08.03-.16.05-.25.1-.52.26-1.03.39-1.55.12-.44.25-.86.43-1.28.16-.37.28-.75.44-1.11.12-.28.26-.55.39-.82.18-.37.36-.75.54-1.13.06-.13.13-.27.2-.4.28-.48.54-.97.83-1.44.29-.48.6-.95.91-1.41.22-.32.48-.63.72-.94.37-.48.73-.99,1.13-1.44.54-.61,1.1-1.19,1.67-1.76.42-.41.86-.81,1.3-1.19.69-.59,1.39-1.17,2.09-1.74.44-.36.89-.71,1.36-1.04.29-.2.61-.36.91-.54.37-.22.74-.44,1.11-.66.41-.24.81-.5,1.23-.73.42-.23.86-.42,1.3-.63.28-.14.55-.28.83-.41.23-.11.46-.2.69-.29.45-.17.9-.35,1.36-.5.59-.19,1.18-.35,1.77-.52.16-.05.33-.07.49-.12.1-.03.18-.09.28-.11.66-.16,1.32-.32,1.99-.47.48-.11.96-.21,1.45-.3.43-.08.86-.14,1.29-.21.31-.05.62-.1.93-.14.26-.04.52-.06.79-.09.33-.04.65-.07.98-.11.19-.02.37-.04.56-.05.39-.02.77-.04,1.16-.05.72-.01,1.45-.03,2.17-.03.43,0,.85.04,1.28.07.24.01.48.02.72.04.26.02.52.06.79.09.38.05.75.09,1.13.14.23.03.46.07.68.12.5.1.99.2,1.49.3.74.15,1.47.34,2.18.57,1.24.41,2.44.91,3.62,1.46.97.45,1.89.99,2.73,1.65.3.24.64.44.93.7.44.38.85.8,1.27,1.2.18.17.36.35.54.53.69.69,1.33,1.43,1.94,2.19.46.57.93,1.13,1.38,1.71.67.86,1.28,1.76,1.74,2.75.05.12.1.24.16.35.07.13.08.24-.06.35Z" fill="currentColor"></path>
                <path d="m.25,50.94c.02-.82.14-1.63.31-2.43.21-.96.5-1.9.81-2.84.14-.43.25-.86.38-1.29.04-.13.1-.25.14-.37.03-.1.05-.2.09-.29.24-.57.37-1.17.59-1.75.3-.81.62-1.61.94-2.41.21-.53.43-1.06.65-1.59.2-.48.4-.96.61-1.44.34-.79.69-1.57,1.04-2.35.08-.19.17-.38.26-.56.22-.47.45-.93.68-1.4.38-.79.77-1.58,1.15-2.37.32-.68.64-1.35.96-2.03.41-.88.82-1.77,1.23-2.65.31-.68.63-1.36.94-2.04.4-.85.79-1.7,1.19-2.54.31-.65.62-1.31.94-1.96.49-1.01.99-2.01,1.48-3.01.14-.3.27-.6.52-.83.03-.03.06-.06.09-.08.16-.12.25-.12.4-.01.12.09.17.27.1.42-.09.21-.19.41-.29.61-.32.67-.63,1.34-.95,2.02-.01.02-.03.05-.03.07-.03.4-.25.73-.39,1.08-.35.88-.73,1.75-1.08,2.63-.37.95-.73,1.92-1.07,2.88-.35,1.01-.66,2.03-.91,3.07-.15.66-.32,1.32-.45,1.99-.11.56-.17,1.13-.25,1.7-.03.25-.02.51-.09.75-.12.43-.04.86-.07,1.29-.02.24-.04.48-.03.71,0,.37.04.73.06,1.1,0,.05,0,.1.01.15.05.49.09.97.15,1.46.06.45.12.9.2,1.35.05.29.13.58.19.87.17.79.4,1.56.66,2.32.3.91.64,1.8,1.06,2.66.34.7.68,1.4,1.05,2.08.28.53.59,1.04.93,1.54.52.78,1.07,1.55,1.62,2.31.29.4.63.77.94,1.15.67.82,1.41,1.59,2.17,2.32.42.4.85.77,1.29,1.14.44.38.89.75,1.35,1.1.52.39,1.06.76,1.59,1.13.83.57,1.68,1.09,2.55,1.57,1.04.58,2.11,1.1,3.23,1.48.42.14.84.28,1.26.43.14.05.27.13.38.22.25.2.16.48-.05.67-.07.07-.18.1-.28.13-.43.11-.87.09-1.31.04-.05,0-.1,0-.15,0-.92,0-1.84,0-2.76,0-1.98,0-3.96.02-5.95.03-.45,0-.9-.02-1.36-.04-.31,0-.62-.03-.93-.04-.44-.01-.88-.02-1.32-.04-.3-.01-.6-.01-.88-.08-.45-.11-.91-.07-1.36-.18-.3-.07-.62-.08-.93-.13-.28-.04-.55-.07-.83-.12-.36-.07-.71-.15-1.07-.22-.03,0-.05,0-.08-.01-.63-.03-1.21-.28-1.82-.4-.17-.03-.32-.13-.49-.16-.56-.09-1.06-.35-1.59-.53-.37-.13-.74-.27-1.09-.44-.72-.34-1.45-.64-2.12-1.08-.41-.27-.83-.53-1.21-.84-.5-.4-.95-.85-1.36-1.35-.39-.49-.72-1-.99-1.57-.29-.61-.52-1.25-.59-1.93-.04-.35-.07-.7-.1-1.06Z" fill="currentColor"></path>
              </g>
            </svg>
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
async function handleStaticPageWithComponents(request, env, pathname) {
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
  const response = await env.ASSETS.fetch(assetRequest);

  if (!response.ok) {
    return response;
  }

  let html = await response.text();

  // Determine active page for nav highlighting
  let activePage = "";
  if (pathname.includes("/contact/")) activePage = "contact";
  if (pathname.includes("/legal/")) activePage = "legal";

  // Add required dependencies to <head> if not present
  const headAdditions = `
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

  // Inject Tailwind CDN before </head>
  html = html.replace("</head>", headAdditions + "</head>");

  // Replace Webflow navigation with standardized nav
  // Match from <header class="nav_wrap"> to </header>
  const navPattern = /<header class="nav_wrap">[\s\S]*?<\/header>/;
  if (navPattern.test(html)) {
    html = html.replace(navPattern, getNavigationHTML({ activePage }));
  } else {
    // If no Webflow nav found, inject our nav after <body>
    html = html.replace(
      /<body[^>]*>/,
      "$&\n" + getNavigationHTML({ activePage }),
    );
  }

  // Replace Webflow footer with standardized footer
  // Match from <footer... to </footer>
  html = html.replace(
    /<footer[^>]*data-brand[^>]*>[\s\S]*?<\/footer>/,
    getFooterHTML(),
  );

  // Inject mobile menu script before </body>
  html = html.replace("</body>", getMobileMenuScript() + "</body>");

  return htmlResponse(html);
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

    \${getNavigationHTML({ activePage: 'blog' })}

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
      <div class="relative w-full aspect-[4/3] sm:aspect-video md:aspect-[21/9] bg-neutral-100 rounded-3xl md:rounded-[2.5rem] overflow-hidden shadow-2xl">
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

    ${getFooterHTML()}

    ${getMobileMenuScript()}

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

    ${getNavigationHTML({ activePage: "blog" })}

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

    ${getFooterHTML()}

    ${getMobileMenuScript()}

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
    return errorResponse("Post not found", 404);
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

  return htmlResponse(html);
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

  return htmlResponse(html, 1800);
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
        to: ["crew@highsurfcorp.com", "idavidmorganh@gmail.com"],
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
  async fetch(request, env) {
    const url = new URL(request.url);

    // Route: /api/contact - Contact form submission
    if (url.pathname === "/api/contact" && request.method === "POST") {
      return handleContactForm(request, env);
    }

    // Route: /blog/:slug - Individual post
    if (url.pathname.match(/^\/blog\/[^/]+\/?$/)) {
      return handleBlogPost(url, env);
    }

    // Route: /blog - Blog index
    if (url.pathname === "/blog" || url.pathname === "/blog/") {
      return handleBlogIndex(env);
    }

    // Route: Legal pages - Transform with reusable components
    // Skip paths ending in .html (internal asset fetches) to prevent redirect loops
    if (
      url.pathname.startsWith("/legal/") &&
      url.pathname !== "/legal/" &&
      !url.pathname.endsWith(".html")
    ) {
      return handleStaticPageWithComponents(request, env, url.pathname);
    }

    // Route: Contact pages - Transform with reusable components
    // Skip paths ending in .html (internal asset fetches) to prevent redirect loops
    if (
      url.pathname.startsWith("/contact/") &&
      url.pathname !== "/contact/" &&
      !url.pathname.endsWith(".html")
    ) {
      return handleStaticPageWithComponents(request, env, url.pathname);
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
