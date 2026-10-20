
"use client";

import { useState } from "react";

const skillGroups = [
  {
    number: "01",
    title: "SOFTWARE DEVELOPMENT",
    skills: [
      "JavaScript",
      "TypeScript",
      "React",
      "Next.js",
      "Node.js",
      "Python",
      "SQL",
      "HTML & CSS",
      "UI/UX",
      "ER Modeling",
    ],
  },
  {
    number: "02",
    title: "BUSINESS SYSTEMS",
    skills: [
      "Zoho CRM",
      "Zoho Creator",
      "Zoho Books",
      "Zoho Analytics",
      "Zoho Forms",
      "Zoho Flow",
      "Zoho Sheets",
      "Zoho Catalyst",
      "Zoho Vertical Studio",
      "Zoho Bigin",
      "Zoho Marketing Automation",
    ],
  },
  {
    number: "03",
    title: "INTEGRATION & AUTOMATION",
    skills: [
      "REST APIs",
      "Deluge",
      "Webhooks",
      "OAuth",
      "Third-party integrations",
      "Workflow automation",
      "Data synchronization",
      "Business process automation",
    ],
  },
  {
    number: "04",
    title: "PRODUCT & BUSINESS",
    skills: [
      "Requirements analysis",
      "Business process design",
      "CRM implementation",
      "Reporting & analytics",
      "Sales workflows",
      "Marketing workflows",
      "Client communication",
      "Training & mentoring",
    ],
  },
];

export default function Skills() {
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

  const toggleGroup = (number: string) => {
    setExpandedGroups((previous) =>
      previous.includes(number)
        ? previous.filter((item) => item !== number)
        : [...previous, number]
    );
  };

  return (
    <section
      id="skills"
      className="content-section skills-section"
      aria-labelledby="skills-title"
    >
      <div className="section-container">
        <div className="section-intro">
          <p className="section-eyebrow">02 · CAPABILITIES</p>

          <h2 id="skills-title">
            WHAT I
            <br />
            WORK WITH.
          </h2>
        </div>

        <div className="skills-grid">
          {skillGroups.map((group) => {
            const isExpanded = expandedGroups.includes(group.number);
            const visibleSkills = isExpanded
              ? group.skills
              : group.skills.slice(0, 5);

            return (
              <article className="skill-group" key={group.number}>
                <span className="skill-number">{group.number}</span>

                <h3>{group.title}</h3>

                <ul>
                  {visibleSkills.map((skill) => (
                    <li key={skill}>{skill}</li>
                  ))}
                </ul>

                <button
                  type="button"
                  className="skills-toggle"
                  aria-expanded={isExpanded}
                  onClick={() => toggleGroup(group.number)}
                >
                  {isExpanded ? "Show Less" : "Show All Skills"}
                  <span aria-hidden="true">
                    {isExpanded ? " ↑" : " ↓"}
                  </span>
                </button>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
