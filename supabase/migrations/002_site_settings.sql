-- Public storefront settings

CREATE TABLE site_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb
);

INSERT INTO site_settings (key, value) VALUES
  ('active_drop_id', '"2026-01"'::jsonb),
  ('ticker', '{"enabled":true,"messages":["New jersey drops — stay locked on @genecode.clothing","Drop 01 live now — limited pieces only"]}'::jsonb),
  ('whatsapp_number', '"91XXXXXXXXXX"'::jsonb);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_select_site_settings"
  ON site_settings FOR SELECT TO anon USING (true);
