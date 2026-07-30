# Supabase setup

Supabase stores drops, shirts, sizes, product images, testimonials, and public storefront settings. The storefront has no local product fallback.

## Setup

1. Create a Supabase project.
2. Run `migrations/001_initial_schema.sql` in the SQL editor.
3. Run `migrations/002_site_settings.sql`.
4. Run `migrations/003_homepage_images.sql`.
5. Copy the project URL, anon key, and service-role key into `.env.local`.

The anon key is safe in the browser because Row Level Security only permits public reads. Never expose the service-role key; it is used server-side solely for authenticated availability updates.
