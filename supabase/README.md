# Genecode Supabase setup (Phase 1)

Phase 1 moves catalog data (drops, shirts, sizes) into Supabase Postgres. The static site reads the catalog via the Supabase REST API with the public anon key. Row Level Security allows **read-only** public access.

Site settings (`whatsappNumber`, `instagramHandle`, `aboutText`, `ticker`, `activeDropId`) stay in `config.js` for now.

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and sign in (free tier is fine).
2. **New project** → pick a name, database password, and region.
3. Wait for the project to finish provisioning.

## 2. Run the migration

1. In the Supabase dashboard, open **SQL Editor**.
2. Open `supabase/migrations/001_initial_schema.sql` from this repo.
3. Paste the full file into the editor and click **Run**.

This creates `drops`, `shirts`, and `shirt_sizes` tables plus RLS policies (anon can `SELECT` only).

## 3. Seed catalog data

1. Still in **SQL Editor**, open `supabase/seed.sql`.
2. Paste and **Run**.

This inserts the same three drops as the `config.js` fallback (2026-01 active, 2025-12 archive, 2025-11 carry-over test).

## 4. Add credentials to config.js

1. In Supabase: **Project Settings → API**.
2. Copy **Project URL** and the **anon public** key (`anon` / `public`).
3. In `config.js`, fill in:

```js
supabase: {
  url: "https://YOUR_PROJECT_REF.supabase.co",
  anonKey: "YOUR_ANON_PUBLIC_KEY",
},
```

Do **not** commit real keys if this repo is public — use placeholders in git and set values only in your deployed copy or a private fork.

## 5. Test locally

1. Serve the site over HTTP (e.g. `npx serve .` or your usual static server).
2. Open the browser devtools **Network** tab — you should see a GET to `/rest/v1/drops?...` when Supabase is configured.
3. Confirm the home grid, carry-over section, and archive page match the database.
4. Leave `supabase.url` and `supabase.anonKey` empty to verify the site still works from `config.js` drops (fallback).

## 6. Service worker cache

After changing catalog fetch logic or JS files, bump `CACHE_NAME` in `sw.js` (currently `genecode-v3`) so returning visitors pick up the new scripts. Supabase API responses are **not** precached.

## Security note

The anon key is safe to embed in a static frontend **when RLS is enabled** and policies only grant public `SELECT`, as in Phase 1. Never expose the `service_role` key in client code. Admin write access comes in Phase 2.
