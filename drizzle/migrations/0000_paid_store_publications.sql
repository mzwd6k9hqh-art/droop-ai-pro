CREATE TABLE public.store_publish_drafts (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 token_hash text NOT NULL,
 html text NOT NULL,
 store_name text NOT NULL,
 checkout_session_id text UNIQUE,
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.store_publish_drafts TO service_role;
ALTER TABLE public.store_publish_drafts ENABLE ROW LEVEL SECURITY;
CREATE TABLE public.published_storefronts (
 id uuid PRIMARY KEY REFERENCES public.store_publish_drafts(id),
 html text NOT NULL,
 store_name text NOT NULL,
 checkout_session_id text NOT NULL UNIQUE,
 published_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.published_storefronts TO anon, authenticated;
GRANT ALL ON public.published_storefronts TO service_role;
ALTER TABLE public.published_storefronts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published storefronts are public" ON public.published_storefronts FOR SELECT TO anon, authenticated USING (true);