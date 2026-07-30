# Genecode — Next.js Store

Premium men's shirt drops. Next.js 15 + Supabase + Razorpay (WhatsApp fallback).

## Quick start

```bash
npm install
cp .env.example .env.local
# Fill in Supabase + optional Razorpay keys
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Without Supabase env vars, the site uses **fallback catalog data** baked into `lib/site-config.ts`.

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com)
2. Run SQL in order:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_orders_and_cart.sql`
   - `supabase/seed.sql`
3. Copy **Project URL** and **anon key** → `.env.local`
4. Copy **service role key** → `SUPABASE_SERVICE_ROLE_KEY` (server-only, for orders + admin)

## Razorpay (optional)

Add to `.env.local`:

```
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
NEXT_PUBLIC_RAZORPAY_KEY_ID=
```

If missing, checkout creates an order and opens **WhatsApp** with order details.

## Admin

1. Set `ADMIN_EMAILS=you@example.com` in `.env.local`
2. Enable Email auth in Supabase → Authentication
3. Visit `/admin/login` → magic link
4. Manage sold-out toggles at `/admin/drops`, orders at `/admin/orders`

## Deploy (Vercel)

1. Push to GitHub
2. Import in Vercel
3. Add all env vars from `.env.example`
4. Set `NEXT_PUBLIC_SITE_URL` to your production URL

## Legacy static site

The original GitHub Pages build lives in `legacy/` for reference.

## Routes

| Route | Purpose |
|-------|---------|
| `/` | Home + active drop |
| `/archive` | Sold-out drops (The Vault) |
| `/shirt/[year]/[dropNum]/[code]` | Product page |
| `/cart` | Shopping cart |
| `/checkout` | Place order |
| `/order/[id]` | Confirmation |
| `/admin` | Dashboard |
