import Link from "next/link";
import styles from "./error-pages.module.css";

export default function NotFound() {
  return (
    <main className={styles.page}>
      <section className={styles.content} aria-labelledby="not-found-title">
        <Link className={styles.brand} href="/">TRUDEV</Link>
        <p className={styles.eyebrow}>ERROR 404 · PAGE NOT FOUND</p>
        <h1 id="not-found-title">THIS PAGE<br />IS MISSING.</h1>
        <p className={styles.message}>That address doesn’t lead to a page here. Head back to the portfolio or open one of the tools.</p>
        <div className={styles.actions}>
          <Link className={styles.action} href="/">Back to home <span aria-hidden="true">↗︎</span></Link>
          <Link className={`${styles.action} ${styles.secondary}`} href="/#tools">Browse tools</Link>
        </div>
      </section>
    </main>
  );
}
