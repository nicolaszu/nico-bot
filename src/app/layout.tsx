import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nico-bot",
  description: "Asistente virtual espanol",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="notranslate" translate="no">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
