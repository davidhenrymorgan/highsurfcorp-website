#!/usr/bin/env node
/**
 * D1 Migration Runner for High Surf Corp CMS
 *
 * Usage:
 *   node src/migrate.js              # Run pending migrations on local D1
 *   node src/migrate.js --remote     # Run pending migrations on remote D1
 *   node src/migrate.js --status     # Show migration status
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const DB_NAME = "highsurf-cms";
const MIGRATIONS_DIR = path.join(__dirname, "..", "migrations");

// Parse command line arguments
const args = process.argv.slice(2);
const isRemote = args.includes("--remote");
const isStatus = args.includes("--status");
const remoteFlag = isRemote ? "--remote" : "";

/**
 * Execute a D1 SQL command
 */
function executeD1(sql) {
  const escapedSql = sql.replace(/"/g, '\\"');
  const cmd = `npx wrangler d1 execute ${DB_NAME} ${remoteFlag} --command="${escapedSql}"`;
  try {
    const result = execSync(cmd, {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    return JSON.parse(result.match(/\[[\s\S]*\]/)?.[0] || "[]");
  } catch (err) {
    // Table might not exist yet
    if (err.message.includes("no such table")) {
      return [];
    }
    throw err;
  }
}

/**
 * Execute a D1 SQL file
 */
function executeD1File(filePath) {
  const cmd = `npx wrangler d1 execute ${DB_NAME} ${remoteFlag} --file="${filePath}"`;
  try {
    execSync(cmd, { encoding: "utf-8", stdio: "inherit" });
    return true;
  } catch (err) {
    console.error(`Failed to execute ${filePath}:`, err.message);
    return false;
  }
}

/**
 * Get list of applied migrations
 */
function getAppliedMigrations() {
  try {
    const result = executeD1(
      "SELECT version FROM schema_migrations ORDER BY version",
    );
    if (result[0]?.results) {
      return result[0].results.map((r) => r.version);
    }
    return [];
  } catch {
    return [];
  }
}

/**
 * Get list of available migration files
 */
function getAvailableMigrations() {
  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();
  return files
    .map((f) => {
      const match = f.match(/^(\d+)_(.+)\.sql$/);
      if (match) {
        return { version: match[1], name: match[2], file: f };
      }
      return null;
    })
    .filter(Boolean);
}

/**
 * Record a migration as applied
 */
function recordMigration(version, name) {
  executeD1(
    `INSERT INTO schema_migrations (version, name) VALUES ('${version}', '${name}')`,
  );
}

/**
 * Main migration runner
 */
async function main() {
  console.log(`\n📦 D1 Migration Runner (${isRemote ? "REMOTE" : "LOCAL"})\n`);

  const available = getAvailableMigrations();
  const applied = getAppliedMigrations();

  if (isStatus) {
    console.log("Available migrations:");
    available.forEach((m) => {
      const status = applied.includes(m.version) ? "✅" : "⏳";
      console.log(`  ${status} ${m.version}_${m.name}`);
    });
    console.log(`\nApplied: ${applied.length}/${available.length}`);
    return;
  }

  // Find pending migrations
  const pending = available.filter((m) => !applied.includes(m.version));

  if (pending.length === 0) {
    console.log("✅ All migrations are up to date!\n");
    return;
  }

  console.log(`Found ${pending.length} pending migration(s):\n`);

  for (const migration of pending) {
    const filePath = path.join(MIGRATIONS_DIR, migration.file);
    console.log(`⏳ Running ${migration.version}_${migration.name}...`);

    const success = executeD1File(filePath);
    if (!success) {
      console.error(`\n❌ Migration ${migration.version} failed. Stopping.\n`);
      process.exit(1);
    }

    // Record migration (skip for 0002 which records itself)
    if (migration.version !== "0002") {
      try {
        recordMigration(migration.version, migration.name);
      } catch {
        // Might fail if schema_migrations doesn't exist yet
      }
    }

    console.log(`✅ Applied ${migration.version}_${migration.name}\n`);
  }

  console.log(`\n🎉 All migrations applied successfully!\n`);
}

main().catch(console.error);
