-- Orders, site settings (Phase 2)

CREATE TABLE site_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb
);

INSERT INTO site_settings (key, value) VALUES
  ('active_drop_id', '"2026-01"'::jsonb),
  ('ticker', '{"enabled":true,"messages":["New jersey drops — stay locked on @genecode.clothing","Drop 01 live now — limited pieces only"]}'::jsonb),
  ('whatsapp_number', '"91XXXXXXXXXX"'::jsonb);

CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  phone text NOT NULL,
  email text,
  address text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'shipped', 'cancelled')),
  total numeric(10, 2) NOT NULL DEFAULT 0,
  razorpay_order_id text,
  razorpay_payment_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  shirt_id uuid NOT NULL REFERENCES shirts(id),
  size text NOT NULL,
  price text NOT NULL,
  quantity int NOT NULL DEFAULT 1 CHECK (quantity > 0)
);

CREATE INDEX idx_orders_created_at ON orders (created_at DESC);
CREATE INDEX idx_order_items_order_id ON order_items (order_id);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_select_site_settings"
  ON site_settings FOR SELECT TO anon USING (true);

-- Orders created only via service role (API routes)
CREATE POLICY "anon_select_own_orders_none"
  ON orders FOR SELECT TO anon USING (false);

CREATE POLICY "anon_insert_orders_none"
  ON orders FOR INSERT TO anon WITH CHECK (false);

CREATE POLICY "anon_select_order_items_none"
  ON order_items FOR SELECT TO anon USING (false);

CREATE POLICY "anon_insert_order_items_none"
  ON order_items FOR INSERT TO anon WITH CHECK (false);

-- Authenticated admin (Phase 2): service role used in API routes for now
