import Link from "next/link";
import { Header } from "@/components/Header";
import { fetchCatalog, formatDropTitle } from "@/lib/catalog";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

async function toggleSoldOut(formData: FormData) {
  "use server";
  const shirtId = String(formData.get("shirtId"));
  const soldOut = formData.get("soldOut") === "true";
  const admin = createAdminClient();
  if (!admin || !shirtId) return;
  await admin.from("shirts").update({ sold_out: !soldOut }).eq("id", shirtId);
  revalidatePath("/");
  revalidatePath("/admin/drops");
}

export default async function AdminDropsPage() {
  const { drops } = await fetchCatalog();

  return (
    <>
      <Header />
      <main>
        <section className="collection">
          <div className="collection__inner">
            <h1 className="collection__heading">Manage drops</h1>
            <Link className="admin-nav-link" href="/admin">← Admin home</Link>
            {drops.map((drop) => (
              <div className="archive-drop" key={drop.id}>
                <h2 className="archive-drop__title">{formatDropTitle(drop)}</h2>
                <ul className="cart-list">
                  {drop.shirts.map((shirt) => (
                    <li className="cart-list__item admin-row" key={shirt.code}>
                      <div className="admin-row__info">
                        <strong className="admin-row__code">{shirt.code}</strong>
                        <span className="admin-row__name">{shirt.name || "Untitled"}</span>
                        <span
                          className={
                            shirt.soldOut ? "admin-badge admin-badge--sold" : "admin-badge admin-badge--live"
                          }
                        >
                          {shirt.soldOut ? "Sold out" : "Available"}
                        </span>
                      </div>
                      {shirt.id ? (
                        <form action={toggleSoldOut}>
                          <input type="hidden" name="shirtId" value={shirt.id} />
                          <input type="hidden" name="soldOut" value={String(!!shirt.soldOut)} />
                          <button type="submit" className="admin-btn">
                            {shirt.soldOut ? "Mark available" : "Mark sold out"}
                          </button>
                        </form>
                      ) : (
                        <p className="admin-hint">Connect Supabase + run seed to enable toggles.</p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
