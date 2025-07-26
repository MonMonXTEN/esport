import type { Metadata } from "next";
import { Noto_Sans_Thai } from 'next/font/google';
import "./globals.css";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/ui/sonner";
import ToastInitializer from "@/components/providers/ToastInitializer";

const font = Noto_Sans_Thai({
  subsets: ['thai', 'latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
  variable: '--font-noto-sans-thai',
});

export const metadata: Metadata = {
  title: {
    template: "%s | Esport",
    default: "Esport",
  },
  description: "Management system for esports tournaments",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <body
        className={`${font.className} antialiased`}
      >
        <SessionProvider>
          <Toaster
            position="top-right"
          />
          <ToastInitializer />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
