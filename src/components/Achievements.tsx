
"use client";

import { useState } from "react";

const achievements = [
  {
    number: "01",
    type: "CERTIFICATION",
    title: "Zoho CRM Certified Administrator",
    description:
      "Certified knowledge of Zoho CRM administration, configuration, automation, and system management.",
    meta: "Certificate ID: bckk3BiC3um",
  },
  {
    number: "02",
    type: "RECOGNITION",
    title: "Zoho Premium Partner Developer",
    description:
      "Professional recognition associated with development work within the Zoho ecosystem and the delivery of business solutions.",
    meta: "One Hub Operations Pvt. Ltd.",
  },
  {
    number: "03",
    type: "CONTINUOUS LEARNING",
    title: "Building Across Multiple Technologies",
    description:
      "Continuous hands-on development across business applications, web technologies, APIs, automation, data, and software engineering.",
    meta: "",
  },
];

export default function Achievements() {
  const [showAll, setShowAll] = useState(false);

  const visibleAchievements = showAll
    ? achievements
    : achievements.slice(0, 2);

  return (
    <section
      id="achievements"
      className="content-section achievements-section"
      aria-labelledby="achievements-title"
    >
      <div className="section-container">
        <div className="section-intro">
          <p className="section-eyebrow">03 · ACHIEVEMENTS</p>

          <h2 id="achievements-title">
            PROOF
            <br />
            MATTERS.
          </h2>
        </div>

        <div className="achievements-list">
          {visibleAchievements.map((achievement) => (
            <article
              className="achievement-item"
              key={achievement.number}
            >
              <span className="achievement-number">
                {achievement.number}
              </span>

              <div className="achievement-content">
                <p className="achievement-type">
                  {achievement.type}
                </p>

                <h3>{achievement.title}</h3>

                <p>{achievement.description}</p>

                {achievement.meta && (
                  <span className="achievement-meta">
                    {achievement.meta}
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>

        <button
          type="button"
          className="achievements-toggle"
          onClick={() => setShowAll((current) => !current)}
          aria-expanded={showAll}
        >
          {showAll ? "Show Less −" : "Show All Achievements +"}
        </button>
      </div>
    </section>
  );
}
