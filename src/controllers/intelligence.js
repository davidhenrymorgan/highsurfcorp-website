/**
 * Intelligence API handlers for competitor analysis using Firecrawl
 * 
 * ARCHITECTURE:
 * 1. Uses Firecrawl /extract endpoint for structured data extraction
 * 2. Falls back to /scrape for single-page analysis
 * 3. Stores raw markdown content for blog generation context
 * 4. Uses Cloudflare Workers AI for gap analysis
 */

import { jsonResponse } from "../middleware/static.js";
import { safeDbQuery, safeDbFirst } from "../utils/db.js";

/**
 * Helper: Wait for specified milliseconds
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Firecrawl Extract - Get structured data from a website
 * Uses the /extract endpoint which is purpose-built for this
 */
async function extractCompetitorData(firecrawlKey, url) {
  const schema = {
    type: "object",
    properties: {
      services: {
        type: "array",
        items: { type: "string" },
        description: "All services offered by this company",
      },
      locations_served: {
        type: "array",
        items: { type: "string" },
        description: "Geographic areas, cities, and counties they serve",
      },
      unique_selling_points: {
        type: "array",
        items: { type: "string" },
        description: "What makes them different from competitors - certifications, experience, guarantees",
      },
      keywords: {
        type: "array",
        items: { type: "string" },
        description: "Main SEO keywords this company targets",
      },
      tone: {
        type: "string",
        description: "Describe their marketing tone: professional, casual, urgent, educational, technical",
      },
      content_topics: {
        type: "array",
        items: { type: "string" },
        description: "Main topics covered on their website",
      },
    },
    required: ["services", "locations_served", "unique_selling_points"],
  };

  // Start extract job
  const extractResponse = await fetch("https://api.firecrawl.dev/v2/extract", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${firecrawlKey}`,
    },
    body: JSON.stringify({
      urls: [`${url}/*`], // Wildcard to crawl all pages
      prompt: `Extract comprehensive business information for this marine construction/seawall company. 
               Focus on: services offered, geographic coverage, certifications, insurance, 
               unique selling points, and their marketing approach.`,
      schema,
    }),
  });

  const extractData = await extractResponse.json();

  if (!extractData.success) {
    throw new Error(extractData.error || "Extract failed to start");
  }

  // If it returns immediately (sync mode), return data
  if (extractData.data && Object.keys(extractData.data).length > 0) {
    return {
      success: true,
      data: extractData.data,
      source: "extract-sync",
    };
  }

  // Poll for async completion
  const jobId = extractData.id;
  if (!jobId) {
    throw new Error("No job ID returned from extract");
  }

  const maxWaitTime = 90000; // 90 seconds
  const pollInterval = 3000;
  const startTime = Date.now();

  await sleep(3000); // Initial wait

  while (Date.now() - startTime < maxWaitTime) {
    const statusResponse = await fetch(
      `https://api.firecrawl.dev/v2/extract/${jobId}`,
      {
        headers: {
          Authorization: `Bearer ${firecrawlKey}`,
        },
      },
    );

    const statusData = await statusResponse.json();

    if (statusData.status === "completed") {
      return {
        success: true,
        data: statusData.data || {},
        source: "extract-async",
      };
    }

    if (statusData.status === "failed") {
      throw new Error(statusData.error || "Extract job failed");
    }

    await sleep(pollInterval);
  }

  throw new Error("Extract timed out");
}

/**
 * Firecrawl Scrape - Get content from single page with structured extraction
 * Used as fallback or for specific page analysis
 */
async function scrapeWithStructuredData(firecrawlKey, url) {
  const response = await fetch("https://api.firecrawl.dev/v2/scrape", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${firecrawlKey}`,
    },
    body: JSON.stringify({
      url,
      formats: [
        "markdown",
        {
          type: "json",
          schema: {
            type: "object",
            properties: {
              services: {
                type: "array",
                items: { type: "string" },
                description: "Services offered",
              },
              locations_served: {
                type: "array",
                items: { type: "string" },
                description: "Geographic areas served",
              },
              unique_selling_points: {
                type: "array",
                items: { type: "string" },
                description: "What makes them different",
              },
            },
          },
          prompt: "Extract business information for a seawall/marine construction company",
        },
      ],
      onlyMainContent: true,
    }),
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || "Scrape failed");
  }

  return {
    success: true,
    markdown: data.markdown || "",
    json: data.json || {},
    metadata: data.metadata || {},
    source: "scrape",
  };
}

/**
 * Map website to discover all URLs
 */
async function mapWebsite(firecrawlKey, url) {
  const response = await fetch("https://api.firecrawl.dev/v2/map", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${firecrawlKey}`,
    },
    body: JSON.stringify({
      url,
      limit: 50,
    }),
  });

  const data = await response.json();
  return data.success ? data.links || [] : [];
}

