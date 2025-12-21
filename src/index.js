import { Resend } from "resend";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // API Route: Contact Form Submission
    if (url.pathname === "/api/submit" && request.method === "POST") {
      return handleContactForm(request, env);
    }

    // Static Asset Serving: Delegate to Workers Assets
    return env.ASSETS.fetch(request);
  },
};

/**
 * Handle contact form submission
 * @param {Request} request - Incoming request
 * @param {Object} env - Environment bindings (includes RESEND_API_KEY)
 * @returns {Response}
 */
async function handleContactForm(request, env) {
  try {
    // Parse form data
    const formData = await request.formData();

    // Extract fields (matching HTML form field names)
    const name = formData.get("name-2");
    const email = formData.get("email-2");
    const phone = formData.get("phone-2");
    const message = formData.get("message-2");
    const zipCode = formData.get("title-2"); // Labeled "Zip code" in form
    const projectBudget = formData.get("projectBudget"); // Radio button

    // Validation
    if (!name || !email) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Name and email are required",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid email address",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Initialize Resend with API key from environment
    const resend = new Resend(env.RESEND_API_KEY);

    // Construct email body
    const emailBody = `
New Contact Form Submission from High Surf Corp Website

Name: ${name}
Email: ${email}
Phone: ${phone || "Not provided"}
Zip Code: ${zipCode || "Not provided"}
Project Budget: ${projectBudget || "Not specified"}

Message:
${message || "No message provided"}

---
Submitted: ${new Date().toLocaleString("en-US", { timeZone: "America/New_York" })}
    `.trim();

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: "High Surf Corp Website <noreply@highsurfcorp.com>",
      to: ["crew@highsurfcorp.com"],
      replyTo: email, // Allow direct reply to customer
      subject: `New Contact Form: ${name} - ${zipCode || "No Location"}`,
      text: emailBody,
    });

    if (error) {
      console.error("Resend API error:", error);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to send email. Please try again.",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Success response
    return new Response(
      JSON.stringify({
        success: true,
        message: "Thank you for contacting us! We will get back to you soon.",
        emailId: data.id,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    console.error("Contact form error:", err);
    return new Response(
      JSON.stringify({
        success: false,
        error: "An unexpected error occurred. Please try again.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
