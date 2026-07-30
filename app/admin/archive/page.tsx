import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { fetchCatalog, formatDropTitle, getArchiveDrops } from "@/lib/catalog";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminDeleteButton } from "@/components/AdminDeleteButton";
import { AdminNotice } from "@/components/AdminNotice";

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
  if (!admin || !shirtId) redirect("/admin/archive?error=Unable+to+restore+shirt");
  const { error } = await admin.from("shirts").update({ sold_out: false }).eq("id", shirtId);
  refreshCatalog();
  redirect(error ? "/admin/archive?error=Unable+to+restore+shirt" : "/admin/archive?success=Shirt+restored");
}

async function restoreDrop(formData: FormData) {
  "use server";
  const admin = createAdminClient();
  const dropId = String(formData.get("dropId") || "");
  if (!admin || !dropId) redirect("/admin/archive?error=Unable+to+restore+drop");
  const { error } = await admin.from("drops").update({ status: "active" }).eq("id", dropId);
  refreshCatalog();
  redirect(error ? "/admin/archive?error=Unable+to+restore+drop" : "/admin/archive?success=Drop+restored");
}

async function deleteShirt(formData: FormData) {
  "use server";
  const admin = createAdminClient();
  const shirtId = String(formData.get("shirtId") || "");
  if (!admin || !shirtId) return;
  const { data: shirt } = await admin.from("shirts").select("image_url").eq("id", shirtId).maybeSingle();
  const { error: deleteError } = await admin.from("shirts").delete().eq("id", shirtId);
  if (shirt?.image_url) {
    const marker = "/storage/v1/object/public/site-content/";
    try {
      const pathname = new URL(shirt.image_url).pathname;
      if (pathname.includes(marker)) await admin.storage.from("site-content").remove([decodeURIComponent(pathname.split(marker)[1])]);
    } catch {}
  }
  refreshCatalog();
  redirect(deleteError ? "/admin/archive?error=Unable+to+delete+shirt" : "/admin/archive?success=Shirt+deleted+permanently");
}

async function deleteDrop(formData: FormData) {
  "use server";
  const admin = createAdminClient();
  const dropId = String(formData.get("dropId") || "");
  if (!admin || !dropId) return;
  const { data: shirts } = await admin.from("shirts").select("image_url").eq("drop_id", dropId);
  const { error: deleteError } = await admin.from("drops").delete().eq("id", dropId);
  const marker = "/storage/v1/object/public/site-content/";
  const paths = (shirts || []).flatMap((shirt) => {
    try {
      const pathname = new URL(shirt.image_url).pathname;
      return pathname.includes(marker) ? [decodeURIComponent(pathname.split(marker)[1])] : [];
    } catch { return []; }
  });
  if (paths.length) await admin.storage.from("site-content").remove(paths);
  refreshCatalog();
  redirect(deleteError ? "/admin/archive?error=Unable+to+delete+drop" : "/admin/archive?success=Drop+deleted+permanently");
}

export default async function AdminArchivePage({ searchParams }: { searchParams: Promise<{ success?: string; error?: string }> }) {
  const { drops } = await fetchCatalog();
  const archived = getArchiveDrops(drops);
  const notice = await searchParams;

  return (
    <main><section className="collection"><div className="collection__inner">
      <h1 className="collection__heading">Archive</h1>
      <Link className="admin-nav-link" href="/admin">← Admin home</Link>
      <AdminNotice success={notice.success} error={notice.error} />
      {!archived.length && <p className="about__text">The archive is empty.</p>}
      {archived.map((drop) => (
        <section className="archive-drop" key={drop.id}>
          <div className="admin-section-heading">
            <h2 className="archive-drop__title">{formatDropTitle(drop)}</h2>
            {drop.status === "sold_out" && <form action={restoreDrop}>
              <input type="hidden" name="dropId" value={drop.id} />
              <button className="admin-btn" type="submit">Restore whole drop</button>
            </form>}
            <form action={deleteDrop}>
              <input type="hidden" name="dropId" value={drop.id} />
              <AdminDeleteButton label="Delete drop" />
            </form>
          </div>
          <ul className="admin-product-list">
            {drop.shirts.map((shirt) => (
              <li className="admin-row" key={shirt.code}>
                <div className="admin-row__info">
                  <strong className="admin-row__code">{shirt.code}</strong>
                  <span>{shirt.name || "Untitled"}</span>
                  <span>{shirt.sizes.join(", ") || "No sizes"}</span>
                </div>
                {shirt.id && <div className="admin-row__actions">
                  {drop.status !== "sold_out" && <form action={restoreShirt}>
                    <input type="hidden" name="shirtId" value={shirt.id} />
                    <button className="admin-btn" type="submit">Restore shirt</button>
                  </form>}
                  <form action={deleteShirt}>
                    <input type="hidden" name="shirtId" value={shirt.id} />
                    <AdminDeleteButton label="Delete shirt" />
                  </form>
                </div>}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div></section></main>
  );
}
