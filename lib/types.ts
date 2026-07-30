export type DropStatus = "active" | "sold_out";

export interface Shirt {
  id?: string;
  code: string;
  name: string | null;
  tagline: string | null;
  price: string | null;
  discountedPrice: string | null;
  image: string;
  sizes: string[];
  soldOut: boolean;
}

export interface Drop {
  id: string;
  year: number;
  number: string;
  label: string;
  name: string | null;
  tagline: string;
  status: DropStatus;
  shirts: Shirt[];
}

export interface FlatShirt {
  drop: Drop;
  shirt: Shirt;
  code: string;
  key: string;
  buyable: boolean;
  soldOut: boolean;
}

export interface SiteSettings {
  activeDropId: string;
  whatsappNumber: string;
  instagramHandle: string;
  aboutText: string;
  ticker: { enabled: boolean; messages: string[] };
  testimonialImages: string[];
}
