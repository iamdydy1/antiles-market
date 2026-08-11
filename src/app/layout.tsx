import type { Metadata } from "next";
import "./globals.css";
import "./marketplace.css";
import "./admin.css";
import "./category-carousel.css";
import "./account-type.css";
import { getLocale } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Antilles Market — Marketplace des Antilles",
  description: "Achetez, vendez et échangez facilement dans les Antilles et la Caraïbe.",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  return (
    <html lang={locale}>
      <body>{children}</body>
    </html>
  );
}
