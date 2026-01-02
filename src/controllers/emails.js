/**
 * Email management controller for admin API
 */

import { jsonResponse } from "../middleware/static.js";
import { safeDbQuery, safeDbFirst } from "../utils/db.js";

/**
 * GET /api/admin/emails - List emails with pagination
 */
export async function listEmails(c) {
  try {
    const url = new URL(c.req.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "20", 10);
    const status = url.searchParams.get("status"); // optional filter

    const offset = (page - 1) * limit;

    // Build query with optional status filter
    let query = "SELECT * FROM emails";
    let countQuery = "SELECT COUNT(*) as total FROM emails";
    const params = [];
    const countParams = [];

    if (status) {
      query += " WHERE status = ?";
      countQuery += " WHERE status = ?";
      params.push(status);
      countParams.push(status);
    }

    query += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const [emailsResult, countResult] = await Promise.all([
      safeDbQuery(c.env.DB, query, params),
      safeDbQuery(c.env.DB, countQuery, countParams),
    ]);

    const total = countResult.results[0]?.total || 0;
    const unreadCount = await safeDbFirst(
      c.env.DB,
      "SELECT COUNT(*) as count FROM emails WHERE status = 'unread'",
    );

    return jsonResponse(
      {
        success: true,
        data: emailsResult.results,
        total,
        page,
        limit,
        unreadCount: unreadCount?.count || 0,
      },
      200,
      c.req.raw,
    );
  } catch (error) {
    console.error("List emails error:", error);
    return jsonResponse(
      { success: false, error: "Failed to fetch emails" },
      500,
      c.req.raw,
    );
  }
}

/**
 * GET /api/admin/emails/:id - Get single email
 */
export async function getEmail(c) {
  try {
    const id = c.req.param("id");

    if (!id) {
      return jsonResponse(
        { success: false, error: "Missing email ID" },
        400,
        c.req.raw,
      );
    }

    const email = await safeDbFirst(
      c.env.DB,
      "SELECT * FROM emails WHERE id = ?",
      [id],
    );

    if (!email) {
      return jsonResponse(
        { success: false, error: "Email not found" },
        404,
        c.req.raw,
      );
    }

    return jsonResponse({ success: true, data: email }, 200, c.req.raw);
  } catch (error) {
    console.error("Get email error:", error);
    return jsonResponse(
      { success: false, error: "Failed to fetch email" },
      500,
      c.req.raw,
    );
  }
}

/**
 * POST /api/admin/emails/send - Send email reply
 */
export async function sendEmail(c) {
  try {
    const body = await c.req.json();
    const { to, subject, html, replyToEmailId } = body;

    // Validate required fields
    if (!to || !subject || !html) {
      return jsonResponse(
        { success: false, error: "Missing required fields: to, subject, html" },
        400,
        c.req.raw,
      );
    }

    if (!c.env.RESEND_API_KEY) {
      return jsonResponse(
        { success: false, error: "Email service not configured" },
        503,
        c.req.raw,
      );
    }

    // Build email payload
    const emailPayload = {
      from: "High Surf Corp <crew@send.highsurfcorp.com>",
      to: [to],
      subject,
      html,
    };

    // If replying to an email, add threading headers
    let originalEmail = null;
    if (replyToEmailId) {
      originalEmail = await safeDbFirst(
        c.env.DB,
        "SELECT message_id, thread_id FROM emails WHERE id = ?",
        [replyToEmailId],
      );

      if (originalEmail && originalEmail.message_id) {
        emailPayload.headers = {
          "In-Reply-To": originalEmail.message_id,
          References: originalEmail.thread_id || originalEmail.message_id,
        };
      }
    }

    // Send via Resend API
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${c.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Resend API error:", errorText);
      return jsonResponse(
        { success: false, error: "Failed to send email" },
        500,
        c.req.raw,
      );
    }

    const resendData = await response.json();
    console.log("Email sent via Resend:", resendData.id);

    // Store sent email in database
    const id = crypto.randomUUID();
    const messageId = resendData.id;
    const threadId = originalEmail?.thread_id || messageId;

    await safeDbQuery(
      c.env.DB,
      `INSERT INTO emails (id, message_id, from_email, to_email, subject, html_body, thread_id, in_reply_to, direction, status, lead_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'outbound', 'sent', ?)`,
      [
        id,
        messageId,
        "crew@send.highsurfcorp.com",
        to,
        subject,
        html,
        threadId,
        originalEmail?.message_id || null,
        null, // lead_id can be linked later
      ],
    );

    // If replying, mark original email as replied
    if (replyToEmailId) {
      await safeDbQuery(
        c.env.DB,
        "UPDATE emails SET status = 'replied' WHERE id = ?",
        [replyToEmailId],
      );
    }

    return jsonResponse(
      {
        success: true,
        message: "Email sent successfully",
        data: { id, messageId },
      },
      200,
      c.req.raw,
    );
  } catch (error) {
    console.error("Send email error:", error);
    return jsonResponse(
      { success: false, error: "Failed to send email" },
      500,
      c.req.raw,
    );
  }
}

/**
 * PATCH /api/admin/emails/:id - Update email status
 */
export async function updateEmail(c) {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const { status } = body;

    if (!id) {
      return jsonResponse(
        { success: false, error: "Missing email ID" },
        400,
        c.req.raw,
      );
    }

    if (!status) {
      return jsonResponse(
        { success: false, error: "Missing status field" },
        400,
        c.req.raw,
      );
    }

    // Validate status value
    const validStatuses = ["unread", "read", "replied"];
    if (!validStatuses.includes(status)) {
      return jsonResponse(
        {
          success: false,
          error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
        },
        400,
        c.req.raw,
      );
    }

    // Check email exists
    const email = await safeDbFirst(
      c.env.DB,
      "SELECT id FROM emails WHERE id = ?",
      [id],
    );

    if (!email) {
      return jsonResponse(
        { success: false, error: "Email not found" },
        404,
        c.req.raw,
      );
    }

    // Update status
    await safeDbQuery(c.env.DB, "UPDATE emails SET status = ? WHERE id = ?", [
      status,
      id,
    ]);

    return jsonResponse(
      { success: true, message: "Email status updated" },
      200,
      c.req.raw,
    );
  } catch (error) {
    console.error("Update email error:", error);
    return jsonResponse(
      { success: false, error: "Failed to update email" },
      500,
      c.req.raw,
    );
  }
}
