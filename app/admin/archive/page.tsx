import Link from "next/link";
import { revalidatePath } from "next/cache";
import { fetchCatalog, formatDropTitle, getArchiveDrops } from "@/lib/catalog";
import { createAdminClient } from "@/lib/supabase/admin";

function refreshCatalog() {
  revalidatePath("/");
  revalidatePath("/archive");
  revalidatePath("/admin/drops");
  revalidatePath("/admin/archive");
}

async function restoreShirt(formData: FormData) {
  "use server";
  const admin = createAdminClient();
  const shirtId = String(formData.get("shirtId") || "");
  if (admin && shirtId) await admin.from("shirts").update({ sold_out: false }).eq("id", shirtId);
  refreshCatalog();
}

async function restoreDrop(formData: FormData) {
  "use server";
  const admin = createAdminClient();
  const dropId = String(formData.get("dropId") || "");
  if (admin && dropId) await admin.from("drops").update({ status: "active" }).eq("id", dropId);
  refreshCatalog();
}

export default async function AdminArchivePage() {
  const { drops } = await fetchCatalog();
  const archived = getArchiveDrops(drops);

  return (
    <main><section className="collection"><div className="collection__inner">
      <h1 className="collection__heading">Archive</h1>
      <Link className="admin-nav-link" href="/admin">← Admin home</Link>
      {!archived.length && <p className="about__text">The archive is empty.</p>}
      {archived.map((drop) => (
        <section className="archive-drop" key={drop.id}>
          <div className="admin-section-heading">
            <h2 className="archive-drop__title">{formatDropTitle(drop)}</h2>
            {drop.status === "sold_out" && <form action={restoreDrop}>
              <input type="hidden" name="dropId" value={drop.id} />
              <button className="admin-btn" type="submit">Restore whole drop</button>
            </form>}
          </div>
          <ul className="admin-product-list">
            {drop.shirts.map((shirt) => (
              <li className="admin-row" key={shirt.code}>
                <div className="admin-row__info">
                  <strong className="admin-row__code">{shirt.code}</strong>
                  <span>{shirt.name || "Untitled"}</span>
                  <span>{shirt.sizes.join(", ") || "No sizes"}</span>
                </div>
                {drop.status !== "sold_out" && shirt.id && <form action={restoreShirt}>
                  <input type="hidden" name="shirtId" value={shirt.id} />
                  <button className="admin-btn" type="submit">Restore shirt</button>
                </form>}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div></section></main>
  );
}
