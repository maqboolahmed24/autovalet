import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createAbsoluteUrl, getSiteUrl, siteConfig } from "../lib/seo/site-config";
import "../styles/globals.css";

const openGraphImageUrl = createAbsoluteUrl("/opengraph-image");
const openGraphImages = typeof openGraphImageUrl === "string"
  ? [
      {
        url: openGraphImageUrl,
        width: 1200,
        height: 630,
        alt: siteConfig.siteName,
      },
    ]
  : undefined;

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  title: {
    default: siteConfig.defaultTitle,
    template: "%s | AUTO VALET",
  },
  description: siteConfig.defaultDescription,
  icons: {
    apple: "/apple-icon.png",
    icon: "/favicon.png",
  },
  openGraph: {
    title: siteConfig.defaultTitle,
    description: siteConfig.defaultDescription,
    siteName: siteConfig.siteName,
    type: "website",
    images: openGraphImages,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.defaultTitle,
    description: siteConfig.defaultDescription,
    images: openGraphImageUrl ? [openGraphImageUrl] : undefined,
  },
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
