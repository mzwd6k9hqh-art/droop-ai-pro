-- Customer chats table
CREATE TABLE public.customer_chats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_avatar TEXT,
  last_message TEXT,
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  unread_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.customer_chats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sellers manage own chats"
  ON public.customer_chats
  FOR ALL
  USING (auth.uid() = seller_id)
  WITH CHECK (auth.uid() = seller_id);

CREATE INDEX idx_customer_chats_seller ON public.customer_chats(seller_id, last_message_at DESC);

-- Customer messages table
CREATE TYPE public.message_sender AS ENUM ('seller', 'customer');

CREATE TABLE public.customer_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID NOT NULL REFERENCES public.customer_chats(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL,
  sender public.message_sender NOT NULL,
  content TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.customer_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sellers manage own messages"
  ON public.customer_messages
  FOR ALL
  USING (auth.uid() = seller_id)
  WITH CHECK (auth.uid() = seller_id);

CREATE INDEX idx_customer_messages_chat ON public.customer_messages(chat_id, created_at);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_customer_chats_updated_at
  BEFORE UPDATE ON public.customer_chats
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER TABLE public.customer_chats REPLICA IDENTITY FULL;
ALTER TABLE public.customer_messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.customer_chats;
ALTER PUBLICATION supabase_realtime ADD TABLE public.customer_messages;