import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are an intelligent assistant inside an online store-building application.

Your responsibilities are:

1. When a user asks to modify their store, you must understand the request clearly and accurately.

2. You must respond with the correct answer every time, avoiding incorrect or random information.

3. When the user requests a store modification, ALWAYS call the "modify_store" function with the exact details they requested, and do not send a normal text reply.

4. If the user's request is unclear, ask for clarification before calling the function.

5. You can interact with users kindly, politely, and with a light, harmless sense of humor.

6. You may compliment users, encourage them, and be friendly, while still telling the truth gently.

7. Never perform harmful actions or generate fake modifications. Only modify the store as the user explicitly requests.

8. Always aim to create a positive, helpful, and enjoyable experience for the user.

When the user asks to update something in their store (such as product name, price, colors, description, layout, images, or categories), return ONLY a function call to "modify_store" with the correct parameters.

You also have expertise in:
- Business strategy and growth tactics
- Market analysis and trends
- Pricing optimization
- Sales and conversion improvement
- E-commerce best practices`;

const tools = [
  {
    type: "function",
    function: {
      name: "modify_store",
      description: "Modify aspects of the user's online store such as product details, layout, colors, descriptions, images, or categories.",
      parameters: {
        type: "object",
        properties: {
          action: {
            type: "string",
            description: "The type of modification to make (e.g., 'update_product', 'change_color', 'update_layout', 'update_description', 'add_category', 'remove_category', 'update_image', 'update_price')",
          },
          target: {
            type: "string",
            description: "The specific element to modify (e.g., product name, section name, page name)",
          },
          details: {
            type: "object",
            description: "The specific changes to apply",
            additionalProperties: true,
          },
        },
        required: ["action", "target"],
      },
    },
  },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, storeUrl } = await req.json();

    const systemWithContext = storeUrl
      ? `${SYSTEM_PROMPT}\n\nThe user's store URL is: ${storeUrl}. Use this context when providing advice or making modifications.`
      : SYSTEM_PROMPT;

    const apiMessages = [
      { role: "system", content: systemWithContext },
      ...messages,
    ];

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: apiMessages,
        tools,
        tool_choice: "auto",
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway returned ${response.status}`);
    }

    const data = await response.json();
    const choice = data.choices?.[0]?.message;

    if (!choice) {
      throw new Error("No response from AI model");
    }

    // Check if the model wants to call modify_store
    if (choice.tool_calls && choice.tool_calls.length > 0) {
      const toolCall = choice.tool_calls[0];
      const args = JSON.parse(toolCall.function.arguments);
      
      return new Response(
        JSON.stringify({
          type: "modify_store",
          content: `🔧 **Store Modification Requested**\n\n**Action:** ${args.action}\n**Target:** ${args.target}\n${args.details ? `**Details:** ${JSON.stringify(args.details, null, 2)}` : ""}\n\n_This modification has been queued for your store._`,
          functionCall: args,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        type: "text",
        content: choice.content,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("AI Chat error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
