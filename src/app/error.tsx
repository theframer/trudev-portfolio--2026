"use client";

import Link from "next/link";
import { useEffect } from "react";
import styles from "./error-pages.module.css";

export default function ErrorPage({
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
    <main className={styles.page}>
      <section className={styles.content} aria-labelledby="error-title">
        <Link className={styles.brand} href="/">TRUDEV</Link>
        <p className={styles.eyebrow}>SOMETHING WENT WRONG</p>
        <h1 id="error-title">LET’S TRY<br />THAT AGAIN.</h1>
        <p className={styles.message}>This page hit an unexpected error. Your locally opened files remain on your device. You can retry or return home.</p>
        <div className={styles.actions}>
          <button className={styles.action} type="button" onClick={reset}>Try again <span aria-hidden="true">↻</span></button>
          <Link className={`${styles.action} ${styles.secondary}`} href="/">Back to home</Link>
        </div>
      </section>
    </main>
  );
}
