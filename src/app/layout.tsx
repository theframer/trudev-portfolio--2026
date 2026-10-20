import type { Metadata, Viewport } from "next";
import "./globals.css";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import { AUTHOR_NAME, SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: "Amal Dev Anilkumar | Software Developer",
    template: "%s | TRUDEV",
  },

  description:
    "Amal Dev Anilkumar is a software developer building web applications, APIs, integrations, business systems, and digital products. Explore projects, technical work, and engineering experiments at TRUDEV.",

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
                "@id": `${SITE_URL}/#person`,
                name: AUTHOR_NAME,
                url: `${SITE_URL}/`,
                jobTitle: "Software Developer",
                knowsAbout: [
                  "Software Development",
                  "Web Application Development",
                  "API Integration",
                  "CRM Development",
                  "Workflow Automation",
                  "Zoho CRM",
                  "JavaScript",
                  "TypeScript",
                  "React",
                  "Next.js",
                  "Node.js",
                ],
              },
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                "@id": `${SITE_URL}/#website`,
                name: SITE_NAME,
                url: `${SITE_URL}/`,
                description:
                  "Portfolio of Amal Dev Anilkumar featuring software projects, web applications, API integrations, business systems, and developer tools.",
                inLanguage: "en-IN",
                publisher: {
                  "@type": "Person",
                  "@id": `${SITE_URL}/#person`,
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
