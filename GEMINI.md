# High Surf Corp Website

## Project Overview

*   **Purpose:** Marketing website for High Surf Corp, specializing in seawalls in Brevard County, FL.
*   **Architecture:** Hybrid Static Site + Cloudflare Worker.
    *   **Static Content:** Exported from Webflow and stored in `dist/`.
    *   **Dynamic Content:** Blog generated from CSV data via a Node.js script (`generate-blog.js`).
    *   **Backend:** Cloudflare Worker (`src/index.js`) handles static asset serving and API routes (contact form).
*   **Hosting:** Cloudflare Workers.

## Key Files & Directories

*   **`wrangler.toml`**: Cloudflare Workers configuration. Defines entry point (`src/index.js`) and static asset directory (`dist/`).
*   **`src/index.js`**: The main Worker script.
    *   Serves static assets via `env.ASSETS.fetch`.
    *   Handles `POST /api/submit` for the contact form, using the `Resend` API for emails.
*   **`generate-blog.js`**: Static site generator script.
    *   Reads CSVs from `website-main/blog/`.
    *   Downloads images referenced in CSVs.
    *   Generates `dist/blog/index.html` and individual post pages `dist/blog/[slug]/index.html`.
    *   Injects the 3 most recent posts into `dist/index.html` (Homepage).
*   **`dist/`**: The web root. Contains all static HTML, CSS, JS, and images.
*   **`website-main/blog/`**: Source of truth for blog content (CSVs).

## Development Workflow

### Git Rules (CRITICAL)

*   **Branching:** ALWAYS work on a feature branch.
    *   `git checkout -b feature/your-feature-name`
*   **Commits:** Use descriptive messages.
*   **Main:** Do NOT commit directly to `main` (unless initially syncing/setting up).

### Commands

| Command | Description |
| :--- | :--- |
| `npm run build` | Runs `node generate-blog.js` to regenerate the blog and update the homepage. |
| `npm run dev` | Builds the project and starts a local Cloudflare Workers dev server (`wrangler dev`). |
| `npm run deploy` | Builds and deploys the worker and assets to Cloudflare (`wrangler deploy`). |

### How to Make Changes

1.  **Blog Content:**
    *   Edit the CSV files in `website-main/blog/`.
    *   Run `npm run build` to regenerate HTML.
2.  **Site Structure/Design:**
    *   Edit files in `dist/` (Note: Homepage blog section is overwritten by the build script).
3.  **Backend Logic:**
    *   Edit `src/index.js`.

## Dependencies

*   **Runtime:** Node.js
*   **Package Manager:** npm
*   **Key Packages:**
    *   `wrangler`: CLI for Cloudflare Workers.
    *   `resend`: Email sending service (requires `RESEND_API_KEY` secret).

## Troubleshooting

*   **Images:** `generate-blog.js` attempts to download images from URLs in the CSV. Failures to download will cause the build to fail.
*   **Secrets:** Ensure `RESEND_API_KEY` is set in Cloudflare via `npx wrangler secret put RESEND_API_KEY` for form submissions to work.
