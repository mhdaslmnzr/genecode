-- Genecode Phase 1: catalog tables + public read-only RLS

CREATE TABLE drops (
  id text PRIMARY KEY,
  year int NOT NULL,
  number text NOT NULL,
  label text NOT NULL,
  name text,
  tagline text NOT NULL,
  status text NOT NULL CHECK (status IN ('active', 'sold_out')),
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE shirts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  drop_id text NOT NULL REFERENCES drops(id) ON DELETE CASCADE,
  code text NOT NULL,
  name text,
  tagline text,
  price text,
  image_url text NOT NULL,
  sold_out boolean NOT NULL DEFAULT false,
  reveal_date timestamptz,
  sort_order int NOT NULL DEFAULT 0,
  UNIQUE (drop_id, code)
);

CREATE TABLE shirt_sizes (
  shirt_id uuid NOT NULL REFERENCES shirts(id) ON DELETE CASCADE,
  size text NOT NULL,
  PRIMARY KEY (shirt_id, size)
);

CREATE INDEX idx_drops_sort_order ON drops (sort_order);
CREATE INDEX idx_shirts_drop_id ON shirts (drop_id);
CREATE INDEX idx_shirts_sort_order ON shirts (drop_id, sort_order);

-- Row Level Security: anon can SELECT only (Phase 2 adds admin writes)
ALTER TABLE drops ENABLE ROW LEVEL SECURITY;
ALTER TABLE shirts ENABLE ROW LEVEL SECURITY;
ALTER TABLE shirt_sizes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_select_drops"
  ON drops FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "anon_select_shirts"
  ON shirts FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "anon_select_shirt_sizes"
  ON shirt_sizes FOR SELECT
  TO anon
  USING (true);
