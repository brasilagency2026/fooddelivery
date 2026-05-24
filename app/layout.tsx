import type { Metadata } from "next";
import "./globals.css";
import { ConvexClientProvider } from "@/components/providers/ConvexClientProvider";
import { ClerkProvider } from "@clerk/nextjs";

export const metadata: Metadata = {
  metadataBase: new URL("https://delivery.foodpronto.com.br"),
  title: "Food Pronto Delivery",
  description: "Peça comida dos melhores restaurantes perto de você",
  manifest: "/manifest.json",
  themeColor: "#0A0A0A",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  openGraph: {
    title: "Food Pronto Delivery",
    description: "Peça comida dos melhores restaurantes perto de você",
    url: "https://delivery.foodpronto.com.br",
    siteName: "Food Pronto Delivery",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Food Pronto Delivery",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon.png', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png' },
    ],
  },
};

import { ptBR } from "@clerk/localizations";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <ClerkProvider
          localization={ptBR as any}
          signInUrl="/admin/login"
          signUpUrl="/admin/signup"
          signInFallbackRedirectUrl="/admin/dashboard"
          signUpFallbackRedirectUrl="/admin/dashboard"
        >
          <ConvexClientProvider>{children}</ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
