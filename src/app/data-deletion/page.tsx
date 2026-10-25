import type { Metadata } from "next";
import { AUTHOR_NAME, SITE_NAME, absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Data Deletion",
  description:
    "How to delete your data and disconnect your account from TRUDEV products, including Meta app integrations.",
  alternates: { canonical: "/data-deletion/" },
  openGraph: {
    type: "website",
    url: absoluteUrl("/data-deletion/"),
    title: `Data Deletion | ${SITE_NAME}`,
    description:
      "How to delete your data and disconnect your account from TRUDEV products.",
    siteName: SITE_NAME,
    locale: "en_IN",
  },
};

export default function DataDeletionPage() {
  return (
    <main className="tool-seo-content" id="main">
      <div>
        <p className="section-eyebrow">LEGAL</p>
        <h1>Data Deletion</h1>
        <p>
          You can delete your data from TRUDEV products at any time. This page
          explains every method, including the options for Meta platform apps
          (Facebook / Instagram).
        </p>

        <h2>Method 1: By email (primary method)</h2>
        <p>
          Email{" "}
          <a href="mailto:amaldevanil129@gmail.com">amaldevanil129@gmail.com</a>{" "}
          with the subject &quot;Data Deletion Request&quot;. Include the email
          address, username, or account identifier linked to the TRUDEV product
          so we can locate your data. Deletion requests are reviewed and
          processed manually, and we will confirm by reply once your data has
          been deleted.
        </p>

        <h2>Method 2: For Meta app users (Facebook / Instagram)</h2>
        <p>
          If you connected a Facebook or Instagram account to a TRUDEV
          application, revoking the app also stops our access immediately:
        </p>
        <ol>
          <li>
            Go to Facebook{" "}
            <strong>
              Settings &amp; Privacy → Settings → Business Integrations
            </strong>
            , find the TRUDEV app, and remove it. This revokes our access to
            your account immediately.
          </li>
          <li>
            Revoking access stops all new processing, but it does not by itself
            delete data we may already hold. To have stored data deleted, follow
            Method 1 above, or use the app&apos;s data deletion request URL if
            the app you use publishes one. When a Meta data deletion request is
            received — whether through a callback, the deletion request URL, or
            direct email — we process it manually and confirm the deletion by
            reply.
          </li>
        </ol>
        <p>
          For more on revoking permissions, see Meta&apos;s{" "}
          <a
            href="https://www.facebook.com/help/212802592374264"
            target="_blank"
            rel="noopener noreferrer"
          >
            app settings help
          </a>
          .
        </p>

        <h2>What gets deleted</h2>
        <p>
          For the TRUDEV products you have used, deletion covers the personal
          data we hold about you in our application records — such as your
          account identifiers, settings, and the content you asked us to
          process. The specific categories depend on the product; if you are
          unsure what a product stored, ask in your deletion request and we
          will tell you.
        </p>

        <h2>What we cannot always delete immediately</h2>
        <p>
          TRUDEV runs on third-party infrastructure (for example, hosting,
          database, and caching providers). Copies of data can persist
          temporarily in provider-managed backups, logs, and caches that we do
          not directly control, and we cannot guarantee or verify their deletion.
          Such residual data expires according to those providers&apos; own
          retention policies. We may also retain minimal records where legally
          required (for example, transaction records) or for security and
          abuse-prevention purposes, and aggregated, de-identified analytics
          that cannot identify you. Retained data is never used to personalise
          anything about you.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about deletion:{" "}
          <a href="mailto:amaldevanil129@gmail.com">amaldevanil129@gmail.com</a>. See our{" "}
          <a href="/privacy-policy/">Privacy Policy</a> and{" "}
          <a href="/terms-of-service/">Terms of Service</a>.
        </p>
      </div>
    </main>
  );
}
