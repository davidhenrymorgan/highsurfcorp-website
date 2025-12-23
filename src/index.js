import { Resend } from "resend";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Handle CORS preflight requests (OPTIONS)
    if (request.method === "OPTIONS") {
      return handleCors(request);
    }

    // API Route: Contact Form Submission
    if (url.pathname === "/api/submit" && request.method === "POST") {
      return handleContactForm(request, env);
    }

    // Static Asset Serving: Delegate to Workers Assets
    // This is the "Smart Static Host" capability
    return env.ASSETS.fetch(request);
  },
};

/**
 * Handle CORS Preflight
 */
function handleCors(request) {
  const origin = request.headers.get("Origin");
  // Allow requests from your domain and localhost for dev
  const allowedOrigins = [
    "https://highsurfcorp.com",
    "https://www.highsurfcorp.com",
    "http://localhost:8787",
  ];

  const allowOrigin = allowedOrigins.includes(origin)
    ? origin
    : "https://www.highsurfcorp.com";

  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": allowOrigin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

/**
 * Handle contact form submission
 */
async function handleContactForm(request, env) {
  // Common headers for JSON responses
  const corsHeaders = {
    "Access-Control-Allow-Origin": request.headers.get("Origin") || "*",
    "Content-Type": "application/json",
  };

  try {
    // 1. Parse Data
    const formData = await request.formData();

    // Map Webflow legacy names to semantic variables
    // "title-2" was likely the Zip Code field in Webflow
    const payload = {
      name: formData.get("name-2"),
      email: formData.get("email-2"),
      phone: formData.get("phone-2") || "Not provided",
      message: formData.get("message-2") || "No message",
      zipCode: formData.get("title-2") || "Not provided",
      budget: formData.get("projectBudget") || "Not specified",
    };

    // 2. Validation
    if (!payload.name || !payload.email) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Name and email are required",
        }),
        { status: 400, headers: corsHeaders },
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(payload.email)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid email address" }),
        { status: 400, headers: corsHeaders },
      );
    }

    // 3. Prepare Email
    const resend = new Resend(env.RESEND_API_KEY);

    // Construct a clean, readable text body
    const emailBody = `
New Lead from Website
-----------------------
Name:    ${payload.name}
Email:   ${payload.email}
Phone:   ${payload.phone}
Zip:     ${payload.zipCode}
Budget:  ${payload.budget}

Message:
${payload.message}

-----------------------
Received: ${new Date().toLocaleString("en-US", { timeZone: "America/New_York" })}
    `.trim();

    // 4. Send via Resend
    // Using verified noreply@highsurfcorp.com address
    const { data, error } = await resend.emails.send({
      from: "High Surf Corp <noreply@highsurfcorp.com>",
      to: ["crew@highsurfcorp.com"],
      replyTo: payload.email,
      subject: `New Lead: ${payload.name} (${payload.zipCode})`,
      text: emailBody,
    });

    if (error) {
      console.error("Resend Failure:", JSON.stringify(error));
      // Return 502 Bad Gateway for external service failures
      return new Response(
        JSON.stringify({
          success: false,
          error: "Email service reported an error.",
        }),
        { status: 502, headers: corsHeaders },
      );
    }

    // 5. Success
    return new Response(
      JSON.stringify({
        success: true,
        message: "Message sent successfully!",
        id: data.id,
      }),
      { status: 200, headers: corsHeaders },
    );
  } catch (err) {
    console.error("Worker Error:", err.stack);
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error" }),
      { status: 500, headers: corsHeaders },
    );
  }
}
