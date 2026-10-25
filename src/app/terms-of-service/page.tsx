import type { Metadata } from "next";
import { AUTHOR_NAME, SITE_NAME, absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms that govern your use of TRUDEV's website, free browser tools, and subscription applications.",
  alternates: { canonical: "/terms-of-service/" },
  openGraph: {
    type: "website",
    url: absoluteUrl("/terms-of-service/"),
    title: `Terms of Service | ${SITE_NAME}`,
    description:
      "The terms that govern your use of TRUDEV's website, free browser tools, and applications.",
    siteName: SITE_NAME,
    locale: "en_IN",
  },
};

const LAST_UPDATED = "October 25, 2026";

export default function TermsOfServicePage() {
  return (
    <main className="tool-seo-content" id="main">
      <div>
        <p className="section-eyebrow">LEGAL</p>
        <h1>Terms of Service</h1>
        <p>
          <strong>Last updated: {LAST_UPDATED}</strong>. These terms govern your
          use of all {SITE_NAME} products and services operated by {AUTHOR_NAME}
          , including the trudev.in website, its free browser-based tools, and
          TRUDEV applications (including those integrating with Meta platforms).
          By using a TRUDEV product, you agree to these terms.
        </p>

        <h2>1. Use of the service</h2>
        <ul>
          <li>
            You must comply with all applicable laws when using our products.
          </li>
          <li>
            You may not use the products to spam, harass, send unsolicited bulk
            messages, infringe intellectual property, or violate any third
            party&apos;s terms — including the Meta Platform Terms and Community
            Standards.
          </li>
          <li>
            You may not attempt to disrupt, overload, reverse-engineer, or gain
            unauthorised access to any part of our services or infrastructure.
          </li>
          <li>
            You are responsible for the content you send, publish, or automate
            through TRUDEV products, and for maintaining the confidentiality of
            your credentials.
          </li>
        </ul>

        <h2>2. Accounts and automation products</h2>
        <p>
          For products that connect to third-party accounts (such as Meta), you
          grant only those permissions you choose, and you confirm you have the
          right to grant them for the pages or accounts involved. Automated
          actions you configure are sent on your behalf; you remain responsible
          for their content and compliance with the relevant platform&apos;s
          policies.
        </p>

        <h2>3. Free tools vs. paid products</h2>
        <p>
          Browser-based tools (PDF editor, invoice generator, metadata
          generator) are provided free of charge and process your files locally
          on your device. No payment is required for any product available
          today. Some planned products may later become paid, require an
          account, or use subscriptions; if that happens, the billing terms,
          renewal, and cancellation options will be presented before any
          purchase and will form part of these terms.
        </p>

        <h2>4. Payment and cancellation (future paid products)</h2>
        <p>
          If and when a TRUDEV product requires payment, you will authorise the
          applicable charges at the disclosed rate before you are billed.
          Subscription products, where offered, will renew until cancelled and
          you will be able to cancel at any time, with access continuing until
          the end of the current billing period. The refund policy for a paid
          product will be stated before purchase. Because no paid products are
          currently available, no payment, renewal, or refund terms apply at
          this time.
        </p>

        <h2>5. Intellectual property</h2>
        <p>
          The {SITE_NAME} brand, code, design, and content are owned by{" "}
          {AUTHOR_NAME} and protected by law. You retain all rights to your own
          data and content; you grant us only the limited licence needed to
          store, process, and transmit it to provide the service.
        </p>

        <h2>6. Availability and changes</h2>
        <p>
          We aim for high availability but do not guarantee uninterrupted
          service. We may modify, suspend, or discontinue features; where a future
          paid feature is discontinued materially, we intend to offer a pro-rata
          refund or reasonable substitute. Third-party platforms (such as Meta)
          may change
          their APIs or policies, which can affect product functionality.
        </p>

        <h2>7. Disclaimers</h2>
        <p>
          The services are provided &quot;as is&quot; without warranties of any
          kind, express or implied, including merchantability, fitness for a
          particular purpose, and non-infringement. We do not warrant that
          outputs, automations, or generated documents will be error-free or
          meet your specific requirements.
        </p>

        <h2>8. Limitation of liability</h2>
        <p>
          To the maximum extent permitted by law, {AUTHOR_NAME} shall not be
          liable for indirect, incidental, special, consequential, or punitive
          damages, or for lost profits, data, or goodwill. Our total liability
          for any claim is limited to the amount you paid us in the twelve
          months preceding the claim, or USD 100 if you paid nothing.
        </p>

        <h2>9. Indemnity</h2>
        <p>
          You agree to indemnify us against claims arising from your content,
          your configuration of automation products, or your violation of these
          terms or third-party rights.
        </p>

        <h2>10. Termination</h2>
        <p>
          You may stop using the products at any time. We may suspend or
          terminate access for violation of these terms, unlawful use, or
          security risk, with notice where practicable.
        </p>

        <h2>11. Governing law</h2>
        <p>
          These terms are governed by the laws of India, and disputes will be
          resolved in the courts of Kerala, India, unless applicable law gives
          you a mandatory local forum.
        </p>

        <h2>12. Changes to these terms</h2>
        <p>
          We may update these terms; material changes will be posted on this
          page with a new &quot;last updated&quot; date. Continued use after
          changes take effect constitutes acceptance.
        </p>

        <h2>13. Contact</h2>
        <p>
          Questions about these terms:{" "}
          <a href="mailto:amaldevanil129@gmail.com">amaldevanil129@gmail.com</a>. See also our{" "}
          <a href="/privacy-policy/">Privacy Policy</a> and{" "}
          <a href="/data-deletion/">Data Deletion instructions</a>.
        </p>
      </div>
    </main>
  );
}
