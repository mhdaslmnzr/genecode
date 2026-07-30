import { createClient } from "@supabase/supabase-js";
import { DEFAULT_SETTINGS } from "@/lib/site-config";
import type { Drop, FlatShirt, Shirt, SiteSettings } from "@/lib/types";

export function formatShirtCode(drop: Drop, shirt: Shirt) {
  return `${drop.year}/${drop.number}/${shirt.code}`;
}

export function formatDropTitle(drop: Drop) {
  const base = drop.label || `DROP ${drop.number}`;
  return drop.name ? `${base} — ${drop.name}` : base;
}

export function shirtKey(drop: Drop, shirt: Shirt) {
  return `${drop.id}:${shirt.code}`;
}

export function isBuyable(drop: Drop, shirt: Shirt) {
  return !shirt.soldOut && drop.status !== "sold_out" && shirt.sizes.length > 0;
}

export function flattenShirt(drop: Drop, shirt: Shirt): FlatShirt {
  return {
    drop,
    shirt,
    code: formatShirtCode(drop, shirt),
    key: shirtKey(drop, shirt),
    buyable: isBuyable(drop, shirt),
    soldOut: shirt.soldOut || drop.status === "sold_out",
  };
}

function normalizeImage(url: string) {
  if (!url) return "";
  if (url.startsWith("http") || url.startsWith("/")) return url;
  return `/${url.replace(/^assets\//, "assets/")}`;
}

function mapDbDrop(row: Record<string, unknown>): Drop {
  const shirtsRaw = (row.shirts as Record<string, unknown>[]) || [];
  return {
    id: row.id as string,
    year: row.year as number,
    number: row.number as string,
    label: row.label as string,
    name: (row.name as string) || null,
    tagline: row.tagline as string,
    status: row.status as Drop["status"],
    shirts: shirtsRaw
      .sort((a, b) => (a.sort_order as number) - (b.sort_order as number))
      .map((s) => {
        const sizesRaw = (s.shirt_sizes as { size: string }[]) || [];
        return {
          id: s.id as string,
          code: s.code as string,
          name: (s.name as string) || null,
          tagline: (s.tagline as string) || null,
          price: (s.price as string) || null,
          discountedPrice: (s.discounted_price as string) || null,
          image: normalizeImage(s.image_url as string),
          sizes: sizesRaw.map((x) => x.size),
          soldOut: !!s.sold_out,
        };
      }),
  };
}

export async function fetchCatalog(): Promise<{ drops: Drop[]; settings: SiteSettings }> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return { drops: [], settings: DEFAULT_SETTINGS };
  }

  try {
    // Public catalog read — plain client (no cookies). SSR cookie client can throw
    // outside a request or fail silently into FALLBACK_DROPS (shirts without id).
    const supabase = createClient(url, key, { auth: { persistSession: false } });
    const [catalogResult, settingsResult] = await Promise.all([
      supabase
        .from("drops")
        .select("*, shirts(*, shirt_sizes(size))")
        .order("sort_order", { ascending: true }),
      supabase.from("site_settings").select("key, value"),
    ]);

    const drops = catalogResult.error ? [] : (catalogResult.data || []).map(mapDbDrop);
    let settings = { ...DEFAULT_SETTINGS };

    const settingsRows = settingsResult.data;
    if (settingsRows) {
      for (const row of settingsRows) {
        if (row.key === "active_drop_id" && typeof row.value === "string") {
          settings = { ...settings, activeDropId: row.value.replace(/"/g, "") };
        }
        if (row.key === "whatsapp_number" && typeof row.value === "string") {
          settings = { ...settings, whatsappNumber: row.value.replace(/"/g, "") };
        }
        if (row.key === "ticker" && row.value && typeof row.value === "object") {
          settings = { ...settings, ticker: row.value as SiteSettings["ticker"] };
        }
        if (row.key === "testimonial_images" && Array.isArray(row.value)) {
          settings = {
            ...settings,
            testimonialImages: row.value.filter((value): value is string => typeof value === "string"),
          };
        }
      }
    }

    return { drops, settings };
  } catch {
    return { drops: [], settings: DEFAULT_SETTINGS };
  }
}

export function getActiveDrop(drops: Drop[], activeDropId: string) {
  return (
    drops.find((drop) => drop.id === activeDropId && drop.status !== "sold_out") ||
    drops.find((drop) => drop.status !== "sold_out") ||
    null
  );
}

export function getArchiveDrops(drops: Drop[]) {
  return drops
    .map((drop) => ({
      ...drop,
      shirts: drop.status === "sold_out" ? drop.shirts : drop.shirts.filter((shirt) => shirt.soldOut),
    }))
    .filter((drop) => drop.status === "sold_out" || drop.shirts.length > 0)
    .sort((a, b) => b.year - a.year || String(b.number).localeCompare(String(a.number)));
}

export function getPrimaryShirts(drops: Drop[], activeDropId: string) {
  const drop = getActiveDrop(drops, activeDropId);
  if (!drop) return [];
  return drop.shirts.filter((shirt) => !shirt.soldOut).map((shirt) => flattenShirt(drop, shirt));
}

export function findShirt(drops: Drop[], year: string, dropNum: string, code: string) {
  const drop = drops.find((d) => String(d.year) === year && d.number === dropNum);
  if (!drop) return null;
  const shirt = drop.shirts.find((s) => s.code.toUpperCase() === code.toUpperCase());
  if (!shirt) return null;
  return flattenShirt(drop, shirt);
}

export function parsePrice(price: string | null): number {
  if (!price) return 0;
  const n = parseFloat(price.replace(/[^\d.]/g, ""));
  return Number.isNaN(n) ? 0 : n;
}
