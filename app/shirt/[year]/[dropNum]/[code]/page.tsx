import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { BuyOnWhatsAppButton } from "@/components/BuyOnWhatsAppButton";
import { fetchCatalog, findShirt, formatDropTitle } from "@/lib/catalog";

export const revalidate = 60;

export default async function ProductPage({
  params,
}: {
  params: Promise<{ year: string; dropNum: string; code: string }>;
}) {
  const { year, dropNum, code } = await params;
  const { drops, settings } = await fetchCatalog();
  const item = findShirt(drops, year, dropNum, code);
  if (!item) notFound();

  const { drop, shirt } = item;

  return (
    <>
      <main>
        <section className="collection product-page">
          <div className="collection__inner">
            <Link className="archive-hero__back" href="/">← Back to drop</Link>
            <div className="shirt-detail__layout product-page__layout">
              <div className="shirt-detail__image">
                <img src={shirt.image} alt={shirt.name || shirt.code} width={800} height={1000} />
                {item.soldOut && <span className="shirt-detail__badge">Sold out</span>}
              </div>
              <div className="shirt-detail__meta">
                <p className="shirt-detail__code">{item.code}</p>
                <p className="shirt-detail__drop">{formatDropTitle(drop)}</p>
                <h1 className="shirt-detail__title">{shirt.name || shirt.code}</h1>
                {shirt.tagline && <p className="shirt-detail__tagline">{shirt.tagline}</p>}
                {shirt.price && <p className="shirt-detail__price">{shirt.price}</p>}
                {shirt.sizes.length > 0 && (
                  <div className="shirt-detail__sizes" aria-label="Available sizes">
                    {shirt.sizes.map((s) => (
                      <span className="shirt-detail__size" key={s}>{s}</span>
                    ))}
                  </div>
                )}
                <BuyOnWhatsAppButton item={item} whatsappNumber={settings.whatsappNumber} />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer settings={settings} />
    </>
  );
}
