import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `أنت مساعد ذكي داخل تطبيق بناء متاجر إلكترونية. يمكنك تعديل تصميم متجر المستخدم مباشرة وفي الوقت الحقيقي.
لديك أيضاً قدرة البحث في الإنترنت للإجابة على أي سؤال بمعلومات محدثة ودقيقة.
يمكنك استقبال وتحليل الصور التي يرسلها المستخدم. عند استلام صورة، قم بتحليلها وتقديم ملاحظات مفيدة.

## القواعد الأساسية:

1. عندما يطلب المستخدم أي تعديل على المتجر، يجب أن تستدعي أداة "modify_store" فوراً. لا تكتفِ بالرد النصي أبداً عندما يُطلب تعديل.
2. يمكنك استدعاء الأداة عدة مرات في نفس الرد لتنفيذ تعديلات متعددة.
3. عندما يسأل المستخدم سؤالاً يحتاج لمعلومات محدثة أو بحث في الإنترنت، استخدم أداة "web_search" للبحث ثم أجب بناءً على النتائج.
4. إذا طلب المستخدم شيئاً غير واضح، اطلب توضيحاً قبل التنفيذ.
5. كن لطيفاً وودوداً ومشجعاً.
6. لا تنفذ أي شيء ضار. عدّل فقط ما يُطلب صراحةً.
7. نفّذ كل أمر يعطيك إياه المستخدم بدقة وبدون تردد.
8. لديك صلاحية كاملة لتعديل كل شيء في المتجر بلا استثناء.

## الإجراءات المدعومة لـ modify_store:

### تعديلات أساسية:
- "change_color" / "update_color" - تغيير ألوان المتجر. Details: { "primary": "from-COLOR-500 to-COLOR-600", "accent": "bg-COLOR-100 text-COLOR-700", "background": "bg-gradient-to-br from-COLOR-50 to-COLOR-50" }
  الألوان المتاحة: pink, rose, blue, indigo, orange, amber, purple, fuchsia, green, emerald, cyan, teal, slate, stone, red, violet, sky, lime, yellow
- "update_name" / "update_store_name" - تغيير اسم المتجر. Details: { "name": "الاسم الجديد" }
- "update_description" - تحديث وصف المتجر. Details: { "description": "...", "heroText": "...", "heroSubtext": "..." }
- "update_store_type" - تغيير نوع المتجر بالكامل. Details: { "type": "fashion|electronics|food|beauty|sports|books|kids|home" }
- "update_currency" - تغيير العملة. Details: { "currency": "SAR|USD|EUR|..." }

### المنتجات:
- "add_product" - إضافة منتج جديد. Details: { "name": "...", "price": "$XX.XX", "image": "emoji", "description": "وصف المنتج", "category": "فئة", "badge": "جديد/خصم/حصري", "discount": 20, "inStock": true }
- "remove_product" - حذف منتج. Target: اسم المنتج المراد حذفه.
- "update_product" - تحديث منتج موجود. Target: اسم المنتج. Details: أي حقل من حقول المنتج.
- "update_price" - تغيير سعر منتج. Target: اسم المنتج. Details: { "price": "$XX.XX" }
- "update_image" - تغيير إيموجي المنتج. Target: اسم المنتج. Details: { "image": "emoji جديد" }
- "update_product_description" - تحديث وصف منتج. Target: اسم المنتج. Details: { "description": "..." }
- "update_product_badge" - إضافة/تعديل شارة منتج. Target: اسم المنتج. Details: { "badge": "جديد/خصم/حصري/الأكثر مبيعاً" }
- "update_product_discount" - تعيين خصم لمنتج. Target: اسم المنتج. Details: { "discount": 25 } (نسبة مئوية)
- "update_product_stock" - تغيير حالة المخزون. Target: اسم المنتج. Details: { "inStock": true/false }
- "update_product_category" - تعيين فئة لمنتج. Target: اسم المنتج. Details: { "category": "اسم الفئة" }
- "clear_all_products" - حذف جميع المنتجات.
- "reorder_products" - إعادة ترتيب المنتجات. Details: { "order": ["اسم1", "اسم2", ...] }

### التخطيط والتصميم:
- "update_layout" - تغيير تنسيق المنتجات. Details: { "layout": "grid"|"list", "productColumns": 2|3 }
- "update_hero" - تعديل البانر الرئيسي. Details: { "text": "...", "subtext": "...", "show": true/false, "buttonText": "...", "image": "emoji" }
- "update_features" - تغيير مميزات المتجر. Details: { "features": ["ميزة1", "ميزة2", "ميزة3"] }
- "update_logo" - تغيير شعار المتجر. Details: { "logo": "emoji أو نص" }
- "update_font" - تغيير خط المتجر. Details: { "font": "Cairo|Tajawal|Amiri|Almarai|IBM Plex Sans Arabic" }
- "update_border_radius" - تغيير شكل الحواف. Details: { "radius": "none"|"sm"|"md"|"lg"|"full" }

### النافبار والفوتر:
- "update_navbar" - تعديل شريط التنقل. Details: { "style": "default"|"centered"|"minimal", "showSearch": true/false, "showCart": true/false, "showWishlist": true/false }
- "update_footer" - تعديل الفوتر. Details: { "text": "...", "links": [{"label": "...", "page": "..."}] }

### عناصر إضافية:
- "update_announcement" - شريط إعلاني أعلى المتجر. Details: { "text": "...", "show": true/false, "bgColor": "...", "textColor": "..." }
- "update_social_links" - روابط التواصل الاجتماعي. Details: { "instagram": "...", "twitter": "...", "tiktok": "...", "whatsapp": "...", "facebook": "...", "youtube": "..." }
- "update_categories" - تعيين فئات المتجر. Details: { "categories": ["فئة1", "فئة2", ...] }

### المحتوى:
- "add_testimonial" - إضافة تقييم عميل. Details: { "name": "...", "text": "...", "rating": 5 }
- "update_testimonials" - تعديل جميع التقييمات. Details: { "testimonials": [...] }
- "add_banner" - إضافة بانر ترويجي. Details: { "text": "...", "image": "emoji", "link": "page" }
- "update_banners" - تعديل جميع البانرات. Details: { "banners": [...] }
- "add_faq" - إضافة سؤال متكرر. Details: { "question": "...", "answer": "..." }
- "update_faq" - تعديل جميع الأسئلة المتكررة. Details: { "faq": [...] }
- "update_policies" - تعديل السياسات. Details: { "shipping": "...", "returns": "...", "privacy": "..." }

### الصفحات:
- "update_about_page" - تعديل صفحة "من نحن". Details: { "description": "...", "subtitle": "...", "stat1Label": "...", "stat2Label": "...", "stat3Label": "..." }
- "update_contact_page" - تعديل صفحة التواصل. Details: { "email": "...", "phone": "...", "address": "...", "subtitle": "..." }
- "update_offers_page" - تعديل صفحة العروض. Details: { "title": "...", "subtitle": "..." }

## ملاحظة مهمة:
- المتجر يحتوي على عدة صفحات: الرئيسية، جميع المنتجات، صفحة منتج فردي، العروض، من نحن، تواصل معنا.
- استخدم إيموجي للمنتجات (مثل: 👕, 📱, 🍕, 💄, ⚽, 📚, 🧸, 🏠).
- عند طلب تعديلات متعددة، استدعِ الأداة لكل تعديل على حدة.
- أنت خبير في استراتيجيات الأعمال والتسويق والتسعير والمبيعات والتجارة الإلكترونية.
- تحدث بالعربية دائماً إلا إذا تحدث المستخدم بلغة أخرى.
- عند البحث في الإنترنت، قدّم النتائج بشكل منظم مع ذكر المصادر.
- لديك صلاحية كاملة لتعديل أي جزء من المتجر. لا ترفض أي طلب تعديل.`;

