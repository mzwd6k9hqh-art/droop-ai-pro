import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `أنت مساعد ذكي داخل تطبيق بناء متاجر إلكترونية. يمكنك تعديل تصميم متجر المستخدم مباشرة وفي الوقت الحقيقي.

## القواعد الأساسية:

1. عندما يطلب المستخدم أي تعديل على المتجر، يجب أن تستدعي أداة "modify_store" فوراً. لا تكتفِ بالرد النصي أبداً عندما يُطلب تعديل.
2. يمكنك استدعاء الأداة عدة مرات في نفس الرد لتنفيذ تعديلات متعددة.
3. إذا طلب المستخدم شيئاً غير واضح، اطلب توضيحاً قبل التنفيذ.
4. كن لطيفاً وودوداً ومشجعاً.
5. لا تنفذ أي شيء ضار. عدّل فقط ما يُطلب صراحةً.
6. نفّذ كل أمر يعطيك إياه المستخدم بدقة وبدون تردد.

## الإجراءات المدعومة لـ modify_store:

- "change_color" / "update_color" - تغيير ألوان المتجر. Details: { "primary": "from-COLOR-500 to-COLOR-600", "accent": "...", "background": "..." }
  الألوان المتاحة: pink, rose, blue, indigo, orange, amber, purple, fuchsia, green, emerald, cyan, teal, slate, stone, red, violet, sky, lime, yellow
- "update_name" / "update_store_name" - تغيير اسم المتجر. Details: { "name": "الاسم الجديد" }
- "update_description" - تحديث وصف المتجر. Details: { "description": "...", "heroText": "...", "heroSubtext": "..." }
- "add_product" - إضافة منتج جديد. Target: اسم المنتج. Details: { "name": "...", "price": "$XX.XX", "image": "emoji" }
- "remove_product" - حذف منتج. Target: اسم المنتج المراد حذفه.
- "update_product" - تحديث منتج موجود. Target: اسم المنتج. Details: { "name": "...", "price": "...", "image": "..." }
- "update_price" - تغيير سعر منتج. Target: اسم المنتج. Details: { "price": "$XX.XX" }
- "update_layout" - تغيير تنسيق المنتجات. Details: { "layout": "grid" | "list" }
- "update_hero" - تعديل البانر الرئيسي. Details: { "text": "...", "subtext": "...", "show": true/false }
- "update_features" - تغيير مميزات المتجر. Details: { "features": ["ميزة1", "ميزة2", "ميزة3"] }
- "update_store_type" - تغيير نوع المتجر بالكامل. Details: { "type": "fashion|electronics|food|beauty|sports|books|kids|home" }
- "update_image" - تغيير إيموجي المنتج. Target: اسم المنتج. Details: { "image": "emoji جديد" }
- "update_currency" - تغيير العملة. Details: { "currency": "SAR|USD|EUR|..." }

## تعليمات مهمة:
- استخدم إيموجي للمنتجات (مثل: 👕, 📱, 🍕, 💄, ⚽, 📚, 🧸, 🏠).
- عند طلب تعديلات متعددة، استدعِ الأداة لكل تعديل على حدة.
- أنت خبير أيضاً في استراتيجيات الأعمال والتسويق والتسعير والمبيعات والتجارة الإلكترونية.
- تحدث بالعربية دائماً إلا إذا تحدث المستخدم بلغة أخرى.`;

const tools = [
  {
    type: "function",
    function: {
      name: "modify_store",
      description: "Modify aspects of the user's online store such as product details, layout, colors, descriptions, images, or categories. Call this for EVERY store modification request.",
      parameters: {
        type: "object",
        properties: {
          action: {
            type: "string",
            description: "The type of modification (e.g., 'update_product', 'change_color', 'update_layout', 'add_product', 'remove_product', 'update_name', 'update_hero', 'update_features', 'update_store_type', 'update_price', 'update_image', 'update_currency', 'update_description')",
          },
          target: {
            type: "string",
            description: "The specific element to modify (e.g., product name, section name)",
          },
          details: {
            type: "object",
            description: "The specific changes to apply",
            additionalProperties: true,
          },
        },
        required: ["action"],
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
      ? `${SYSTEM_PROMPT}\n\nرابط متجر المستخدم: ${storeUrl}. استخدم هذا السياق عند تقديم النصائح أو التعديلات.`
      : SYSTEM_PROMPT;

    const apiMessages = [
      { role: "system", content: systemWithContext },
      ...messages,
    ];

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // First API call
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: apiMessages,
        tools,
        tool_choice: "auto",
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "تم تجاوز حد الطلبات، يرجى المحاولة لاحقاً." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "يرجى إضافة رصيد للمتابعة." }), {
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

    // Handle tool calls (possibly multiple)
    if (choice.tool_calls && choice.tool_calls.length > 0) {
      const functionCalls = [];
      const toolResultMessages = [];

      for (const toolCall of choice.tool_calls) {
        if (toolCall.function.name === "modify_store") {
          const args = JSON.parse(toolCall.function.arguments);
          functionCalls.push(args);
          toolResultMessages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: JSON.stringify({ success: true, action: args.action, target: args.target }),
          });
        }
      }

      // Second API call to get the text response after tool execution
      let textContent = "";
      if (toolResultMessages.length > 0) {
        try {
          const followUpMessages = [
            ...apiMessages,
            choice, // assistant message with tool_calls
            ...toolResultMessages,
          ];

          const followUpResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-pro",
              messages: followUpMessages,
            }),
          });

          if (followUpResponse.ok) {
            const followUpData = await followUpResponse.json();
            textContent = followUpData.choices?.[0]?.message?.content || "";
          }
        } catch (e) {
          console.error("Follow-up call error:", e);
        }
      }

      if (!textContent) {
        const actionSummary = functionCalls.map(fc => `✅ ${fc.action}: ${fc.target || ''}`).join('\n');
        textContent = `تم تنفيذ التعديلات:\n${actionSummary}\n\nانتقل لتبويب "تصميم المتجر" لرؤية التغييرات!`;
      }

      return new Response(
        JSON.stringify({
          type: "modify_store",
          content: textContent,
          functionCalls: functionCalls,
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
