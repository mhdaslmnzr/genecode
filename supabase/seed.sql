-- Genecode catalog seed — mirrors config.js fallback drops
-- Run after 001_initial_schema.sql

INSERT INTO drops (id, year, number, label, name, tagline, status, sort_order) VALUES
  ('2026-01', 2026, '01', 'DROP 01', 'Wear Your Code', 'WEAR YOUR CODE', 'active', 0),
  ('2025-12', 2025, '00', 'DROP 00', 'Pilot Run', 'THE FIRST SIGNAL', 'sold_out', 1),
  ('2025-11', 2025, '99', 'DROP 99', NULL, 'CARRY-OVER TEST', 'active', 2);

-- Drop 2026-01 shirts
INSERT INTO shirts (id, drop_id, code, name, tagline, price, image_url, sold_out, reveal_date, sort_order) VALUES
  ('a0000001-0001-4000-8000-000000000001', '2026-01', 'GC01', 'Shirt One', 'First move. Clean line.', '₹999', 'assets/shirts/shirt-01.jpg', false, NULL, 0),
  ('a0000001-0001-4000-8000-000000000002', '2026-01', 'GC02', 'Shirt Two', 'Second position. Same precision.', '₹999', 'assets/shirts/shirt-02.jpg', false, NULL, 1),
  ('a0000001-0001-4000-8000-000000000003', '2026-01', 'GC03', NULL, NULL, NULL, 'assets/shirts/shirt-03.jpg', false, '2026-07-10T10:00:00+00:00', 2),
  ('a0000001-0001-4000-8000-000000000004', '2026-01', 'GC04', NULL, NULL, NULL, 'assets/shirts/shirt-04.jpg', false, '2026-07-12T10:00:00+00:00', 3),
  ('a0000001-0001-4000-8000-000000000005', '2026-01', 'GC05', NULL, NULL, NULL, 'assets/shirts/shirt-05.jpg', false, '2026-07-14T10:00:00+00:00', 4),
  ('a0000001-0001-4000-8000-000000000006', '2026-01', 'GC06', NULL, NULL, NULL, 'assets/shirts/shirt-06.jpg', false, '2026-07-16T10:00:00+00:00', 5);

INSERT INTO shirt_sizes (shirt_id, size) VALUES
  ('a0000001-0001-4000-8000-000000000001', 'S'),
  ('a0000001-0001-4000-8000-000000000001', 'M'),
  ('a0000001-0001-4000-8000-000000000001', 'L'),
  ('a0000001-0001-4000-8000-000000000001', 'XL'),
  ('a0000001-0001-4000-8000-000000000002', 'S'),
  ('a0000001-0001-4000-8000-000000000002', 'M'),
  ('a0000001-0001-4000-8000-000000000002', 'L'),
  ('a0000001-0001-4000-8000-000000000002', 'XL');

-- Drop 2025-12 shirts (archive / sold out)
INSERT INTO shirts (id, drop_id, code, name, tagline, price, image_url, sold_out, reveal_date, sort_order) VALUES
  ('a0000001-0002-4000-8000-000000000001', '2025-12', 'GC01', 'Pilot One', 'Where it started.', '₹899', 'assets/shirts/shirt-01.jpg', true, NULL, 0),
  ('a0000001-0002-4000-8000-000000000002', '2025-12', 'GC02', 'Pilot Two', 'Limited run. Gone.', '₹899', 'assets/shirts/shirt-02.jpg', true, NULL, 1);

INSERT INTO shirt_sizes (shirt_id, size) VALUES
  ('a0000001-0002-4000-8000-000000000001', 'M'),
  ('a0000001-0002-4000-8000-000000000001', 'L'),
  ('a0000001-0002-4000-8000-000000000002', 'S'),
  ('a0000001-0002-4000-8000-000000000002', 'M');

-- Drop 2025-11 carry-over test
INSERT INTO shirts (id, drop_id, code, name, tagline, price, image_url, sold_out, reveal_date, sort_order) VALUES
  ('a0000001-0003-4000-8000-000000000001', '2025-11', 'GC01', 'Archive Pick', 'Still on the rack.', '₹799', 'assets/shirts/shirt-03.jpg', false, NULL, 0);

INSERT INTO shirt_sizes (shirt_id, size) VALUES
  ('a0000001-0003-4000-8000-000000000001', 'M'),
  ('a0000001-0003-4000-8000-000000000001', 'L'),
  ('a0000001-0003-4000-8000-000000000001', 'XL');
