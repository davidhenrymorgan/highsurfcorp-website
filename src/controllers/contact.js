/**
 * Contact form handler
 */

import { escapeHtml } from "../utils/helpers.js";
import { jsonResponse } from "../middleware/static.js";

/**
 * POST /api/contact - Handle contact form submission
 */
export async function postContact(c) {
  try {
    // Parse form data
    const formData = await c.req.formData();
    const name = formData.get("name");
    const zip = formData.get("zip") || "";
    const email = formData.get("email");
    const phone = formData.get("phone");
    const budget = formData.get("budget") || "";
    const message = formData.get("message") || "";
    const turnstileToken = formData.get("cf-turnstile-response");

    // Validate required fields
    if (!name || !email || !phone) {
      return jsonResponse(
        {
          success: false,
          error: "Please fill in all required fields (Name, Email, Phone)",
        },
        400,
        c.req.raw,
      );
    }

    // Verify Turnstile Token (if secret is configured)
    if (c.env.TURNSTILE_SECRET_KEY) {
      if (!turnstileToken) {
        return jsonResponse(
          { success: false, error: "Missing security check token" },
          400,
          c.req.raw,
        );
      }

      const turnstileVerify = await fetch(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            secret: c.env.TURNSTILE_SECRET_KEY,
            response: turnstileToken,
            remoteip: c.req.header("CF-Connecting-IP"),
          }),
        },
      );

      const turnstileOutcome = await turnstileVerify.json();
      if (!turnstileOutcome.success) {
        console.error("Turnstile failure:", turnstileOutcome);
        return jsonResponse(
          {
            success: false,
            error: "Security check failed. Please refresh and try again.",
          },
          400,
          c.req.raw,
        );
      }
    } else {
      console.warn("TURNSTILE_SECRET_KEY not set - skipping security check");
    }

    // Basic email validation
    if (!email.includes("@")) {
      return jsonResponse(
        { success: false, error: "Please enter a valid email address" },
        400,
        c.req.raw,
      );
    }

    // Format budget for display
    const budgetDisplay = budget
      ? {
          "10-20k": "$10k - $20k",
          "50-100k": "$50k - $100k",
          "100k+": "$100k+",
        }[budget] || budget
      : "";

    // Format email HTML
    const emailHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #000; color: #fff; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
          .field { margin-bottom: 20px; }
          .label { font-weight: 600; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px; }
          .value { font-size: 16px; color: #111827; }
          .budget { display: inline-block; background: #10b981; color: white; padding: 8px 16px; border-radius: 6px; font-weight: 600; }
          .footer { background: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 8px 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2 style="margin: 0; font-size: 20px;">New Contact Form Submission</h2>
          </div>

          <div class="content">
            <div class="field">
              <div class="label">Name</div>
              <div class="value">${escapeHtml(name)}</div>
            </div>

            <div class="field">
              <div class="label">Email</div>
              <div class="value"><a href="mailto:${escapeHtml(email)}" style="color: #2563eb;">${escapeHtml(email)}</a></div>
            </div>

            <div class="field">
              <div class="label">Phone</div>
              <div class="value"><a href="tel:${escapeHtml(phone)}" style="color: #2563eb;">${escapeHtml(phone)}</a></div>
            </div>

            ${
              zip
                ? `
            <div class="field">
              <div class="label">Zip Code</div>
              <div class="value">${escapeHtml(zip)}</div>
            </div>
            `
                : ""
            }

            ${
              budgetDisplay
                ? `
            <div class="field">
              <div class="label">Project Budget</div>
              <div class="value"><span class="budget">${escapeHtml(budgetDisplay)}</span></div>
            </div>
            `
                : ""
            }

            ${
              message
                ? `
            <div class="field">
              <div class="label">Message</div>
              <div class="value" style="white-space: pre-wrap;">${escapeHtml(message)}</div>
            </div>
            `
                : ""
            }
          </div>

          <div class="footer">
            Submitted from: <strong>Homepage Contact Form</strong><br>
            ${new Date().toLocaleString("en-US", { timeZone: "America/New_York" })} EST
          </div>
        </div>
      </body>
      </html>
    `;

    // Check for Resend API key
    if (!c.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured");
      return jsonResponse(
        {
          success: false,
          error:
            "Email service not configured. Please call us at (321) 821-4895.",
        },
        500,
        c.req.raw,
      );
    }

    // Send email via Resend
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${c.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "High Surf Corp Website <website@send.highsurfcorp.com>",
        to: ["crew@highsurfcorp.com"],
        reply_to: email,
        subject: `New Lead: ${name}${budgetDisplay ? ` (${budgetDisplay})` : ""} - ${zip || "No Zip"}`,
        html: emailHTML,
      }),
    });

    if (!resendResponse.ok) {
      const errorText = await resendResponse.text();
      console.error("Resend API error:", errorText);
      throw new Error("Failed to send email");
    }

    const resendData = await resendResponse.json();
    console.log("Email sent successfully:", resendData.id);

    return jsonResponse(
      {
        success: true,
        message: "Thank you! We'll contact you within 24 hours.",
      },
      200,
      c.req.raw,
    );
  } catch (error) {
    console.error("Form submission error:", error);
    return jsonResponse(
      {
        success: false,
        error:
          "Something went wrong. Please call us at (321) 821-4895 or try again later.",
      },
      500,
      c.req.raw,
    );
  }
}
