import type { Metadata, Viewport } from "next";
import "./globals.css";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import { AUTHOR_NAME, SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: "TRUDEV | Amal Dev Anilkumar",
    template: "%s | TRUDEV",
  },

  description:
    "Use TRUDEV’s free online PDF editor and invoice generator. Edit supported PDF content or create and download an invoice, with your files staying on your device.",

  applicationName: "TRUDEV",

  authors: [
    {
      name: AUTHOR_NAME,
      url: SITE_URL,
    },
  ],

  creator: AUTHOR_NAME,

  publisher: AUTHOR_NAME,

  alternates: {
    canonical: "/",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  manifest: "/manifest.webmanifest",

  openGraph: {
    type: "website",
    url: SITE_URL,
    title: "Free PDF Editor & Invoice Generator | TRUDEV",
    description:
      "Edit supported PDF content or create a PDF invoice with free browser-based tools. Your files stay on your device.",
    siteName: "TRUDEV",
    locale: "en_IN",
    images: [
      {
        url: "/opengraph-image?d8b23af9237d0bd8",
        width: 1200,
        height: 630,
        alt: "TRUDEV — free browser-based PDF editor and invoice generator",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Free PDF Editor & Invoice Generator | TRUDEV",
    description:
      "Free browser-based PDF editor and invoice generator. Your files stay on your device.",
    images: ["/opengraph-image?d8b23af9237d0bd8"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
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
      <body>
        <ServiceWorkerRegistration />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "Person",
                name: AUTHOR_NAME,
                url: `${SITE_URL}/`,
                jobTitle: "Software Developer",
                knowsAbout: [
                  "Software development",
                  "Web applications",
                  "Business systems",
                  "PDF editing tools",
                  "Invoice generation tools",
                ],
              },
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: SITE_NAME,
                url: `${SITE_URL}/`,
                description:
                  "Free browser-based PDF and invoice tools by software developer Amal Dev Anilkumar.",
                inLanguage: "en-IN",
                publisher: {
                  "@type": "Person",
                  name: AUTHOR_NAME,
                  url: `${SITE_URL}/`,
                },
              },
            ]).replace(/</g, "\\u003c"),
          }}
        />
        {children}
      </body>
    </html>
  );
}
