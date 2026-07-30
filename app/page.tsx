import { Ticker } from "@/components/Ticker";
import { ShirtGrid } from "@/components/ShirtGrid";
import { VaultSection } from "@/components/VaultSection";
import { Footer } from "@/components/Footer";
import { SectionCursorGrid } from "@/components/CursorGrid";
import { CodeDomeBackground } from "@/components/CodeDomeBackground";
import {
  fetchCatalog,
  getActiveDrop,
  getPrimaryShirts,
} from "@/lib/catalog";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const { drops, settings } = await fetchCatalog();
  const activeDrop = getActiveDrop(drops, settings.activeDropId);
  const primary = getPrimaryShirts(drops, settings.activeDropId);

  return (
    <div className="home-scroll">
      <a className="skip-link" href="#collection">Skip to collection</a>

      <main>
        <section className="hero" id="hero" aria-label="Introduction">
          <SectionCursorGrid hero />
          <Ticker settings={settings} />
          <div className="hero__inner">
            <img className="hero__logo" src="/assets/logo.png" alt="Genecode" />
            <hr className="hero__rule" />
          </div>
          <div className="hero__scroll" aria-hidden="true">
            <span className="hero__scroll-arrow" />
          </div>
        </section>

        <section className="collection" id="collection" aria-labelledby="collection-heading">
          <SectionCursorGrid />
          <div className="collection__inner">
            {activeDrop && primary.length ? <>
              <h2 className="collection__heading" id="collection-heading">{activeDrop.label}</h2>
              <ShirtGrid items={primary} />
            </> : <div className="collection-empty" id="collection-heading">
              <h2>Drops on the way — stay tuned</h2>
            </div>}
          </div>
        </section>

        <section className="about" id="about" aria-labelledby="about-heading">
          <CodeDomeBackground images={settings.codeGalleryImages} />
          <div className="about__inner">
            <h2 className="about__heading" id="about-heading">The code</h2>
            <p className="about__text">{settings.aboutText}</p>
          </div>
        </section>

        <section className="team" id="team" aria-labelledby="team-heading">
          <SectionCursorGrid />
          <div className="team__inner">
            <h2 className="team__heading" id="team-heading">BEHIND THE CODE</h2>
            <p className="team__body">
              Three siblings from Kerala on a mission — to bring sharp, limited men&apos;s fashion to a generation tired of the
              same. Every piece in every drop is handpicked. No filler. No repeats. Just pieces worth wearing.
            </p>
          </div>
        </section>

        <section className="insta-feed" id="insta-feed" aria-labelledby="insta-heading">
          <SectionCursorGrid />
          <div className="insta-feed__inner">
            <h2 className="insta-feed__heading" id="insta-heading">FOLLOW THE DROP</h2>
            <iframe
              className="insta-feed__embed"
              src="https://www.instagram.com/genecode.clothing/embed"
              title="Genecode Clothing on Instagram"
              loading="lazy"
            />
          </div>
        </section>

        <VaultSection />

        <section className="testimonials" id="testimonials" aria-labelledby="testimonials-heading">
          <SectionCursorGrid />
          <div className="testimonials__inner">
            <h2 className="testimonials__heading" id="testimonials-heading">WHAT THEY SAY</h2>
            {settings.testimonialImages.length ? (
              <div className="testimonials__scroller" role="list">
                <div className="testimonials__track">
                  {[...settings.testimonialImages, ...settings.testimonialImages].map((src, index) => (
                    <figure className="testimonial-card" role="listitem" key={`${src}-${index}`}>
                      <img src={src} alt={`Customer feedback screenshot ${(index % settings.testimonialImages.length) + 1}`} loading="lazy" />
                    </figure>
                  ))}
                </div>
              </div>
            ) : (
              <div className="content-image-placeholder">Customer feedback screenshots coming soon</div>
            )}
          </div>
        </section>
      </main>

      <Footer settings={settings} />
    </div>
  );
}
