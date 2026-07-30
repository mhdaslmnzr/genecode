import Link from "next/link";

export function Header({ solid = true }: { solid?: boolean }) {
  return (
    <header className={`site-header${solid ? " site-header--solid" : ""}`} id="site-header">
      <div className="site-header__inner">
        <Link className="site-header__brand" href="/" aria-label="Genecode home">
          <img className="site-header__logo" src="/assets/logo.png" width={120} height={32} alt="" />
        </Link>
        <nav className="site-header__nav" aria-label="Site">
          <span className="site-header__wordmark" aria-hidden="true">
            GENECODE
          </span>
        </nav>
      </div>
    </header>
  );
}
