#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const readline = require("readline");
const https = require("https");

// Paths
const BLOG_CSV = path.join(
  __dirname,
  "website-main/blog/Copy of High Surf Corp V4.20 - Blog Posts.csv",
);
const TOPICS_CSV = path.join(
  __dirname,
  "website-main/blog/Copy of High Surf Corp V4.20 - Topics.csv",
);
const OUTPUT_DIR = path.join(__dirname, "dist/blog");
const INDEX_HTML = path.join(__dirname, "dist/index.html");

// Font links for blog pages (removed from homepage for performance)
// Blog pages use various font classes from Webflow, so they need all fonts
const BLOG_FONTS = `<link id="all-fonts-link-font-geist" rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&display=swap"><style id="all-fonts-style-font-geist">.font-geist { font-family: 'Geist', sans-serif !important; }</style><link id="all-fonts-link-font-roboto" rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600;700&display=swap"><style id="all-fonts-style-font-roboto">.font-roboto { font-family: 'Roboto', sans-serif !important; }</style><link id="all-fonts-link-font-montserrat" rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap"><style id="all-fonts-style-font-montserrat">.font-montserrat { font-family: 'Montserrat', sans-serif !important; }</style><link id="all-fonts-link-font-poppins" rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"><style id="all-fonts-style-font-poppins">.font-poppins { font-family: 'Poppins', sans-serif !important; }</style><link id="all-fonts-link-font-playfair" rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;900&display=swap"><style id="all-fonts-style-font-playfair">.font-playfair { font-family: 'Playfair Display', serif !important; }</style><link id="all-fonts-link-font-instrument-serif" rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Serif:wght@400;500;600;700&display=swap"><style id="all-fonts-style-font-instrument-serif">.font-instrument-serif { font-family: 'Instrument Serif', serif !important; }</style><link id="all-fonts-link-font-merriweather" rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700;900&display=swap"><style id="all-fonts-style-font-merriweather">.font-merriweather { font-family: 'Merriweather', serif !important; }</style><link id="all-fonts-link-font-bricolage" rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@300;400;500;600;700&display=swap"><style id="all-fonts-style-font-bricolage">.font-bricolage { font-family: 'Bricolage Grotesque', sans-serif !important; }</style><link id="all-fonts-link-font-jakarta" rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap"><style id="all-fonts-style-font-jakarta">.font-jakarta { font-family: 'Plus Jakarta Sans', sans-serif !important; }</style><link id="all-fonts-link-font-manrope" rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&display=swap"><style id="all-fonts-style-font-manrope">.font-manrope { font-family: 'Manrope', sans-serif !important; }</style><link id="all-fonts-link-font-space-grotesk" rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap"><style id="all-fonts-style-font-space-grotesk">.font-space-grotesk { font-family: 'Space Grotesk', sans-serif !important; }</style><link id="all-fonts-link-font-work-sans" rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Work+Sans:wght@300;400;500;600;700;800&display=swap"><style id="all-fonts-style-font-work-sans">.font-work-sans { font-family: 'Work Sans', sans-serif !important; }</style><link id="all-fonts-link-font-pt-serif" rel="stylesheet" href="https://fonts.googleapis.com/css2?family=PT+Serif:wght@400;700&display=swap"><style id="all-fonts-style-font-pt-serif">.font-pt-serif { font-family: 'PT Serif', serif !important; }</style><link id="all-fonts-link-font-geist-mono" rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@300;400;500;600;700&display=swap"><style id="all-fonts-style-font-geist-mono">.font-geist-mono { font-family: 'Geist Mono', monospace !important; }</style><link id="all-fonts-link-font-space-mono" rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap"><style id="all-fonts-style-font-space-mono">.font-space-mono { font-family: 'Space Mono', monospace !important; }</style><link id="all-fonts-link-font-quicksand" rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Quicksand:wght@300;400;500;600;700&display=swap"><style id="all-fonts-style-font-quicksand">.font-quicksand { font-family: 'Quicksand', sans-serif !important; }</style><link id="all-fonts-link-font-nunito" rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600;700;800&display=swap"><style id="all-fonts-style-font-nunito">.font-nunito { font-family: 'Nunito', sans-serif !important; }</style><link id="all-fonts-link-font-newsreader" rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,400..800&display=swap"><style id="all-fonts-style-font-newsreader">.font-newsreader { font-family: 'Newsreader', serif !important; }</style><link id="all-fonts-link-font-google-sans-flex" rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Google+Sans+Flex:wght@400;500;600;700&display=swap"><style id="all-fonts-style-font-google-sans-flex">.font-google-sans-flex { font-family: 'Google Sans Flex', sans-serif !important; }</style><link id="all-fonts-link-font-oswald" rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;500;600;700&display=swap"><style id="all-fonts-style-font-oswald">.font-oswald { font-family: 'Oswald', sans-serif !important; }</style><link id="all-fonts-link-font-dm-sans" rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap"><style id="all-fonts-style-font-dm-sans">.font-dm-sans { font-family: 'DM Sans', sans-serif !important; }</style>`;

