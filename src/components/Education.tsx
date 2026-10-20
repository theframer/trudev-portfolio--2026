
"use client";

import { useState } from "react";

export default function Education() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section
      id="education"
      className="content-section education-section"
      aria-labelledby="education-title"
    >
      <div className="section-container">
        <div className="section-intro">
          <p className="section-eyebrow">09 · EDUCATION</p>

          <h2 id="education-title">
            WHERE THE
            <br />
            JOURNEY STARTED.
          </h2>
        </div>

        <div className="education-content">
          <div className="education-details">
            <div
              id="education-story"
              className={`education-story ${
                isExpanded ? "is-expanded" : "is-collapsed"
              }`}
              aria-hidden={!isExpanded}
              inert={!isExpanded}
            >
              <p>
                My professional development has been shaped by a simple path.
                When I was in 10th grade, I got A+ in Information Technology.
                Yep! You heard that right. I thought that was it, simple as
                that. Later, I went straight into Computer Science, not because
                I had a clear vision, but because I was confident (overconfident)
                that I was good with computers.
              </p>

              <p>
                Long story short, 11th and 12th grade taught me new math.
                <strong>
                  {" "}
                  <i>&quot;1 + 1 = 10&quot;. OKAYYYY!</i>
                </strong>
              </p>

              <p>
                Later, binary, algorithms, and some serious logical thinking
                became my close friends. <strong><i>Three years later,</i></strong>{" "}
                I made a serious decision about my future. Yes! I took BSc
                Computer Science. Eventually, everything became part of me,
                and here I am, working across different domains, people,
                technologies, methods, and life.
              </p>

              <div className="education-note">
                <span>University of Kerala (JAN 2018 – FEB 2022)</span>
                <p>BSc Graduate — Specialized in Computer Science</p>
              </div>
            </div>

            <button
              type="button"
              className="education-toggle"
              aria-expanded={isExpanded}
              aria-controls="education-story"
              onClick={() => setIsExpanded((current) => !current)}
            >
              {isExpanded ? "Close −" : "Click To Read +"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
