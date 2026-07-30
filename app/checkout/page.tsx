import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CheckoutForm } from "@/components/CheckoutForm";
import { fetchCatalog } from "@/lib/catalog";

export default async function CheckoutPage() {
  const { drops, settings } = await fetchCatalog();
  return (
    <>
      <Header />
      <main><CheckoutForm /></main>
      <Footer settings={settings} drops={drops} />
    </>
  );
}
