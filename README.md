# Genecode

Limited-run men's shirt storefront built with Next.js 15 and Supabase. Customers select a shirt and size, then continue directly to WhatsApp with a pre-filled enquiry containing the product details and image link.

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). If Supabase is not configured, the storefront uses the catalog in `lib/site-config.ts`.

## Configuration

Set the variables from `.env.example`:

- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` load the public catalog.
- `SUPABASE_SERVICE_ROLE_KEY` lets the authenticated admin update shirt availability.
- `NEXT_PUBLIC_WHATSAPP_NUMBER` is the destination number, including country code and digits only.
- `ADMIN_EMAILS`, `ADMIN_PASSWORD`, and `ADMIN_SESSION_SECRET` protect the admin area.
- `CRON_SECRET` protects the daily Vercel activity check; use a random value of at least 16 characters.
- `NEXT_PUBLIC_SITE_URL` is the deployed storefront URL.

## Supabase

Run these files in order:

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_site_settings.sql`
3. `supabase/migrations/003_homepage_images.sql`
4. `supabase/seed.sql`

Public users receive read-only catalog access through Row Level Security. The service-role key must remain server-side.

## Admin

Visit `/admin/login` and sign in with an email listed in `ADMIN_EMAILS` plus `ADMIN_PASSWORD`. The `/admin/drops` screen controls whether each shirt is available or sold out.

The `/admin/content` screen accepts any number of customer-feedback screenshots for the homepage carousel.

## Routes

| Route | Purpose |
|---|---|
| `/` | Active drop and available shirts |
| `/archive` | Sold-out drops |
| `/shirt/[year]/[dropNum]/[code]` | Product, size selection, and WhatsApp purchase link |
| `/admin` | Catalog administration |

The original static site is retained in `legacy/` for reference.

## Keeping Supabase active on Vercel

`vercel.json` schedules `/api/cron/keep-supabase-active` once per day. The route performs a small read from the `drops` table and returns an error if Supabase cannot be reached.

Add the same strong `CRON_SECRET` value to the Vercel project's Production environment, then redeploy. Vercel automatically sends it as a Bearer token when invoking the cron route. Cron status and logs appear under **Project → Settings → Cron Jobs**.