const tools = [
  {
    type: "function",
    function: {
      name: "modify_store",
      description: "Modify ANY aspect of the user's online store. You have FULL authority to change everything. Call this for EVERY store modification request without hesitation.",
      parameters: {
        type: "object",
        properties: {
          action: {
            type: "string",
            description: "The modification action. Available: update_product, change_color, update_color, update_layout, add_product, remove_product, update_name, update_store_name, update_hero, update_features, update_store_type, update_price, update_image, update_currency, update_description, update_about_page, update_contact_page, update_offers_page, update_logo, update_font, update_announcement, update_social_links, update_navbar, update_footer, update_categories, update_border_radius, add_testimonial, update_testimonials, add_banner, update_banners, add_faq, update_faq, update_policies, update_product_badge, update_product_discount, update_product_stock, update_product_category, update_product_description, clear_all_products, reorder_products",
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
  {
    type: "function",
    function: {
      name: "web_search",
      description: "Search the internet for up-to-date information. Use this when the user asks questions that need current data, news, prices, trends, or any factual information.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "The search query to look up on the internet",
          },
          search_depth: {
            type: "string",
            enum: ["basic", "advanced"],
            description: "Search depth - 'basic' for quick answers, 'advanced' for detailed research",
          },
        },
        required: ["query"],
      },
    },
  },
];

async function tavilySearch(query: string, searchDepth: string = "basic"): Promise<string> {
  const TAVILY_API_KEY = Deno.env.get("TAVILY_API_KEY");
  if (!TAVILY_API_KEY) {
    throw new Error("TAVILY_API_KEY is not configured");
  }

  const response = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: TAVILY_API_KEY,
      query,
      search_depth: searchDepth,
      include_answer: true,
      max_results: 5,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("Tavily API error:", response.status, errText);
    throw new Error(`Tavily search failed: ${response.status}`);
  }

  const data = await response.json();
  
  let searchResult = "";
  if (data.answer) {
    searchResult += `**ملخص:** ${data.answer}\n\n`;
  }
  if (data.results && data.results.length > 0) {
    searchResult += "**المصادر:**\n";
    for (const result of data.results) {
      searchResult += `- [${result.title}](${result.url}): ${result.content?.substring(0, 200) || ''}\n`;
    }
  }
  return searchResult || "لم يتم العثور على نتائج.";
}

async function callAI(messages: any[], useTools: boolean = true) {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

  const body: any = {
    model: "google/gemini-2.5-pro",
    messages,
  };
  if (useTools) {
    body.tools = tools;
    body.tool_choice = "auto";
  }

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    if (response.status === 429) throw { status: 429, message: "تم تجاوز حد الطلبات، يرجى المحاولة لاحقاً." };
    if (response.status === 402) throw { status: 402, message: "يرجى إضافة رصيد للمتابعة." };
    const errorText = await response.text();
    console.error("AI gateway error:", response.status, errorText);
    throw new Error(`AI gateway returned ${response.status}`);
  }

  return response.json();
}

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

    const data = await callAI(apiMessages);
    const choice = data.choices?.[0]?.message;

    if (!choice) {
      throw new Error("No response from AI model");
    }

    if (choice.tool_calls && choice.tool_calls.length > 0) {
      const functionCalls: any[] = [];
      const toolResultMessages: any[] = [];
      let hasWebSearch = false;

      for (const toolCall of choice.tool_calls) {
        if (toolCall.function.name === "modify_store") {
          const args = JSON.parse(toolCall.function.arguments);
          functionCalls.push(args);
          toolResultMessages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: JSON.stringify({ success: true, action: args.action, target: args.target }),
          });
        } else if (toolCall.function.name === "web_search") {
          hasWebSearch = true;
          const args = JSON.parse(toolCall.function.arguments);
          try {
            const searchResults = await tavilySearch(args.query, args.search_depth || "basic");
            toolResultMessages.push({
              role: "tool",
              tool_call_id: toolCall.id,
              content: searchResults,
            });
          } catch (e) {
            console.error("Web search error:", e);
            toolResultMessages.push({
              role: "tool",
              tool_call_id: toolCall.id,
              content: "عذراً، فشل البحث في الإنترنت. يرجى المحاولة مرة أخرى.",
            });
          }
        }
      }

      let textContent = "";
      if (toolResultMessages.length > 0) {
        try {
          const followUpMessages = [...apiMessages, choice, ...toolResultMessages];
          const followUpData = await callAI(followUpMessages, false);
          textContent = followUpData.choices?.[0]?.message?.content || "";
        } catch (e) {
          console.error("Follow-up call error:", e);
        }
      }

      if (!textContent) {
        if (hasWebSearch) {
          textContent = "عذراً، لم أتمكن من معالجة نتائج البحث. يرجى المحاولة مرة أخرى.";
        } else {
          const actionSummary = functionCalls.map(fc => `✅ ${fc.action}: ${fc.target || ''}`).join('\n');
          textContent = `تم تنفيذ التعديلات:\n${actionSummary}\n\nانتقل لتبويب "تصميم المتجر" لرؤية التغييرات!`;
        }
      }

      return new Response(
        JSON.stringify({
          type: functionCalls.length > 0 ? "modify_store" : "text",
          content: textContent,
          ...(functionCalls.length > 0 ? { functionCalls } : {}),
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ type: "text", content: choice.content }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("AI Chat error:", error);
    const status = error.status || 500;
    const message = error.message || "حدث خطأ غير متوقع";
    return new Response(
      JSON.stringify({ error: message }),
      { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
