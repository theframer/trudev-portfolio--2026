import type { Metadata } from "next";
import { SITE_NAME, absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact TRUDEV — questions, support, data requests, and project inquiries for Amal Dev Anilkumar.",
  alternates: { canonical: "/contact/" },
  openGraph: {
    type: "website",
    url: absoluteUrl("/contact/"),
    title: `Contact | ${SITE_NAME}`,
    description:
      "Get in touch with TRUDEV for support, data requests, or project inquiries.",
    siteName: SITE_NAME,
    locale: "en_IN",
  },
};

export default function ContactPage() {
  return (
    <main className="tool-seo-content" id="main">
      <div>
        <p className="section-eyebrow">CONTACT</p>
        <h1>Contact</h1>
        <p>
          Reach out for product support, data and privacy requests, project
          inquiries, or anything else. Email is the fastest way to reach me.
        </p>

        <h2>Email</h2>
        <p>
          <a href="mailto:amaldevanil129@gmail.com">amaldevanil129@gmail.com</a> — general
          inquiries, support, and feedback.
        </p>

        <h2>Support</h2>
        <p>
          If you are using a TRUDEV product and something isn&apos;t working,
          email the address above with the product name and a short description
          of what happened. I read and reply to every message.
        </p>

        <h2>Privacy and data requests</h2>
        <p>
          For access, correction, or deletion of your data, see the{" "}
          <a href="/data-deletion/">Data Deletion page</a> or email{" "}
          <a href="mailto:amaldevanil129@gmail.com">amaldevanil129@gmail.com</a> with the subject
          &quot;Data Deletion Request&quot; or &quot;Data Access Request&quot;.
        </p>

        <h2>Projects and collaboration</h2>
        <p>
          If you would like to work together on a web application, API
          integration, or automation project, tell me a little about the problem
          you are solving and I&apos;ll get back to you.
        </p>

        <h2>Location</h2>
        <p>Alappuzha, Kerala, India (IST, UTC+5:30).</p>

        <h2>Legal</h2>
        <p>
          <a href="/privacy-policy/">Privacy Policy</a> ·{" "}
          <a href="/terms-of-service/">Terms of Service</a> ·{" "}
          <a href="/data-deletion/">Data Deletion</a>
        </p>
      </div>
    </main>
  );
}
