import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Evopas - AI Notepad",
  description: "Un éditeur de notes intelligent avec des fonctionnalités AI intégrées",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