/**
 * Batch scrape multiple URLs
 */
async function batchScrapePages(firecrawlKey, urls, maxPages = 10) {
  const pagesToScrape = urls.slice(0, maxPages);
  const results = [];

  for (const pageUrl of pagesToScrape) {
    try {
      const result = await scrapeWithStructuredData(firecrawlKey, pageUrl);
      results.push(result);
      await sleep(500); // Rate limiting
    } catch (err) {
      console.warn(`Failed to scrape ${pageUrl}:`, err.message);
    }
  }

  return results;
}

/**
 * Combine scraped data from multiple pages
 */
function combineScrapedData(results) {
  const combined = {
    services: new Set(),
    locations_served: new Set(),
    unique_selling_points: new Set(),
  };

  let combinedMarkdown = "";

  for (const result of results) {
    // Combine structured JSON data
    if (result.json) {
      if (result.json.services) {
        result.json.services.forEach((s) => combined.services.add(s));
      }
      if (result.json.locations_served) {
        result.json.locations_served.forEach((l) => combined.locations_served.add(l));
      }
      if (result.json.unique_selling_points) {
        result.json.unique_selling_points.forEach((u) => combined.unique_selling_points.add(u));
      }
    }

    // Combine markdown (limit total size)
    if (result.markdown && combinedMarkdown.length < 15000) {
      const pageTitle = result.metadata?.title || result.metadata?.sourceURL || "Page";
      combinedMarkdown += `\n\n--- ${pageTitle} ---\n${result.markdown}`;
    }
  }

  return {
    structuredData: {
      services: [...combined.services],
      locations_served: [...combined.locations_served],
      unique_selling_points: [...combined.unique_selling_points],
    },
    markdown: combinedMarkdown.trim().substring(0, 20000), // Cap at 20k chars
    pagesCrawled: results.length,
  };
}

/**
 * Analyze competitor data with AI to find gaps and opportunities
 */
async function analyzeWithAI(env, structuredData, markdown) {
  const prompt = `You are analyzing a competitor's website for a seawall/marine construction company in Florida.

EXTRACTED STRUCTURED DATA:
${JSON.stringify(structuredData, null, 2)}

WEBSITE CONTENT SAMPLE:
${markdown.substring(0, 6000)}

Based on this data, analyze and return ONLY valid JSON (no markdown, no explanation):

{
  "keywords": ["list", "of", "primary", "keywords", "they", "target"],
  "tone": "describe their marketing tone in 2-3 words",
  "selling_points": ["their", "key", "differentiators"],
  "gaps": ["content", "topics", "they", "dont", "cover", "well"],
  "geographic_focus": ["areas", "they", "serve"]
}

Focus on identifying content gaps that represent opportunities for our business to differentiate.`;

  try {
    const aiResponse = await env.AI.run("@cf/meta/llama-3-8b-instruct", {
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1024,
    });

    let responseText = aiResponse.response || aiResponse;
    
    // Clean up common AI response issues
    responseText = responseText
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .replace(/^[^{]*/, "") // Remove anything before first {
      .replace(/[^}]*$/, ""); // Remove anything after last }

    // Find JSON object in response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in AI response");
    }

    return JSON.parse(jsonMatch[0]);
  } catch (aiError) {
    console.error("AI analysis error:", aiError);
    
    // Fallback: Generate basic insights from structured data
    return {
      keywords: structuredData.services?.slice(0, 5) || [],
      tone: "Professional",
      selling_points: structuredData.unique_selling_points?.slice(0, 5) || [],
      gaps: [
        "Technical specifications not detailed",
        "Customer testimonials could be expanded",
        "Educational content about materials",
      ],
      geographic_focus: structuredData.locations_served?.slice(0, 5) || [],
      _fallback: true,
    };
  }
}

