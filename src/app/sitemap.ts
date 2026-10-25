import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  // Only public, canonical, indexable pages. Trailing slashes match the
  // canonical hrefs emitted by `alternates.canonical`.
  return [
    { url: absoluteUrl("/"), lastModified, changeFrequency: "monthly", priority: 1 },
    { url: absoluteUrl("/tools/invoice-generator/"), lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: absoluteUrl("/tools/pdf-editor/"), lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: absoluteUrl("/og-generator/"), lastModified, changeFrequency: "yearly", priority: 0.5 },
    { url: absoluteUrl("/privacy-policy/"), lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: absoluteUrl("/terms-of-service/"), lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: absoluteUrl("/data-deletion/"), lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: absoluteUrl("/contact/"), lastModified, changeFrequency: "yearly", priority: 0.4 },
  ];
}
