"use client";

import { useEffect, useRef, useState } from "react";

function CountUp({ end }: { end: number }) {
  const [count, setCount] = useState(0);
  const numberRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = numberRef.current;

    if (!element) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reducedMotion) {
      const frame = requestAnimationFrame(() => {
        setCount(end);
      });
      return () => cancelAnimationFrame(frame);
    }

    let animationFrame = 0;
    let observer: IntersectionObserver | undefined;

    observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        observer?.disconnect();

        const duration = 1200;
        let startTime: number | undefined;

        const animate = (timestamp: number) => {
          if (startTime === undefined) startTime = timestamp;

          const progress = Math.min((timestamp - startTime) / duration, 1);

          // Ease-out effect: fast at first, slower near the target.
          const easedProgress = 1 - Math.pow(1 - progress, 3);

          setCount(Math.round(easedProgress * end));

          if (progress < 1) {
            animationFrame = requestAnimationFrame(animate);
          }
        };

        animationFrame = requestAnimationFrame(animate);
      },
      { threshold: 0.5 }
    );

    observer.observe(element);

    return () => {
      observer?.disconnect();
      cancelAnimationFrame(animationFrame);
    };
  }, [end]);

  return <span ref={numberRef}>{count}+</span>;
}

export default function Clients() {
  const [showAllIndustries, setShowAllIndustries] = useState(false);

  const industries = [
    "Real Estate",
    "Swimming & Aquatic Services",
    "Aged Care",
    "Healthcare",
    "Clinical Research",
    "Dermatology",
    "Outsourcing",
    "Professional Services",
    "Building Materials",
    "Plumbing",
    "Automotive",
    "Waste Management",
    "Cleaning Services",
    "Digital Marketing",
    "Food & Beverage",
    "Confectionery",
    "Appliances",
    "Refrigeration",
    "Fashion & Apparel",
    "Wine & Beverages",
    "Organic Food",
    "Payroll & HR",
    "Workplace Compliance",
    "Telecommunications",
    "Communications APIs",
    "Financial Services",
    "Education",
    "Biomedical Engineering",
    "Medical Services",
    "Steel & Industrial Materials",
    "Accounting",
    "Marketing",
    "Forex & Financial Markets",
    "Hair Restoration",
    "Aesthetic Medicine",
    "Facilities Services",
    "Home Services",
    "Spices & Food Products",
    "Industrial Coatings",
    "Safety Products",
    "Laundry Equipment",
    "Overseas Education",
    "Photography & Videography",
    "Cybersecurity",
    "Risk Technology",
  ];

  const visibleIndustries = showAllIndustries
    ? industries
    : industries.slice(0, 12);

  return (
    <section id="clients" className="content-section clients-section">
      <div className="section-container">
        <div className="section-intro">
          <p className="section-eyebrow">04 · CLIENTS</p>

          <h2>
            WORKING
            <br />
            ACROSS BORDERS.
          </h2>
        </div>

        <div className="clients-metrics">
          <div className="client-metric">
            <p className="client-metric-number">
              <CountUp end={48} />
            </p>

            <p className="client-metric-label">
              DOMESTIC
              <br />
              CLIENTS
            </p>
          </div>

          <div className="client-metric">
            <p className="client-metric-number">
              <CountUp end={7} />
            </p>

            <p className="client-metric-label">
              INTERNATIONAL
              <br />
              CLIENTS
            </p>
          </div>

          <div className="client-metric">
            <p className="client-metric-number">
              <CountUp end={30} />
            </p>

            <p className="client-metric-label">
              INDUSTRIES
              <br />
              WORKED WITH
            </p>
          </div>
        </div>

        <div className="clients-industries">
          <div className="clients-industries-header">
            <p className="section-eyebrow">INDUSTRIES</p>
          </div>

          <div className="experience-tags">
            {visibleIndustries.map((industry) => (
              <span key={industry}>{industry}</span>
            ))}
          </div>

          <button
            type="button"
            className="industries-toggle"
            onClick={() => setShowAllIndustries((previous) => !previous)}
            aria-expanded={showAllIndustries}
          >
            {showAllIndustries ? "Show Less" : "Show All Industries"}
            <span aria-hidden="true">{showAllIndustries ? " ↑" : " ↓"}</span>
          </button>
        </div>
      </div>
    </section>
  );
}