// Category gradients for fallback thumbnails
const CATEGORY_GRADIENTS = {
  "coquina": "from-amber-600 via-orange-700 to-stone-800",
  "general": "from-slate-600 via-slate-700 to-slate-900",
  "construction": "from-blue-600 via-cyan-700 to-teal-800",
  "pros & cons": "from-green-600 via-emerald-700 to-teal-900",
  "default": "from-gray-600 via-gray-700 to-gray-900"
};

// Get gradient class for category
function getCategoryGradient(category) {
  const normalizedCategory = (category || "").toLowerCase().trim();
  return CATEGORY_GRADIENTS[normalizedCategory] || CATEGORY_GRADIENTS["default"];
}

// Parse CSV line (simple parser for quoted fields)
function parseCSVLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

// Format date
function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { year: "numeric", month: "long", day: "numeric" };
  return date.toLocaleDateString("en-US", options);
}

// Get recent posts sorted by date
function getRecentPosts(posts, count = 3) {
  return posts
    .sort((a, b) => {
      const dateA = new Date(a["Published On"] || a["Created On"]);
      const dateB = new Date(b["Published On"] || b["Created On"]);
      return dateB - dateA; // Sort descending (newest first)
    })
    .slice(0, count);
}

/**
 * Download image from URL to local filesystem
 * @param {string} url - Full URL to image
 * @param {string} slug - Blog post slug (for error messages)
 * @param {string} suffix - 'thumbnail' or 'hero' (for error messages)
 * @returns {Promise<string|null>} Local filename or null
 */
async function downloadImage(url, slug, suffix) {
  return new Promise((resolve, reject) => {
    // Handle empty/null URLs
    if (!url || url.trim() === "") {
      console.log(`  ⚠️  No ${suffix} image for ${slug}`);
      resolve(null);
      return;
    }

    // Extract filename from URL
    const urlParts = url.split("/");
    const filenameEncoded = urlParts[urlParts.length - 1];

    // Decode URL-encoded characters
    const filename = decodeURIComponent(filenameEncoded);

    // Create output directory if it doesn't exist
    const outputDir = path.join(__dirname, "dist/images/blog");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, filename);

    // Skip if already downloaded
    if (fs.existsSync(outputPath)) {
      console.log(`  ✅ ${suffix}: ${filename} (cached)`);
      resolve(filename);
      return;
    }

    console.log(`  ⬇️  Downloading ${suffix}: ${filename}`);

    // Download image
    https
      .get(url, (response) => {
        // Handle HTTP redirects
        if (response.statusCode === 301 || response.statusCode === 302) {
          const redirectUrl = response.headers.location;
          console.log(`  ↪️  Redirect to: ${redirectUrl}`);
          downloadImage(redirectUrl, slug, suffix).then(resolve).catch(reject);
          return;
        }

        // Handle non-200 responses
        if (response.statusCode !== 200) {
          reject(
            new Error(
              `Failed to download ${suffix} image for ${slug}: HTTP ${response.statusCode}`,
            ),
          );
          return;
        }

        // Stream to file
        const fileStream = fs.createWriteStream(outputPath);
        response.pipe(fileStream);

        fileStream.on("finish", () => {
          fileStream.close();
          console.log(`  ✅ ${suffix}: ${filename}`);
          resolve(filename);
        });

        fileStream.on("error", (err) => {
          fs.unlinkSync(outputPath); // Clean up partial file
          reject(
            new Error(
              `Failed to write ${suffix} image for ${slug}: ${err.message}`,
            ),
          );
        });
      })
      .on("error", (err) => {
        reject(
          new Error(
            `Network error downloading ${suffix} image for ${slug}: ${err.message}`,
          ),
        );
      });
  });
}

