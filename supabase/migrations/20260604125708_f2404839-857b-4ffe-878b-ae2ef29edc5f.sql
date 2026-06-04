
-- Ensure pgvector is available for long-term memory (assistant_memory already uses it)
CREATE EXTENSION IF NOT EXISTS vector;

-- Activity logs table
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  event_type text NOT NULL,
  action text,
  target text,
  route text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  session_id text,
  ip_address text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.activity_logs TO authenticated;
GRANT ALL ON public.activity_logs TO service_role;

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own activity logs"
  ON public.activity_logs
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS activity_logs_user_id_created_at_idx
  ON public.activity_logs (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS activity_logs_event_type_idx
  ON public.activity_logs (event_type);

CREATE INDEX IF NOT EXISTS activity_logs_route_idx
  ON public.activity_logs (route);
