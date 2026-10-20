
"use client";

import { useState } from "react";

const projects = [
  {
    number: "01",
    title: "Agent Time Buyers Agency Suite",
    category: "BUSINESS SOFTWARE · PRODUCT DEVELOPMENT",
    description:
      "A large-scale business solution developed under the Zoho Vertical Studio environment, bringing together business workflows, applications, integrations, automation, and supporting systems.",
    tags: [
      "Zoho",
      "CRM",
      "Creator",
      "APIs",
      "Automation",
      "Xero",
      "Finance",
      "Omni Channel",
      "Marketing Automation",
      "HTag",
      "Widget",
      "Database Management",
      "Production / Sandbox",
      "Version Control",
    ],
    href: "https://preview.agenttime.au/",
    external: true,
  },
  {
    number: "02",
    title: "Customer Management System",
    category: "WEB APPLICATION · ZOHO",
    description:
      "A React-based customer management application designed to give a sales team a more efficient way to manage customer information and workflow.",
    tags: [
      "React",
      "JavaScript",
      "Customer Management",
      "Sales Workflow",
    ],
    href: "https://ohosolutions.com/",
    external: true,
  },
  {
    number: "03",
    title: "You are looking at it.",
    category: "WEBPAGE · TRUDEV.IN",
    description:
      "I love the journey, to be honest. Planning, designing, building, testing, executing, and enjoying what I built is another level of happiness.",
    tags: [
      "Front-End",
      "NextJS",
      "Learning Curve",
      "ReactJS",
      "TypeScript",
      "JavaScript",
      "Designing",
      "Content Writing",
      "AI",
    ],
    href: "",
    external: false,
  },
];

export default function Work() {
  const [expandedProjects, setExpandedProjects] = useState<string[]>([]);

  const toggleProject = (number: string) => {
    setExpandedProjects((previous) =>
      previous.includes(number)
        ? previous.filter((item) => item !== number)
        : [...previous, number]
    );
  };

  return (
    <section
      id="work"
      className="content-section work-section"
      aria-labelledby="work-title"
    >
      <div className="section-container">
        <div className="section-intro">
          <p className="section-eyebrow">06 · SELECTED WORK</p>

          <h2 id="work-title">
            WORK
            <br />
            WITH PROOF.
          </h2>
        </div>

        <div className="work-list">
          {projects.map((project) => {
            const isExpanded = expandedProjects.includes(project.number);
            const detailsId = `work-details-${project.number}`;

            return (
              <article className="work-item" key={project.number}>
                <div className="work-index">{project.number}</div>

                <div className="work-details">
                  <h3>{project.title}</h3>

                  {isExpanded && (
                    <div id={detailsId} className="work-expanded-details">
                      <p className="work-category">{project.category}</p>

                      <p>{project.description}</p>

                      <div className="work-tags">
                        {project.tags.map((tag) => (
                          <span key={tag}>{tag}</span>
                        ))}
                      </div>

                      {project.href && (
                        <a
                          className="work-project-link"
                          href={project.href}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Visit Project ↗
                        </a>
                      )}
                    </div>
                  )}

                  <button
                    type="button"
                    className="work-toggle"
                    aria-expanded={isExpanded}
                    aria-controls={detailsId}
                    onClick={() => toggleProject(project.number)}
                  >
                    {isExpanded ? "Show Less −" : "Read More +"}
                  </button>
                </div>

                {project.href ? (
                  <a
                    className="work-arrow"
                    href={project.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Visit ${project.title} (opens in a new tab)`}
                  >
                    ↗
                  </a>
                ) : (
                  <span className="work-arrow" aria-hidden="true">
                    ↗
                  </span>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
