"use client";

import { useState } from "react";

export default function About() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section
      id="about"
      className="content-section about-section"
      aria-labelledby="about-title"
    >
      <div className="section-container">
        <div className="section-intro">
          <p className="section-eyebrow">01 · ABOUT</p>

          <h3 id="about-title" className="about-heading">
            NAMASKARAM.
          </h3>
        </div>

        <div className="about-content">
          <div className="about-introduction">
            <p className="about-lead">
              I&apos;m <span className="about-name">Amal Dev Anilkumar</span>, a
              software developer who enjoys turning real-world problems into
              working technology.
            </p>

            <div
              id="about-additional-content"
              className={`about-text ${
                isExpanded ? "is-expanded" : "is-collapsed"
              }`}
              aria-hidden={!isExpanded}
            >
              <p>
                This is probably the part where I&apos;m supposed to give you a
                standard intro.
              </p>

              <p>
                I’m Amal Dev Anilkumar, a software developer focused on building
                web applications, APIs, integrations, and business systems. My
                experience spans full-stack development, CRM customization,
                workflow automation, and connecting platforms through APIs and
                webhooks.
              </p>

              <p>
                I enjoy turning complex business requirements into practical
                software solutions, from designing data models and automating
                processes to building user-facing applications. Through TRUDEV,
                I share my projects, developer tools, and ongoing technical
                work.
              </p>

              <p>
                One thing I consider in both life and
                profession: <strong>communication.</strong> Even a brilliant
                technical solution fails if people aren&apos;t on the same page.
                As Paul J. Meyer put it,{" "}
                <em>
                  &quot;Communication is the key to personal and career
                  success.&quot;
                </em>
              </p>
            </div>

            <button
              type="button"
              className="about-read-more"
              aria-expanded={isExpanded}
              aria-controls="about-additional-content"
              onClick={() => setIsExpanded((previous) => !previous)}
            >
              {isExpanded ? "Read Less" : "Read More"}
              <span aria-hidden="true">{isExpanded ? " ↑" : " ↓"}</span>
            </button>
          </div>
        </div>

        <div className="about-facts">
          <div className="about-fact">
            <span className="about-fact-number">01</span>
            <div>
              <h3>LEARN</h3>
              <p>
                Explore technologies, platforms, tools, and ideas to understand
                what they can do and where they can create real value.
              </p>
            </div>
          </div>

          <div className="about-fact">
            <span className="about-fact-number">02</span>
            <div>
              <h3>UNDERSTAND</h3>
              <p>
                Understand the business, its people, workflows, data, and the
                real problem that technology needs to solve.
              </p>
            </div>
          </div>

          <div className="about-fact">
            <span className="about-fact-number">03</span>
            <div>
              <h3>PLAN</h3>
              <p>
                Break complex requirements into practical solutions, defining
                the architecture, integrations, workflows, and path to delivery.
              </p>
            </div>
          </div>

          <div className="about-fact">
            <span className="about-fact-number">04</span>
            <div>
              <h3>BUILD</h3>
              <p>
                Turn ideas and plans into applications, business systems,
                integrations, automations, and digital products that work.
              </p>
            </div>
          </div>

          <div className="about-fact">
            <span className="about-fact-number">05</span>
            <div>
              <h3>TEST</h3>
              <p>
                Test the solution against real requirements, data, users, and
                edge cases to find what breaks and what needs improvement.
              </p>
            </div>
          </div>

          <div className="about-fact">
            <span className="about-fact-number">06</span>
            <div>
              <h3>EXECUTE</h3>
              <p>
                Put the solution into practice, refine it through real-world
                use, and keep improving it as the business and its needs evolve.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
