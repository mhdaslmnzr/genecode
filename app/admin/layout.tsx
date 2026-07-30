import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GENECODE ADMIN",
  manifest: "/admin-manifest.json",
  icons: {
    icon: [{ url: "/assets/icons/admin-icon-192.png", type: "image/png", sizes: "192x192" }],
    apple: [{ url: "/assets/icons/admin-apple-touch-icon.png", type: "image/png", sizes: "180x180" }],
  },
  appleWebApp: {
    capable: true,
    title: "GC Admin",
    statusBarStyle: "black-translucent",
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="admin-panel">{children}</div>;
}
