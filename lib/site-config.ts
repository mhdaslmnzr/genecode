import type { SiteSettings } from "./types";

export const DEFAULT_SETTINGS: SiteSettings = {
  activeDropId: "",
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "918136942735",
  instagramHandle: "@genecode.clothing",
  aboutText: "Genecode is a men's shirt label built on sharp silhouettes and quiet confidence.",
  ticker: {
    enabled: true,
    messages: [
      "New jersey drops — stay locked on @genecode.clothing",
      "Limited pieces only",
    ],
  },
  testimonialImages: [],
};