// Read CSV file
async function readCSV(filePath) {
  return new Promise((resolve, reject) => {
    const data = [];
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    let headers = [];
    let isFirstLine = true;

    rl.on("line", (line) => {
      if (isFirstLine) {
        headers = parseCSVLine(line);
        isFirstLine = false;
      } else {
        const values = parseCSVLine(line);
        const obj = {};
        headers.forEach((header, index) => {
          obj[header] = values[index] || "";
        });
        data.push(obj);
      }
    });

    rl.on("close", () => resolve(data));
    rl.on("error", reject);
  });
}

// Get navigation HTML from index.html
function extractNavigation() {
  const indexHTML = fs.readFileSync(INDEX_HTML, "utf-8");

  // Extract Tailwind navigation (pill-shaped fixed nav)
  const navMatch = indexHTML.match(
    /<div class="fixed top-6[\s\S]*?<\/nav>[\s\S]*?<\/div>/,
  );
  const headerNav = navMatch ? navMatch[0] : "";

  // Extract footer
  const footerMatch = indexHTML.match(/<footer[\s\S]*?<\/footer>/);
  const footer = footerMatch ? footerMatch[0] : "";

  // Extract head elements (fonts, styles, analytics)
  const headMatch = indexHTML.match(/<head>([\s\S]*?)<\/head>/);
  const head = headMatch ? headMatch[1] : "";

  return { headerNav, footer, head };
}

