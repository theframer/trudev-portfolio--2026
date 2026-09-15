export default function Contact() {
    return (
      <section id="contact" className="content-section contact-section">
        <div className="section-container">
          <div className="section-intro">
            <p className="section-eyebrow">12 · CONTACT</p>
  
            <h2>
              HAVE A
              <br />
              PROBLEM?
            </h2>
          </div>
  
          <div className="contact-content">
            <div className="contact-message">
              <p>
                If you have a project, business problem, software
                idea, collaboration opportunity, or simply want
                to talk technology, get in touch.
              </p>
  
              <p>
                Tell me what you&apos;re trying to build or solve.
                We can start from there.
              </p>
            </div>
  
            <div className="contact-details">
              <a
                className="contact-link"
                href="mailto:hello@trudev.in"
              >
                <span>EMAIL</span>
                <strong>Feel free to draft</strong>
                <span aria-hidden="true">↗</span>
              </a>
  
              <a
                className="contact-link"
                href="https://www.linkedin.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>LINKEDIN</span>
                <strong>Connect on LinkedIn</strong>
                <span aria-hidden="true">↗</span>
              </a>
  
              <a
                className="contact-link"
                href="https://github.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>GITHUB</span>
                <strong>View my GitHub</strong>
                <span aria-hidden="true">↗</span>
              </a>

              <a
                className="contact-link"
                href="https://github.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>INSTAGRAM</span>
                <strong>Checkout my Contents</strong>
                <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    );
  }