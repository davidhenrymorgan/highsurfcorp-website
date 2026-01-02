/**
 * Webhook handlers for external services
 */

import { jsonResponse } from "../middleware/static.js";
import { safeDbQuery, safeDbFirst } from "../utils/db.js";

/**
 * Verify Svix webhook signature
 * @param {string} payload - Raw request body
 * @param {Object} headers - Request headers
 * @param {string} secret - Webhook secret (whsec_...)
 * @returns {Promise<boolean>}
 */
async function verifySvixSignature(payload, headers, secret) {
  try {
    const svixId = headers["svix-id"];
    const svixTimestamp = headers["svix-timestamp"];
    const svixSignature = headers["svix-signature"];

    if (!svixId || !svixTimestamp || !svixSignature) {
      console.error("Missing svix headers");
      return false;
    }

    // Check timestamp is within 5 minutes
    const timestampSeconds = parseInt(svixTimestamp, 10);
    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - timestampSeconds) > 300) {
      console.error("Svix timestamp too old or in future");
      return false;
    }

    // Build signed content
    const signedContent = `${svixId}.${svixTimestamp}.${payload}`;

    // Base64 decode the secret (remove whsec_ prefix first)
    const secretBase64 = secret.replace("whsec_", "");
    const secretBytes = Uint8Array.from(atob(secretBase64), (c) =>
      c.charCodeAt(0),
    );

    // Import key for HMAC-SHA256
    const key = await crypto.subtle.importKey(
      "raw",
      secretBytes,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );

    // Generate expected signature
    const signatureBytes = await crypto.subtle.sign(
      "HMAC",
      key,
      new TextEncoder().encode(signedContent),
    );

    // Convert to base64
    const expectedSig = btoa(
      String.fromCharCode(...new Uint8Array(signatureBytes)),
    );

    // Svix signature format: "v1,base64sig" - may have multiple signatures
    const signatures = svixSignature.split(" ");
    for (const sig of signatures) {
      const [version, providedSig] = sig.split(",");
      if (version === "v1" && providedSig === expectedSig) {
        return true;
      }
    }

    console.error("Signature mismatch");
    return false;
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
}

/**
 * Fetch full email content from Resend API
 * @param {string} emailId - Resend email ID
 * @param {string} apiKey - Resend API key
 * @returns {Promise<Object|null>}
 */
async function fetchEmailContent(emailId, apiKey) {
  try {
    const response = await fetch(
      `https://api.resend.com/emails/${emailId}/receive`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "Failed to fetch email content:",
        response.status,
        errorText,
      );
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching email content:", error);
    return null;
  }
}

/**
 * POST /api/webhooks/resend - Handle Resend webhook events
 */
export async function handleResendWebhook(c) {
  try {
    // Get raw body for signature verification
    const rawBody = await c.req.text();

    // Verify webhook signature
    if (!c.env.RESEND_WEBHOOK_SECRET) {
      console.error("RESEND_WEBHOOK_SECRET not configured");
      return jsonResponse({ error: "Webhook not configured" }, 503, c.req.raw);
    }

    const headers = {
      "svix-id": c.req.header("svix-id"),
      "svix-timestamp": c.req.header("svix-timestamp"),
      "svix-signature": c.req.header("svix-signature"),
    };

    const isValid = await verifySvixSignature(
      rawBody,
      headers,
      c.env.RESEND_WEBHOOK_SECRET,
    );

    if (!isValid) {
      console.error("Invalid webhook signature");
      return jsonResponse({ error: "Invalid signature" }, 401, c.req.raw);
    }

    // Parse webhook payload
    const payload = JSON.parse(rawBody);
    const { type, data } = payload;

    console.log("Received Resend webhook:", type, data?.email_id);

    // Handle email.received event
    if (type === "email.received") {
      const emailId = data.email_id;

      if (!emailId) {
        console.error("Missing email_id in webhook payload");
        return jsonResponse({ error: "Missing email_id" }, 400, c.req.raw);
      }

      // Fetch full email content from Resend API
      if (!c.env.RESEND_API_KEY) {
        console.error("RESEND_API_KEY not configured");
        return jsonResponse(
          { error: "API key not configured" },
          503,
          c.req.raw,
        );
      }

      const emailContent = await fetchEmailContent(
        emailId,
        c.env.RESEND_API_KEY,
      );

      if (!emailContent) {
        console.error("Failed to fetch email content for:", emailId);
        // Return 200 to prevent Resend from retrying - we'll log the error
        return jsonResponse(
          { received: true, error: "Failed to fetch content" },
          200,
          c.req.raw,
        );
      }

      // Extract email details
      const fromEmail = emailContent.from || data.from;
      const fromName = emailContent.from_name || null;
      const toEmail = emailContent.to || data.to;
      const subject = emailContent.subject || data.subject || "(No Subject)";
      const htmlBody = emailContent.html || null;
      const textBody = emailContent.text || null;
      const messageId = emailContent.message_id || emailId;
      const inReplyTo = emailContent.in_reply_to || null;

      // Try to auto-link to a lead by matching email address
      let leadId = null;
      try {
        const lead = await safeDbFirst(
          c.env.DB,
          "SELECT id FROM leads WHERE email = ?",
          [fromEmail],
        );
        if (lead) {
          leadId = lead.id;
          console.log("Auto-linked email to lead:", leadId);
        }
      } catch (dbError) {
        console.error("Error looking up lead:", dbError);
        // Continue without linking
      }

      // Generate thread_id from message_id or in_reply_to
      const threadId = inReplyTo || messageId;

      // Store email in database
      const id = crypto.randomUUID();

      try {
        await safeDbQuery(
          c.env.DB,
          `INSERT INTO emails (id, message_id, from_email, from_name, to_email, subject, html_body, text_body, thread_id, in_reply_to, direction, status, lead_id)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'inbound', 'unread', ?)`,
          [
            id,
            messageId,
            fromEmail,
            fromName,
            toEmail,
            subject,
            htmlBody,
            textBody,
            threadId,
            inReplyTo,
            leadId,
          ],
        );

        console.log("Email stored successfully:", id);
      } catch (dbError) {
        // Check if it's a duplicate (UNIQUE constraint on message_id)
        if (dbError.message?.includes("UNIQUE constraint")) {
          console.log("Duplicate email, already processed:", messageId);
          return jsonResponse(
            { received: true, duplicate: true },
            200,
            c.req.raw,
          );
        }
        throw dbError;
      }

      return jsonResponse({ received: true, id }, 200, c.req.raw);
    }

    // For other event types, just acknowledge receipt
    console.log("Unhandled webhook type:", type);
    return jsonResponse({ received: true }, 200, c.req.raw);
  } catch (error) {
    console.error("Webhook handler error:", error);
    // Return 200 to prevent infinite retries for parsing errors
    return jsonResponse(
      { received: true, error: error.message },
      200,
      c.req.raw,
    );
  }
}
