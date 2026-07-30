import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";

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
const service = env.SUPABASE_SERVICE_ROLE_KEY;

console.log("URL present:", !!url, url?.includes("/rest/v1") ? "(has /rest/v1 - BAD)" : "(format ok)");
console.log("Anon present:", !!anon, "prefix:", anon?.slice(0, 15));
console.log("Service present:", !!service, "prefix:", service?.slice(0, 10));

async function restTest(key, label) {
  const res = await fetch(`${url}/rest/v1/drops?select=id,year,number&limit=3`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  const text = await res.text();
  console.log(`\n${label} REST status:`, res.status);
  console.log(`${label} REST body:`, text.slice(0, 400));
}

async function jsTest(key, label) {
  const sb = createClient(url, key);
  const { data, error } = await sb
    .from("drops")
    .select("*, shirts(id, code)")
    .order("sort_order", { ascending: true });
  console.log(`\n${label} JS error:`, error?.message || null);
  console.log(`${label} JS rows:`, data?.length ?? 0);
  if (data?.[0]) {
    console.log(`${label} first drop shirts:`, data[0].shirts?.map((s) => ({ id: s.id, code: s.code })));
  }
}

await restTest(anon, "anon");
await restTest(service, "service");
await jsTest(anon, "anon");
await jsTest(service, "service");
