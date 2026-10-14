import type { Metadata } from "next";
import "@fontsource/unbounded/300.css";
import "@fontsource/unbounded/500.css";
import "@fontsource/unbounded/700.css";
import "@fontsource/unbounded/800.css";
import "@fontsource/barlow/400.css";
import "@fontsource/barlow/500.css";
import "@fontsource/barlow/600.css";
import "@fontsource/noto-sans-thai/400.css";
import "@fontsource/noto-sans-thai/500.css";
import "@fontsource/noto-sans-thai/600.css";
import "@fontsource/noto-sans-thai/700.css";
import "@fontsource/noto-sans-thai/800.css";
import "./globals.css";
import "./typography.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.gbgbattleground.online"),
  title: "GBG Battlegrounds | PUBG Tournaments & Live Scores",
  description:
    "Join GBG Battlegrounds PUBG tournaments, check event schedules, follow live scores, and view final standings.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "GBG Battlegrounds",
    title: "GBG Battlegrounds | PUBG Tournaments & Live Scores",
    description:
      "Join GBG Battlegrounds PUBG tournaments, check event schedules, follow live scores, and view final standings.",
    images: [
      {
        url: "/media/gbg-battlegrounds-logo.png",
        alt: "GBG Battlegrounds",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GBG Battlegrounds | PUBG Tournaments & Live Scores",
    description:
      "Join GBG Battlegrounds PUBG tournaments, check event schedules, follow live scores, and view final standings.",
    images: ["/media/gbg-battlegrounds-logo.png"],
  },
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
