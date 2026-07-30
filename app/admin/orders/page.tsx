import Link from "next/link";
import { Header } from "@/components/Header";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

async function updateStatus(formData: FormData) {
  "use server";
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  const admin = createAdminClient();
  if (!admin || !id) return;
  await admin.from("orders").update({ status }).eq("id", id);
  revalidatePath("/admin/orders");
}

export default async function AdminOrdersPage() {
  const admin = createAdminClient();
  let orders: { id: string; customer_name: string; phone: string; status: string; total: number; created_at: string }[] = [];

  if (admin) {
    const { data } = await admin.from("orders").select("*").order("created_at", { ascending: false }).limit(50);
    orders = data || [];
  }

  return (
    <>
      <Header />
      <main>
        <section className="collection">
          <div className="collection__inner">
            <h1 className="collection__heading">Orders</h1>
            <Link className="admin-nav-link" href="/admin">← Admin home</Link>
            {!orders.length ? (
              <p className="about__text">No orders yet{!admin ? " (configure SUPABASE_SERVICE_ROLE_KEY)" : ""}.</p>
            ) : (
              <ul className="cart-list">
                {orders.map((o) => (
                  <li className="cart-list__item admin-row" key={o.id}>
                    <div className="cart-list__meta admin-row__info">
                      <p className="shirt-card__name">{o.customer_name} · {o.phone}</p>
                      <p className="shirt-card__id">{o.id} · ₹{o.total} · {o.status}</p>
                      <form action={updateStatus} className="admin-form-inline">
                        <input type="hidden" name="id" value={o.id} />
                        <select name="status" defaultValue={o.status} className="admin-select">
                          {["pending", "paid", "shipped", "cancelled"].map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        <button type="submit" className="admin-btn">Update status</button>
                      </form>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
