import type { Metadata } from "next";
import { AppSplash } from "@/components/AppSplash";
import { InstallPrompt } from "@/components/InstallPrompt";
import "./globals.css";

export const metadata: Metadata = {
  title: "GENECODE",
  description: "Premium men's shirts. Limited drops.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/assets/logo%20no%20text.png", type: "image/png", sizes: "231x232" },
      { url: "/assets/icons/icon-192.png", type: "image/png", sizes: "192x192" },
    ],
    apple: [{ url: "/assets/icons/apple-touch-icon.png", type: "image/png", sizes: "180x180" }],
  },
  appleWebApp: {
    capable: true,
    title: "GENECODE",
    statusBarStyle: "black-translucent",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppSplash />
        {children}
        <InstallPrompt />
      </body>
    </html>
  );
}
