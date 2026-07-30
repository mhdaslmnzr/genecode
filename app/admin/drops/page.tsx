import Link from "next/link";
import { revalidatePath } from "next/cache";
import { fetchCatalog, formatDropTitle } from "@/lib/catalog";
import { createAdminClient } from "@/lib/supabase/admin";
import { AddDropForm, AddShirtForm } from "@/components/AdminCatalogForms";

const ALL_SIZES = ["S", "M", "L", "XL"] as const;

function refreshCatalog() {
  revalidatePath("/");
  revalidatePath("/archive");
  revalidatePath("/admin/drops");
  revalidatePath("/admin/archive");
}

async function createDrop(formData: FormData) {
  "use server";
  const admin = createAdminClient();
  if (!admin) return;
  const id = String(formData.get("id") || "").trim();
  const year = Number(formData.get("year"));
  const number = String(formData.get("number") || "").trim();
  const label = String(formData.get("label") || "").trim();
  if (!id || !year || !number || !label) return;
  const { data: lastDrop } = await admin
    .from("drops")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  await admin.from("drops").insert({
    id,
    year,
    number,
    label,
    name: String(formData.get("name") || "").trim() || null,
    tagline: String(formData.get("tagline") || "").trim(),
    status: "active",
    sort_order: (lastDrop?.sort_order ?? -1) + 1,
  });
  refreshCatalog();
}

