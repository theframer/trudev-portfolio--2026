
"use client";

import { useState } from "react";

const experiences = [
  {
    number: "01",
    title: "Cloud Support Engineer",
    company: "Wipro [WILP:Work Integrated Learning Program]",
    location: "Kolkata, India",
    duration: "SEP 2021 - APR 2022 (8mos)",
    description:
      "Got the opportunity to work with on of the top MNC's in India. A large technology organization and team collaboration.",
    tags: [
      "Dream Job",
      "First Job",
      "Technology",
      "Interpersonal",
      "Teamwork",
      "Cloud Platform",
      "Cloud Engineering",
      "Support",
      "MTECH",
      "WILP",
      "OOP",
      "Professional Development",
    ],
  },
  {
    number: "02",
    title: "Zoho Developer",
    company: "One Hub Operations Private Limited",
    location: "Vytilla, Kochi, Kerala India",
    duration: "OCT 2022 - JUN 2025 (2yrs 9mos)",
    description:
      "Place where i felt i became a real developer, learn new nukes and corners of profession and life. Led to love and learn more about business, applications, solutions, automations, integrations, and clients with technology-driven process improvements.",
    tags: [
      "Zoho",
      "CRM",
      "Zoho CRM Certified",
      "Client Handling",
      "SDLC",
      "APIs",
      "OAuth",
      "Troubleshooting",
      "NodeJS",
      "Frameworks",
      "ER Diagram",
      "Ethics",
      "Communication",
      "Presentation",
      "Social Interaction",
      "Team management",
      "Task management",
      "Time management",
      "Postman",
      "Deluge",
      "Testing",
      "Leadership",
    ],
  },
  {
    number: "03",
    title: "Team Lead Developer",
    company: "Agent Time Pvt Ltd",
    location: "Norwest, NSW 2153, Australia",
    duration: "JUN 2025 - Present",
    description:
      "Working on business software and product development, including complex solutions built around the Zoho ecosystem and multiple integrations.",
    tags: [
      "Proptech",
      "Real Estate",
      "Buyer Agents",
      "CRM",
      "Zoho",
      "Product Based",
      "Sales",
      "Marketing",
      "UI/UX",
      "Authentiction",
      "Widgets",
      "Property Data",
      "AML",
      "AI",
      "AgenticAI",
      "Deluge",
      "Service",
      "Documentation",
      "Support",
    ],
  },
];

export default function Experience() {
  const [expandedRoles, setExpandedRoles] = useState<string[]>([]);

  const toggleRole = (number: string) => {
    setExpandedRoles((previous) =>
      previous.includes(number)
        ? previous.filter((item) => item !== number)
        : [...previous, number]
    );
  };

  return (
    <section
      id="experience"
      className="content-section experience-section"
      aria-labelledby="experience-title"
    >
      <div className="section-container">
        <div className="section-intro">
          <p className="section-eyebrow">05 · EXPERIENCE</p>

          <h2 id="experience-title">
            WHERE I&apos;VE
            <br />
            BUILT.
          </h2>
        </div>

        <div className="experience-list">
          {experiences.map((experience) => {
            const isExpanded = expandedRoles.includes(experience.number);
            const detailsId = `experience-details-${experience.number}`;

            return (
              <article className="experience-item" key={experience.number}>
                <div className="experience-meta">
                  <span>{experience.number}</span>
                  <span>PROFESSIONAL EXPERIENCE</span>
                </div>

                <div className="experience-main">
                  <h3>{experience.title}</h3>
                  <h4>{experience.company}</h4>
                  <p className="experience-location">
                    {experience.location}
                  </p>
                  <p className="experience-role">
                    {experience.duration}
                  </p>

                  {isExpanded && (
                    <div id={detailsId} className="experience-details">
                      <p>{experience.description}</p>

                      <div className="experience-tags">
                        {experience.tags.map((tag) => (
                          <span key={tag}>{tag}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    className="experience-toggle"
                    aria-expanded={isExpanded}
                    aria-controls={detailsId}
                    onClick={() => toggleRole(experience.number)}
                  >
                    {isExpanded ? "Show Less −" : "Read More +"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