// Generate blog index page
function generateBlogIndex(posts, topics, { headerNav, footer, head }) {
  const featuredPosts = posts.filter((p) => p["Feature?"] === "true");
  const allPosts = posts;

  // Generate featured posts HTML
  const featuredHTML = featuredPosts
    .map((post) => {
      const category = post["Categories / topics"] || "General";
      const date = formatDate(post["Published On"] || post["Created On"]);
      const excerpt = (
        post["Short preview"] ||
        post["Meta description"] ||
        ""
      ).slice(0, 150);

      return `
      <article class="u-vflex-stretch-top u-gap-small" style="background: var(--swatch--light-2); border-radius: 8px; overflow: hidden;">
        <a href="${post.Slug}/" style="display: block;">
          <img src="${post._localThumbnail ? `../images/blog/${post._localThumbnail}` : post["Thumbnail image"]}" alt="${post.Name}" style="width: 100%; height: 240px; object-fit: cover;">
        </a>
        <div style="padding: var(--size--2rem);">
          <div class="u-hflex-left-center u-gap-xsmall" style="margin-bottom: var(--size--1rem);">
            <span class="u-text-small" style="color: var(--swatch--brand-1); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">${category}</span>
            <span class="u-text-small" style="color: var(--swatch--dark-fade);">•</span>
            <time class="u-text-small" style="color: var(--swatch--dark-fade);" datetime="${post["Published On"]}">${date}</time>
          </div>
          <h3 class="u-h4" style="margin-bottom: var(--size--1rem);">
            <a href="${post.Slug}/" style="text-decoration: none; color: inherit;">${post.Name}</a>
          </h3>
          <p class="u-text-main" style="color: var(--swatch--dark-fade); margin-bottom: var(--size--1-5rem);">${excerpt}</p>
          <a href="${post.Slug}/" class="u-text-main" style="color: var(--swatch--brand-1); font-weight: 600; text-decoration: none;">Read More →</a>
        </div>
      </article>
    `;
    })
    .join("");

  // Generate all posts HTML
  const postsHTML = allPosts
    .map((post) => {
      const category = post["Categories / topics"] || "General";
      const date = formatDate(post["Published On"] || post["Created On"]);
      const excerpt = (
        post["Short preview"] ||
        post["Meta description"] ||
        ""
      ).slice(0, 120);

      return `
      <article class="u-vflex-stretch-top u-gap-small" style="border: 1px solid var(--swatch--dark-fade); border-radius: 8px; overflow: hidden; transition: transform 0.2s, box-shadow 0.2s;">
        <a href="${post.Slug}/" style="display: block;">
          <img src="${post._localThumbnail ? `../images/blog/${post._localThumbnail}` : post["Thumbnail image"]}" alt="${post.Name}" style="width: 100%; height: 200px; object-fit: cover;">
        </a>
        <div style="padding: var(--size--2rem);">
          <div class="u-hflex-left-center u-gap-xsmall" style="margin-bottom: var(--size--1rem);">
            <span class="u-text-small" style="color: var(--swatch--brand-1); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">${category}</span>
            <span class="u-text-small" style="color: var(--swatch--dark-fade);">•</span>
            <time class="u-text-small" style="color: var(--swatch--dark-fade);" datetime="${post["Published On"]}">${date}</time>
          </div>
          <h3 class="u-h5" style="margin-bottom: var(--size--1rem);">
            <a href="${post.Slug}/" style="text-decoration: none; color: inherit;">${post.Name}</a>
          </h3>
          <p class="u-text-main" style="color: var(--swatch--dark-fade); line-height: 1.6;">${excerpt}...</p>
        </div>
      </article>
    `;
    })
    .join("");

  // Add Blog link to navigation (make active)
  const updatedNav = headerNav.replace(
    '<a href="contact/brevard-county-free-estimate.html"',
    '<a href="index.html" class="nav_menu_link is-icon w-inline-block"><div class="nav_menu_link_text">Blog</div></a></li><li class="nav_menu_item"><a href="../contact/brevard-county-free-estimate.html"',
  );

  return `<!DOCTYPE html>
<html data-wf-page="blog-index" data-wf-site="68fc859a95b7d8d6466ccd3f" lang="en">
<head>
  <meta charset="utf-8">
  <title>Blog - Coastal Living & Shoreline Protection | High Surf Corp</title>
  <meta content="Expert insights on shoreline restoration, coastal property protection, and coquina seawalls in Brevard County, Florida." name="description">
  <meta content="Blog - High Surf Corp" property="og:title">
  <meta content="Expert insights on shoreline restoration and coastal protection." property="og:description">
  <meta content="https://highsurfcorp.com/blog/" property="og:url">
  <meta property="og:type" content="website">
  <meta content="width=device-width, initial-scale=1" name="viewport">
  ${head}
  ${BLOG_FONTS}
</head>
<body>
  <div class="page_wrap">
    ${updatedNav.replace('href="', 'href="../').replace('href="../http', 'href="http')}

    <section data-padding-top="large" data-padding-bottom="large">
      <div class="u-container">
        <div class="u-vflex-center-center u-gap-main" style="text-align: center;">
          <h1 class="u-h1">Our Blog</h1>
          <p class="u-text-large" style="max-width: 640px;">Expert insights on coastal living, shoreline restoration, and protecting your waterfront property in Brevard County.</p>
        </div>
      </div>
    </section>

    ${
      featuredPosts.length > 0
        ? `
    <section data-padding-top="main" data-padding-bottom="main" data-theme="light">
      <div class="u-container">
        <h2 class="u-h3" style="margin-bottom: var(--size--3rem);">Featured Articles</h2>
        <div class="u-grid-custom" data-gap="large" style="grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));">
          ${featuredHTML}
        </div>
      </div>
    </section>
    `
        : ""
    }

    <section data-padding-top="large" data-padding-bottom="large">
      <div class="u-container">
        <h2 class="u-h3" style="margin-bottom: var(--size--3rem);">All Articles</h2>
        <div class="u-grid-custom" data-gap="large" style="grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));">
          ${postsHTML}
        </div>
      </div>
    </section>

    ${footer.replace('href="', 'href="../').replace('href="../http', 'href="http')}
  </div>
  <script src="../js/webflow.js" type="text/javascript"></script>
</body>
</html>`;
}

