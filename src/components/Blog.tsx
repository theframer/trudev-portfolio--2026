export default function Blog() {
    return (
      <section id="blog" className="content-section blog-section">
        <div className="section-container">
          <div className="section-intro">
            <p className="section-eyebrow">10 · BLOG</p>
  
            <h2>
              THINGS I
              <br />
              LEARN.
            </h2>
          </div>
  
          <div className="blog-intro">
            <p>
              A place for technical notes, things I learn while
              building, problems I solve, and ideas worth writing
              down.
            </p>
          </div>
  
          <div className="blog-list">
            <article className="blog-item">
              <div className="blog-number">01</div>
  
              <div className="blog-content">
                <p className="blog-category">COMING SOON</p>
  
                <h3>
                  Building Systems Instead of Just Building
                  Features
                </h3>
  
                <p>
                  Thoughts on understanding the business problem
                  before deciding what technology to use.
                </p>
              </div>
  
              <span className="blog-arrow" aria-hidden="true">
                ↗
              </span>
            </article>
  
            <article className="blog-item">
              <div className="blog-number">02</div>
  
              <div className="blog-content">
                <p className="blog-category">COMING SOON</p>
  
                <h3>
                  What Working With Business Software Actually
                  Teaches You
                </h3>
  
                <p>
                  Lessons from working between users, businesses,
                  processes, data, and software.
                </p>
              </div>
  
              <span className="blog-arrow" aria-hidden="true">
                ↗
              </span>
            </article>
  
            <article className="blog-item">
              <div className="blog-number">03</div>
  
              <div className="blog-content">
                <p className="blog-category">COMING SOON</p>
  
                <h3>
                  Learning Technology by Building Things
                </h3>
  
                <p>
                  Why understanding and executing matters more
                  than simply collecting technologies.
                </p>
              </div>
  
              <span className="blog-arrow" aria-hidden="true">
                ↗
              </span>
            </article>
          </div>
        </div>
      </section>
    );
  }