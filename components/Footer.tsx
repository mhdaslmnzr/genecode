import Link from "next/link";
import type { SiteSettings } from "@/lib/types";
import { formatDropTitle, getActiveDrop } from "@/lib/catalog";
import type { Drop } from "@/lib/types";

export function Footer({ settings, drops }: { settings: SiteSettings; drops: Drop[] }) {
  const active = getActiveDrop(drops, settings.activeDropId);
  const dropTitle = active ? formatDropTitle(active) : "DROP 01";
  const handle = settings.instagramHandle.replace(/^@/, "");
  const waNum = settings.whatsappNumber.replace(/\D/g, "");

  return (
    <footer className="site-footer" id="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <img className="site-footer__logo" src="/assets/logo-dark.png" width={160} height={40} alt="" />
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
          <h3 className="site-footer__nav-heading">Order</h3>
          <a className="site-footer__link site-footer__link--cta" href={waNum ? `https://wa.me/${waNum}` : "#"} target="_blank" rel="noopener noreferrer">
            WhatsApp
          </a>
        </div>
        <p className="site-footer__meta">Now featuring {dropTitle}</p>
        <p className="site-footer__legal">© GENECODE · {new Date().getFullYear()}</p>
      </div>
    </footer>
  );
}
