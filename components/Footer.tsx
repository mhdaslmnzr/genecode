import Link from "next/link";
import type { SiteSettings } from "@/lib/types";

export function Footer({ settings }: { settings: SiteSettings }) {
  const handle = settings.instagramHandle.replace(/^@/, "");
  const waNum = settings.whatsappNumber.replace(/\D/g, "");

  return (
    <footer className="site-footer" id="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <p className="site-footer__brand-name">GENECODE</p>
          <p className="site-footer__tagline">Sharp silhouettes. Quiet confidence.</p>
        </div>
        <nav className="site-footer__nav" aria-label="Explore">
          <h3 className="site-footer__nav-heading">Explore</h3>
          <ul className="site-footer__links">
            <li><Link className="site-footer__link" href="/">Home</Link></li>
            <li><Link className="site-footer__link" href="/archive">Vault</Link></li>
            <li>
              <a className="site-footer__link" href={`https://www.instagram.com/${handle}/`} target="_blank" rel="noopener noreferrer">
                {settings.instagramHandle}
              </a>
            </li>
          </ul>
        </nav>
        <div className="site-footer__order">
          <h3 className="site-footer__nav-heading">Contact</h3>
          <a className="site-footer__link" href="mailto:genecodeclothing@gmail.com">genecodeclothing@gmail.com</a>
          <a className="site-footer__link site-footer__link--cta" href={waNum ? `https://wa.me/${waNum}` : "#"} target="_blank" rel="noopener noreferrer">
            {waNum ? `+${waNum}` : "WhatsApp"}
          </a>
          <address className="site-footer__address">
            Genecode, Kuttamassery, Thottumugham, Aluva<br />683105
          </address>
        </div>
        <p className="site-footer__legal">© GENECODE · {new Date().getFullYear()}</p>
      </div>
    </footer>
  );
}
