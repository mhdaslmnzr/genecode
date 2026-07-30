import { readFileSync } from "fs";
import { createServerClient } from "@supabase/ssr";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split("\n")
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const anon = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const cookieStore = { cookies: [] };
const supabase = createServerClient(url, anon, {
  cookies: {
    getAll() {
      return cookieStore.cookies;
    },
    setAll(cookiesToSet) {
      cookiesToSet.forEach(({ name, value }) => cookieStore.cookies.push({ name, value }));
    },
  },
});

const { data, error } = await supabase
  .from("drops")
  .select("*, shirts(*, shirt_sizes(size))")
  .order("sort_order", { ascending: true });

console.log("SSR client error:", error?.message || null);
console.log("SSR client rows:", data?.length ?? 0);
if (data?.[0]) {
  const shirts = data[0].shirts;
  console.log("First drop shirt ids:", shirts?.map((s) => s.id));
}
