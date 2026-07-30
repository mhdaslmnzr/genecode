import Link from "next/link";

export function VaultSection() {
  return (
    <section className="vault" id="vault" aria-labelledby="vault-heading">
      <div className="vault__inner">
        <span className="vault__watermark" aria-hidden="true">2025</span>
        <div className="vault__content">
          <h2 className="vault__heading" id="vault-heading">THE VAULT</h2>
          <p className="vault__tagline">Every drop ends. The archive remembers.</p>
          <div className="vault__strip" aria-hidden="true">
            <img className="vault__thumb" src="/assets/shirts/shirt-01.jpg" alt="" width={80} height={100} loading="lazy" />
            <img className="vault__thumb" src="/assets/shirts/shirt-02.jpg" alt="" width={80} height={100} loading="lazy" />
          </div>
          <Link className="vault__cta" href="/archive">ENTER THE ARCHIVE →</Link>
        </div>
      </div>
    </section>
  );
}
