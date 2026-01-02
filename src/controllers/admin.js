/**
 * Admin API handlers for AI content generation and blog post management
 */

import { jsonResponse } from "../middleware/static.js";
import { slugify } from "../utils/helpers.js";
import { safeDbQuery, safeDbFirst } from "../utils/db.js";

/**
 * POST /api/admin/generate - Generate blog post structure using AI
 */
export async function generateBlogPost(c) {
  try {
    // Parse request body
    const body = await c.req.json();
    const { topic, keywords, tone = "professional" } = body;

    // Validate required fields
    if (!topic) {
      return jsonResponse(
        { success: false, error: "Missing required field: topic" },
        400,
        c.req.raw,
      );
    }

    // Build AI prompt
    const systemPrompt = `You are an expert SEO content writer for a seawall construction company in Florida specializing in coquina, granite, and limestone seawalls. Output ONLY valid JSON with no additional text or markdown formatting.`;

    const userPrompt = `Generate a blog post structure for the topic "${topic}"${keywords ? ` targeting keywords: ${keywords}` : ""}. Tone: ${tone}.

Required JSON output structure:
{
  "title": "SEO Optimized Title (50-60 chars)",
  "slug": "seo-optimized-slug",
  "meta_description": "Compelling meta description (150-160 chars)",
  "outline": [
    { "heading": "H2 Heading", "content_points": ["key point 1", "key point 2", "key point 3"] }
  ]
}

Include 3-5 outline sections relevant to seawall construction in Brevard County, Florida.`;

    // Call Workers AI
    const aiResponse = await c.env.AI.run("@cf/meta/llama-3-8b-instruct", {
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 1024,
    });

    // Parse AI response
    let generatedContent;
    try {
      // Extract JSON from response (AI might include markdown code blocks)
      let responseText = aiResponse.response || aiResponse;

      // Remove markdown code blocks if present
      responseText = responseText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "");

      generatedContent = JSON.parse(responseText.trim());

      // Ensure slug is properly formatted
      if (generatedContent.slug) {
        generatedContent.slug = slugify(generatedContent.slug);
      } else if (generatedContent.title) {
        generatedContent.slug = slugify(generatedContent.title);
      }
    } catch (parseError) {
      console.error("AI response parse error:", parseError, aiResponse);
      return jsonResponse(
        {
          success: false,
          error: "Failed to parse AI response",
          raw_response: aiResponse.response || aiResponse,
        },
        500,
        c.req.raw,
      );
    }

    return jsonResponse(
      {
        success: true,
        data: generatedContent,
        input: { topic, keywords, tone },
      },
      200,
      c.req.raw,
    );
  } catch (error) {
    console.error("AI generation error:", error);
    return jsonResponse(
      {
        success: false,
        error: "AI generation failed: " + error.message,
      },
      500,
      c.req.raw,
    );
  }
}

// ============================================================================
// CRUD OPERATIONS FOR BLOG POSTS
// ============================================================================

/**
 * GET /api/admin/posts - List all posts
 */
export async function getAdminPosts(c) {
  try {
    const posts = await safeDbQuery(
      c.env.DB,
      `SELECT id, title, slug, category, short_tag, featured, draft, archived, published_at, created_at, updated_at
       FROM posts
       ORDER BY created_at DESC`,
    );

    return jsonResponse(
      {
        success: true,
        data: posts.results,
        count: posts.results.length,
      },
      200,
      c.req.raw,
    );
  } catch (error) {
    console.error("Get posts error:", error);
    return jsonResponse(
      { success: false, error: "Failed to fetch posts" },
      500,
      c.req.raw,
    );
  }
}

/**
 * GET /api/admin/posts/:id - Get single post by ID or slug
 */
export async function getAdminPost(c) {
  try {
    const identifier = c.req.param("id");

    if (!identifier) {
      return jsonResponse(
        { success: false, error: "Missing post ID or slug" },
        400,
        c.req.raw,
      );
    }

    // Try to find by ID first, then by slug
    let post = await safeDbFirst(c.env.DB, "SELECT * FROM posts WHERE id = ?", [
      identifier,
    ]);

    if (!post) {
      post = await safeDbFirst(c.env.DB, "SELECT * FROM posts WHERE slug = ?", [
        identifier,
      ]);
    }

    if (!post) {
      return jsonResponse(
        { success: false, error: "Post not found" },
        404,
        c.req.raw,
      );
    }

    return jsonResponse({ success: true, data: post }, 200, c.req.raw);
  } catch (error) {
    console.error("Get post error:", error);
    return jsonResponse(
      { success: false, error: "Failed to fetch post" },
      500,
      c.req.raw,
    );
  }
}

/**
 * Generate a unique slug by appending -2, -3, etc. if needed
 */
async function generateUniqueSlug(db, baseSlug, excludeId = null) {
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const query = excludeId
      ? "SELECT id FROM posts WHERE slug = ? AND id != ?"
      : "SELECT id FROM posts WHERE slug = ?";
    const params = excludeId ? [slug, excludeId] : [slug];

    const existing = await safeDbFirst(db, query, params);

    if (!existing) {
      return slug;
    }

    counter++;
    slug = `${baseSlug}-${counter}`;
  }
}

