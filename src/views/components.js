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
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 1280 1024" width="48" height="38" class="w-[48px] h-[38px]" style="color: rgb(250, 250, 250);">
              <path d="M889.52793,963.54244c-52.64646-.53723-99.45921-4.81069-146.39274-6.41648-30.11735-1.03034-60.22339-2.42364-90.27508-4.86938-58.23404-4.7394-115.57374-13.54139-169.94279-36.34464-34.84196-14.61321-66.00519-35.16778-94.31054-59.93326-50.11185-43.84467-91.15683-95.00661-122.39817-153.99851-22.13031-41.78797-36.06525-86.34137-43.95908-132.66898-17.71283-103.95354-.47165-200.87368,59.48288-289.11103,44.45757-65.42995,102.7728-114.93871,171.0591-153.76822,34.69939-19.73102,71.57753-32.91664,110.21223-42.21907,51.49075-12.3979,103.26317-22.47845,156.49692-21.48905,69.90399,1.29922,136.82564,15.3412,199.07293,48.42837,16.83698,8.94957,31.9905,20.30759,46.01737,33.07742,35.43421,32.25885,66.59963,68.20869,92.09568,108.90757,2.72007,4.34213,4.81287,9.08954,7.03175,13.72801.67435,1.40962,1.45227,3.19335.17727,4.64022-1.57219,1.78393-3.50697.80761-5.16716.04828-7.58506-3.46938-13.87835-8.67591-19.05013-15.13643-15.20034-18.9885-31.15343-37.21216-48.15647-54.69582-48.9225-50.30523-109.87305-73.38396-177.8093-82.03822-44.12649-5.6212-87.43492-.396-129.71052,11.44975-39.61506,11.1003-74.79197,31.58225-105.70572,58.98072-51.44864,45.59827-84.83953,102.73041-106.15858,167.44651-12.55496,38.11181-20.59707,77.23002-25.2565,117.08211-7.66017,65.51707,10.93192,122.62047,52.82228,173.29697,37.79815,45.72602,83.47697,81.4429,133.94422,111.72416,67.52264,40.51485,139.07834,71.81402,214.57243,93.9815,49.61661,14.56899,100.20186,25.11567,151.34718,32.39986,28.40991,4.04622,57.1718,5.92355,85.92685,6.45384,43.1689.79626,85.80667-3.63717,127.83368-13.70196,9.80497-2.34807,19.15311-6.06132,28.68237-9.23803,5.10022-1.7003,10.20386-3.46949,15.63124-3.74076,2.79163-.13966,5.89594-.36964,7.27459,2.8488,1.25299,2.92523-.16563,5.49196-1.94463,7.76308-3.93334,5.02147-9.53337,7.45848-15.32583,9.39946-25.9225,8.68683-51.67038,17.97868-77.87202,25.7283-35.84209,10.60134-70.86689,23.76153-107.29311,32.59394-45.65143,11.06943-91.72144,17.62352-138.68989,18.06522-13.30878.1251-26.58521,1.76465-34.26271,1.32578Z" fill="#ffffff"></path>
              <path d="M16.28316,802.63361c1.90842-29.55209,11.1553-57.34348,20.12905-85.15522,18.41082-57.05965,41.30256-112.35522,66.59847-166.65638,24.48598-52.56248,49.29555-104.97411,74.0444-157.41351,16.86311-35.7307,33.86549-71.39552,50.80772-107.08878,2.30823-4.86296,4.54826-9.80211,8.01536-13.95524,2.11013-2.52762,4.14062-6.94236,8.22992-4.56178,4.11361,2.39476,1.44747,6.29858.04389,9.35703-3.60744,7.86063-7.81583,15.4625-11.11217,23.44576-22.74684,55.08952-46.40318,109.77075-60.4158,168.11154-19.17303,79.8261-10.4903,156.77144,23.02918,230.78363,48.19681,106.42036,127.51613,182.51452,232.14147,232.92845,11.37682,5.48185,23.34748,9.50082,35.46803,13.10535,4.51515,1.34274,10.58987,2.70862,9.81264,9.04953-.70953,5.78911-6.5643,5.7251-11.11292,6.53352-7.00997,1.24584-13.96241-.46954-20.96463-.46423-52.5746.03941-105.14938-.2238-157.72404-.20958-36.44205.00985-72.18444-6.26739-107.67079-13.20517-40.71678-7.96041-78.91344-23.21633-112.40694-48.34939-29.12122-21.85199-45.2696-51.08945-46.8966-87.85908-.12362-2.79353-.01625-5.59743-.01625-8.39645Z" fill="#ffffff"></path>
            </svg>
            <span class="text-xl font-bold tracking-tight">High Surf Corp</span>
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