// Generate individual post page
function generatePostPage(post, { headerNav, footer, head }) {
  const category = post["Categories / topics"] || "General";
  const date = formatDate(post["Published On"] || post["Created On"]);
  const metaDesc = post["Meta description"] || post["Short preview"] || "";
  const content = post["Post body"] || "";

  return `<!DOCTYPE html>
<html data-wf-page="blog-post" data-wf-site="68fc859a95b7d8d6466ccd3f" lang="en">
<head>
  <meta charset="utf-8">
  <title>${post.Name} | High Surf Corp Blog</title>
  <meta content="${metaDesc}" name="description">
  <meta content="${post.Name}" property="og:title">
  <meta content="${metaDesc}" property="og:description">
  <meta content="${post._localHero ? `https://highsurfcorp.com/images/blog/${post._localHero}` : post["Hero image"]}" property="og:image">
  <meta content="https://highsurfcorp.com/blog/${post.Slug}/" property="og:url">
  <meta property="og:type" content="article">
  <meta property="article:published_time" content="${post["Published On"]}">
  <meta content="width=device-width, initial-scale=1" name="viewport">
  ${head}
  ${BLOG_FONTS}
  <style>
    .blog-post-content h2 {
      font-size: var(--h3--font-size);
      margin-top: var(--size--4rem);
      margin-bottom: var(--size--2rem);
      font-weight: 700;
    }
    .blog-post-content h3 {
      font-size: var(--h4--font-size);
      margin-top: var(--size--3rem);
      margin-bottom: var(--size--1-5rem);
      font-weight: 600;
    }
    .blog-post-content h4 {
      font-size: var(--h5--font-size);
      margin-top: var(--size--2rem);
      margin-bottom: var(--size--1rem);
      font-weight: 600;
    }
    .blog-post-content h5 {
      font-size: var(--h6--font-size);
      margin-top: var(--size--2rem);
      margin-bottom: var(--size--1rem);
      font-weight: 600;
    }
    .blog-post-content p {
      font-size: var(--text-main--font-size);
      line-height: 1.7;
      margin-bottom: var(--size--2rem);
    }
    .blog-post-content ul, .blog-post-content ol {
      margin-bottom: var(--size--2rem);
      padding-left: var(--size--3rem);
    }
    .blog-post-content li {
      margin-bottom: var(--size--1rem);
      line-height: 1.7;
    }
    .blog-post-content img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      margin: var(--size--2rem) 0;
    }
    .blog-post-content figure {
      margin: var(--size--3rem) 0;
    }
    .blog-post-content figcaption {
      font-size: var(--text-small--font-size);
      color: var(--swatch--dark-fade);
      margin-top: var(--size--1rem);
      font-style: italic;
    }
  </style>
