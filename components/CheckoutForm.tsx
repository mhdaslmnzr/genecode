"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";

export function CheckoutForm() {
  const { items, total, clearCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!items.length) return;
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const payload = {
      customerName: String(form.get("name")),
      phone: String(form.get("phone")),
      email: String(form.get("email") || ""),
      address: String(form.get("address")),
      items: items.map((i) => ({
        key: i.key,
        shirtId: i.shirtId,
        size: i.size,
        price: i.price,
        quantity: i.quantity,
        name: i.name,
        code: `${i.year}/${i.dropNum}/${i.code}`,
      })),
      total,
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");

      if (data.razorpayOrderId && data.razorpayKey) {
        await openRazorpay(data);
      } else if (data.whatsappUrl) {
        clearCart();
        window.open(data.whatsappUrl, "_blank");
        router.push(`/order/${data.orderId}?mode=whatsapp`);
      } else {
        clearCart();
        router.push(`/order/${data.orderId}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function openRazorpay(data: {
    razorpayOrderId: string;
    razorpayKey: string;
    orderId: string;
    amount: number;
    customerName: string;
    phone: string;
  }) {
    return new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => {
        const Razorpay = (window as unknown as { Razorpay: new (o: object) => { open: () => void } }).Razorpay;
        const rzp = new Razorpay({
          key: data.razorpayKey,
          amount: data.amount,
          currency: "INR",
          name: "Genecode",
          description: "Order payment",
          order_id: data.razorpayOrderId,
          handler: async (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
            await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: data.orderId,
                ...response,
              }),
            });
            clearCart();
            router.push(`/order/${data.orderId}?paid=1`);
            resolve();
          },
          prefill: { name: data.customerName, contact: data.phone },
          theme: { color: "#8B0000" },
        });
        rzp.open();
      };
      script.onerror = () => reject(new Error("Razorpay failed to load"));
      document.body.appendChild(script);
    });
  }

  if (!items.length) {
    return (
      <section className="collection">
        <div className="collection__inner">
          <p className="about__text">Your cart is empty.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="collection">
      <div className="collection__inner checkout-form">
        <h1 className="collection__heading">Checkout</h1>
        <p className="about__text">Total: ₹{total.toFixed(0)}</p>
        <form onSubmit={handleSubmit} className="checkout-form__fields">
          <label>
            Full name
            <input name="name" required autoComplete="name" />
          </label>
          <label>
            Phone
            <input name="phone" required type="tel" autoComplete="tel" />
          </label>
          <label>
            Email (optional)
            <input name="email" type="email" autoComplete="email" />
          </label>
          <label>
            Delivery address
            <textarea name="address" required rows={3} />
          </label>
          {error && <p className="checkout-form__error">{error}</p>}
          <button type="submit" className="insta-feed__cta" disabled={loading}>
            {loading ? "Processing…" : "Place order"}
          </button>
        </form>
      </div>
    </section>
  );
}
