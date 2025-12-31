/**
 * Image URL Transformation Script
 * Transforms Webflow CDN URLs to R2 URLs in the D1 database
 *
 * Usage:
 *   node scripts/fix-image-urls.js > update-images.sql
 *   npx wrangler d1 execute highsurf-cms --remote --file=./update-images.sql
 */

const fs = require("fs");
const path = require("path");

// Constants
const WEBFLOW_BASE =
  "https://cdn.prod.website-files.com/68fc859a95b7d8d6466ccd6c/";
const R2_BASE =
  "https://pub-8a557d48118e46a38c0007cee5e58bd9.r2.dev/images/blog/";

// Read the seed.sql file
const seedPath = path.join(__dirname, "..", "seed.sql");
const seedContent = fs.readFileSync(seedPath, "utf-8");

/**
 * Transform a Webflow URL to an R2 URL
 */
function transformUrl(webflowUrl) {
  if (!webflowUrl || !webflowUrl.includes("cdn.prod.website-files.com")) {
    return webflowUrl;
  }

  // Extract filename from Webflow URL
  const parts = webflowUrl.split(WEBFLOW_BASE);
  if (parts.length < 2) return webflowUrl;

  const filename = parts[1];
  // Decode URL once (triple-encoded %252520 becomes %2520)
  const decodedFilename = decodeURIComponent(filename);

  return R2_BASE + decodedFilename;
}

// Split content into individual INSERT statements for posts
const postInserts = seedContent.split(/INSERT INTO posts/).slice(1);

const updates = [];

postInserts.forEach((insertChunk) => {
  // Find the slug - it's after title and before short_tag
  // Format: VALUES (\n  'id',\n  'title',\n  'slug',\n  'short_tag' or NULL,...

  // Extract slug using regex - it's the 3rd quoted value in VALUES
  const slugMatch = insertChunk.match(
    /VALUES\s*\(\s*'[^']*',\s*'[^']*',\s*'([^']*)'/s,
  );
  if (!slugMatch) return;
  const slug = slugMatch[1];

  // Find hero_image URL (Webflow URL pattern)
  const heroMatch = insertChunk.match(
    /'(https:\/\/cdn\.prod\.website-files\.com\/68fc859a95b7d8d6466ccd6c\/[^']*)'/,
  );
  const heroImage = heroMatch ? heroMatch[1] : null;

  // Find thumbnail_image URL - it comes after hero_image
  // Look for the second occurrence of the Webflow URL pattern
  const allWebflowUrls = insertChunk.match(
    /https:\/\/cdn\.prod\.website-files\.com\/68fc859a95b7d8d6466ccd6c\/[^']*/g,
  );

  let thumbnailImage = null;
  if (allWebflowUrls && allWebflowUrls.length >= 2) {
    // First is hero, second is thumbnail (in the column order)
    thumbnailImage = allWebflowUrls[1];
  }

  // Transform URLs
  const newHeroImage = heroImage ? transformUrl(heroImage) : null;
  const newThumbnailImage = thumbnailImage
    ? transformUrl(thumbnailImage)
    : null;

  // Generate UPDATE statement if we have URLs to update
  if (newHeroImage || newThumbnailImage) {
    const setParts = [];
    if (newHeroImage) {
      setParts.push(`hero_image = '${newHeroImage.replace(/'/g, "''")}'`);
    }
    if (newThumbnailImage) {
      setParts.push(
        `thumbnail_image = '${newThumbnailImage.replace(/'/g, "''")}'`,
      );
    }

    updates.push(
      `UPDATE posts SET ${setParts.join(", ")} WHERE slug = '${slug.replace(/'/g, "''")}';`,
    );
  }
});

// Output SQL
console.log("-- Image URL Update Script");
console.log("-- Generated: " + new Date().toISOString());
console.log("-- Transforms Webflow CDN URLs to R2 URLs");
console.log("");
console.log("-- Total updates: " + updates.length);
console.log("");

updates.forEach((update) => {
  console.log(update);
  console.log("");
});
