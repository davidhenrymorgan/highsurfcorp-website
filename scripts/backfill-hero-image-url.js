#!/usr/bin/env node

/**
 * Backfill hero_image_url Column (DB-Driven + R2-Aware)
 *
 * Reads D1 JSON output from stdin, computes hero_image_url for each post,
 * transforms Webflow CDN URLs to R2 URLs, and outputs UPDATE SQL.
 *
 * Usage:
 *   npx wrangler d1 execute highsurf-cms --remote --json \
 *     --command="SELECT id, slug, thumbnail_image, hero_image, body FROM posts WHERE hero_image_url IS NULL" \
 *     | node scripts/backfill-hero-image-url.js > backfill.sql
 *
 *   npx wrangler d1 execute highsurf-cms --remote --file=./backfill.sql
 *
 * Environment:
 *   VALIDATE_FILES=1  Force file validation even if dist/images/blog doesn't exist
 */

const fs = require("fs");
const path = require("path");

// Constants
const R2_BASE =
  "https://pub-8a557d48118e46a38c0007cee5e58bd9.r2.dev/images/blog/";

/**
 * Transform a Webflow CDN URL to an R2 URL
 * Extracts the LAST path segment and decodes repeatedly
 */
function transformToR2(url) {
  if (!url || !url.includes("cdn.prod.website-files.com")) {
    return url;
  }

  try {
    // Extract LAST path segment (filename) using URL parsing
    const parsed = new URL(url);
    let filename = parsed.pathname.split("/").pop();

    // Decode ONCE - Webflow URLs may be triple-encoded (%252520)
    // Single decode brings them to double-encoded (%2520) matching R2 files
    filename = decodeURIComponent(filename);

    return R2_BASE + filename;
  } catch {
    // If URL parsing fails, return original
    return url;
  }
}

/**
 * Extract first image URL from HTML body
 */
function extractFirstImageUrl(html) {
  if (!html) return null;
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match ? match[1] : null;
}

/**
 * Compute hero_image_url using priority logic
 * Priority: thumbnail_image → hero_image → first <img> from body
 */
function computeHeroImageUrl(post) {
  // 1. thumbnail_image (if non-empty)
  const thumbnail = post.thumbnail_image?.trim();
  if (thumbnail) return transformToR2(thumbnail);

  // 2. hero_image (if non-empty)
  const hero = post.hero_image?.trim();
  if (hero) return transformToR2(hero);

  // 3. First <img src="..."> from body
  const bodyImg = extractFirstImageUrl(post.body);
  if (bodyImg) return transformToR2(bodyImg);

  return null;
}

/**
 * Escape string for SQL (double single quotes)
 */
function escapeSql(str) {
  if (str === null || str === undefined) return "NULL";
  if (str === "") return "NULL";
  return `'${str.replace(/'/g, "''")}'`;
}

/**
 * Load valid files from dist/images/blog if available
 */
function loadValidFiles() {
  const blogImagesDir = path.join(__dirname, "..", "dist/images/blog");

  // Check if we should validate
  const forceValidate = process.env.VALIDATE_FILES === "1";
  const dirExists = fs.existsSync(blogImagesDir);

  if (!forceValidate && !dirExists) {
    return null; // Skip validation
  }

  if (!dirExists) {
    console.error(
      "-- Warning: VALIDATE_FILES=1 but dist/images/blog does not exist",
    );
    return null;
  }

  try {
    const files = fs.readdirSync(blogImagesDir);
    return new Set(files);
  } catch (err) {
    console.error(
      `-- Warning: Could not read dist/images/blog: ${err.message}`,
    );
    return null;
  }
}

/**
 * Extract filename from R2 URL for validation
 */
function extractFilename(r2Url) {
  if (!r2Url || !r2Url.startsWith(R2_BASE)) return null;
  return r2Url.slice(R2_BASE.length);
}

/**
 * Main function - reads JSON from stdin
 */
async function main() {
  // Read stdin
  let input = "";
  for await (const chunk of process.stdin) {
    input += chunk;
  }

  if (!input.trim()) {
    console.log("-- No input received from stdin");
    console.log(
      "-- Usage: npx wrangler d1 execute ... --json | node scripts/backfill-hero-image-url.js",
    );
    process.exit(1);
  }

  // Parse JSON from wrangler d1 execute --json
  let data;
  try {
    data = JSON.parse(input);
  } catch (err) {
    console.error(`-- Error parsing JSON: ${err.message}`);
    process.exit(1);
  }

  // Extract results - wrangler returns array with result objects
  const results = data[0]?.results || data.results || [];
  if (!Array.isArray(results)) {
    console.error("-- Error: Could not find results array in JSON");
    console.error(
      "-- Expected format: [{ results: [...] }] or { results: [...] }",
    );
    process.exit(1);
  }

  // Load valid files for optional validation
  const validFiles = loadValidFiles();
  const validateEnabled = validFiles !== null;

  // Output SQL header
  console.log("-- Backfill hero_image_url Column (DB-Driven + R2-Aware)");
  console.log("-- Generated: " + new Date().toISOString());
  console.log(
    "-- Priority: thumbnail_image -> hero_image -> first <img> from body",
  );
  console.log("-- Transforms Webflow CDN URLs to R2 URLs");
  console.log(
    `-- File validation: ${validateEnabled ? "enabled" : "disabled"}`,
  );
  console.log("");
  console.log(`-- Total posts to process: ${results.length}`);
  console.log("");

  let updateCount = 0;
  let skippedNoImage = 0;
  let skippedMissing = 0;

  for (const post of results) {
    const { id, slug } = post;
    if (!id) {
      console.log(`-- Skipped: missing id (slug: ${slug})`);
      continue;
    }

    const heroImageUrl = computeHeroImageUrl(post);
    if (!heroImageUrl) {
      console.log(`-- Skipped: ${slug} (no image found)`);
      skippedNoImage++;
      continue;
    }

    // Optional file validation
    if (validateEnabled) {
      const filename = extractFilename(heroImageUrl);
      if (filename && !validFiles.has(filename)) {
        console.log(`-- Skipped: ${slug} (file not found: ${filename})`);
        skippedMissing++;
        continue;
      }
    }

    // Generate UPDATE statement using id as primary key
    console.log(
      `UPDATE posts SET hero_image_url = ${escapeSql(heroImageUrl)} WHERE id = ${escapeSql(id)} AND hero_image_url IS NULL;`,
    );
    console.log("");
    updateCount++;
  }

  console.log(`-- Summary:`);
  console.log(`--   Updates generated: ${updateCount}`);
  console.log(`--   Skipped (no image): ${skippedNoImage}`);
  if (validateEnabled) {
    console.log(`--   Skipped (file missing): ${skippedMissing}`);
  }
}

// Run
main().catch((err) => {
  console.error(`-- Error: ${err.message}`);
  process.exit(1);
});
