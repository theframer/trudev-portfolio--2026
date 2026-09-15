export default function Hero() {
  return (
    <section
      id="top"
      className="hero"
      aria-labelledby="hero-title"
    >
      <div className="hero-content">
        <p className="hero-eyebrow">
          SOFTWARE DEVELOPER · INDIA
        </p>

        <h1 id="hero-title">
          I BUILD TECH
          <br />
          THAT WORKS.
        </h1>

        <p className="hero-description">
          Software, business systems, web applications, and
          digital products built around real problems.
        </p>

        <a className="hero-link" href="#work">
          Explore my work
          <span aria-hidden="true">↗</span>
        </a>
      </div>

      <div
        className="hero-mark"
        aria-hidden="true"
      >
        <span>DEV</span>
      </div>
    </section>
  );
}