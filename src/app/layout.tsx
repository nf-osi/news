import Header from "@/app/_components/header";
import Footer from "@/app/_components/footer";
import { SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/constants";
import { BRAND_PRIMARY } from "@/lib/brand";
import { withBasePath } from "@/lib/base-path";
import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import { ThemeScript } from "./_components/theme-switcher";

import "./globals.css";
import "./prose.css";

// The NF Data Portal's `defaultFontFamily`
// (packages/synapse-react-client/src/theme/typography/Typography.ts).
const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_NAME,
  description: SITE_TAGLINE,
};

export const viewport: Viewport = {
  themeColor: BRAND_PRIMARY,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={dmSans.variable} suppressHydrationWarning>
      <head>
        <ThemeScript />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href={withBasePath("/favicon/apple-touch-icon.png")}
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href={withBasePath("/favicon/favicon-32x32.png")}
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href={withBasePath("/favicon/favicon-16x16.png")}
        />
        <link
          rel="manifest"
          href={withBasePath("/favicon/site.webmanifest")}
        />
        <link
          rel="mask-icon"
          href={withBasePath("/favicon/safari-pinned-tab.svg")}
          color={BRAND_PRIMARY}
        />
        <link
          rel="shortcut icon"
          href={withBasePath("/favicon/favicon.ico")}
        />
        <meta name="msapplication-TileColor" content={BRAND_PRIMARY} />
        <meta
          name="msapplication-config"
          content={withBasePath("/favicon/browserconfig.xml")}
        />
        <link
          rel="alternate"
          type="application/rss+xml"
          href={withBasePath("/feed.xml")}
        />
      </head>
      <body className="font-sans">
        <Header />
        <div className="min-h-screen">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
