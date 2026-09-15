export default function Achievements() {
  return (
    <section
      id="achievements"
      className="content-section achievements-section"
      aria-labelledby="achievements-title"
    >
      <div className="section-container">

        <div className="section-intro">
          <p className="section-eyebrow">
            03 · ACHIEVEMENTS
          </p>

          <h2 id="achievements-title">
            PROOF
            <br />
            MATTERS.
          </h2>
        </div>

        <div className="achievements-list">

          <article className="achievement-item">
            <span className="achievement-number">
              01
            </span>

            <div className="achievement-content">
              <p className="achievement-type">
                CERTIFICATION
              </p>

              <h3>
                Zoho CRM Certified Administrator
              </h3>

              <p>
                Certified knowledge of Zoho CRM
                administration, configuration,
                automation, and system management.
              </p>

              <span className="achievement-meta">
                Certificate ID: bckk3BiC3um
              </span>
            </div>
          </article>

          <article className="achievement-item">
            <span className="achievement-number">
              02
            </span>

            <div className="achievement-content">
              <p className="achievement-type">
                RECOGNITION
              </p>

              <h3>
                Zoho Premium Partner Developer
              </h3>

              <p>
                Professional recognition associated with
                development work within the Zoho ecosystem
                and the delivery of business solutions.
              </p>

              <span className="achievement-meta">
                One Hub Operations Pvt. Ltd.
              </span>
            </div>
          </article>

          <article className="achievement-item">
            <span className="achievement-number">
              03
            </span>

            <div className="achievement-content">
              <p className="achievement-type">
                CONTINUOUS LEARNING
              </p>

              <h3>
                Building Across Multiple Technologies
              </h3>

              <p>
                Continuous hands-on development across
                business applications, web technologies,
                APIs, automation, data, and software
                engineering.
              </p>
            </div>
          </article>

        </div>
      </div>
    </section>
  );
}