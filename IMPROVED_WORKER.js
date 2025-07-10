// Improved CloudFlare Worker Script for L'Oréal Beauty Assistant
// Copy this code into your Cloudflare Worker script

export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Content-Type": "application/json",
    };

    // Handle CORS preflight requests
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Handle GET requests for testing
      if (request.method === "GET") {
        return new Response(
          JSON.stringify({
            message: "L'Oréal Beauty Assistant Worker is running!",
            status: "healthy",
            timestamp: new Date().toISOString(),
            endpoint: "Use POST method to send chat requests",
          }),
          {
            status: 200,
            headers: corsHeaders,
          }
        );
      }

      // Validate request method for chat requests
      if (request.method !== "POST") {
        return new Response(
          JSON.stringify({
            error:
              "Method not allowed. Use POST for chat requests or GET for health check.",
          }),
          {
            status: 405,
            headers: corsHeaders,
          }
        );
      }

      // Check for API key
      const apiKey = env.OPENAI_API_KEY;
      if (!apiKey) {
        console.error("Missing OPENAI_API_KEY environment variable");
        return new Response(
          JSON.stringify({ error: "API key not configured" }),
          { status: 500, headers: corsHeaders }
        );
      }

      // Parse request body
      let userInput;
      try {
        userInput = await request.json();
      } catch (parseError) {
        console.error("Failed to parse request body:", parseError);
        return new Response(
          JSON.stringify({ error: "Invalid JSON in request body" }),
          { status: 400, headers: corsHeaders }
        );
      }

      // Validate required fields
      if (!userInput.messages || !Array.isArray(userInput.messages)) {
        return new Response(
          JSON.stringify({ error: "Missing or invalid messages array" }),
          { status: 400, headers: corsHeaders }
        );
      }

      // Prepare request body for OpenAI
      const requestBody = {
        model: userInput.model || "gpt-4o",
        messages: userInput.messages,
        max_completion_tokens: userInput.max_completion_tokens || 300,
        temperature: userInput.temperature || 0.7,
      };

      console.log(
        "Sending request to OpenAI:",
        JSON.stringify(requestBody, null, 2)
      );

      // Make request to OpenAI
      const apiUrl = "https://api.openai.com/v1/chat/completions";
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      // Check OpenAI response
      if (!response.ok) {
        const errorText = await response.text();
        console.error("OpenAI API error:", response.status, errorText);

        return new Response(
          JSON.stringify({
            error: "OpenAI API request failed",
            status: response.status,
            details: errorText,
          }),
          { status: response.status, headers: corsHeaders }
        );
      }

      // Parse OpenAI response
      const data = await response.json();
      console.log("OpenAI response received successfully");

      // Return successful response
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: corsHeaders,
      });
    } catch (error) {
      // Catch any unexpected errors
      console.error("Worker error:", error);
      return new Response(
        JSON.stringify({
          error: "Internal server error",
          message: error.message,
        }),
        { status: 500, headers: corsHeaders }
      );
    }
  },
};
