"use client";

import { useEffect } from "react";

/**
 * Global scroll-reveal engine.
 *
 * Every element carrying [data-reveal] starts hidden (styled in CSS via the
 * .reveal / .reveal-left / .reveal-right classes) and animates into view the
 * first time it enters the viewport. A `data-reveal-delay` attribute staggers
 * siblings; a `data-reveal-group` container staggers its children.
 *
 * No motion for users who prefer reduced motion.
 */
export default function RevealOnScroll() {
  useEffect(() => {
    document.documentElement.classList.add("js-enabled");

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      document
        .querySelectorAll<HTMLElement>("[data-reveal]")
        .forEach((element) => {
          element.classList.add("is-visible");
        });

      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const element = entry.target as HTMLElement;

            const delay = element.dataset.revealDelay;

            if (delay) {
              element.style.setProperty("--reveal-delay", `${delay}ms`);
            }

            element.classList.add("is-visible");
            observer.unobserve(element);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    document
      .querySelectorAll<HTMLElement>("[data-reveal]:not(.is-visible)")
      .forEach((element) => {
        observer.observe(element);
      });

    return () => {
      observer.disconnect();
    };
  }, []);

  return null;
}
