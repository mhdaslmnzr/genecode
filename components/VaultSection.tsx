import Link from "next/link";

export function VaultSection() {
  return (
    <section className="vault" id="vault" aria-labelledby="vault-heading">
      <div className="vault__inner">
        <div className="vault__content">
          <h2 className="vault__heading" id="vault-heading">THE VAULT</h2>
          <p className="vault__tagline">Every drop ends. The archive remembers.</p>
          <Link className="vault__cta" href="/archive">ENTER THE ARCHIVE →</Link>
        </div>
      </div>
    </section>
  );
}
