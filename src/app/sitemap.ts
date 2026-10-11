import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: "https://trudev.in/", lastModified, changeFrequency: "monthly", priority: 1 },
    { url: "https://trudev.in/tools/invoice-generator/", lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: "https://trudev.in/tools/pdf-editor/", lastModified, changeFrequency: "monthly", priority: 0.9 },
  ];
}
