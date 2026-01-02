/**
 * Intelligence API handlers for competitor analysis using Firecrawl
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
 * Helper: Start a crawl job and poll until complete
 */
async function crawlAndWait(firecrawlKey, url, limit = 10) {
  // Start the crawl job
  const crawlResponse = await fetch("https://api.firecrawl.dev/v2/crawl", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${firecrawlKey}`,
    },
    body: JSON.stringify({
      url,
      limit,
      scrapeOptions: {
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
                  description: "List of services offered by this company",
                },
                locations_served: {
                  type: "array",
                  items: { type: "string" },
                  description: "Geographic areas and cities served",
                },
                unique_selling_points: {
                  type: "array",
                  items: { type: "string" },
                  description: "What makes them different from competitors",
                },
                contact_info: {
                  type: "object",
                  properties: {
                    phone: { type: "string" },
                    email: { type: "string" },
                    address: { type: "string" },
                  },
                  description: "Contact information found on site",
                },
              },
            },
            prompt:
              "Extract business information for a seawall/marine construction company",
          },
        ],
        onlyMainContent: true,
      },
    }),
  });

  const crawlData = await crawlResponse.json();

  if (!crawlData.success) {
    throw new Error(crawlData.error || "Failed to start crawl");
  }

  const jobId = crawlData.id;

  // Poll for completion
  const maxWaitTime = 120000; // 120 seconds max (v2 can take longer)
  const pollInterval = 3000; // 3 seconds between polls
  const startTime = Date.now();

  await sleep(5000); // Initial delay before first poll (v2 needs more startup time)

  while (Date.now() - startTime < maxWaitTime) {
    const statusResponse = await fetch(
      `https://api.firecrawl.dev/v2/crawl/${jobId}`,
      {
        headers: {
          Authorization: `Bearer ${firecrawlKey}`,
        },
      },
    );

    const statusData = await statusResponse.json();

    if (statusData.status === "completed") {
      // Handle potential pagination in v2
      let allData = statusData.data || [];

      // v2 may paginate results with 'next' parameter
      if (statusData.next && allData.length > 0) {
        console.log("Note: Crawl had additional pages not fetched");
      }

      return {
        success: true,
        data: allData,
        pagesCrawled: statusData.completed || allData.length || 0,
      };
    }

    if (statusData.status === "failed") {
      throw new Error(statusData.error || "Crawl job failed");
    }

    // Still in progress, wait and poll again
    await sleep(pollInterval);
  }

  // Timeout - try to get partial results
  const finalResponse = await fetch(
    `https://api.firecrawl.dev/v2/crawl/${jobId}`,
    {
      headers: {
        Authorization: `Bearer ${firecrawlKey}`,
      },
    },
  );

  const finalData = await finalResponse.json();

  // Check if we got any data despite timeout
  if (finalData.data && finalData.data.length > 0) {
    // Handle potential pagination in v2
    if (finalData.next) {
      console.log("Note: Partial crawl had additional pages not fetched");
    }

    return {
      success: true,
      data: finalData.data,
      pagesCrawled: finalData.data.length,
      partial: true,
    };
  }

  // Check for v2-specific error information
  if (finalData.error) {
    throw new Error(`Crawl failed: ${finalData.error}`);
  }

  throw new Error("Crawl timed out with no results");
}

/**
 * Helper: Combine markdown from multiple pages
 */
function combineMarkdown(pages, maxChars = 8000) {
  let combined = "";

  for (const page of pages) {
    if (!page.markdown) continue;

    const pageContent = `\n\n--- PAGE: ${page.metadata?.title || page.sourceURL || "Unknown"} ---\n${page.markdown}`;

    if (combined.length + pageContent.length > maxChars) {
      // Truncate this page to fit
      const remaining = maxChars - combined.length;
      if (remaining > 200) {
        combined += pageContent.substring(0, remaining) + "\n...[truncated]";
      }
      break;
    }

    combined += pageContent;
  }

  return combined.trim();
}

/**
 * Helper: Combine structured JSON data from multiple pages
 */
