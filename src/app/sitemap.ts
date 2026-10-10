import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://trudev.in/" },
    { url: "https://trudev.in/tools/invoice-generator/" },
    { url: "https://trudev.in/tools/pdf-editor/" },
  ];
}
