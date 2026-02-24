import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileName, fileContent, extractSteps } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // If extractSteps is true, use tool calling to get structured steps
    if (extractSteps) {
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            {
              role: "system",
              content: "You are an expert SOP analyst. Extract actionable procedure steps from the document. Each step should be a clear, concise instruction.",
            },
            {
              role: "user",
              content: `Extract procedure steps from this document titled "${fileName}":\n\n${fileContent}`,
            },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "extract_sop_steps",
                description: "Extract structured procedure steps from an SOP document.",
                parameters: {
                  type: "object",
                  properties: {
                    steps: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          instruction: { type: "string", description: "Clear step instruction" },
                          requirePhoto: { type: "boolean", description: "Whether this step needs photo evidence" },
                          requireEvidenceFile: { type: "boolean", description: "Whether this step needs file evidence" },
                        },
                        required: ["instruction", "requirePhoto", "requireEvidenceFile"],
                        additionalProperties: false,
                      },
                    },
                  },
                  required: ["steps"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "extract_sop_steps" } },
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limit exceeded." }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (response.status === 402) {
          return new Response(JSON.stringify({ error: "AI usage limit reached." }), {
            status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        throw new Error("AI analysis failed");
      }

      const data = await response.json();
      const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
      let steps = [];
      if (toolCall?.function?.arguments) {
        try {
          const parsed = JSON.parse(toolCall.function.arguments);
          steps = parsed.steps || [];
        } catch {
          steps = [];
        }
      }

      return new Response(JSON.stringify({ steps }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Standard analysis
    const systemPrompt = `You are an expert SOP analyst. Analyze the document and provide:

1. **Summary**: 2-3 sentence summary.
2. **Extracted Steps**: Break into numbered actionable steps.
3. **Compliance Flags**: Potential compliance issues or missing elements.
4. **Recommendations**: Improvements for clarity, safety, compliance.
5. **Risk Level**: Low, Medium, or High.

Format in clean markdown.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analyze this SOP document titled "${fileName}":\n\n${fileContent}` },
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI usage limit reached." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI analysis failed");
    }

    const data = await response.json();
    const analysis = data.choices?.[0]?.message?.content || "Unable to generate analysis.";

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-sop error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
