import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ronda",
  description: "Juego de cartas rápido donde ganas al completar 3 grupos de propiedades.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400..800&display=swap"
        />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
