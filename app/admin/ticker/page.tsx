import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { fetchCatalog } from "@/lib/catalog";
import { createAdminClient } from "@/lib/supabase/admin";

async function updateTicker(formData: FormData) {
  "use server";
  const admin = createAdminClient();
  if (!admin) throw new Error("Supabase admin client is not configured.");
  const messages = String(formData.get("messages") || "")
    .split(/\r?\n/)
    .map((message) => message.trim())
    .filter(Boolean);
  const { error } = await admin.from("site_settings").upsert({
    key: "ticker",
    value: { enabled: formData.get("enabled") === "on", messages },
  });
  if (error) throw new Error(`Unable to save ticker: ${error.message}`);
  revalidatePath("/");
  revalidatePath("/admin/ticker");
  redirect("/admin/ticker?saved=1");
}

export default async function AdminTickerPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const { settings } = await fetchCatalog();
  const saved = (await searchParams).saved === "1";
  return (
    <main><section className="collection"><div className="collection__inner admin-content">
      <h1 className="collection__heading">Edit ticker</h1>
      <Link className="admin-nav-link" href="/admin">← Admin home</Link>
      <section className="admin-content-section">
        {saved && <p className="admin-success" role="status">Ticker saved. The homepage now uses these messages.</p>}
        <form action={updateTicker} className="admin-upload-card">
          <label className="admin-checkbox-label">
            <input type="checkbox" name="enabled" defaultChecked={settings.ticker.enabled} />
            Show ticker on the website
          </label>
          <label>
            Ticker messages — one message per line
            <textarea name="messages" rows={5} defaultValue={settings.ticker.messages.join("\n")} />
          </label>
          <p className="admin-hint admin-hint--wide">
            Tip: Always use four ticker messages and make each one a longer sentence. A fuller ticker track moves more smoothly and makes the scrolling speed feel faster and more consistent.
          </p>
          <button className="admin-btn" type="submit">Save ticker</button>
        </form>
      </section>
    </div></section></main>
  );
}
