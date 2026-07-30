import Link from "next/link";
import type { FlatShirt } from "@/lib/types";

export function ShirtCard({ item }: { item: FlatShirt }) {
  const { drop, shirt, code, buyable, soldOut } = item;
  const displayName = shirt.name || shirt.code;
  const href = `/shirt/${drop.year}/${drop.number}/${shirt.code}`;

  const sizesHtml = shirt.sizes?.length ? (
    <div className="shirt-card__sizes">
      {shirt.sizes.map((s) => (
        <span className="shirt-card__size" key={s}>
          {s}
        </span>
      ))}
    </div>
  ) : null;

  return (
    <article
      className={`shirt-card shirt-card--revealed shirt-card--clickable${soldOut ? " shirt-card--sold-out" : ""}`}
      role="listitem"
    >
      <Link href={href} className="shirt-card__link">
        <div className="shirt-card__media">
          <img src={shirt.image} alt={displayName} loading="lazy" width={800} height={1000} />
          {soldOut && (
            <div className="shirt-card__sold-out-overlay">
              <span className="shirt-card__sold-out-label">Sold out</span>
            </div>
          )}
        </div>
        <div className="shirt-card__body">
          <p className="shirt-card__id">{code}</p>
          <h3 className="shirt-card__name">{displayName}</h3>
          {shirt.tagline && <p className="shirt-card__tagline">{shirt.tagline}</p>}
          {shirt.price && <p className="shirt-card__price">{shirt.price}</p>}
          {sizesHtml}
        </div>
      </Link>
      {buyable && (
        <div className="shirt-card__body shirt-card__body--cta">
          <Link className="shirt-card__cta" href={href}>
            View &amp; select size
          </Link>
        </div>
      )}
    </article>
  );
}
