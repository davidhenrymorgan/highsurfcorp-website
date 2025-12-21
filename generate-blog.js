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

  // Extract header navigation
  const navMatch = indexHTML.match(
    /<header class="nav_wrap"[\s\S]*?<\/header>/,
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
      ).slice(0, 100);

      return `
                <div role="listitem" class="blog_cms_item">
                  <a tr-ajaxmodal-element="cms-link" data-theme="invert" href="blog/${post.Slug}/" class="blog_card_wrap u-vflex-left-between u-gap-medium w-inline-block">
                    <div class="blog_card_header u-vflex-left-top u-gap-small">
                      <div class="g_tag_wrap u-color-brand">${category}</div>
                      <div class="blog_card_title u-text-large u-weight-medium">${post.Name}</div>
                    </div>
                    <div class="g_link-title_wrap u-hflex-between-center u-hflex-nowrap u-gap-xsmall">
                      <div class="g_link-title_text u-line-clamp-2">${excerpt}</div>
                      <div class="g_link-title_icon"><svg xmlns="http://www.w3.org/2000/svg" width="100%" viewbox="0 0 18 19" fill="none">
                          <path d="M1 17.4981L17 1.49811" stroke="currentColor" stroke-width="var(--svg-stroke-width--main)" stroke-miterlimit="10" vector-effect="non-scaling-stroke"></path>
                          <path d="M16.9999 13.5407C16.9999 13.5407 13.1927 8.68158 16.9999 1.49811C9.81639 5.30525 4.95728 1.49811 4.95728 1.49811" stroke="currentColor" stroke-width="var(--svg-stroke-width--main)" stroke-linejoin="bevel" vector-effect="non-scaling-stroke"></path>
                        </svg></div>
                    </div>
                  </a>
                </div>
      `.trim();
    })
    .join("\n");

  return `
            <div class="blog_cms_wrap">
              <div role="list" class="blog_cms_list u-grid-column-3">
${blogCardsHTML}
              </div>
            </div>
  `.trim();
}

// Update homepage with blog posts
function updateHomepageWithBlogPosts(posts) {
  const indexPath = INDEX_HTML;
  let indexHTML = fs.readFileSync(indexPath, "utf-8");

  // Find and replace the blog section (lines 901-922)
  const blogSectionStart = indexHTML.indexOf(
    '<div class="blog_cms_wrap w-dyn-list">',
  );
  const blogSectionEnd = indexHTML.indexOf(
    "</div>\n          </div>\n        </div>\n      </section>\n      <footer",
    blogSectionStart,
  );

  if (blogSectionStart === -1 || blogSectionEnd === -1) {
    console.log("⚠️  Could not find blog section in homepage");
    return;
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
