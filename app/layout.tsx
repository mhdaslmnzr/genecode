import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GENECODE",
  description: "Premium men's shirts. Limited drops.",
  manifest: "/manifest.json",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="has-ticker">
        {children}
      </body>
    </html>
  );
}
