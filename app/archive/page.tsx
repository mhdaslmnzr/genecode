import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ShirtGrid } from "@/components/ShirtGrid";
import { fetchCatalog, formatDropTitle, getArchiveDrops } from "@/lib/catalog";
import { flattenShirt } from "@/lib/catalog";

export const revalidate = 60;

export default async function ArchivePage() {
  const { drops, settings } = await fetchCatalog();
  const archived = getArchiveDrops(drops);

  return (
    <>
      <Header />
      <main>
        <section className="archive-hero" id="archive" aria-labelledby="archive-heading">
          <div className="archive-hero__inner">
            <h1 className="archive-hero__title" id="archive-heading">ARCHIVE</h1>
            <p className="archive-hero__subtitle">Past drops. Sold out. Still part of the code.</p>
            <Link className="archive-hero__back" href="/">← Back to current drop</Link>
          </div>
        </section>

        <div className="archive-root">
          {!archived.length ? (
            <p className="archive-empty">No archived drops yet.</p>
          ) : (
            archived.map((drop) => {
              const items = drop.shirts.map((s) => flattenShirt(drop, s));
              return (
                <section className="archive-drop" key={drop.id} aria-labelledby={`drop-${drop.id}`}>
                  <div className="archive-drop__header">
                    <h2 className="archive-drop__title" id={`drop-${drop.id}`}>{formatDropTitle(drop)}</h2>
                    <span className="archive-drop__year">{drop.year}</span>
                  </div>
                  <ShirtGrid items={items} />
                </section>
              );
            })
          )}
        </div>
      </main>
      <Footer settings={settings} drops={drops} />
    </>
  );
}
