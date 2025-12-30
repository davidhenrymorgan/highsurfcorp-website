#!/usr/bin/env node

/**
 * Generate seed.sql from CSV data for D1 database migration
 * Converts blog posts and topics from CSV to SQL INSERT statements
 */

const fs = require("fs");
const path = require("path");
const readline = require("readline");

// Paths
const BLOG_CSV = path.join(
  __dirname,
  "website-main/blog/Copy of High Surf Corp V4.20 - Blog Posts.csv",
);
const TOPICS_CSV = path.join(
  __dirname,
  "website-main/blog/Copy of High Surf Corp V4.20 - Topics.csv",
);
const OUTPUT_FILE = path.join(__dirname, "seed.sql");

// Parse CSV line (handles quoted fields with commas and newlines)
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

// Escape string for SQL (double single quotes)
function escapeSql(str) {
  if (str === null || str === undefined) return "NULL";
  if (str === "") return "NULL";
  // Replace single quotes with two single quotes for SQL escaping
  const escaped = str.replace(/'/g, "''");
  return `'${escaped}'`;
}

// Convert boolean string to integer
function boolToInt(str) {
  return str === "true" ? 1 : 0;
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
    let currentRow = "";
    let inQuotes = false;

    rl.on("line", (line) => {
      // Handle multi-line quoted fields
      currentRow += (currentRow ? "\n" : "") + line;

      // Count quotes to determine if we're still inside a quoted field
      for (const char of line) {
        if (char === '"') inQuotes = !inQuotes;
      }

      // If we're not inside quotes, the row is complete
      if (!inQuotes) {
        if (isFirstLine) {
          headers = parseCSVLine(currentRow);
          isFirstLine = false;
        } else {
          const values = parseCSVLine(currentRow);
          const obj = {};
          headers.forEach((header, index) => {
            obj[header] = values[index] || "";
          });
          data.push(obj);
        }
        currentRow = "";
      }
    });

    rl.on("close", () => resolve(data));
    rl.on("error", reject);
  });
}

// Generate INSERT statement for topics
function generateTopicInsert(topic) {
  return `INSERT INTO topics (id, name, slug, created_at, updated_at, published_at) VALUES (
  ${escapeSql(topic["Item ID"])},
  ${escapeSql(topic["Name"])},
  ${escapeSql(topic["Slug"])},
  ${escapeSql(topic["Created On"])},
  ${escapeSql(topic["Updated On"])},
  ${escapeSql(topic["Published On"])}
);`;
}

// Generate INSERT statement for posts
function generatePostInsert(post) {
  return `INSERT INTO posts (id, title, slug, short_tag, hero_image, thumbnail_image, featured, short_preview, title_variation, meta_description, category, body, seo_description, introduction, description_variation, archived, draft, created_at, updated_at, published_at) VALUES (
  ${escapeSql(post["Item ID"])},
  ${escapeSql(post["Name"])},
  ${escapeSql(post["Slug"])},
  ${escapeSql(post["Short Tag"])},
  ${escapeSql(post["Hero image"])},
  ${escapeSql(post["Thumbnail image"])},
  ${boolToInt(post["Feature?"])},
  ${escapeSql(post["Short preview"])},
  ${escapeSql(post["Title variation"])},
  ${escapeSql(post["Meta description"])},
  ${escapeSql(post["Categories / topics"])},
  ${escapeSql(post["Post body"])},
  ${escapeSql(post["Description / summary for seo"])},
  ${escapeSql(post["Introduction"])},
  ${escapeSql(post["Description vareation"])},
  ${boolToInt(post["Archived"])},
  ${boolToInt(post["Draft"])},
  ${escapeSql(post["Created On"])},
  ${escapeSql(post["Updated On"])},
  ${escapeSql(post["Published On"])}
);`;
}

// Main function
async function main() {
  console.log("Generating seed.sql from CSV data...\n");

  // Read topics
  console.log("Reading topics CSV...");
  const topics = await readCSV(TOPICS_CSV);
  console.log(`Found ${topics.length} topics\n`);

  // Read posts
  console.log("Reading blog posts CSV...");
  const posts = await readCSV(BLOG_CSV);
  console.log(`Found ${posts.length} posts\n`);

  // Generate SQL
  let sql = `-- =============================================
-- High Surf Corp CMS Seed Data for Cloudflare D1
-- Database: highsurf-cms
-- Generated: ${new Date().toISOString()}
-- =============================================

-- Insert Topics (${topics.length} records)
`;

  for (const topic of topics) {
    sql += generateTopicInsert(topic) + "\n\n";
  }

  sql += `
-- Insert Posts (${posts.length} records)
`;

  for (const post of posts) {
    sql += generatePostInsert(post) + "\n\n";
  }

  // Write to file
  fs.writeFileSync(OUTPUT_FILE, sql);
  console.log(`Generated seed.sql with:`);
  console.log(`  - ${topics.length} topic inserts`);
  console.log(`  - ${posts.length} post inserts`);
  console.log(`\nOutput: ${OUTPUT_FILE}`);
}

// Run
main().catch(console.error);
