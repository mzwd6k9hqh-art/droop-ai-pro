# Upgrade Zyra into a Premium AI E-commerce SaaS

This is large enough to break into phases. Each phase is shippable on its own. I'll stop after each phase so you can review.

## Phase 1 — Design system & foundation (this turn)
- New premium palette: **black / olive / white** with a true dark mode default.
  - Tokens in `index.css` + `tailwind.config.ts` (HSL): `--background` near-black, `--foreground` warm white, `--primary` olive, `--accent` muted olive, refined `--card`, `--border`, `--muted`.
  - Replace existing indigo/emerald/purple gradients with olive/white accents across Landing, Onboarding, AIChat, Voice, Dashboard, Settings, Pricing, Upgrade.
- Typography upgrade: pair a display serif (e.g. Instrument Serif) with a clean grotesque (Inter/Geist) for body.
- Motion polish via `framer-motion` page transitions + button micro-interactions.
- Update logo treatment + Header/AppLayout to the new look.

## Phase 2 — Stripe + Integrations dashboard
- Run Lovable's built-in **Stripe Payments** (eligibility already passed — recommendation was Paddle, but you asked specifically for Stripe). I'll call `enable_stripe_payments`, then create products: **Free**, **Pro**, **Premium**.
- Subscription checkout, customer portal, invoices/payment history page.
- New `/integrations` page: tiles for **Stripe, Shopify, Discord, Gmail, Notion, Google Sheets, Zapier**.
  - Stripe + Shopify use Lovable's built-in flows.
  - Gmail / Notion / Google Sheets use Lovable connectors (gateway).
  - Discord + Zapier use webhook URL inputs (standard pattern).
  - Each tile shows status (connected / not connected) and a configure drawer.

## Phase 3 — Smart AI Store Assistant + Analytics
- Upgrade `ai-chat` edge function to accept store context (URL, products, copy) and return structured findings: description quality, pricing, branding, SEO, conversion, performance — each with severity + fix steps.
- New `/store-analysis` page: charts (recharts) for traffic, conversion, AOV, revenue trend; AI insight cards with "Apply fix" actions where possible.
- Persist memory per user in a `assistant_memory` table so Zyra feels adaptive (RLS scoped to user).
- Keep all numbers honest: $0 / 0 orders until real data exists.

## Phase 4 — Custom links in stores
- Extend `StoreConfig` with `socialLinks[]` and `productLinks[]` (label, url, icon, type).
- Editor UI in the store editor panel; render in storefront product detail + footer.

## Phase 5 — Challenges & Rewards
- Tables: `challenges`, `user_challenges` (progress, streak, completed_at), `rewards`, `user_rewards`, `user_xp` — all RLS-scoped.
- `/challenges` page with progress bars, streak flame, XP level, badges grid, confetti on completion (`framer-motion`).
- Seed initial challenges (publish store, add 5 products, connect Stripe, etc.).

## Phase 6 — PWA + Admin + polish
- Manifest-only installable PWA (icons, `display: standalone`) — **no service worker** (preview-safe).
- "Install App" page with platform-specific instructions.
- Lightweight `/admin` (role-gated via `user_roles` + `has_role` security definer) showing users, subscriptions, challenge completions.
- Final pass: loading states, empty states, accessibility, responsive QA at 414px.

## Technical notes
- All new tables: `public` schema, GRANT to `authenticated` + `service_role`, RLS enabled, policies via `auth.uid()`. Roles via separate `user_roles` table + `has_role()` security definer (never on profiles).
- AI calls stay in edge functions using Lovable AI Gateway (no API key needed).
- New components live under `src/components/{integrations,challenges,analytics,store}` — small and reusable.
- Memory file updates: rebrand palette to black/olive/white, document Stripe plans + challenge system once shipped.

## What I need from you to start Phase 1
Just confirm:
1. **Go ahead with Phase 1 now** (design system rebrand only)?
2. **Stripe vs Paddle** — you wrote Stripe, eligibility check recommended Paddle. Stripe is fine but I want to confirm before enabling.
3. **Authentication** — earlier you removed login entirely. Challenges/rewards/admin need accounts. OK to **re-introduce optional auth** (email + Google) so progress persists, while keeping the app usable without login?
