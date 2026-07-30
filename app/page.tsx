import { Header } from "@/components/Header";
import { Ticker } from "@/components/Ticker";
import { ShirtGrid } from "@/components/ShirtGrid";
import { VaultSection } from "@/components/VaultSection";
import { Footer } from "@/components/Footer";
import {
  fetchCatalog,
  formatDropTitle,
  getActiveDrop,
  getCarryOverShirts,
  getPrimaryShirts,
} from "@/lib/catalog";

export const revalidate = 60;

export default async function HomePage() {
  const { drops, settings } = await fetchCatalog();
  const activeDrop = getActiveDrop(drops, settings.activeDropId);
  const primary = getPrimaryShirts(drops, settings.activeDropId);
  const carryOver = getCarryOverShirts(drops, settings.activeDropId);
  const dropTitle = activeDrop ? formatDropTitle(activeDrop) : "DROP 01";

  return (
    <>
      <a className="skip-link" href="#collection">Skip to collection</a>
      <Header solid={false} />
      <Ticker settings={settings} />

      <main>
        <section className="hero" id="hero" aria-label="Introduction">
          <div className="hero__inner">
            <h1 className="hero__title">GENECODE</h1>
            <hr className="hero__rule" />
            <p className="hero__tagline">{dropTitle} — {activeDrop?.tagline || ""}</p>
          </div>
          <div className="hero__scroll" aria-hidden="true">
            <span className="hero__scroll-arrow" />
          </div>
        </section>

        <section className="collection" id="collection" aria-labelledby="collection-heading">
          <div className="collection__inner">
            <h2 className="collection__heading" id="collection-heading">{activeDrop?.label || "Drop"}</h2>
            <ShirtGrid items={primary} />
          </div>
        </section>

        {carryOver.length > 0 && (
          <section className="carry-over" id="carry-over">
            <div className="carry-over__inner">
              <h2 className="carry-over__heading">STILL AVAILABLE</h2>
              <ShirtGrid items={carryOver} />
            </div>
          </section>
        )}

        <section className="about" id="about" aria-labelledby="about-heading">
          <div className="about__inner">
            <h2 className="about__heading" id="about-heading">The code</h2>
            <p className="about__text">{settings.aboutText}</p>
          </div>
        </section>

        <section className="team" id="team" aria-labelledby="team-heading">
          <div className="team__inner">
            <h2 className="team__heading" id="team-heading">THE TRIO BEHIND THE CODE</h2>
            <div className="team__grid" role="list">
              {[
                { name: "Sufaid", role: "The Visionary" },
                { name: "Thalhath", role: "The Builder" },
                { name: "Hiba", role: "The Eye" },
              ].map((m) => (
                <article className="team-card" role="listitem" key={m.name}>
                  <div className="team-card__photo" role="img" aria-label={`${m.name} — photo placeholder`} />
                  <h3 className="team-card__name">{m.name}</h3>
                  <p className="team-card__role">{m.role}</p>
                </article>
              ))}
            </div>
            <p className="team__body">
              Three siblings from Kerala on a mission — to bring sharp, limited men&apos;s fashion to a generation tired of the
              same. Every piece in every drop is handpicked. No filler. No repeats. Just pieces worth wearing.
            </p>
          </div>
        </section>

        <section className="insta-feed" id="insta-feed" aria-labelledby="insta-heading">
          <div className="insta-feed__inner">
            <h2 className="insta-feed__heading" id="insta-heading">FOLLOW THE DROP</h2>
            <p className="about__text">
              <a href={`https://www.instagram.com/${settings.instagramHandle.replace("@", "")}/`} target="_blank" rel="noopener noreferrer">
                {settings.instagramHandle}
              </a>
            </p>
            <a className="insta-feed__cta" href={`https://www.instagram.com/${settings.instagramHandle.replace("@", "")}/`} target="_blank" rel="noopener noreferrer">
              SEE ALL ON INSTAGRAM →
            </a>
          </div>
        </section>

        <VaultSection />

        <section className="testimonials" id="testimonials" aria-labelledby="testimonials-heading">
          <div className="testimonials__inner">
            <h2 className="testimonials__heading" id="testimonials-heading">WHAT THEY SAY</h2>
            <div className="testimonials__grid" role="list">
              {[
                { q: "Cleanest shirt I've owned. Got stopped twice on the first day.", who: "Arjun M., Kochi" },
                { q: "Bought GC-01, wore it to a wedding. Nobody had seen anything like it.", who: "Rahul T., Thrissur" },
                { q: "Finally, something different. Kerala needed this.", who: "Vishnu K., Calicut" },
              ].map((t) => (
                <figure className="testimonial-card" role="listitem" key={t.who}>
                  <span className="testimonial-card__mark" aria-hidden="true">&quot;</span>
                  <blockquote className="testimonial-card__quote"><p>{t.q}</p></blockquote>
                  <figcaption className="testimonial-card__cite">{t.who}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer settings={settings} drops={drops} />
    </>
  );
}
