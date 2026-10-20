
const contactLinks = [
  {
    label: "EMAIL",
    title: "Send me an email",
    href: "mailto:hello@trudev.in?subject=Project%20Enquiry",
    external: false,
  },
  {
    label: "LINKEDIN",
    title: "Connect on LinkedIn",
    href: "https://www.linkedin.com/",
    external: true,
  },
  {
    label: "GITHUB",
    title: "Explore my GitHub projects",
    href: "https://github.com/theframer",
    external: true,
  },
  {
    label: "INSTAGRAM",
    title: "Visit my Instagram",
    href: "https://www.instagram.com/amal_dv_/",
    external: true,
  },
];

export default function Contact() {
  return (
    <section
      id="contact"
      className="content-section contact-section"
      aria-labelledby="contact-title"
    >
      <div className="section-container">
        <div className="section-intro">
          <p className="section-eyebrow">12 · CONTACT</p>

          <h2 id="contact-title">
            HAVE A
            <br />
            PROBLEM?
          </h2>
        </div>

        <div className="contact-content">
          <div className="contact-message">
            <p>
              Have a project, business problem, software idea,
              or collaboration opportunity? Let&apos;s talk.
            </p>

            <p>
              Tell me what you&apos;re trying to build or solve.
              We can start from there.
            </p>
          </div>

          <div className="contact-details">
            {contactLinks.map((link) => (
              <a
                key={link.label}
                className="contact-link"
                href={link.href}
                target={link.external ? "_blank" : undefined}
                rel={
                  link.external
                    ? "noopener noreferrer"
                    : undefined
                }
                aria-label={`${link.title}${
                  link.external ? " (opens in a new tab)" : ""
                }`}
              >
                <span>{link.label}</span>
                <strong>{link.title}</strong>
                <span className="contact-link-arrow" aria-hidden="true">
                  ↗
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
