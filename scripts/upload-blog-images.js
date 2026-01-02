#!/usr/bin/env node
/**
 * Upload blog images to R2 bucket
 *
 * This script uploads all images from dist/images/blog/ to the R2 bucket
 * at images/blog/ path, preserving the original filenames.
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const BUCKET = "highsurfcorp";
const SOURCE_DIR = path.join(__dirname, "../dist/images/blog");
const R2_PATH = "images/blog";

async function main() {
  console.log("Starting blog image upload to R2...\n");

  // Get list of files
  const files = fs.readdirSync(SOURCE_DIR);
  console.log(`Found ${files.length} files to upload\n`);

  let uploaded = 0;
  let failed = 0;

  for (const filename of files) {
    const filePath = path.join(SOURCE_DIR, filename);
    const r2Key = `${BUCKET}/${R2_PATH}/${filename}`;

    // Skip directories
    if (fs.statSync(filePath).isDirectory()) {
      continue;
    }

    try {
      console.log(`Uploading: ${filename.substring(0, 50)}...`);
      execSync(
        `npx wrangler r2 object put "${r2Key}" --file="${filePath}" --remote`,
        {
          stdio: "pipe",
        },
      );
      uploaded++;
      console.log(`  ✓ Uploaded successfully`);
    } catch (error) {
      failed++;
      console.log(`  ✗ Failed: ${error.message}`);
    }
  }

  console.log(`\n${"=".repeat(50)}`);
  console.log(`Upload complete: ${uploaded} succeeded, ${failed} failed`);

  // Verify bucket info
  console.log("\nVerifying bucket...");
  try {
    const info = execSync("npx wrangler r2 bucket info highsurfcorp", {
      encoding: "utf8",
    });
    console.log(info);
  } catch (e) {
    console.log("Could not get bucket info");
  }
}

main().catch(console.error);
