import type { Drop, SiteSettings } from "./types";

export const FALLBACK_SETTINGS: SiteSettings = {
  activeDropId: "2026-01",
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "91XXXXXXXXXX",
  instagramHandle: "@genecode.clothing",
  aboutText:
    "Genecode is a men's shirt label built on sharp silhouettes and quiet confidence. Drop 01 is six pieces—released on a rhythm, not a noise.",
  ticker: {
    enabled: true,
    messages: [
      "New jersey drops — stay locked on @genecode.clothing",
      "Drop 01 live now — limited pieces only",
    ],
  },
};

function img(path: string) {
  return path.startsWith("/") ? path : `/${path.replace(/^assets\//, "assets/")}`;
}

export const FALLBACK_DROPS: Drop[] = [
  {
    id: "2026-01",
    year: 2026,
    number: "01",
    label: "DROP 01",
    name: "Wear Your Code",
    tagline: "WEAR YOUR CODE",
    status: "active",
    shirts: [
      { code: "GC01", name: "Shirt One", tagline: "First move. Clean line.", price: "₹999", sizes: ["S", "M", "L", "XL"], image: img("assets/shirts/shirt-01.jpg"), soldOut: false },
      { code: "GC02", name: "Shirt Two", tagline: "Second position. Same precision.", price: "₹999", sizes: ["S", "M", "L", "XL"], image: img("assets/shirts/shirt-02.jpg"), soldOut: false },
      { code: "GC03", name: "Shirt Three", tagline: "Third position.", price: "₹999", sizes: ["S", "M", "L", "XL"], image: img("assets/shirts/shirt-03.jpg"), soldOut: false },
      { code: "GC04", name: "Shirt Four", tagline: "Fourth line.", price: "₹999", sizes: ["S", "M", "L", "XL"], image: img("assets/shirts/shirt-04.jpg"), soldOut: false },
      { code: "GC05", name: "Shirt Five", tagline: "Fifth cut.", price: "₹999", sizes: ["S", "M", "L", "XL"], image: img("assets/shirts/shirt-05.jpg"), soldOut: false },
      { code: "GC06", name: "Shirt Six", tagline: "Final piece.", price: "₹999", sizes: ["S", "M", "L", "XL"], image: img("assets/shirts/shirt-06.jpg"), soldOut: false },
    ],
  },
  {
    id: "2025-12",
    year: 2025,
    number: "00",
    label: "DROP 00",
    name: "Pilot Run",
    tagline: "THE FIRST SIGNAL",
    status: "sold_out",
    shirts: [
      { code: "GC01", name: "Pilot One", tagline: "Where it started.", price: "₹899", sizes: ["M", "L"], image: img("assets/shirts/shirt-01.jpg"), soldOut: true },
      { code: "GC02", name: "Pilot Two", tagline: "Limited run. Gone.", price: "₹899", sizes: ["S", "M"], image: img("assets/shirts/shirt-02.jpg"), soldOut: true },
    ],
  },
  {
    id: "2025-11",
    year: 2025,
    number: "99",
    label: "DROP 99",
    name: null,
    tagline: "CARRY-OVER TEST",
    status: "active",
    shirts: [
      { code: "GC01", name: "Archive Pick", tagline: "Still on the rack.", price: "₹799", sizes: ["M", "L", "XL"], image: img("assets/shirts/shirt-03.jpg"), soldOut: false },
    ],
  },
];
