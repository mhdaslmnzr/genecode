import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import crypto from "crypto";

interface OrderBody {
  customerName: string;
  phone: string;
  email?: string;
  address: string;
  total: number;
  items: {
    key: string;
    shirtId?: string;
    size: string;
    price: string;
    quantity: number;
    name: string;
    code: string;
  }[];
}

function buildWhatsAppUrl(phone: string, orderId: string, items: OrderBody["items"], total: number) {
  const num = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "") || "";
  const lines = items.map((i) => `- ${i.name} (${i.code}) · ${i.size} × ${i.quantity} · ${i.price}`).join("\n");
  const msg =
    `Hi! I'd like to confirm my Genecode order.\n\nOrder: ${orderId}\n\n${lines}\n\nTotal: ₹${total.toFixed(0)}\nPhone: ${phone}\n\nPlease confirm availability and payment details.`;
  return `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as OrderBody;
    if (!body.customerName || !body.phone || !body.address || !body.items?.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const admin = createAdminClient();
    const orderId = crypto.randomUUID();

    if (admin) {
      const { error: orderErr } = await admin.from("orders").insert({
        id: orderId,
        customer_name: body.customerName,
        phone: body.phone,
        email: body.email || null,
        address: body.address,
        status: "pending",
        total: body.total,
      });

      if (orderErr) {
        console.error(orderErr);
        return NextResponse.json({ error: "Could not save order" }, { status: 500 });
      }

      const orderItems = body.items.map((item) => ({
        order_id: orderId,
        shirt_id: item.shirtId || null,
        size: item.size,
        price: item.price,
        quantity: item.quantity,
      }));

      const withShirtId = orderItems.filter((i) => i.shirt_id);
      if (withShirtId.length) {
        await admin.from("order_items").insert(withShirtId);
      }
    }

    const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;

    if (razorpayKey && razorpaySecret && admin) {
      try {
        const Razorpay = (await import("razorpay")).default;
        const rzp = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID!, key_secret: razorpaySecret });
        const amountPaise = Math.round(body.total * 100);
        const rzpOrder = await rzp.orders.create({
          amount: amountPaise,
          currency: "INR",
          receipt: orderId.slice(0, 8),
        });

        await admin.from("orders").update({ razorpay_order_id: rzpOrder.id }).eq("id", orderId);

        return NextResponse.json({
          orderId,
          razorpayOrderId: rzpOrder.id,
          razorpayKey,
          amount: amountPaise,
          customerName: body.customerName,
          phone: body.phone,
        });
      } catch (e) {
        console.warn("Razorpay unavailable, falling back to WhatsApp", e);
      }
    }

    const whatsappUrl = buildWhatsAppUrl(body.phone, orderId, body.items, body.total);
    return NextResponse.json({ orderId, whatsappUrl, mode: "whatsapp" });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
