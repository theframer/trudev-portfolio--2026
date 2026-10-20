/**
 * Single source of truth for site identity used by metadata, sitemap, robots,
 * and JSON-LD. The origin is explicit per environment: set
 * NEXT_PUBLIC_SITE_URL at build time for non-production deployments; it
 * defaults to the verified production origin.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://trudev.in"
).replace(/\/+$/, "");

export const SITE_NAME = "TRUDEV";
export const AUTHOR_NAME = "Amal Dev Anilkumar";

/** Build an absolute URL from a site-relative path (e.g. "/tools/pdf-editor/"). */
export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
