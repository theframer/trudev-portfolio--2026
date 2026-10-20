"use client";

import { useMemo, useState } from "react";
import CustomCursor from "@/components/CustomCursor";
import styles from "./og-generator.module.css";

type OgInput = {
  title: string;
  description: string;
  url: string;
  imageUrl: string;
  siteName: string;
  twitterHandle: string;
};

const initialInput: OgInput = {
  title: "",
  description: "",
  url: "",
  imageUrl: "",
  siteName: "",
  twitterHandle: "",
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export default function OgGenerator() {
  const [input, setInput] = useState<OgInput>(initialInput);
  const [copied, setCopied] = useState<string | null>(null);

  const update =
    (field: keyof OgInput) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setInput((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const metaTags = useMemo(() => {
    const lines: string[] = [];
    if (input.title)
      lines.push(
        `<meta property="og:title" content="${escapeHtml(input.title)}" />`
      );
    if (input.description)
      lines.push(
        `<meta property="og:description" content="${escapeHtml(
          input.description
        )}" />`
      );
    if (input.url)
      lines.push(
        `<meta property="og:url" content="${escapeHtml(input.url)}" />`
      );
    if (input.imageUrl)
      lines.push(
        `<meta property="og:image" content="${escapeHtml(input.imageUrl)}" />`
      );
    if (input.siteName)
      lines.push(
        `<meta property="og:site_name" content="${escapeHtml(
          input.siteName
        )}" />`
      );
    lines.push('<meta property="og:type" content="website" />');
    if (input.title)
      lines.push(`<meta name="twitter:card" content="summary_large_image" />`);
    if (input.title)
      lines.push(
        `<meta name="twitter:title" content="${escapeHtml(input.title)}" />`
      );
    if (input.description)
      lines.push(
        `<meta name="twitter:description" content="${escapeHtml(
          input.description
        )}" />`
      );
    if (input.imageUrl)
      lines.push(
        `<meta name="twitter:image" content="${escapeHtml(input.imageUrl)}" />`
      );
    if (input.twitterHandle)
      lines.push(
        `<meta name="twitter:site" content="${escapeHtml(
          input.twitterHandle
        )}" />`
      );
    return lines.join("\n");
  }, [input]);

  const jsonLd = useMemo(() => {
    const graph: Record<string, unknown>[] = [
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: input.title || undefined,
        description: input.description || undefined,
        url: input.url || undefined,
        isPartOf: input.siteName
          ? { "@type": "WebSite", name: input.siteName }
          : undefined,
      },
    ];
    return JSON.stringify(
      graph.length === 1
        ? graph[0]
        : { "@context": "https://schema.org", "@graph": graph },
      null,
      2
    );
  }, [input]);

  async function copy(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      window.setTimeout(() => setCopied(null), 1600);
    } catch {
      // Clipboard access may be blocked; the value remains selectable in the output.
    }
  }

  const previewTitle = input.title || "Your page title appears here";
  const previewDescription =
    input.description || "Your page description appears here.";
  const previewDomain = (() => {
    try {
      return input.url ? new URL(input.url).hostname : "example.com";
    } catch {
      return "example.com";
    }
  })();

  return (
    <>
      <CustomCursor />
      <main className={styles.page}>
        <section className={styles.intro} aria-labelledby="og-generator-title">
          <p className={styles.eyebrow}>FREE BROWSER TOOL</p>
          <h1 id="og-generator-title">
            Open Graph
            <br />
            metadata generator.
          </h1>
          <p className={styles.lede}>
            Preview and copy Open Graph and Twitter card metadata for any page.
            Everything is generated locally in your browser.
          </p>
        </section>

        <section className={styles.workspace} aria-label="Metadata generator">
          <div className={styles.form}>
            <label className={styles.field}>
              <span>Page title</span>
              <input
                type="text"
                value={input.title}
                onChange={update("title")}
                placeholder="My page title"
                maxLength={120}
              />
            </label>
            <label className={styles.field}>
              <span>Description</span>
              <textarea
                value={input.description}
                onChange={update("description")}
                placeholder="A short summary shown in link previews"
                rows={3}
                maxLength={300}
              />
            </label>
            <label className={styles.field}>
              <span>Canonical URL</span>
              <input
                type="url"
                value={input.url}
                onChange={update("url")}
                placeholder="https://example.com/page/"
              />
            </label>
            <label className={styles.field}>
              <span>Preview image URL</span>
              <input
                type="url"
                value={input.imageUrl}
                onChange={update("imageUrl")}
                placeholder="https://example.com/og-image.png"
              />
            </label>
            <label className={styles.field}>
              <span>Site name</span>
              <input
                type="text"
                value={input.siteName}
                onChange={update("siteName")}
                placeholder="My site"
                maxLength={80}
              />
            </label>
            <label className={styles.field}>
              <span>Twitter handle (optional)</span>
              <input
                type="text"
                value={input.twitterHandle}
                onChange={update("twitterHandle")}
                placeholder="@handle"
                maxLength={30}
              />
            </label>
          </div>

          <div className={styles.previewPane}>
            <p className={styles.paneLabel}>Link preview</p>
            <div className={styles.card}>
              <div className={styles.cardImage}>
                {input.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- arbitrary user-supplied URLs are not next/image optimizable at build time
                  <img
                    src={input.imageUrl}
                    alt=""
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <span
                    className={styles.cardImagePlaceholder}
                    aria-hidden="true"
                  >
                    1200 × 630
                  </span>
                )}
              </div>
              <div className={styles.cardBody}>
                <p className={styles.cardDomain}>{previewDomain}</p>
                <p className={styles.cardTitle}>{previewTitle}</p>
                <p className={styles.cardDescription}>{previewDescription}</p>
              </div>
            </div>
          </div>
        </section>

        <section
          className={styles.outputSection}
          aria-label="Generated metadata"
        >
          <div className={styles.outputBlock}>
            <div className={styles.outputHeader}>
              <p className={styles.paneLabel}>Meta tags</p>
              <button
                type="button"
                className={styles.copyButton}
                onClick={() => copy(metaTags, "tags")}
              >
                {copied === "tags" ? "Copied" : "Copy"}
              </button>
            </div>
            <pre className={styles.code} tabIndex={0}>
              <code>
                {metaTags || "// Fill in the fields to generate meta tags"}
              </code>
            </pre>
          </div>
          <div className={styles.outputBlock}>
            <div className={styles.outputHeader}>
              <p className={styles.paneLabel}>JSON-LD</p>
              <button
                type="button"
                className={styles.copyButton}
                onClick={() => copy(jsonLd, "jsonld")}
              >
                {copied === "jsonld" ? "Copied" : "Copy"}
              </button>
            </div>
            <pre className={styles.code} tabIndex={0}>
              <code>{jsonLd}</code>
            </pre>
          </div>
        </section>
      </main>
    </>
  );
}
