import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartPageClient } from "@/components/CartPageClient";
import { fetchCatalog } from "@/lib/catalog";

export default async function CartPage() {
  const { drops, settings } = await fetchCatalog();
  return (
    <>
      <Header />
      <main><CartPageClient /></main>
      <Footer settings={settings} drops={drops} />
    </>
  );
}
