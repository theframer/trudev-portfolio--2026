"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#080808", color: "#f4f3ef", fontFamily: "Arial, Helvetica, sans-serif" }}>
        <main style={{ display: "grid", minHeight: "100svh", placeItems: "center", padding: 24 }}>
          <section style={{ width: "min(100%, 720px)", padding: "clamp(24px, 7vw, 64px)", border: "1px solid #292929" }}>
            <p style={{ color: "#ff3b2f", fontSize: 10, fontWeight: 700, letterSpacing: ".18em" }}>TRUDEV · SYSTEM ERROR</p>
            <h1 style={{ margin: 0, fontSize: "clamp(48px, 11vw, 88px)", lineHeight: .9, letterSpacing: "-.08em" }}>THE PAGE<br />COULDN’T LOAD.</h1>
            <p style={{ maxWidth: 430, color: "#aaa69e", fontSize: 15, lineHeight: 1.7 }}>A site error interrupted this page. Try loading it again.</p>
            <button type="button" onClick={reset} style={{ minHeight: 48, padding: "0 18px", border: "1px solid #ff3b2f", color: "#080808", background: "#ff3b2f", fontWeight: 800, cursor: "pointer" }}>Try again</button>
          </section>
        </main>
      </body>
    </html>
  );
}
