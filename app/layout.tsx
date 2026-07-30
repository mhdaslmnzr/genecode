import type { Metadata } from "next";
import { AppSplash } from "@/components/AppSplash";
import "./globals.css";

export const metadata: Metadata = {
  title: "GENECODE",
  description: "Premium men's shirts. Limited drops.",
  manifest: "/manifest.json",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppSplash />
        {children}
      </body>
    </html>
  );
}