</head>
<body>
  <div class="page_wrap">
    ${headerNav.replace('href="', 'href="../../').replace('href="../../http', 'href="http')}

    <section data-padding-top="small" data-padding-bottom="none">
      <div class="u-container">
        <nav aria-label="Breadcrumb">
          <ol class="u-hflex-left-center u-gap-xsmall" style="list-style: none; padding: 0;">
            <li><a href="../../" class="u-text-small" style="color: var(--swatch--dark-fade);">Home</a></li>
            <li class="u-text-small" style="color: var(--swatch--dark-fade);">/</li>
            <li><a href="../" class="u-text-small" style="color: var(--swatch--dark-fade);">Blog</a></li>
            <li class="u-text-small" style="color: var(--swatch--dark-fade);">/</li>
            <li class="u-text-small" style="color: var(--swatch--dark);" aria-current="page">${post.Name}</li>
          </ol>
        </nav>
      </div>
    </section>

    <section data-padding-top="main" data-padding-bottom="small">
      <div class="u-container">
        <article style="max-width: 720px; margin: 0 auto;">
          <div class="u-hflex-left-center u-gap-small" style="margin-bottom: var(--size--2rem);">
            <span class="u-text-small" style="display: inline-block; padding: 0.5rem 1rem; background: var(--swatch--brand-3); color: var(--swatch--dark-1); border-radius: 4px; text-decoration: none; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">${category}</span>
            <time class="u-text-small" style="color: var(--swatch--dark-fade);" datetime="${post["Published On"]}">${date}</time>
          </div>
          <h1 class="u-h1" style="margin-bottom: var(--size--2rem);">${post.Name}</h1>
        </article>
      </div>
    </section>

    ${
      post["Hero image"] || post._localHero
        ? `
    <section data-padding-top="none" data-padding-bottom="main">
      <div class="u-container">
        <div style="max-width: 1000px; margin: 0 auto;">
          <img src="${post._localHero ? `../../images/blog/${post._localHero}` : post["Hero image"]}" alt="${post.Name}" style="width: 100%; height: auto; border-radius: 8px; box-shadow: 0 20px 60px rgba(0,0,0,0.1);">
        </div>
      </div>
    </section>
    `
        : ""
    }

    <section data-padding-top="none" data-padding-bottom="large">
      <div class="u-container">
        <article class="blog-post-content" style="max-width: 720px; margin: 0 auto;">
          ${content}
        </article>
      </div>
    </section>

    <section data-padding-top="large" data-padding-bottom="large" data-theme="dark" data-brand="3">
      <div class="u-container">
        <div class="u-vflex-center-center u-gap-main" style="text-align: center; max-width: 640px; margin: 0 auto;">
          <h2 class="u-h2">Ready to Protect Your Shoreline?</h2>
          <p class="u-text-large">Get a free estimate from Brevard County's leading shoreline restoration experts.</p>
          <a href="../../contact/brevard-county-free-estimate.html" data-button-style="secondary" class="button">Get Free Estimate</a>
        </div>
      </div>
    </section>

    ${footer.replace('href="', 'href="../../').replace('href="../../http', 'href="http')}
  </div>
  <script src="../../js/webflow.js" type="text/javascript"></script>
</body>
</html>`;
}

// Generate homepage blog section HTML
function generateHomepageBlogSection(posts) {
  const recentPosts = getRecentPosts(posts, 3);

  const blogCardsHTML = recentPosts
    .map((post) => {
      const category = post["Categories / topics"] || "General";
      const excerpt = (
        post["Short preview"] ||
        post["Meta description"] ||
        ""
      ).slice(0, 120);
      
      const thumbnailUrl = post._localThumbnail 
        ? `images/blog/${post._localThumbnail}` 
        : post["Thumbnail image"];
      
      const hasThumbnail = thumbnailUrl && thumbnailUrl.trim() !== "";
      const gradientClass = getCategoryGradient(category);

      return `
        <div class="blog_cms_item group">
          <a href="blog/${post.Slug}/"
             class="block h-full bg-neutral-800/50 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:border-white/30 transition-all hover:-translate-y-1">
            <div class="relative aspect-[4/3] overflow-hidden">
              ${hasThumbnail ? `
                <img src="${thumbnailUrl}" 
                     alt="${post.Name}" 
                     class="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105"
                     loading="lazy">
              ` : `
                <div class="absolute inset-0 bg-gradient-to-br ${gradientClass}">
                  <div class="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.3),transparent)]"></div>
                </div>
              `}
              <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              
              <div class="absolute bottom-4 left-4 right-4">
                <div class="mb-3">
                  <span class="inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-white backdrop-blur-sm">
                    ${category}
                  </span>
                </div>
                <h3 class="text-xl font-semibold text-white mb-3 tracking-tight line-clamp-2">
                  ${post.Name}
                </h3>
                <p class="text-white/60 text-sm mb-4 line-clamp-2">
                  ${excerpt}
                </p>
                <div class="flex items-center text-white/40 text-sm group-hover:text-white/60 transition-colors">
                  <span>Read Article</span>
                  <svg class="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </div>
              </div>
            </div>
          </a>
        </div>
      `.trim();
    })
    .join("\n");

  return `<div class="blog_cms_wrap">
  <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
${blogCardsHTML}
  </div>