/**
 * POST /api/admin/intelligence/analyze - Analyze a competitor website
 */
export async function analyzeCompetitor(c) {
  try {
    const body = await c.req.json();
    const { url, limit = 10 } = body;

    if (!url) {
      return jsonResponse(
        { success: false, error: "Missing required field: url" },
        400,
        c.req.raw,
      );
    }

    let parsedUrl;
    try {
      parsedUrl = new URL(url);
    } catch {
      return jsonResponse(
        { success: false, error: "Invalid URL format" },
        400,
        c.req.raw,
      );
    }

    // Check if competitor already exists
    const existing = await safeDbFirst(
      c.env.DB,
      "SELECT id, name FROM competitors WHERE url = ?",
      [url],
    );

    if (existing) {
      return jsonResponse(
        {
          success: false,
          error: `Competitor "${existing.name}" already exists. Use refresh to update.`,
          existing_id: existing.id,
        },
        409,
        c.req.raw,
      );
    }

    if (!c.env.FIRECRAWL_API_KEY) {
      return jsonResponse(
        { success: false, error: "Firecrawl API not configured" },
        503,
        c.req.raw,
      );
    }

    let extractedData = null;
    let markdown = "";
    let pagesCrawled = 0;

    // Strategy 1: Try /extract endpoint first (best for structured data)
    try {
      console.log("Attempting Firecrawl /extract...");
      const extractResult = await extractCompetitorData(c.env.FIRECRAWL_API_KEY, url);
      extractedData = extractResult.data;
      pagesCrawled = 1; // Extract counts as analyzing whole site
      console.log("Extract successful:", extractResult.source);
    } catch (extractError) {
      console.warn("Extract failed, falling back to map+scrape:", extractError.message);
    }

    // Strategy 2: Fallback to map + scrape
    if (!extractedData || Object.keys(extractedData).length === 0) {
      try {
        console.log("Mapping website...");
        const siteUrls = await mapWebsite(c.env.FIRECRAWL_API_KEY, url);
        
        const urlsToScrape = siteUrls.length > 0 
          ? siteUrls 
          : [url]; // At minimum scrape the provided URL

        console.log(`Scraping ${Math.min(urlsToScrape.length, limit)} pages...`);
        const scrapeResults = await batchScrapePages(c.env.FIRECRAWL_API_KEY, urlsToScrape, limit);
        
        const combined = combineScrapedData(scrapeResults);
        extractedData = combined.structuredData;
        markdown = combined.markdown;
        pagesCrawled = combined.pagesCrawled;
      } catch (scrapeError) {
        console.error("Scrape fallback failed:", scrapeError);
        return jsonResponse(
          { success: false, error: `Failed to analyze website: ${scrapeError.message}` },
          500,
          c.req.raw,
        );
      }
    }

    // Analyze with AI to find gaps and opportunities
    const insights = await analyzeWithAI(c.env, extractedData, markdown);

    // Save to database
    const id = crypto.randomUUID();
    const name = parsedUrl.hostname.replace("www.", "");
    const now = new Date().toISOString();

    await safeDbQuery(
      c.env.DB,
      `INSERT INTO competitors (id, name, url, insights, structured_data, raw_content, pages_crawled, crawled_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        name,
        url,
        JSON.stringify(insights),
        JSON.stringify(extractedData),
        markdown.substring(0, 50000), // Store up to 50k chars of markdown
        pagesCrawled,
        now,
        now,
        now,
      ],
    );

    return jsonResponse(
      {
        success: true,
        data: {
          id,
          name,
          url,
          insights,
          structured_data: extractedData,
          pages_crawled: pagesCrawled,
          has_content: markdown.length > 0,
        },
      },
      201,
      c.req.raw,
    );
  } catch (error) {
    console.error("Analyze competitor error:", error);
    return jsonResponse(
      { success: false, error: "Analysis failed: " + error.message },
      500,
      c.req.raw,
    );
  }
}

/**
 * GET /api/admin/intelligence/competitors - List all competitors
 */
export async function getCompetitors(c) {
  try {
    const competitors = await safeDbQuery(
      c.env.DB,
      `SELECT id, name, url, insights, structured_data, pages_crawled, crawled_at, created_at,
              CASE WHEN raw_content IS NOT NULL AND length(raw_content) > 0 THEN 1 ELSE 0 END as has_content
       FROM competitors
       ORDER BY created_at DESC`,
    );

    const parsed = competitors.results.map((comp) => ({
      ...comp,
      insights: comp.insights ? JSON.parse(comp.insights) : null,
      structured_data: comp.structured_data ? JSON.parse(comp.structured_data) : null,
    }));

    return jsonResponse(
      {
        success: true,
        data: parsed,
        count: parsed.length,
      },
      200,
      c.req.raw,
    );
  } catch (error) {
    console.error("Get competitors error:", error);
    return jsonResponse(
      { success: false, error: "Failed to fetch competitors" },
      500,
      c.req.raw,
    );
  }
}

/**
 * GET /api/admin/intelligence/competitors/:id - Get single competitor with full content
 */
export async function getCompetitor(c) {
  try {
    const id = c.req.param("id");

    if (!id) {
      return jsonResponse(
        { success: false, error: "Missing competitor ID" },
        400,
        c.req.raw,
      );
    }

    const competitor = await safeDbFirst(
      c.env.DB,
      "SELECT * FROM competitors WHERE id = ?",
      [id],
    );

    if (!competitor) {
      return jsonResponse(
        { success: false, error: "Competitor not found" },
        404,
        c.req.raw,
      );
    }

    competitor.insights = competitor.insights ? JSON.parse(competitor.insights) : null;
    competitor.structured_data = competitor.structured_data ? JSON.parse(competitor.structured_data) : null;

    return jsonResponse({ success: true, data: competitor }, 200, c.req.raw);
  } catch (error) {
    console.error("Get competitor error:", error);
    return jsonResponse(
      { success: false, error: "Failed to fetch competitor" },
      500,
      c.req.raw,
    );
  }
}

/**
 * GET /api/admin/intelligence/competitors/:id/content - Get raw content for blog generation
 */
export async function getCompetitorContent(c) {
  try {
    const id = c.req.param("id");

    if (!id) {
      return jsonResponse(
        { success: false, error: "Missing competitor ID" },
        400,
        c.req.raw,
      );
    }

    const competitor = await safeDbFirst(
      c.env.DB,
      "SELECT name, url, raw_content, structured_data FROM competitors WHERE id = ?",
      [id],
    );

    if (!competitor) {
      return jsonResponse(
        { success: false, error: "Competitor not found" },
        404,
        c.req.raw,
      );
    }

    return jsonResponse({
      success: true,
      data: {
        name: competitor.name,
        url: competitor.url,
        content: competitor.raw_content || "",
        structured_data: competitor.structured_data ? JSON.parse(competitor.structured_data) : null,
      },
    }, 200, c.req.raw);
  } catch (error) {
    console.error("Get competitor content error:", error);
    return jsonResponse(
      { success: false, error: "Failed to fetch content" },
      500,
      c.req.raw,
    );
  }
}

/**
 * DELETE /api/admin/intelligence/competitors/:id - Delete a competitor
 */
export async function deleteCompetitor(c) {
  try {
    const id = c.req.param("id");

    if (!id) {
      return jsonResponse(
        { success: false, error: "Missing competitor ID" },
        400,
        c.req.raw,
      );
    }

    const existing = await safeDbFirst(
      c.env.DB,
      "SELECT id, name FROM competitors WHERE id = ?",
      [id],
    );

    if (!existing) {
      return jsonResponse(
        { success: false, error: "Competitor not found" },
        404,
        c.req.raw,
      );
    }

    await safeDbQuery(c.env.DB, "DELETE FROM competitors WHERE id = ?", [id]);

    return jsonResponse(
      {
        success: true,
        message: "Competitor deleted successfully",
        deleted: { id: existing.id, name: existing.name },
      },
      200,
      c.req.raw,
    );
  } catch (error) {
    console.error("Delete competitor error:", error);
    return jsonResponse(
      { success: false, error: "Failed to delete competitor: " + error.message },
      500,
      c.req.raw,
    );
  }
}

/**
 * POST /api/admin/intelligence/competitors/:id/refresh - Re-analyze a competitor
 */
export async function refreshCompetitor(c) {
  try {
    const id = c.req.param("id");
    const body = await c.req.json().catch(() => ({}));
    const limit = body.limit || 10;

    if (!id) {
      return jsonResponse(
        { success: false, error: "Missing competitor ID" },
        400,
        c.req.raw,
      );
    }

    const existing = await safeDbFirst(
      c.env.DB,
      "SELECT * FROM competitors WHERE id = ?",
      [id],
    );

    if (!existing) {
      return jsonResponse(
        { success: false, error: "Competitor not found" },
        404,
        c.req.raw,
      );
    }

    if (!c.env.FIRECRAWL_API_KEY) {
      return jsonResponse(
        { success: false, error: "Firecrawl API not configured" },
        503,
        c.req.raw,
      );
    }

    let extractedData = null;
    let markdown = "";
    let pagesCrawled = 0;

    // Try extract first, then fallback
    try {
      const extractResult = await extractCompetitorData(c.env.FIRECRAWL_API_KEY, existing.url);
      extractedData = extractResult.data;
      pagesCrawled = 1;
    } catch (extractError) {
      console.warn("Extract failed on refresh:", extractError.message);
    }

    if (!extractedData || Object.keys(extractedData).length === 0) {
      const siteUrls = await mapWebsite(c.env.FIRECRAWL_API_KEY, existing.url);
      const urlsToScrape = siteUrls.length > 0 ? siteUrls : [existing.url];
      const scrapeResults = await batchScrapePages(c.env.FIRECRAWL_API_KEY, urlsToScrape, limit);
      const combined = combineScrapedData(scrapeResults);
      extractedData = combined.structuredData;
      markdown = combined.markdown;
      pagesCrawled = combined.pagesCrawled;
    }

    const insights = await analyzeWithAI(c.env, extractedData, markdown);
    const now = new Date().toISOString();

    await safeDbQuery(
      c.env.DB,
      `UPDATE competitors 
       SET insights = ?, structured_data = ?, raw_content = ?, pages_crawled = ?, crawled_at = ?, updated_at = ? 
       WHERE id = ?`,
      [
        JSON.stringify(insights),
        JSON.stringify(extractedData),
        markdown.substring(0, 50000),
        pagesCrawled,
        now,
        now,
        id,
      ],
    );

    return jsonResponse(
      {
        success: true,
        data: {
          id,
          name: existing.name,
          url: existing.url,
          insights,
          structured_data: extractedData,
          pages_crawled: pagesCrawled,
          crawled_at: now,
        },
      },
      200,
      c.req.raw,
    );
  } catch (error) {
    console.error("Refresh competitor error:", error);
    return jsonResponse(
      { success: false, error: "Refresh failed: " + error.message },
      500,
      c.req.raw,
    );
  }
}
