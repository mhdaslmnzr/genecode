-- Public image storage and homepage screenshot settings

INSERT INTO storage.buckets (id, name, public)
VALUES ('site-content', 'site-content', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO site_settings (key, value) VALUES
  ('testimonial_images', '[]'::jsonb)
ON CONFLICT (key) DO NOTHING;
