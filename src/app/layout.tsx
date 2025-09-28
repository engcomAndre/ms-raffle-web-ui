import type { Metadata, Viewport } from "next";
import "./globals.css";
import { GoogleScript } from "@/components/GoogleScript";
import SessionProvider from "@/components/SessionProvider";
import TokenTimeoutProvider from "@/components/TokenTimeoutProvider";

export const metadata: Metadata = {
  title: "MS Raffle - Sistema de Gerenciamento de Rifas",
  description: "Sistema moderno de gerenciamento de rifas. Crie, gerencie e participe de rifas de forma simples e segura.",
  keywords: "rifas, sorteio, gerenciamento, sistema, web",
  authors: [{ name: "MS Raffle Team" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <script 
          src="https://accounts.google.com/gsi/client" 
          async 
          defer
        ></script>
      </head>
      <body className="antialiased">
        <GoogleScript />
        <SessionProvider>
          <TokenTimeoutProvider>
            {children}
          </TokenTimeoutProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
