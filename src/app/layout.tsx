import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://trudev.in"),

  title: {
    default: "TRUDEV — Software Developer",
    template: "%s — TRUDEV",
  },

  description:
    "The personal website of Amal Dev Anilkumar — software developer building software, business systems, web applications, and digital products.",

  applicationName: "TRUDEV",

  authors: [
    {
      name: "Amal Dev Anilkumar",
      url: "https://trudev.in",
    },
  ],

  creator: "Amal Dev Anilkumar",

  publisher: "Amal Dev Anilkumar",

  alternates: {
    canonical: "/",
  },

  robots: {
    index: true,
    follow: true,
  },

  openGraph: {
    type: "website",
    url: "https://trudev.in",
    title: "TRUDEV — Software Developer",
    description:
      "Software, business systems, web applications, and digital products built around real problems.",
    siteName: "TRUDEV",
    locale: "en_IN",
  },

  twitter: {
    card: "summary_large_image",
    title: "TRUDEV — Software Developer",
    description:
      "Software, business systems, web applications, and digital products built around real problems.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "dark",
  themeColor: "#080808",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}