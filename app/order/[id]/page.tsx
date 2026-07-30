import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { fetchCatalog } from "@/lib/catalog";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ paid?: string; mode?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const { drops, settings } = await fetchCatalog();

  let status = "pending";
  const admin = createAdminClient();
  if (admin) {
    const { data } = await admin.from("orders").select("status").eq("id", id).single();
    if (data) status = data.status;
  }

  return (
    <>
      <Header />
      <main>
        <section className="collection">
          <div className="collection__inner">
            <h1 className="collection__heading">Order confirmed</h1>
            <p className="about__text">
              Order ID: {id}
              {sp.paid === "1" || status === "paid" ? " — Payment received. Thank you." : ""}
              {sp.mode === "whatsapp" ? " — Complete payment via WhatsApp." : ""}
            </p>
            <Link className="insta-feed__cta" href="/">Back to shop</Link>
          </div>
        </section>
      </main>
      <Footer settings={settings} drops={drops} />
    </>
  );
}
