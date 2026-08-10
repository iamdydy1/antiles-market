import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Antilles Market — Petites annonces des Antilles",
  description:
    "Achetez, vendez et échangez facilement entre particuliers et professionnels dans les Antilles.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