</div>`.trim();
}

// Update homepage with blog posts
function updateHomepageWithBlogPosts(posts) {
  const indexPath = INDEX_HTML;
  let indexHTML = fs.readFileSync(indexPath, "utf-8");

  // Find blog section (Tailwind version)
  const blogSectionStart = indexHTML.indexOf('<div class="blog_cms_wrap">');

  if (blogSectionStart === -1) {
    console.log("⚠️  Could not find blog section in homepage");
    return;
  }

  // Find the closing </div> for blog_cms_wrap
  let depth = 0;
  let blogSectionEnd = blogSectionStart + '<div class="blog_cms_wrap">'.length;

  for (let i = blogSectionEnd; i < indexHTML.length; i++) {
    if (indexHTML.substr(i, 5) === "<div ") {
      depth++;
    } else if (indexHTML.substr(i, 6) === "</div>") {
      if (depth === 0) {
        blogSectionEnd = i + 6;
        break;
      }
      depth--;
    }
  }

  const newBlogSection = generateHomepageBlogSection(posts);

  // Replace the section
  indexHTML =
    indexHTML.substring(0, blogSectionStart) +
    newBlogSection +
    indexHTML.substring(blogSectionEnd);

  // Write updated HTML
  fs.writeFileSync(indexPath, indexHTML);
  console.log("✅ Homepage updated with recent blog posts");
}

// Main function
async function main() {
  console.log("🚀 Starting blog generation...\n");

  // Read CSV files
  console.log("📄 Reading blog posts...");
  const posts = await readCSV(BLOG_CSV);
  console.log(`✅ Found ${posts.length} blog posts\n`);

  console.log("📄 Reading topics...");
  const topics = await readCSV(TOPICS_CSV);
  console.log(`✅ Found ${topics.length} topics\n`);

  // Extract navigation
  console.log("📄 Extracting site navigation...");
  const siteElements = extractNavigation();
  console.log("✅ Navigation extracted\n");

  // Download all blog images
  console.log("📥 Downloading blog images...\n");
  const imageDownloads = [];

  for (const post of posts) {
    console.log(`📄 Processing images for: ${post.Slug}`);

    // Download thumbnail
    if (post["Thumbnail image"]) {
      imageDownloads.push(
        downloadImage(post["Thumbnail image"], post.Slug, "thumbnail").then(
          (filename) => {
            if (filename) post._localThumbnail = filename;
          },
        ),
      );
    }

    // Download hero
    if (post["Hero image"]) {
      imageDownloads.push(
        downloadImage(post["Hero image"], post.Slug, "hero").then(
          (filename) => {
            if (filename) post._localHero = filename;
          },
        ),
      );
    }
  }

  // Wait for all downloads (fail on any error)
  try {
    await Promise.all(imageDownloads);
    console.log("\n✅ All images downloaded successfully\n");
  } catch (err) {
    console.error("\n❌ Image download failed:");
    console.error(err.message);
    process.exit(1); // Fail build
  }

  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Generate blog index
  console.log("📝 Generating blog index...");
  const indexHTML = generateBlogIndex(posts, topics, siteElements);
  fs.writeFileSync(path.join(OUTPUT_DIR, "index.html"), indexHTML);
  console.log("✅ Blog index created\n");

  // Update homepage with recent posts
  console.log("📝 Updating homepage with recent blog posts...");
  updateHomepageWithBlogPosts(posts);

  // Generate individual posts
  console.log("📝 Generating individual post pages...");
  for (const post of posts) {
    const postDir = path.join(OUTPUT_DIR, post.Slug);
    if (!fs.existsSync(postDir)) {
      fs.mkdirSync(postDir, { recursive: true });
    }

    const postHTML = generatePostPage(post, siteElements);
    fs.writeFileSync(path.join(postDir, "index.html"), postHTML);
    console.log(`  ✅ ${post.Slug}/index.html`);
  }

  console.log("\n✨ Blog generation complete!\n");
  console.log(`Generated:`);
  console.log(`  - 1 blog index page`);
  console.log(`  - ${posts.length} blog post pages`);
  console.log(`  - Total: ${posts.length + 1} HTML files\n`);
}

// Run
main().catch(console.error);