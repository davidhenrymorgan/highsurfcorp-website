#!/usr/bin/env node
/**
 * High Surf Corp - Image Optimization Script
 *
 * Optimizes local images in dist/images using Sharp.
 * - Resizes images > 1920px width
 * - Compresses with 80% quality
 * - Skips files < 100KB
 * - Reports savings
 *
 * Note: Blog images are stored in Cloudflare R2 and managed separately.
 *
 * Usage: npm run optimize:images
 */

const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const IMAGES_DIR = path.join(__dirname, "../dist/images");
const MAX_WIDTH = 1920;
const QUALITY = 80;
const MIN_SIZE = 100 * 1024; // 100KB minimum to optimize

let totalOriginalSize = 0;
let totalOptimizedSize = 0;
let filesOptimized = 0;
let filesSkipped = 0;

async function optimizeImage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const supportedExts = [".jpg", ".jpeg", ".png", ".webp"];

  if (!supportedExts.includes(ext)) {
    return { skipped: true, reason: "unsupported format" };
  }

  const stats = fs.statSync(filePath);
  if (stats.size < MIN_SIZE) {
    return { skipped: true, reason: "file too small", size: stats.size };
  }

  try {
    const image = sharp(filePath);
    const metadata = await image.metadata();

    // Skip if already within size limits
    if (metadata.width <= MAX_WIDTH) {
      return { skipped: true, reason: "already optimized", size: stats.size };
    }

    const tempPath = filePath + ".optimized";

    // Optimize based on format
    let pipeline = image.resize(MAX_WIDTH, null, { withoutEnlargement: true });

    if (ext === ".jpg" || ext === ".jpeg") {
      pipeline = pipeline.jpeg({ quality: QUALITY, mozjpeg: true });
    } else if (ext === ".png") {
      pipeline = pipeline.png({ quality: QUALITY, compressionLevel: 9 });
    } else if (ext === ".webp") {
      pipeline = pipeline.webp({ quality: QUALITY });
    }

    await pipeline.toFile(tempPath);

    const newStats = fs.statSync(tempPath);
    const savings = stats.size - newStats.size;
    const savingsPercent = ((savings / stats.size) * 100).toFixed(1);

    if (savings > 0) {
      // Replace original with optimized version
      fs.unlinkSync(filePath);
      fs.renameSync(tempPath, filePath);

      totalOriginalSize += stats.size;
      totalOptimizedSize += newStats.size;
      filesOptimized++;

      return {
        optimized: true,
        originalSize: stats.size,
        newSize: newStats.size,
        savings,
        savingsPercent,
      };
    } else {
      // Optimized version is larger, keep original
      fs.unlinkSync(tempPath);
      return { skipped: true, reason: "no savings possible", size: stats.size };
    }
  } catch (err) {
    return { error: true, message: err.message };
  }
}

async function main() {
  console.log("");
  console.log("High Surf Corp - Image Optimization");
  console.log("====================================");
  console.log(`Directory: ${IMAGES_DIR}`);
  console.log(`Max width: ${MAX_WIDTH}px`);
  console.log(`Quality: ${QUALITY}%`);
  console.log(`Min size: ${MIN_SIZE / 1024}KB`);
  console.log("");

  if (!fs.existsSync(IMAGES_DIR)) {
    console.error(`Error: Directory not found: ${IMAGES_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(IMAGES_DIR);
  const imageFiles = files.filter((f) => {
    const filePath = path.join(IMAGES_DIR, f);
    return fs.statSync(filePath).isFile();
  });

  console.log(`Found ${imageFiles.length} files to analyze...\n`);

  for (const file of imageFiles) {
    const filePath = path.join(IMAGES_DIR, file);
    const result = await optimizeImage(filePath);

    if (result.error) {
      console.log(`[ERROR] ${file}: ${result.message}`);
    } else if (result.optimized) {
      console.log(`[OPTIMIZED] ${file}`);
      console.log(`  Original: ${(result.originalSize / 1024).toFixed(1)}KB`);
      console.log(`  New: ${(result.newSize / 1024).toFixed(1)}KB`);
      console.log(
        `  Saved: ${(result.savings / 1024).toFixed(1)}KB (${result.savingsPercent}%)`,
      );
    } else if (result.skipped) {
      filesSkipped++;
      // Only log skips for files that were considered
      if (result.reason !== "unsupported format") {
        console.log(`[SKIPPED] ${file}: ${result.reason}`);
      }
    }
  }

  console.log("");
  console.log("====================================");
  console.log("Summary");
  console.log("====================================");
  console.log(`Files optimized: ${filesOptimized}`);
  console.log(`Files skipped: ${filesSkipped}`);

  if (filesOptimized > 0) {
    const totalSavings = totalOriginalSize - totalOptimizedSize;
    const totalSavingsPercent = (
      (totalSavings / totalOriginalSize) *
      100
    ).toFixed(1);
    console.log(
      `Total original size: ${(totalOriginalSize / 1024 / 1024).toFixed(2)}MB`,
    );
    console.log(
      `Total new size: ${(totalOptimizedSize / 1024 / 1024).toFixed(2)}MB`,
    );
    console.log(
      `Total savings: ${(totalSavings / 1024 / 1024).toFixed(2)}MB (${totalSavingsPercent}%)`,
    );
  } else {
    console.log("No images needed optimization.");
  }
  console.log("");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
