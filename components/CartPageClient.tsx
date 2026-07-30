"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";

export function CartPageClient() {
  const { items, total, updateQuantity, removeItem } = useCart();

  if (!items.length) {
    return (
      <section className="collection">
        <div className="collection__inner">
          <h1 className="collection__heading">Your cart</h1>
          <p className="about__text">Nothing here yet.</p>
          <Link className="insta-feed__cta" href="/">Continue shopping</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="collection">
      <div className="collection__inner">
        <h1 className="collection__heading">Your cart</h1>
        <ul className="cart-list">
          {items.map((item) => (
            <li className="cart-list__item" key={`${item.key}-${item.size}`}>
              <img className="cart-list__thumb" src={item.image} alt="" width={80} height={100} />
              <div className="cart-list__meta">
                <p className="shirt-card__name">{item.name}</p>
                <p className="shirt-card__id">{item.year}/{item.dropNum}/{item.code} · Size {item.size}</p>
                <p className="shirt-card__price">{item.price}</p>
                <div className="cart-list__qty">
                  <button type="button" onClick={() => updateQuantity(item.key, item.size, item.quantity - 1)} aria-label="Decrease">−</button>
                  <span>{item.quantity}</span>
                  <button type="button" onClick={() => updateQuantity(item.key, item.size, item.quantity + 1)} aria-label="Increase">+</button>
                </div>
                <button type="button" className="cart-list__remove" onClick={() => removeItem(item.key, item.size)}>Remove</button>
              </div>
            </li>
          ))}
        </ul>
        <p className="cart-list__total">Total: ₹{total.toFixed(0)}</p>
        <Link className="insta-feed__cta" href="/checkout">Proceed to checkout</Link>
      </div>
    </section>
  );
}