async function createShirt(formData: FormData) {
  "use server";
  const admin = createAdminClient();
  if (!admin) return;
  const dropId = String(formData.get("dropId") || "");
  const code = String(formData.get("code") || "").trim().toUpperCase();
  const price = String(formData.get("price") || "").trim();
  const discountedPrice = String(formData.get("discountedPrice") || "").trim();
  const image = formData.get("image");
  if (
    !dropId ||
    !code ||
    !/^\d+$/.test(price) ||
    (discountedPrice && !/^\d+$/.test(discountedPrice)) ||
    !(image instanceof File) ||
    !image.size ||
    !image.type.startsWith("image/")
  ) return;
  const extension = image.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const storagePath = `products/${dropId}-${code}-${Date.now()}.${extension}`;
  const { error: imageError } = await admin.storage
    .from("site-content")
    .upload(storagePath, new Uint8Array(await image.arrayBuffer()), { contentType: image.type });
  if (imageError) return;
  const imageUrl = admin.storage.from("site-content").getPublicUrl(storagePath).data.publicUrl;
  const { data: lastShirt } = await admin
    .from("shirts")
    .select("sort_order")
    .eq("drop_id", dropId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const { data, error } = await admin
    .from("shirts")
    .insert({
      drop_id: dropId,
      code,
      name: String(formData.get("name") || "").trim() || null,
      tagline: String(formData.get("tagline") || "").trim() || null,
      price,
      discounted_price: discountedPrice || null,
      image_url: imageUrl,
      sold_out: false,
      sort_order: (lastShirt?.sort_order ?? -1) + 1,
    })
    .select("id")
    .single();
  if (!error && data) {
    await admin.from("shirt_sizes").insert(ALL_SIZES.map((size) => ({ shirt_id: data.id, size })));
  }
  refreshCatalog();
}

async function toggleSizeAvailability(formData: FormData) {
  "use server";
  const admin = createAdminClient();
  const shirtId = String(formData.get("shirtId") || "");
  const size = String(formData.get("size") || "").toUpperCase();
  const available = formData.get("available") === "true";
  if (!admin || !shirtId || !ALL_SIZES.includes(size as (typeof ALL_SIZES)[number])) return;
  if (available) {
    await admin.from("shirt_sizes").delete().eq("shirt_id", shirtId).eq("size", size);
  } else {
    await admin.from("shirt_sizes").upsert({ shirt_id: shirtId, size });
  }
  refreshCatalog();
}

async function archiveShirt(formData: FormData) {
  "use server";
  const admin = createAdminClient();
  const shirtId = String(formData.get("shirtId") || "");
  if (admin && shirtId) await admin.from("shirts").update({ sold_out: true }).eq("id", shirtId);
  refreshCatalog();
}

async function updateShirtPrices(formData: FormData) {
  "use server";
  const admin = createAdminClient();
  const shirtId = String(formData.get("shirtId") || "");
  const price = String(formData.get("price") || "").trim();
  const discountedPrice = String(formData.get("discountedPrice") || "").trim();
  if (!admin || !shirtId || !/^\d+$/.test(price) || (discountedPrice && !/^\d+$/.test(discountedPrice))) return;
  await admin
    .from("shirts")
    .update({ price, discounted_price: discountedPrice || null })
    .eq("id", shirtId);
  refreshCatalog();
}

async function archiveDrop(formData: FormData) {
  "use server";
  const admin = createAdminClient();
  const dropId = String(formData.get("dropId") || "");
  if (admin && dropId) {
    await admin.from("drops").update({ status: "sold_out" }).eq("id", dropId);
    const { data: nextDrop } = await admin
      .from("drops")
      .select("id")
      .neq("id", dropId)
      .eq("status", "active")
      .order("sort_order")
      .limit(1)
      .maybeSingle();
    if (nextDrop) await admin.from("site_settings").upsert({ key: "active_drop_id", value: nextDrop.id });
  }
  refreshCatalog();
}

async function makeActiveDrop(formData: FormData) {
  "use server";
  const admin = createAdminClient();
  const dropId = String(formData.get("dropId") || "");
  if (admin && dropId) await admin.from("site_settings").upsert({ key: "active_drop_id", value: dropId });
  refreshCatalog();
}

export default async function AdminDropsPage({
  searchParams,
}: {
  searchParams: Promise<{ drop?: string }>;
}) {
  const { drops, settings } = await fetchCatalog();
  const liveDrops = drops.filter((drop) => drop.status !== "sold_out");
  const selectedId = (await searchParams).drop;
  const selectedDrop = liveDrops.find((drop) => drop.id === selectedId);

  return (
    <main><section className="collection"><div className="collection__inner admin-content">
      <h1 className="collection__heading">Manage catalog</h1>
      <Link className="admin-nav-link" href="/admin">← Admin home</Link>

      {!selectedDrop ? <>
        <div className="admin-primary-action"><AddDropForm action={createDrop} /></div>
        <div className="admin-drop-index">
          {liveDrops.map((drop) => (
            <article className="admin-drop-card" key={drop.id}>
              <div>
                <h2 className="archive-drop__title">{formatDropTitle(drop)}</h2>
                <p>{drop.shirts.filter((shirt) => !shirt.soldOut).length} shirts</p>
              </div>
              <Link className="admin-btn" href={`/admin/drops?drop=${encodeURIComponent(drop.id)}`}>View drop</Link>
            </article>
          ))}
        </div>
      </> : (
        <section className="archive-drop admin-drop-detail">
          <Link className="admin-nav-link" href="/admin/drops">← All drops</Link>
          <div className="admin-section-heading">
            <h2 className="archive-drop__title">{formatDropTitle(selectedDrop)}</h2>
            {settings.activeDropId === selectedDrop.id ? (
              <span className="admin-badge admin-badge--live">Currently on homepage</span>
            ) : (
              <form action={makeActiveDrop}>
                <input type="hidden" name="dropId" value={selectedDrop.id} />
                <button className="admin-btn" type="submit">Show on homepage</button>
              </form>
            )}
            <form action={archiveDrop}>
              <input type="hidden" name="dropId" value={selectedDrop.id} />
              <button className="admin-btn admin-btn--ghost" type="submit">Move drop to archive</button>
            </form>
          </div>
          <div className="admin-add-shirt-action">
            <AddShirtForm action={createShirt} dropId={selectedDrop.id} dropLabel={selectedDrop.label} />
          </div>
          <ul className="admin-product-list">
            {selectedDrop.shirts.filter((shirt) => !shirt.soldOut).map((shirt) => (
              <li className="admin-row" key={shirt.code}>
                <div className="admin-row__info">
                  <strong className="admin-row__code">{shirt.code}</strong>
                  <span>{shirt.name || "Untitled"}</span>
                  {shirt.id && <form action={updateShirtPrices} className="admin-price-form">
                    <input type="hidden" name="shirtId" value={shirt.id} />
                    <label>
                      Original price
                      <span className="admin-price-input"><b>₹</b><input name="price" type="number" min="0" step="1" inputMode="numeric" defaultValue={shirt.price?.replace(/[^\d]/g, "") || ""} required /></span>
                    </label>
                    <label>
                      Discounted price
                      <span className="admin-price-input"><b>₹</b><input name="discountedPrice" type="number" min="0" step="1" inputMode="numeric" defaultValue={shirt.discountedPrice?.replace(/[^\d]/g, "") || ""} placeholder="Optional" /></span>
                    </label>
                    <button className="admin-btn" type="submit">Save prices</button>
                  </form>}
                </div>
                {shirt.id && <div className="admin-row__actions">
                  <div className="admin-size-controls" aria-label={`${shirt.code} size availability`}>
                    {ALL_SIZES.map((size) => {
                      const available = shirt.sizes.includes(size);
                      return <form action={toggleSizeAvailability} key={size}>
                        <input type="hidden" name="shirtId" value={shirt.id} />
                        <input type="hidden" name="size" value={size} />
                        <input type="hidden" name="available" value={String(available)} />
                        <button
                          className={`admin-size-btn${available ? " admin-size-btn--available" : " admin-size-btn--sold"}`}
                          type="submit"
                          title={available ? `Mark ${size} sold out` : `Restore ${size}`}
                        >
                          {size}<span>{available ? "Available" : "Sold out"}</span>
                        </button>
                      </form>;
                    })}
                  </div>
                  <form action={archiveShirt}>
                    <input type="hidden" name="shirtId" value={shirt.id} />
                    <button className="admin-btn admin-btn--ghost" type="submit">Move shirt to archive</button>
                  </form>
                </div>}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div></section></main>
  );
}
