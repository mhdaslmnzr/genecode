"use client";

import { useState } from "react";
import type { FlatShirt } from "@/lib/types";
import { formatPrice } from "@/lib/price";

export function BuyOnWhatsAppButton({
  item,
  whatsappNumber,
}: {
  item: FlatShirt;
  whatsappNumber: string;
}) {
  const [size, setSize] = useState(item.shirt.sizes[0] || "M");

  if (!item.buyable) {
    return <p className="shirt-detail__status shirt-detail__status--sold-out">Sold out</p>;
  }

  function openWhatsApp() {
    const phone = whatsappNumber.replace(/\D/g, "");
    const imageUrl = item.shirt.image.startsWith("http")
      ? item.shirt.image
      : new URL(item.shirt.image, window.location.origin).toString();
    const productUrl = window.location.href.split("?")[0];
    const message = [
      "Hi, I'm interested in this Genecode shirt:",
      "",
      `${item.shirt.name || item.shirt.code} (${item.code})`,
      `Size: ${size}`,
      item.shirt.discountedPrice
        ? `Price: ${formatPrice(item.shirt.discountedPrice)} (was ${formatPrice(item.shirt.price)})`
        : item.shirt.price ? `Price: ${formatPrice(item.shirt.price)}` : "",
      `Image: ${imageUrl}`,
      `Product: ${productUrl}`,
    ]
      .filter(Boolean)
      .join("\n");

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="product-add">
      {item.shirt.sizes.length > 0 && (
        <div className="product-add__sizes">
          <label htmlFor="size-select">Size</label>
          <select id="size-select" value={size} onChange={(e) => setSize(e.target.value)}>
            {item.shirt.sizes.map((availableSize) => (
              <option key={availableSize} value={availableSize}>{availableSize}</option>
            ))}
          </select>
        </div>
      )}
      <button type="button" className="shirt-detail__cta" onClick={openWhatsApp}>
        Buy on WhatsApp
      </button>
    </div>
  );
}