function combineStructuredData(pages) {
  const combined = {
    services: new Set(),
    locations_served: new Set(),
    unique_selling_points: new Set(),
    contact_info: {},
  };

  for (const page of pages) {
    if (page.json) {
      if (page.json.services) {
        page.json.services.forEach((s) => combined.services.add(s));
      }
      if (page.json.locations_served) {
        page.json.locations_served.forEach((l) =>
          combined.locations_served.add(l),
        );
      }
      if (page.json.unique_selling_points) {
        page.json.unique_selling_points.forEach((u) =>
          combined.unique_selling_points.add(u),
        );
      }
      if (page.json.contact_info) {
        combined.contact_info = {
          ...combined.contact_info,
          ...page.json.contact_info,
        };
      }
    }
  }

  return {
    services: [...combined.services],
    locations_served: [...combined.locations_served],
    unique_selling_points: [...combined.unique_selling_points],
    contact_info: combined.contact_info,
  };
}

/**
 * POST /api/admin/intelligence/analyze - Analyze a competitor website
 */
export async function analyzeCompetitor(c) {
  try {
    const body = await c.req.json();
    const { url, limit = 10 } = body;

    // Validate URL
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

    // Check for Firecrawl API key
    if (!c.env.FIRECRAWL_API_KEY) {
      return jsonResponse(
        { success: false, error: "Firecrawl API not configured" },
        503,
        c.req.raw,
      );
    }

    // Start crawl and wait for results
    let crawlResult;
    try {
      crawlResult = await crawlAndWait(c.env.FIRECRAWL_API_KEY, url, limit);
    } catch (crawlError) {
      console.error("Crawl error:", crawlError);
      return jsonResponse(
        { success: false, error: `Crawl failed: ${crawlError.message}` },
        500,
        c.req.raw,
      );
    }

    if (!crawlResult.data || crawlResult.data.length === 0) {
      return jsonResponse(
        { success: false, error: "No content found on the website" },
        400,
        c.req.raw,
      );
    }

    // Combine markdown from all pages
    const combinedMarkdown = combineMarkdown(crawlResult.data);

    // Extract structured data from v2 JSON extraction
    const structuredData = combineStructuredData(crawlResult.data);

    // Analyze with AI (using both structured data and markdown)
    const analysisPrompt = `Analyze this competitor's website content for a Seawall/Marine construction business in Florida.

Pre-extracted structured data from crawl:
${JSON.stringify(structuredData, null, 2)}

Additional context from page content:
${combinedMarkdown}

Based on both the structured data AND the markdown content, extract:
1. Primary keywords (what services do they emphasize?)
2. Tone of voice (professional, casual, urgent, educational?)
3. Key selling points (what do they claim makes them different?)
4. Content gaps (what topics are they NOT covering well that we could target?)
5. Geographic focus (what areas do they serve?)

Return ONLY valid JSON with no additional text:
{
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "tone": "description of their tone",
  "selling_points": ["point1", "point2", "point3"],
  "gaps": ["gap1", "gap2", "gap3"],
  "geographic_focus": ["area1", "area2"]
}`;

    let insights;
    try {
      const aiResponse = await c.env.AI.run("@cf/meta/llama-3-8b-instruct", {
        messages: [{ role: "user", content: analysisPrompt }],
        max_tokens: 1024,
      });

      // Parse AI response
      let responseText = aiResponse.response || aiResponse;
      responseText = responseText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "");

      insights = JSON.parse(responseText.trim());
    } catch (aiError) {
      console.error("AI analysis error:", aiError);
      // Store raw response if parsing fails
      insights = {
        keywords: [],
        tone: "Unable to analyze",
        selling_points: [],
        gaps: [],
        geographic_focus: [],
        raw_error: "AI analysis failed to parse",
      };
    }

    // Save to database
    const id = crypto.randomUUID();
    const name = parsedUrl.hostname.replace("www.", "");
    const now = new Date().toISOString();

    await safeDbQuery(
      c.env.DB,
      `INSERT INTO competitors (id, name, url, insights, pages_crawled, crawled_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        name,
        url,
        JSON.stringify(insights),
        crawlResult.pagesCrawled,
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
          pages_crawled: crawlResult.pagesCrawled,
          partial: crawlResult.partial || false,
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
      `SELECT id, name, url, insights, pages_crawled, crawled_at, created_at
       FROM competitors
       ORDER BY created_at DESC`,
    );

    // Parse insights JSON for each competitor
    const parsed = competitors.results.map((comp) => ({
      ...comp,
      insights: comp.insights ? JSON.parse(comp.insights) : null,
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
 * GET /api/admin/intelligence/competitors/:id - Get single competitor
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

    // Parse insights JSON
    competitor.insights = competitor.insights
      ? JSON.parse(competitor.insights)
      : null;

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
      {
        success: false,
        error: "Failed to delete competitor: " + error.message,
      },
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

    // Check for Firecrawl API key
    if (!c.env.FIRECRAWL_API_KEY) {
      return jsonResponse(
        { success: false, error: "Firecrawl API not configured" },
        503,
        c.req.raw,
      );
    }

    // Re-crawl the website
    let crawlResult;
    try {
      crawlResult = await crawlAndWait(
        c.env.FIRECRAWL_API_KEY,
        existing.url,
        limit,
      );
    } catch (crawlError) {
      console.error("Crawl error:", crawlError);
      return jsonResponse(
        { success: false, error: `Crawl failed: ${crawlError.message}` },
        500,
        c.req.raw,
      );
    }

    if (!crawlResult.data || crawlResult.data.length === 0) {
      return jsonResponse(
        { success: false, error: "No content found on the website" },
        400,
        c.req.raw,
      );
    }

    // Combine markdown from all pages
    const combinedMarkdown = combineMarkdown(crawlResult.data);

    // Extract structured data from v2 JSON extraction
    const structuredData = combineStructuredData(crawlResult.data);

    // Re-analyze with AI (using both structured data and markdown)
    const analysisPrompt = `Analyze this competitor's website content for a Seawall/Marine construction business in Florida.

Pre-extracted structured data from crawl:
${JSON.stringify(structuredData, null, 2)}

Additional context from page content:
${combinedMarkdown}

Based on both the structured data AND the markdown content, extract:
1. Primary keywords (what services do they emphasize?)
2. Tone of voice (professional, casual, urgent, educational?)
3. Key selling points (what do they claim makes them different?)
4. Content gaps (what topics are they NOT covering well that we could target?)
5. Geographic focus (what areas do they serve?)

Return ONLY valid JSON with no additional text:
{
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "tone": "description of their tone",
  "selling_points": ["point1", "point2", "point3"],
  "gaps": ["gap1", "gap2", "gap3"],
  "geographic_focus": ["area1", "area2"]
}`;

    let insights;
    try {
      const aiResponse = await c.env.AI.run("@cf/meta/llama-3-8b-instruct", {
        messages: [{ role: "user", content: analysisPrompt }],
        max_tokens: 1024,
      });

      let responseText = aiResponse.response || aiResponse;
      responseText = responseText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "");

      insights = JSON.parse(responseText.trim());
    } catch (aiError) {
      console.error("AI analysis error:", aiError);
      insights = {
        keywords: [],
        tone: "Unable to analyze",
        selling_points: [],
        gaps: [],
        geographic_focus: [],
        raw_error: "AI analysis failed to parse",
      };
    }

    // Update database
    const now = new Date().toISOString();

    await safeDbQuery(
      c.env.DB,
      `UPDATE competitors SET insights = ?, pages_crawled = ?, crawled_at = ?, updated_at = ? WHERE id = ?`,
      [JSON.stringify(insights), crawlResult.pagesCrawled, now, now, id],
    );

    return jsonResponse(
      {
        success: true,
        data: {
          id,
          name: existing.name,
          url: existing.url,
          insights,
          pages_crawled: crawlResult.pagesCrawled,
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
