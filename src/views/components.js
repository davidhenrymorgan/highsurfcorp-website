/**
 * Reusable UI component templates
 */

export const SCHEMA_JSON = `
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

/**
 * Returns the canonical navigation HTML
 * @param {Object} options - { activePage: 'home'|'blog'|'contact'|'legal' }
 */
export function getNavigationHTML(options = {}) {
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
export function getFooterHTML() {
  return `
    <!-- Footer -->
    <footer class="z-10 text-white bg-black border-white/10 border-t pt-16 pr-6 pb-16 pl-6 relative">
      <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div class="col-span-1 md:col-span-2">
          <div class="flex mb-6 gap-x-2 gap-y-2 items-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="#ffffff" viewBox="0 0 242.44 61.96" class="w-[234px] h-[60px]">
              <g>
                <path fill="#ffffff" d="m150.15,27.87c1.98,1.21,3.07,3.17,4.24,5.07.58.95,1.19,1.89,1.84,2.93h-4.55c-1.11-1.65-2.26-3.37-3.41-5.08-.07-.1-.14-.19-.2-.3-1.05-1.82-2.55-2.69-4.8-2.22v7.61h-3.75c-.13-1.08-.14-17.37-.02-18.6.29-.18.61-.08.92-.08,2.36-.01,4.72,0,7.08,0,1,0,1.99.08,2.98.21,2.53.35,3.92,1.89,4.23,4.33.34,2.71-.94,5.22-4.22,5.8-.11.02-.24.02-.34.33Zm-6.88-2.81c1.83,0,3.54.03,5.26,0,1.42-.03,2.27-.84,2.31-2.2.04-1.45-.67-2.24-1.96-2.4-1.85-.23-3.71-.07-5.6-.1v4.71Z"></path>
                <path fill="#ffffff" d="m82.97,22.41c-1.29.23-2.46.45-3.66.67-.24-.13-.29-.41-.43-.66-.74-1.36-1.83-2.18-3.43-2.21-1.17-.02-2.32-.03-3.36.62-1.21.75-2,1.83-2.3,3.21-.37,1.7-.4,3.43.06,5.1.96,3.45,4,4.34,6.39,3.72,1.05-.27,2.05-.65,2.96-1.35v-2.37c-1.34-.12-2.73.02-4.17-.09-.12-1.07-.1-2.08-.03-3.13h7.96c.06.06.09.09.11.12.02.03.06.07.06.1,0,2.4,0,4.79,0,7.23-.48.57-1.13.96-1.8,1.31-1.63.87-3.38,1.45-5.23,1.56-3.06.19-5.9-.4-8.08-2.76-1.34-1.45-2.01-3.23-2.28-5.16-.21-1.51-.13-3.01.18-4.51.81-3.98,4.13-6.78,8.08-6.89,1.2-.03,2.39-.05,3.58.21,2.86.63,4.6,2.37,5.4,5.28Z"></path>
                <path fill="#ffffff" d="m70.45,15.25c-.29-.06-.56-.2-.81-.37-.51-.34-.9-.79-1.28-1.26-.49-.6-.93-1.25-1.47-1.81-.36-.37-.71-.74-1.07-1.1-.7-.68-1.41-1.35-2.13-2.02-.33-.31-.74-.53-1.13-.76-.64-.38-1.28-.75-1.94-1.09-.42-.22-.87-.39-1.32-.55-.61-.21-1.2-.47-1.84-.6-.91-.19-1.81-.39-2.72-.56-.49-.1-.99-.17-1.49-.23-.41-.05-.82-.06-1.24-.09-.17-.01-.35-.04-.52-.03-.44,0-.88,0-1.32.04-.45.03-.9.09-1.34.15-.5.06-.99.12-1.49.2-.42.06-.84.16-1.27.22-.92.13-1.78.49-2.64.83-.26.1-.52.22-.78.34-.09.04-.2,0-.28.11-.07.09-.21.12-.31.18-.1.06-.2.11-.31.17-.11.06-.22.11-.32.17-.11.06-.21.12-.32.18-.83.47-1.63.98-2.39,1.56-.38.29-.74.61-1.1.92-.15.13-.31.25-.45.39-.17.17-.31.36-.47.54-.23.27-.47.53-.7.81-.34.4-.69.81-1.01,1.22-.61.77-1.17,1.57-1.65,2.42-.35.62-.69,1.26-.99,1.92-.48,1.07-.93,2.15-1.37,3.24-.19.47-.31.97-.45,1.46-.18.65-.36,1.3-.52,1.95-.12.47-.2.94-.3,1.41-.06.3-.14.6-.2.9-.05.26-.08.53-.11.8-.04.3-.09.6-.13.89-.04.3-.07.6-.11.9-.01.1-.02.19-.03.29-.02.18-.04.35-.04.53-.02.59-.05,1.18-.03,1.76,0,.35.08.69.13,1.03.03.25.06.5.1.74.04.24.07.48.13.72.14.52.27,1.04.44,1.55.24.72.59,1.39.97,2.06.4.71.85,1.39,1.34,2.03.41.53.83,1.05,1.26,1.57.61.73,1.29,1.4,1.98,2.05.37.36.77.69,1.17,1.02.69.59,1.46,1.07,2.2,1.58.48.34.94.7,1.43,1.03.47.31.95.6,1.43.88.54.32,1.09.64,1.64.94.47.26.95.51,1.43.77.28.15.55.3.84.44.49.25.99.49,1.49.73.27.13.55.26.82.38.56.25,1.13.5,1.7.74.46.19.93.38,1.4.56.7.26,1.4.52,2.1.77.69.24,1.38.49,2.08.7.65.2,1.31.35,1.97.52.53.14,1.06.27,1.58.41.54.15,1.07.31,1.61.45.24.06.49.1.74.14.34.06.68.1,1.03.16.37.06.75.13,1.12.19.47.08.95.17,1.42.26.49.09.97.17,1.46.25.34.05.69.08,1.03.12.29.03.57.08.86.11.19.02.38.03.58.05.42.04.83.08,1.25.11.24.02.49.04.73.04.86.02,1.73.05,2.59.04.58,0,1.16-.07,1.74-.11.32-.02.64-.05.96-.08.39-.04.78-.1,1.17-.15.43-.05.87-.09,1.3-.16.57-.09,1.14-.19,1.7-.32.66-.16,1.32-.37,1.98-.57.33-.1.65-.23.99-.32.2-.06.4-.08.61-.1.07,0,.15.02.23.04.14.05.19.18.17.32-.07.42-.36.67-.71.83-.42.19-.87.35-1.31.51-.49.18-.99.37-1.49.54-.48.17-.98.31-1.46.47-.21.07-.42.15-.64.22-.75.24-1.5.49-2.25.73-.36.11-.73.2-1.09.31-.5.16-.99.32-1.48.5-.46.16-.94.25-1.41.37-.52.13-1.04.29-1.56.42-.64.17-1.28.33-1.92.48-.36.09-.72.17-1.09.24-.46.09-.92.16-1.38.23-.34.05-.69.08-1.03.12-.35.04-.7.08-1.06.11-.2.02-.4.03-.6.04-.38.02-.76.05-1.14.07-.02,0-.04,0-.06,0-.58.01-1.15.03-1.73.04-.49.01-.99.03-1.48.03-.33,0-.67-.02-1-.03-.45,0-.9,0-1.35,0-.41,0-.81-.02-1.22-.04-.57-.02-1.15-.05-1.72-.08-.32-.02-.64-.04-.96-.06-.12,0-.24,0-.36-.01-.53-.01-1.06-.02-1.59-.04-.31-.01-.63-.05-.94-.06-.16,0-.32,0-.48-.01-.37-.01-.75-.02-1.12-.04-.47-.02-.94-.05-1.4-.08-.5-.03-.99-.05-1.49-.08-.37-.02-.75-.05-1.12-.08-.42-.03-.84-.08-1.27-.11-.37-.03-.75-.05-1.12-.08-.46-.04-.92-.1-1.38-.15-.28-.03-.56-.05-.85-.09-.48-.06-.97-.13-1.45-.2-.48-.08-.96-.17-1.44-.26-.26-.05-.51-.12-.76-.19-.57-.15-1.14-.3-1.71-.46-.77-.22-1.52-.47-2.26-.76-.94-.37-1.85-.82-2.71-1.36-.4-.25-.82-.49-1.23-.73-.16-.09-.35-.15-.5-.25-.39-.28-.77-.58-1.16-.88-.27-.21-.54-.42-.81-.63-.27-.22-.53-.43-.79-.66-.33-.3-.64-.61-.96-.91-.25-.24-.51-.47-.75-.73-.43-.45-.86-.92-1.28-1.38-.32-.36-.63-.72-.93-1.09-.65-.78-1.26-1.59-1.82-2.43-.51-.76-.99-1.53-1.43-2.32-.43-.77-.88-1.53-1.25-2.34-.29-.61-.59-1.22-.87-1.84-.11-.26-.17-.54-.25-.81-.11-.34-.21-.69-.32-1.03-.13-.41-.27-.82-.37-1.24-.12-.49-.21-1-.31-1.49-.05-.25-.13-.5-.18-.75-.11-.57-.22-1.14-.32-1.71-.03-.15-.03-.3-.04-.44-.03-.5-.05-.99-.09-1.49-.04-.63-.1-1.26-.13-1.89-.01-.25.02-.5.04-.75,0-.04.01-.09.02-.13.02-.36.02-.72.05-1.09.03-.38.04-.77.12-1.13.1-.44.11-.89.19-1.34.06-.35.13-.69.2-1.04.02-.08.03-.16.05-.25.1-.52.26-1.03.39-1.55.12-.44.25-.86.43-1.28.16-.37.28-.75.44-1.11.12-.28.26-.55.39-.82.18-.37.36-.75.54-1.13.06-.13.13-.27.2-.4.28-.48.54-.97.83-1.44.29-.48.6-.95.91-1.41.22-.32.48-.63.72-.94.37-.48.73-.99,1.13-1.44.54-.61,1.1-1.19,1.67-1.76.42-.41.86-.81,1.3-1.19.69-.59,1.39-1.17,2.09-1.74.44-.36.89-.71,1.36-1.04.29-.2.61-.36.91-.54.37-.22.74-.44,1.11-.66.41-.24.81-.5,1.23-.73.42-.23.86-.42,1.3-.63.28-.14.55-.28.83-.41.23-.11.46-.2.69-.29.45-.17.9-.35,1.36-.5.59-.19,1.18-.35,1.77-.52.16-.05.33-.07.49-.12.1-.03.18-.09.28-.11.66-.16,1.32-.32,1.99-.47.48-.11.96-.21,1.45-.3.43-.08.86-.14,1.29-.21.31-.05.62-.1.93-.14.26-.04.52-.06.79-.09.33-.04.65-.07.98-.11.19-.02.37-.04.56-.05.39-.02.77-.04,1.16-.05.72-.01,1.45-.03,2.17-.03.43,0,.85.04,1.28.07.24.01.48.02.72.04.26.02.52.06.79.09.38.05.75.09,1.13.14.23.03.46.07.68.12.5.1.99.2,1.49.3.74.15,1.47.34,2.18.57,1.24.41,2.44.91,3.62,1.46.97.45,1.89.99,2.73,1.65.3.24.64.44.93.7.44.38.85.8,1.27,1.2.18.17.36.35.54.53.69.69,1.33,1.43,1.94,2.19.46.57.93,1.13,1.38,1.71.67.86,1.28,1.76,1.74,2.75.05.12.1.24.16.35.07.13.08.24-.06.35Z"></path>
                <path fill="#ffffff" d="m.25,50.94c.02-.82.14-1.63.31-2.43.21-.96.5-1.9.81-2.84.14-.43.25-.86.38-1.29.04-.13.1-.25.14-.37.03-.1.05-.2.09-.29.24-.57.37-1.17.59-1.75.3-.81.62-1.61.94-2.41.21-.53.43-1.06.65-1.59.2-.48.4-.96.61-1.44.34-.79.69-1.57,1.04-2.35.08-.19.17-.38.26-.56.22-.47.45-.93.68-1.4.38-.79.77-1.58,1.15-2.37.32-.68.64-1.35.96-2.03.41-.88.82-1.77,1.23-2.65.31-.68.63-1.36.94-2.04.4-.85.79-1.7,1.19-2.54.31-.65.62-1.31.94-1.96.49-1.01.99-2.01,1.48-3.01.14-.3.27-.6.52-.83.03-.03.06-.06.09-.08.16-.12.25-.12.4-.01.12.09.17.27.1.42-.09.21-.19.41-.29.61-.32.67-.63,1.34-.95,2.02-.01.02-.03.05-.03.07-.03.4-.25.73-.39,1.08-.35.88-.73,1.75-1.08,2.63-.37.95-.73,1.92-1.07,2.88-.35,1.01-.66,2.03-.91,3.07-.15.66-.32,1.32-.45,1.99-.11.56-.17,1.13-.25,1.7-.03.25-.02.51-.09.75-.12.43-.04.86-.07,1.29-.02.24-.04.48-.03.71,0,.37.04.73.06,1.1,0,.05,0,.1.01.15.05.49.09.97.15,1.46.06.45.12.9.2,1.35.05.29.13.58.19.87.17.79.4,1.56.66,2.32.3.91.64,1.8,1.06,2.66.34.7.68,1.4,1.05,2.08.28.53.59,1.04.93,1.54.52.78,1.07,1.55,1.62,2.31.29.4.63.77.94,1.15.67.82,1.41,1.59,2.17,2.32.42.4.85.77,1.29,1.14.44.38.89.75,1.35,1.1.52.39,1.06.76,1.59,1.13.83.57,1.68,1.09,2.55,1.57,1.04.58,2.11,1.1,3.23,1.48.42.14.84.28,1.26.43.14.05.27.13.38.22.25.2.16.48-.05.67-.07.07-.18.1-.28.13-.43.11-.87.09-1.31.04-.05,0-.1,0-.15,0-.92,0-1.84,0-2.76,0-1.98,0-3.96.02-5.95.03-.45,0-.9-.02-1.36-.04-.31,0-.62-.03-.93-.04-.44-.01-.88-.02-1.32-.04-.3-.01-.6-.01-.88-.08-.45-.11-.91-.07-1.36-.18-.3-.07-.62-.08-.93-.13-.28-.04-.55-.07-.83-.12-.36-.07-.71-.15-1.07-.22-.03,0-.05,0-.08-.01-.63-.03-1.21-.28-1.82-.4-.17-.03-.32-.13-.49-.16-.56-.09-1.06-.35-1.59-.53-.37-.13-.74-.27-1.09-.44-.72-.34-1.45-.64-2.12-1.08-.41-.27-.83-.53-1.21-.84-.5-.4-.95-.85-1.36-1.35-.39-.49-.72-1-.99-1.57-.29-.61-.52-1.25-.59-1.93-.04-.35-.07-.7-.1-1.06Z"></path>
                <path fill="#ffffff" d="m108.92,17.29h3.83v11.59h7.95v-11.57h3.88v18.56h-3.9v-3.94h-11.76v-14.64Z"></path>
                <path fill="#ffffff" d="m128.07,17.29h3.85v18.56h-3.85v-18.56Z"></path>
                <path fill="#ffffff" d="m161.69,17.29c.13,1.11.14,17.41.02,18.56h-3.61c-.07-.24-.1-.5-.16-.75-.19-.86-.37-1.73-.57-2.65h-8.06c-.23,1.12-.45,2.22-.68,3.39h-3.61c-.15-1.13-.11-17.49.03-18.56h4.02c-.03.46-.11.93-.1,1.4.02,1.25.07,2.5.11,3.75.07,1.98.15,3.96.22,5.94.05,1.19.09,2.39.14,3.58h5.98c.31-4.93.63-9.82.94-14.66h5.33Z"></path>
                <path fill="#ffffff" d="m165.87,26.42c.05-.44.09-.89.15-1.33.15-1.18.43-2.32.95-3.39.67-1.4,1.62-2.53,2.91-3.36,1.28-.83,2.69-1.28,4.23-1.34,1.03-.04,2.06-.04,3.06.2,1.88.45,3.4,1.39,4.58,2.91.87,1.12,1.38,2.39,1.64,3.77.16.84.23,1.69.24,2.54.02,1.34-.1,2.66-.46,3.95-.48,1.71-1.29,3.21-2.62,4.39-1.27,1.13-2.75,1.81-4.43,2.03-1.16.15-2.31.11-3.44-.15-1.7-.39-3.12-1.21-4.27-2.5-.96-1.07-1.58-2.32-1.95-3.71-.24-.92-.4-1.86-.47-2.81-.04-.58-.08-1.16-.12-1.74v-.46Zm3.96-.07c.04.45.06.92.12,1.38.11.86.34,1.68.77,2.43.63,1.1,1.53,1.85,2.79,2.08.91.16,1.8.09,2.65-.25,1.1-.44,1.86-1.21,2.38-2.26.41-.83.6-1.72.68-2.64.08-.9.05-1.8-.12-2.68-.19-.97-.52-1.88-1.14-2.67-.68-.86-1.55-1.41-2.62-1.63-.78-.16-1.55-.14-2.32.06-1.21.31-2.11,1.01-2.73,2.09-.43.75-.64,1.57-.74,2.41-.08.58-.1,1.16-.14,1.74-.06-.01-.1-.03-.16-.03-.14,0-.28-.01-.42-.03Z"></path>
                <path fill="#ffffff" d="m190.12,17.31c1.3.02,2.47.12,3.6.47,1.51.47,2.77,1.27,3.7,2.56.58.8.95,1.69,1.15,2.65.13.64.19,1.29.19,1.95,0,.93-.12,1.84-.42,2.72-.59,1.7-1.64,3.01-3.19,3.9-1.16.66-2.43.99-3.76,1.09-.37.03-.75.05-1.12.05-1.78,0-3.55,0-5.33,0h-.61v3.16h-3.87c-.1-.98-.14-17.42-.04-18.56h9.7Zm-5.8,11.77c1.79,0,3.54.05,5.27-.03,1.44-.06,2.5-1.22,2.59-2.69.09-1.49-.63-2.69-2.06-2.87-1.02-.13-2.05-.08-3.08-.1h-2.72v5.69Z"></path>
                <path fill="#ffffff" d="m208.66,17.28c1.27.02,2.4.12,3.5.45,1.54.47,2.82,1.27,3.76,2.59.83,1.17,1.22,2.48,1.25,3.9.03,1.49-.28,2.89-1.07,4.16-.87,1.4-2.09,2.36-3.6,2.98-1.07.44-2.19.62-3.33.68-.88.05-1.77.02-2.65.02-1.38,0-2.75,0-4.13,0h-.55v3.81h-3.89v-18.58h10.71Zm-6.81,11.75h1.78c1.16,0,2.32.01,3.48-.02,1.14-.02,2.11-.74,2.43-1.81.18-.59.19-1.19.08-1.79-.23-1.19-1.04-1.88-2.39-1.95-1.31-.07-2.62-.03-3.93-.04h-1.44v5.61Z"></path>
                <path fill="#ffffff" d="m227.04,20.38c-1.58-.13-3.09-.06-4.53.56-.75.32-1.36.81-1.66,1.6-.38.97-.17,2.09.84,2.64.58.32,1.21.55,1.85.76,1.08.36,2.19.64,3.27,1,1.14.37,2.17.92,3,1.81,1.2,1.3,1.49,2.84,1.23,4.51-.27,1.71-1.14,3.04-2.62,3.93-1.23.74-2.6,1.08-4.02,1.17-1.26.08-2.52.04-3.76-.17-1.49-.26-2.9-.74-4.12-1.65-.46-.35-.87-.75-1.29-1.14.85-.92,1.68-1.82,2.53-2.75.36.33.69.67,1.06.95,1.05.79,2.25,1.18,3.55,1.25,1.04.05,2.04-.08,2.97-.55.64-.33,1.08-.82,1.2-1.55.13-.81.02-1.55-.59-2.16-.45-.44-1-.73-1.6-.95-1.16-.43-2.35-.77-3.51-1.2-1.01-.37-1.95-.86-2.77-1.55-1.13-.96-1.7-2.18-1.77-3.6-.08-1.52.22-2.93,1.11-4.17.75-1.05,1.76-1.77,2.93-2.26,1.34-.56,2.74-.75,4.18-.72,1.18.02,2.34.16,3.47.49,1.23.36,2.35.93,3.29,1.8.18.17.34.36.53.57-.87.89-1.72,1.75-2.59,2.64-.39-.32-.74-.64-1.13-.9-.8-.54-1.67-.9-2.66-1.01-.26-.03-.52-.08-.78-.12v-.04Z"></path>
                <path fill="#ffffff" d="m237.28,17.29v10.34c0,.85.06,1.7.2,2.54.22,1.29.86,2.23,2.12,2.66.76.26,1.54.3,2.33.13,1.25-.26,2.01-1.07,2.34-2.28.17-.62.24-1.26.25-1.9.02-1.53,0-3.06,0-4.59v-6.88h3.87v7.63c0,1.32-.04,2.64-.23,3.95-.23,1.57-.7,3.04-1.7,4.3-.82,1.03-1.86,1.77-3.1,2.22-1.11.4-2.26.54-3.43.51-1.06-.03-2.1-.2-3.1-.56-1.54-.56-2.75-1.53-3.58-2.96-.59-1.01-.88-2.12-.99-3.28-.12-1.25-.14-2.5-.14-3.75v-8.09h5.16Z"></path>
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
 * Returns the analytics HTML (Google Analytics + Meta Pixel)
 */
export function getAnalyticsHTML() {
  return `
    <!-- Google tag (gtag.js) -->
    <script src="https://www.googletagmanager.com/gtag/js?id=G-93DQDPMR4J" defer></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-93DQDPMR4J');
    </script>
    <!-- Meta Pixel Code -->
    <script>
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.defer=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '1712382146162316');
      fbq('track', 'PageView');
    </script>
    <noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=1712382146162316&ev=PageView&noscript=1"></noscript>
  `;
}

/**
 * Returns the mobile menu JavaScript
 */
export function getMobileMenuScript() {
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
