"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";

export function CartLink() {
  const { count } = useCart();
  return (
    <Link className="site-header__link" href="/cart">
      CART{count > 0 ? ` (${count})` : ""}
    </Link>
  );
}
