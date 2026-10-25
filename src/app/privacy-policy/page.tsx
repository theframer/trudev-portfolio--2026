import type { Metadata } from "next";
import { AUTHOR_NAME, SITE_NAME, absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How TRUDEV collects, uses, stores, and protects personal data across its website, developer tools, and applications.",
  alternates: { canonical: "/privacy-policy/" },
  openGraph: {
    type: "website",
    url: absoluteUrl("/privacy-policy/"),
    title: `Privacy Policy | ${SITE_NAME}`,
    description:
      "How TRUDEV collects, uses, stores, and protects personal data across its website, tools, and applications.",
    siteName: SITE_NAME,
    locale: "en_IN",
  },
};

const LAST_UPDATED = "October 25, 2026";

export default function PrivacyPolicyPage() {
  return (
    <main className="tool-seo-content" id="main">
      <div>
        <p className="section-eyebrow">LEGAL</p>
        <h1>Privacy Policy</h1>
        <p>
          <strong>Last updated: {LAST_UPDATED}</strong>. This policy applies to
          all products and services operated by {AUTHOR_NAME} under the{" "}
          {SITE_NAME} brand, including the website at trudev.in, its free
          browser-based tools, and any TRUDEV-hosted applications built on
          third-party platforms such as Meta.
        </p>

        <h2>1. Who we are</h2>
        <p>
          TRUDEV is the technology brand of {AUTHOR_NAME}, a software developer
          based in Alappuzha, Kerala, India. For questions about this policy or
          your data, contact{" "}
          <a href="mailto:amaldevanil129@gmail.com">amaldevanil129@gmail.com</a>.
        </p>

        <h2>2. Information we collect</h2>
        <h3>Website and browser tools</h3>
        <ul>
          <li>
            <strong>Tool inputs:</strong> The TRUDEV PDF editor, invoice
            generator, and Open Graph generator process files and text entirely
            in your browser. These inputs are not uploaded to, or stored on, our
            servers.
          </li>
          <li>
            <strong>Contact form:</strong> If you send a message through the
            contact form or by email, we receive your name, email address, and
            message content, and use them only to respond.
          </li>
          <li>
            <strong>Server logs:</strong> Like most websites, our hosting
            provider may log request data such as IP address, browser type, and
            requested pages for security and reliability purposes.
          </li>
        </ul>

        <h3>TRUDEV applications (including Meta-based products)</h3>
        <ul>
          <li>
            <strong>Account information:</strong> When you connect an account
            (for example, a Meta/Facebook or Instagram account) to a TRUDEV
            product, we receive only the identifiers and permissions you
            explicitly grant — such as your page or account ID, name, and the
            scopes you approve.
          </li>
          <li>
            <strong>Content you ask us to process:</strong> For automation
            products (for example, comment-to-DM automation), we process the
            comments, messages, and events necessary to perform the action you
            configured, and to deliver that service back to you.
          </li>
          <li>
            <strong>Usage data:</strong> Product settings, campaign
            configuration, and delivery status needed to run and troubleshoot
            your automations.
          </li>
        </ul>

        <h2>3. How we use information</h2>
        <ul>
          <li>
            To provide, operate, and improve the product you signed up for.
          </li>
          <li>To authenticate you and maintain your account and settings.</li>
          <li>
            To deliver messages or actions you configured (for example,
            automated replies).
          </li>
          <li>
            To secure our services, prevent abuse, and comply with legal
            obligations.
          </li>
          <li>To respond to your support and contact requests.</li>
        </ul>
        <p>
          We do not sell your personal data, and we do not use your Meta account
          content for advertising or for building profiles about you.
        </p>

        <h2>4. Legal bases (where applicable)</h2>
        <p>
          Where data protection law requires a legal basis, we rely on the
          following, depending on the product and the processing involved:
        </p>
        <ul>
          <li>
            <strong>Your consent</strong> — when you connect an account or
            grant permissions;
          </li>
          <li>
            <strong>Contract performance</strong> — to deliver a service you
            have signed up for;
          </li>
          <li>
            <strong>Legitimate interests</strong> — security, abuse prevention,
            and service improvement.
          </li>
        </ul>

        <h2>5. Sharing and third parties</h2>
        <p>
          Where a TRUDEV application relies on service providers, personal data
          is shared only with those providers as needed to run the service:
        </p>
        <ul>
          <li>
            <strong>Meta Platforms, Inc.</strong> — for products that integrate
            with Facebook, Instagram, or Messenger, data flows to and from Meta
            via their official APIs under your granted permissions. Meta&apos;s
            Platform Terms and Data Policy also apply to that processing.
          </li>
          <li>
            <strong>Vercel Inc.</strong> — application hosting and serverless
            functions.
          </li>
          <li>
            <strong>Supabase</strong> — database and authentication storage.
          </li>
          <li>
            <strong>Upstash Inc.</strong> — caching and rate limiting.
          </li>
          <li>
            <strong>Email delivery providers</strong> — to send transactional
            email when required.
          </li>
        </ul>
        <p>
          These providers apply when a TRUDEV application uses them; where a
          product does not rely on a given provider, no data is shared with it.
        </p>
        <p>
          We may also disclose data if required by law, or to protect our
          rights, safety, or property. We never sell personal data.
        </p>

        <h2>6. Data retention and deletion</h2>
        <p>
          We keep personal data only as long as needed to provide the service,
          comply with legal obligations, resolve disputes, and enforce
          agreements.
        </p>
        <p>
          Because TRUDEV is operated by an individual, deletion requests are
          processed manually rather than by automated systems. When you request
          deletion (see our{" "}
          <a href="/data-deletion/">Data Deletion page</a>), we delete the
          personal data we hold in our primary application records. Some data
          may persist temporarily in provider-managed backups, server logs, and
          caches operated by our infrastructure providers, where we may not be
          able to control or verify deletion; such residual data expires
          according to those providers&apos; own retention policies. Data we
          must retain for legal, tax, or security reasons (for example,
          transaction records) is retained only for that purpose.
        </p>

        <h2>7. Your rights and choices</h2>
        <ul>
          <li>
            <strong>Access, correction, portability:</strong> Request a copy of
            your data, or correct inaccurate data, at any time.
          </li>
          <li>
            <strong>Deletion:</strong> Use our{" "}
            <a href="/data-deletion/">Data Deletion page</a> or email us to
            request deletion of your data. Requests are reviewed and processed
            manually, and we will confirm what was deleted when we respond.
          </li>
          <li>
            <strong>Objection and restriction:</strong> You may object to
            certain processing, and you can revoke app permissions at any time
            from your Meta account settings (Settings → Business Integrations).
            Revoking permissions stops our access but does not delete data
            already processed — use the Data Deletion page for that.
          </li>
          <li>
            <strong>Complaints:</strong> You may contact us with any concern, or
            lodge a complaint with your local data protection authority.
          </li>
        </ul>

        <h2>8. Security</h2>
        <p>
          We protect data using encryption in transit (HTTPS/TLS), access
          controls, least-privilege credentials, and monitoring. No method of
          transmission or storage is completely secure, so we cannot guarantee
          absolute security, but we take reasonable and appropriate measures.
        </p>

        <h2>9. Children</h2>
        <p>
          TRUDEV products are not directed to children under 13 (or the higher
          minimum age required by local law), and we do not knowingly collect
          their data. If you believe a child has provided us data, contact us
          and we will delete it.
        </p>

        <h2>10. International transfers</h2>
        <p>
          Our hosting and infrastructure providers may process data in countries
          other than India. Where required, we rely on appropriate safeguards
          for those transfers.
        </p>

        <h2>11. Changes to this policy</h2>
        <p>
          We may update this policy as our products evolve. We will post changes
          on this page with a new &quot;last updated&quot; date, and where the
          change is significant, provide more prominent notice.
        </p>

        <h2>12. Contact</h2>
        <p>
          Questions about this policy:{" "}
          <a href="mailto:amaldevanil129@gmail.com">amaldevanil129@gmail.com</a>. See also our{" "}
          <a href="/terms-of-service/">Terms of Service</a> and{" "}
          <a href="/data-deletion/">Data Deletion instructions</a>.
        </p>
      </div>
    </main>
  );
}
