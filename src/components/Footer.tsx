
import Link from "next/link";

const footerLinks = [
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Experience", href: "#experience" },
  { label: "Work", href: "#work" },
  { label: "Achievements", href: "#achievements" },
  { label: "Tools", href: "#tools" },
  { label: "Blog", href: "#blog" },
  { label: "Contact", href: "#contact" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy-policy/" },
  { label: "Terms of Service", href: "/terms-of-service/" },
  { label: "Data Deletion", href: "/data-deletion/" },
  { label: "Contact", href: "/contact/" },
];

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-brand">
          <a href="#top" aria-label="TRUDEV — back to top">
            TRUDEV
          </a>

          <p>
            Software Developer
            <br />
            Alappuzha, Kerala, India, 688011
          </p>
        </div>

        <nav className="footer-navigation" aria-label="Footer navigation">
          {footerLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={
                link.label === "About" ? "footer-link-primary" : undefined
              }
            >
              {link.label}
            </a>
          ))}
        </nav>

        <nav className="footer-legal-navigation" aria-label="Legal">
          {legalLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="footer-bottom">
          <span>TRUDEV © {new Date().getFullYear()}</span>
          <a className="footer-back-to-top" href="#top">
            Back to top ↑
          </a>
        </div>
      </div>
    </footer>
  );
}
