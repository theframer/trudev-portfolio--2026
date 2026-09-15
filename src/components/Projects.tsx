export default function Projects() {
    return (
      <section
        id="projects"
        className="content-section projects-section"
      >
        <div className="section-container">
          <div className="section-intro">
            <p className="section-eyebrow">
              07 · PERSONAL PROJECTS
            </p>
  
            <h2>
              THINGS I
              <br />
              BUILD.
            </h2>
          </div>
  
          <div className="projects-grid">
            <article className="project-card">
              <div className="project-card-top">
                <span>01</span>
  
                <span className="project-status">
                  LIVE PROJECT
                </span>
              </div>
  
              <h3>TRUDEV</h3>
  
              <p>
                My personal technology space, a portfolio,
                experimentation ground, and place to document what
                I build and learn.
              </p>
  
              <a href="#contact">
                View project
                <span aria-hidden="true">↗</span>
              </a>
            </article>
  
            <article className="project-card">
              <div className="project-card-top">
                <span>02</span>
  
                <span className="project-status">
                  APPLICATION
                </span>
              </div>
  
              <h3>YET TO NAME</h3>
  
              <p>
                A separate web application exploring practical software development
                and user-focused tooling.
              </p>
  
              <a href="#contact">
                View project
                <span aria-hidden="true">↗</span>
              </a>
            </article>
  
            <article className="project-card">
              <div className="project-card-top">
                <span>03</span>
  
                <span className="project-status">
                  EXPERIMENT
                </span>
              </div>
  
              <h3>MORE TO COME</h3>
  
              <p>
                Personal experiments, software ideas, technical
                explorations, and projects that grow out of
                curiosity.
              </p>
  
              <a href="#contact">
                Follow the journey
                <span aria-hidden="true">↗</span>
              </a>
            </article>
          </div>
        </div>
      </section>
    );
  }