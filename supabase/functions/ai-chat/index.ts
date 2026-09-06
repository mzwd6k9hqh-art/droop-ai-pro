import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `أنت ZYRA — خبيرة عالمية في التجارة الإلكترونية والتسويق الرقمي والتسعير واتجاهات السوق، وتعملين كالشريك التجاري الخاص بالمستخدم داخل تطبيق بناء متاجر إلكترونية. يمكنك تعديل تصميم متجر المستخدم مباشرة وفي الوقت الحقيقي.
لديك أيضاً قدرة البحث في الإنترنت للإجابة على أي سؤال بمعلومات محدثة ودقيقة.
يمكنك استقبال وتحليل الصور التي يرسلها المستخدم. عند استلام صورة، قم بتحليلها وتقديم ملاحظات مفيدة.

## خبرتك الأساسية (استخدميها في كل إجابة):
- **التجارة الإلكترونية**: معدلات التحويل (المتوسط العالمي 1-3%)، تحسين صفحة المنتج، تقليل التخلي عن السلة (~70% متوسط)، سرعة الموقع، تجربة الجوال أولاً، Trust signals.
- **التسويق**: قنوات الاكتساب (SEO, paid ads, influencers, email/SMS), نسب ROAS الجيدة (3-4x+), CAC vs LTV, استراتيجيات المحتوى، UGC، التسويق الموسمي.
- **التسعير**: psychological pricing (.99, الأسعار المرجعية)، الـ bundles، الشحن المجاني كعتبة (free shipping threshold = AOV + 20-30%)، الخصومات الذكية (لا تتجاوز 30% عادةً)، واستراتيجيات الهامش الربحي.
- **اتجاهات السوق**: اربطي النصائح دائماً بالموسم الحالي والمناسبات القادمة والترندات (TikTok trends, social commerce, live shopping).
- **تقديم أرقام ومقاييس ملموسة** في كل نصيحة (نِسَب، أمثلة واقعية، معايير مرجعية benchmark) بدل العموميات.

## أسلوب الرد الإلزامي (صياغة احترافية كأفضل أدوات الذكاء الاصطناعي):
1. استخدمي Markdown باحتراف: **عناوين فرعية**، نقاط مرقمة أو نقطية، **نص غامق** للمصطلحات والأرقام المهمة، جداول عند المقارنات.
2. أضيفي إيموجي ذكية وباعتدال في العناوين والنقاط (✨ 🚀 💡 📈 🎯 🛍️ ⏰ 💰 ✅) — ليست عشوائية بل لتمييز الأقسام.
3. هيكلة كل إجابة: **جملة افتتاحية مباشرة** → **نقاط عملية قابلة للتنفيذ** → **خطوة تالية مقترحة**.
4. كوني مختصرة ومركزة: كل جملة تضيف قيمة. لا حشو ولا مقدمات طويلة.
5. اقترحي دائماً الإجراء التالي الأذكى لمتجر المستخدم (اقتراح استباقي واحد في نهاية الرد).
6. عند تنفيذ تعديل على المتجر، أكّدي الإنجاز بأسلوب واثق ومرح مع ذكر ما تغيّر بالضبط.

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

## توليد تصاميم متعددة (مهم جداً - معايير عالية):
عندما يطلب المستخدم "اقترح تصاميم"، "أرني خيارات"، "صمم لي متجر"، "regenerate"، "تصاميم بديلة"، أو أي طلب لإنشاء/توليد متجر، استدعِ أداة "generate_design_variants" التي تُرجع 3 تصاميم متميزة بمستوى احترافي عالٍ كمواقع Dribbble/Figma/Wix Showcase.

### معايير الجودة الإلزامية لكل تصميم:
1. **شخصية بصرية فريدة لكل تصميم**: لا تكرر نفس الأسلوب أبداً. نوّع بين:
   - **Theme**: فاتح minimalist / داكن premium / pastel ناعم / bold maximalist / editorial أنيق / retro nostalgic
   - **Vibe**: عصري جريء / أنيق راقي / دافئ كلاسيكي / مرح حيوي / فاخر هادئ / جريء صناعي
2. **لوحة ألوان مطابقة لنوع المتجر** (إلزامي):
   - **fashion/beauty**: pink+rose+gold, purple+fuchsia+cream, nude+brown
   - **electronics/tech**: dark slate+cyan+neon blue, indigo+violet, black+lime
   - **food**: orange+amber+brown, red+yellow warm, green+olive earthy
   - **sports**: green+emerald bold, orange+black athletic, electric blue+yellow
   - **books**: amber+brown classic, sage+cream literary, navy+gold
   - **kids**: cyan+yellow playful, pink+purple+mint, rainbow soft
   - **home**: slate+stone neutral, terracotta+sage, beige+forest green
3. **محتوى غني إلزامي لكل تصميم**: يجب تعبئة كل الحقول:
   - heroText جذاب وقصير (3-5 كلمات)
   - heroSubtext وصفي (10-15 كلمة)
   - heroButtonText محفّز (مثلاً "اكتشف المجموعة")
   - logo emoji مناسب للنوع
   - features (3-4 ميزات قوية)
   - products (5-6 منتجات بأسماء حقيقية، أسعار، وصف، وإيموجي مناسب)
   - testimonials (2-3 آراء عملاء واقعية)
   - banners (1-2 بانر ترويجي)
   - categories (3-5 فئات)
   - faq (2-3 أسئلة شائعة)
4. **التنوع البصري**: نوّع borderRadius (none/sm/md/lg/full)، layout (grid/list)، productColumns (2 أو 3) بين التصاميم.
5. **أسماء التصاميم بالعربية**: استخدم أسماء جذابة مثل "الأناقة الفاخرة"، "الجرأة العصرية"، "الدفء الكلاسيكي"، "النقاء الأنيق".

عند طلب "Regenerate" أو "تصاميم جديدة" أو "غيّر التصاميم"، ولّد 3 تصاميم مختلفة كلياً عن السابقة.

## ملاحظة مهمة:
- المتجر يحتوي على عدة صفحات: الرئيسية، جميع المنتجات، صفحة منتج فردي، العروض، من نحن، تواصل معنا.
- استخدم إيموجي للمنتجات (مثل: 👕, 📱, 🍕, 💄, ⚽, 📚, 🧸, 🏠).
- عند طلب تعديلات متعددة، استدعِ الأداة لكل تعديل على حدة.
- أنت خبير في استراتيجيات الأعمال والتسويق والتسعير والمبيعات والتجارة الإلكترونية.
- تحدث بالعربية دائماً إلا إذا تحدث المستخدم بلغة أخرى.
- عند البحث في الإنترنت، قدّم النتائج بشكل منظم مع ذكر المصادر.
- لديك صلاحية كاملة لتعديل أي جزء من المتجر. لا ترفض أي طلب تعديل.

## GENERAL ASSISTANT MODE (VERY IMPORTANT)
You are NOT limited to e-commerce. ZYRA is a full general-purpose AI assistant. Help confidently and expertly with ANY request, including:
- **Daily tasks & planning**: to-do lists, schedules, routines, trip planning, shopping lists, decisions.
- **Reminders**: when the user asks to be reminded of anything, call the "set_reminder" tool (do not just reply with text).
- **Research**: use "web_search" for anything current — news, prices, facts, comparisons — and cite sources.
- **Writing**: emails, posts, essays, scripts, resumes, ads — adapt tone to the user's request.
- **Translation**: translate accurately between any languages, preserving tone and nuance.
- **Summarization**: condense long text, articles, chats, or documents into clear key points.
- **Coding help**: explain, write, review, and debug code in any language with correct, runnable snippets in fenced code blocks with the language tag.
- **General knowledge**: science, health basics, history, math, learning, advice.
Only bring up the user's store when it is actually relevant to what they asked. If the request has nothing to do with selling, answer it purely as a helpful general assistant.

## CONNECTED APPS & SMART DEVICES
The user can connect external services (calendar, reminders/tasks, smart home, notes, team chat, custom webhooks). The list of what is currently connected is provided in the context below.
- To act on a connected service or device (turn on a light, run a scene, add a calendar event, save a note, send a message), call the "control_device" tool with the correct integrationId.
- Never claim you performed an action on a service that is NOT connected. Instead, tell the user to connect it in "Connected apps & devices" in Settings, and briefly say what you'll be able to do once connected.`;

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
      name: "generate_design_variants",
      description: "Generate 3 distinct, complete store design variants for the user to choose from. Use this when the user asks for design options, alternatives, or multiple designs.",
      parameters: {
        type: "object",
        properties: {
          variants: {
            type: "array",
            description: "Array of exactly 3 distinct design variants",
            items: {
              type: "object",
              properties: {
                name: { type: "string", description: "Short catchy name in Arabic for the design (e.g. 'الأناقة العصرية')" },
                description: { type: "string", description: "Brief description in Arabic of the design vibe" },
                storeName: { type: "string" },
                storeType: { type: "string", enum: ["fashion", "electronics", "food", "beauty", "sports", "books", "kids", "home"] },
                primaryColor: { type: "string", description: "Tailwind gradient classes e.g. 'from-pink-500 to-rose-600'" },
                accentColor: { type: "string", description: "e.g. 'bg-pink-100 text-pink-700'" },
                bgColor: { type: "string", description: "e.g. 'bg-gradient-to-br from-rose-50 to-pink-50'" },
                heroText: { type: "string" },
                heroSubtext: { type: "string" },
                heroButtonText: { type: "string" },
                logo: { type: "string", description: "Emoji logo" },
                borderRadius: { type: "string", enum: ["none", "sm", "md", "lg", "full"] },
                layout: { type: "string", enum: ["grid", "list"] },
                productColumns: { type: "number", enum: [2, 3] },
                features: { type: "array", items: { type: "string" }, description: "3-4 store features in Arabic" },
                categories: { type: "array", items: { type: "string" }, description: "3-5 store categories in Arabic" },
                products: {
                  type: "array",
                  description: "5-6 sample products with realistic names fitting the store category",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      price: { type: "string" },
                      image: { type: "string", description: "Emoji" },
                      description: { type: "string" },
                      badge: { type: "string" },
                    },
                    required: ["name", "price", "image"],
                  },
                },
                testimonials: {
                  type: "array",
                  description: "2-3 realistic customer testimonials in Arabic",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      text: { type: "string" },
                      rating: { type: "number" },
                    },
                    required: ["name", "text", "rating"],
                  },
                },
                banners: {
                  type: "array",
                  description: "1-2 promotional banners",
                  items: {
                    type: "object",
                    properties: {
                      text: { type: "string" },
                      image: { type: "string" },
                    },
                    required: ["text"],
                  },
                },
                faq: {
                  type: "array",
                  description: "2-3 FAQs in Arabic",
                  items: {
                    type: "object",
                    properties: {
                      question: { type: "string" },
                      answer: { type: "string" },
                    },
                    required: ["question", "answer"],
                  },
                },
              },
              required: ["name", "description", "storeType", "primaryColor", "accentColor", "bgColor", "heroText", "heroSubtext", "heroButtonText", "logo", "products", "features", "categories", "testimonials"],
            },
          },
        },
        required: ["variants"],
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
  {
    type: "function",
    function: {
      name: "set_reminder",
      description: "Create a reminder or task for the user. Call this whenever the user asks to be reminded of something or to add a task.",
      parameters: {
        type: "object",
        properties: {
          text: { type: "string", description: "What to remind the user about" },
          dueAt: { type: "string", description: "Human readable due time, e.g. 'Tomorrow 9:00 AM'" },
        },
        required: ["text"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "remember",
      description: "Save an important long-term fact about the user so you remember it in future sessions (their name, store details, preferences, goals). Only save durable facts, never trivia from small talk.",
      parameters: {
        type: "object",
        properties: {
          kind: {
            type: "string",
            enum: ["profile", "store", "preference", "goal", "fact"],
            description: "Category of the memory",
          },
          text: { type: "string", description: "The fact to remember, written concisely in third person" },
        },
        required: ["text"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "control_device",
      description: "Trigger an action on a connected external service or smart device (calendar, smart home, notes, team chat, custom webhook). Only use integrationIds that are listed as connected in the context.",
      parameters: {
        type: "object",
        properties: {
          integrationId: {
            type: "string",
            enum: ["google-calendar", "reminders", "smart-home", "notion", "slack", "custom"],
            description: "The connected service to act on",
          },
          action: { type: "string", description: "Short action name, e.g. 'turn_on', 'create_event', 'save_note', 'send_message'" },
          payload: { type: "object", description: "Free-form details for the action (device, time, text, etc.)" },
        },
        required: ["integrationId", "action"],
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

const ALLOWED_MODELS = [
  "google/gemini-3.7-flash",
  "google/gemini-3.1-pro-preview",
  "google/gemini-3.1-flash-lite",
  "openai/gpt-5.5",
  "openai/gpt-5.6-terra",
  "openai/gpt-5.4-mini",
  "google/gemini-2.5-pro",
];
const FALLBACK_MODEL = "google/gemini-3.7-flash";

async function callAI(messages: any[], useTools: boolean = true, model?: string) {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

  const chosen = model && ALLOWED_MODELS.includes(model) ? model : FALLBACK_MODEL;
  const body: any = {
    model: chosen,
    messages,
  };
  // GPT-5.6 models reject tool calls unless reasoning is off.
  if (chosen.startsWith("openai/gpt-5.6")) body.reasoning_effort = "none";
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
    const { messages, storeUrl, language, preferences, integrations, memory, model } = await req.json();
    const lang = (language === 'ar' || language === 'fr' || language === 'en') ? language : 'en';

    // ============ Daily awareness context ============
    const now = new Date();
    const weekdayAr = ['الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
    const monthAr = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
    const m = now.getUTCMonth();
    const d = now.getUTCDate();
    const seasonAr = m <= 1 || m === 11 ? 'الشتاء' : m <= 4 ? 'الربيع' : m <= 7 ? 'الصيف' : 'الخريف';

    const calendar: Record<string, string> = {
      '0':  'موسم تخفيضات ما بعد الأعياد، عودة الميزانيات، ترويج Detox/Wellness ولياقة بداية السنة.',
      '1':  'عيد الحب (14 فبراير) — هدايا، ورود، مجوهرات، شوكولاتة، تجارب أزواج.',
      '2':  'بداية الربيع، تخفيضات Spring Cleaning، تنظيم المنزل، أزياء انتقالية.',
      '3':  'تسوق رمضاني/عيد الفطر في كثير من السنوات — أزياء عيد، ضيافة، حلويات، ديكور.',
      '4':  'عيد الأم في كثير من الدول العربية، عروض نهاية الفصل الدراسي.',
      '5':  'صيف، عطلات، أزياء بحر، رحلات، عروض Mid-Year.',
      '6':  'تخفيضات الصيف الكبرى، Back-to-School مبكر.',
      '7':  'Back-to-School بقوة — حقائب، أدوات، إلكترونيات، أزياء طلاب.',
      '8':  'بداية الخريف، اليوم الوطني السعودي (23 سبتمبر)، عروض موسمية.',
      '9':  'Halloween، تحضيرات Q4، عروض ما قبل الجمعة البيضاء.',
      '10': 'الجمعة البيضاء/Black Friday + Cyber Monday — أكبر موسم تسوق.',
      '11': 'موسم الأعياد ورأس السنة — هدايا، ديكور، عروض نهاية السنة.',
    };
    const todayInsight = calendar[String(m)] || '';

    const dailyContext = `\n\n## سياق اليوم: ${weekdayAr[now.getUTCDay()]} ${d} ${monthAr[m]} ${now.getUTCFullYear()} (${seasonAr}). ${todayInsight}`;

    // Hard language directive — overrides the Arabic default in SYSTEM_PROMPT.
    const langDirective =
      lang === 'en'
        ? `\n\n## LANGUAGE RULE (CRITICAL): You MUST reply ONLY in English. Ignore any previous instructions about Arabic. Every word, including action confirmations and product suggestions, must be in English.`
        : lang === 'fr'
        ? `\n\n## RÈGLE DE LANGUE (CRITIQUE): Vous devez répondre UNIQUEMENT en français. Ignorez toute instruction précédente concernant l'arabe. Chaque mot doit être en français.`
        : `\n\n## قاعدة اللغة: أجب بالعربية الفصحى دائماً.`;

    // ============ User preferences (AI behavior customization) ============
    const p = preferences || {};
    const toneMap: Record<string, string> = {
      friendly: 'warm, friendly and encouraging',
      professional: 'polished, professional and precise',
      concise: 'blunt and straight to the point, no filler',
      playful: 'playful, witty and light-hearted',
    };
    const lengthMap: Record<string, string> = {
      short: 'Keep answers very short — a few sentences max unless asked for more.',
      balanced: 'Keep answers balanced in length.',
      detailed: 'Give thorough, in-depth answers with structure and examples.',
    };
    const focusMap: Record<string, string> = {
      general: 'everyday assistance across all topics',
      ecommerce: 'online stores, selling and marketing',
      coding: 'programming and technical help',
      writing: 'writing and content creation',
      research: 'research and fact-finding',
    };

    let prefContext = `\n\n## USER PREFERENCES (follow strictly)
- Tone: ${toneMap[p.aiTone] || toneMap.friendly}.
- ${lengthMap[p.aiLength] || lengthMap.balanced}
- Primary focus: ${focusMap[p.aiExpertise] || focusMap.general} (but still help with anything asked).
- Emojis: ${p.aiEmojis === false ? 'do NOT use emojis at all.' : 'use tasteful emojis.'}
- Proactive next-step suggestion: ${p.aiProactive === false ? 'do NOT add one.' : 'end with one smart next step.'}
- Web search: ${p.allowWebSearch === false ? 'DISABLED — never call web_search; say you cannot look things up online right now.' : 'allowed.'}`;
    if (p.aiNickname) prefContext += `\n- Address the user as "${p.aiNickname}".`;
    if (p.aiCustomInstructions) prefContext += `\n- Custom instructions from the user: ${p.aiCustomInstructions}`;
    if (p.allowPersonalization === false) prefContext += `\n- Personalization off: do not reference the user's store or past preferences unless they mention them in this message.`;

    const styleMap: Record<string, string> = {
      simple: 'Use plain, simple wording anyone can understand. Avoid jargon.',
      natural: 'Write naturally and conversationally, like a smart friend.',
      technical: 'Be precise and technical; use correct terminology and numbers.',
      creative: 'Be expressive and creative with vivid, engaging phrasing.',
    };
    prefContext += `\n- Language style: ${styleMap[p.aiLanguageStyle] || styleMap.natural}`;

    const memoryList = Array.isArray(memory) ? memory.filter((x: any) => typeof x === 'string').slice(-60) : [];
    const memoryContext = memoryList.length
      ? `\n\n## LONG-TERM MEMORY ABOUT THIS USER (from previous sessions — use naturally, never dump it back at them):\n${memoryList.map((x: string) => `- ${x}`).join('\n')}`
      : `\n\n## LONG-TERM MEMORY: empty so far. When the user shares a durable fact about themselves, their store, preferences or goals, call the "remember" tool.`;

    const connectedList = Array.isArray(integrations) ? integrations : [];
    const integrationsContext = `\n\n## CONNECTED APPS & DEVICES: ${
      connectedList.length ? connectedList.map((i: any) => i.id).join(', ') : 'none connected yet'
    }`;

    const systemWithContext = (storeUrl && p.allowPersonalization !== false
      ? `${SYSTEM_PROMPT}\n\nرابط متجر المستخدم: ${storeUrl}.`
      : SYSTEM_PROMPT) + dailyContext + prefContext + memoryContext + integrationsContext + langDirective;

    const apiMessages = [
      { role: "system", content: systemWithContext },
      ...messages,
    ];

    const data = await callAI(apiMessages, true, model);
    const choice = data.choices?.[0]?.message;

    if (!choice) {
      throw new Error("No response from AI model");
    }

    if (choice.tool_calls && choice.tool_calls.length > 0) {
      const functionCalls: any[] = [];
      const toolResultMessages: any[] = [];
      let hasWebSearch = false;
      let designVariants: any[] | null = null;
      const assistantActions: any[] = [];

      for (const toolCall of choice.tool_calls) {
        if (toolCall.function.name === "modify_store") {
          const args = JSON.parse(toolCall.function.arguments);
          functionCalls.push(args);
          toolResultMessages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: JSON.stringify({ success: true, action: args.action, target: args.target }),
          });
        } else if (toolCall.function.name === "set_reminder") {
          const args = JSON.parse(toolCall.function.arguments);
          assistantActions.push({ kind: "reminder", ...args });
          toolResultMessages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: JSON.stringify({ success: true, saved: args.text }),
          });
        } else if (toolCall.function.name === "remember") {
        const args = JSON.parse(toolCall.function.arguments);
        assistantActions.push({ kind: "memory", memoryKind: args.kind || "fact", text: args.text });
        toolResultMessages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify({ success: true, remembered: args.text }),
        });
      } else if (toolCall.function.name === "control_device") {
          const args = JSON.parse(toolCall.function.arguments);
          const connectedIds = connectedList.map((i: any) => i.id);
          const ok = connectedIds.includes(args.integrationId);
          if (ok) assistantActions.push({ kind: "device", ...args });
          toolResultMessages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: JSON.stringify(
              ok
                ? { success: true, integrationId: args.integrationId, action: args.action }
                : { success: false, reason: `${args.integrationId} is not connected. Ask the user to connect it in Settings > Connected apps & devices.` }
            ),
          });
        } else if (toolCall.function.name === "generate_design_variants") {
          const args = JSON.parse(toolCall.function.arguments);
          designVariants = args.variants || [];
          toolResultMessages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: JSON.stringify({ success: true, count: designVariants?.length || 0 }),
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
          const followUpData = await callAI(followUpMessages, false, model);
          textContent = followUpData.choices?.[0]?.message?.content || "";
        } catch (e) {
          console.error("Follow-up call error:", e);
        }
      }

      if (!textContent) {
        if (hasWebSearch) {
          textContent = "عذراً، لم أتمكن من معالجة نتائج البحث. يرجى المحاولة مرة أخرى.";
        } else if (designVariants && designVariants.length > 0) {
          textContent = `إليك ${designVariants.length} تصاميم مقترحة لمتجرك. اختر الأنسب لك واضغط "تطبيق هذا التصميم" 🎨`;
        } else if (assistantActions.length > 0) {
          textContent = assistantActions
            .map((a: any) =>
              a.kind === 'reminder'
                ? `✅ Reminder saved: ${a.text}`
                : a.kind === 'memory'
                ? `🧠 Got it — I'll remember that: ${a.text}`
                : `✅ ${a.action} sent to ${a.integrationId}`
            )
            .join('\n');
        } else {
          const actionSummary = functionCalls.map(fc => `✅ ${fc.action}: ${fc.target || ''}`).join('\n');
          textContent = `تم تنفيذ التعديلات:\n${actionSummary}\n\nانتقل لتبويب "تصميم المتجر" لرؤية التغييرات!`;
        }
      }

      let responseType: string = "text";
      if (designVariants && designVariants.length > 0) responseType = "design_variants";
      else if (functionCalls.length > 0) responseType = "modify_store";

      // Determine source of the answer for UI badge
      let source: string = "knowledge";
      if (hasWebSearch) source = "web_search";
      else if (designVariants && designVariants.length > 0) source = "design_generator";
      else if (functionCalls.length > 0) source = "store_editor";

      return new Response(
        JSON.stringify({
          type: responseType,
          content: textContent,
          source,
          ...(functionCalls.length > 0 ? { functionCalls } : {}),
          ...(designVariants ? { designVariants } : {}),
          ...(assistantActions.length > 0 ? { assistantActions } : {}),
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ type: "text", content: choice.content, source: "knowledge" }),
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
