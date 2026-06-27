/**
 * GENECODE site config — operator cheatsheet:
 *
 * Feature new drop on home     → add drop object, set activeDropId to its id
 * Mark piece sold out           → soldOut: true on shirt
 * Retire entire drop            → status: "sold_out" on drop → appears on archive
 * Reveal locked shirt           → revealDate: null + fill name/price/sizes
 * New ticker line               → add string to ticker.messages
 */
const GENECODE_CONFIG = {
  whatsappNumber: "91XXXXXXXXXX",
  instagramHandle: "@genecode.clothing",
  aboutText:
    "Genecode is a men's shirt label built on sharp silhouettes and quiet confidence. Drop 01 is six pieces—released on a rhythm, not a noise. Replace this with your real story when you're ready.",

  activeDropId: "2026-01",

  ticker: {
    enabled: true,
    messages: [
      "New jersey drops — stay locked on @genecode.clothing",
      "Drop 01 live now — limited pieces only",
    ],
  },

  drops: [
    {
      id: "2026-01",
      year: 2026,
      number: "01",
      label: "DROP 01",
      name: "Wear Your Code",
      tagline: "WEAR YOUR CODE",
      status: "active",
      shirts: [
        {
          code: "GC01",
          name: "Shirt One",
          tagline: "First move. Clean line.",
          price: "₹999",
          sizes: ["S", "M", "L", "XL"],
          image: "assets/shirts/shirt-01.jpg",
          revealDate: null,
          soldOut: false,
        },
        {
          code: "GC02",
          name: "Shirt Two",
          tagline: "Second position. Same precision.",
          price: "₹999",
          sizes: ["S", "M", "L", "XL"],
          image: "assets/shirts/shirt-02.jpg",
          revealDate: null,
          soldOut: false,
        },
        {
          code: "GC03",
          name: null,
          tagline: null,
          price: null,
          sizes: [],
          image: "assets/shirts/shirt-03.jpg",
          revealDate: "2026-07-10T10:00:00",
          soldOut: false,
        },
        {
          code: "GC04",
          name: null,
          tagline: null,
          price: null,
          sizes: [],
          image: "assets/shirts/shirt-04.jpg",
          revealDate: "2026-07-12T10:00:00",
          soldOut: false,
        },
        {
          code: "GC05",
          name: null,
          tagline: null,
          price: null,
          sizes: [],
          image: "assets/shirts/shirt-05.jpg",
          revealDate: "2026-07-14T10:00:00",
          soldOut: false,
        },
        {
          code: "GC06",
          name: null,
          tagline: null,
          price: null,
          sizes: [],
          image: "assets/shirts/shirt-06.jpg",
          revealDate: "2026-07-16T10:00:00",
          soldOut: false,
        },
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
        {
          code: "GC01",
          name: "Pilot One",
          tagline: "Where it started.",
          price: "₹899",
          sizes: ["M", "L"],
          image: "assets/shirts/shirt-01.jpg",
          revealDate: null,
          soldOut: true,
        },
        {
          code: "GC02",
          name: "Pilot Two",
          tagline: "Limited run. Gone.",
          price: "₹899",
          sizes: ["S", "M"],
          image: "assets/shirts/shirt-02.jpg",
          revealDate: null,
          soldOut: true,
        },
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
        {
          code: "GC01",
          name: "Archive Pick",
          tagline: "Still on the rack.",
          price: "₹799",
          sizes: ["M", "L", "XL"],
          image: "assets/shirts/shirt-03.jpg",
          revealDate: null,
          soldOut: false,
        },
      ],
    },
  ],
};