/**
 * POST /api/admin/posts - Create or update a post
 */
export async function upsertPost(c) {
  try {
    const body = await c.req.json();
    const {
      id,
      title,
      slug,
      body: postBody,
      meta_description,
      category,
      short_tag,
      hero_image,
      hero_image_url,
      thumbnail_image,
      featured = 0,
      draft = 1,
      archived = 0,
      short_preview,
      introduction,
      seo_description,
      published_at,
    } = body;

    // Validate required fields
    if (!title) {
      return jsonResponse(
        { success: false, error: "Missing required field: title" },
        400,
        c.req.raw,
      );
    }

    const now = new Date().toISOString();

    // Generate slug from title if not provided
    let finalSlug = slug ? slugify(slug) : slugify(title);

    if (id) {
      // UPDATE existing post
      const existingPost = await safeDbFirst(
        c.env.DB,
        "SELECT * FROM posts WHERE id = ?",
        [id],
      );

      if (!existingPost) {
        return jsonResponse(
          { success: false, error: "Post not found" },
          404,
          c.req.raw,
        );
      }

      // Generate unique slug if changed
      if (finalSlug !== existingPost.slug) {
        finalSlug = await generateUniqueSlug(c.env.DB, finalSlug, id);
      }

      await safeDbQuery(
        c.env.DB,
        `UPDATE posts SET
          title = ?,
          slug = ?,
          body = ?,
          meta_description = ?,
          category = ?,
          short_tag = ?,
          hero_image = ?,
          hero_image_url = ?,
          thumbnail_image = ?,
          featured = ?,
          draft = ?,
          archived = ?,
          short_preview = ?,
          introduction = ?,
          seo_description = ?,
          published_at = ?,
          updated_at = ?
        WHERE id = ?`,
        [
          title,
          finalSlug,
          postBody || existingPost.body,
          meta_description || existingPost.meta_description,
          category || existingPost.category,
          short_tag || existingPost.short_tag,
          hero_image || existingPost.hero_image,
          hero_image_url || existingPost.hero_image_url,
          thumbnail_image || existingPost.thumbnail_image,
          featured ? 1 : 0,
          draft ? 1 : 0,
          archived ? 1 : 0,
          short_preview || existingPost.short_preview,
          introduction || existingPost.introduction,
          seo_description || existingPost.seo_description,
          published_at || existingPost.published_at,
          now,
          id,
        ],
      );

      // Fetch updated post
      const updatedPost = await safeDbFirst(
        c.env.DB,
        "SELECT * FROM posts WHERE id = ?",
        [id],
      );

      return jsonResponse(
        {
          success: true,
          message: "Post updated successfully",
          data: updatedPost,
        },
        200,
        c.req.raw,
      );
    } else {
      // INSERT new post
      const newId = crypto.randomUUID();

      // Generate unique slug
      finalSlug = await generateUniqueSlug(c.env.DB, finalSlug);

      await safeDbQuery(
        c.env.DB,
        `INSERT INTO posts (
          id, title, slug, body, meta_description, category, short_tag,
          hero_image, hero_image_url, thumbnail_image, featured, draft, archived,
          short_preview, introduction, seo_description, published_at, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          newId,
          title,
          finalSlug,
          postBody || "",
          meta_description || "",
          category || "",
          short_tag || "",
          hero_image || "",
          hero_image_url || "",
          thumbnail_image || "",
          featured ? 1 : 0,
          draft ? 1 : 0,
          archived ? 1 : 0,
          short_preview || "",
          introduction || "",
          seo_description || "",
          published_at || now,
          now,
          now,
        ],
      );

      // Fetch created post
      const newPost = await safeDbFirst(
        c.env.DB,
        "SELECT * FROM posts WHERE id = ?",
        [newId],
      );

      return jsonResponse(
        {
          success: true,
          message: "Post created successfully",
          data: newPost,
        },
        201,
        c.req.raw,
      );
    }
  } catch (error) {
    console.error("Upsert post error:", error);
    return jsonResponse(
      { success: false, error: "Failed to save post: " + error.message },
      500,
      c.req.raw,
    );
  }
}

/**
 * DELETE /api/admin/posts/:id - Delete a post
 */
export async function deletePost(c) {
  try {
    const id = c.req.param("id");

    if (!id) {
      return jsonResponse(
        { success: false, error: "Missing post ID" },
        400,
        c.req.raw,
      );
    }

    // Check if post exists
    const existingPost = await safeDbFirst(
      c.env.DB,
      "SELECT id, title, slug FROM posts WHERE id = ?",
      [id],
    );

    if (!existingPost) {
      return jsonResponse(
        { success: false, error: "Post not found" },
        404,
        c.req.raw,
      );
    }

    // Delete the post
    await safeDbQuery(c.env.DB, "DELETE FROM posts WHERE id = ?", [id]);

    return jsonResponse(
      {
        success: true,
        message: "Post deleted successfully",
        deleted: {
          id: existingPost.id,
          title: existingPost.title,
          slug: existingPost.slug,
        },
      },
      200,
      c.req.raw,
    );
  } catch (error) {
    console.error("Delete post error:", error);
    return jsonResponse(
      { success: false, error: "Failed to delete post: " + error.message },
      500,
      c.req.raw,
    );
  }
}
