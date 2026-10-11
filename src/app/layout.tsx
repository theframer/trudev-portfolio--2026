import type { Metadata, Viewport } from "next";
import "./globals.css";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";

export const metadata: Metadata = {
  metadataBase: new URL("https://trudev.in"),

  title: {
    default: "TRUDEV | Free PDF Editor & Invoice Generator",
    template: "%s | TRUDEV",
  },

  description:
    "Use TRUDEV’s free online PDF editor and invoice generator. Edit supported PDF content or create and download an invoice, with your files staying on your device.",

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
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  openGraph: {
    type: "website",
    url: "https://trudev.in",
    title: "Free PDF Editor & Invoice Generator | TRUDEV",
    description:
      "Edit supported PDF content or create a PDF invoice with free browser-based tools. Your files stay on your device.",
    siteName: "TRUDEV",
    locale: "en_IN",
  },

  twitter: {
    card: "summary",
    title: "Free PDF Editor & Invoice Generator | TRUDEV",
    description:
      "Free browser-based PDF editor and invoice generator. Your files stay on your device.",
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
                name: "Amal Dev Anilkumar",
                url: "https://trudev.in/",
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
                name: "TRUDEV",
                url: "https://trudev.in/",
                description:
                  "Free browser-based PDF and invoice tools by software developer Amal Dev Anilkumar.",
                inLanguage: "en-IN",
                publisher: {
                  "@type": "Person",
                  name: "Amal Dev Anilkumar",
                  url: "https://trudev.in/",
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
