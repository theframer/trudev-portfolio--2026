"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import ContactForm from "@/components/ContactForm";
import CustomCursor from "@/components/CustomCursor";
import RevealOnScroll from "@/components/RevealOnScroll";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import HeroImage from "@/components/ui/HeroImage";
import About from "@/components/About";
import Skills from "@/components/Skills";
import Achievements from "@/components/Achievements";
import Clients from "@/components/Clients";
import Experience from "@/components/Experience";
import Work from "@/components/Work";
import Tools from "@/components/Tools";
import Testimonials from "@/components/Testimonials";
import Education from "@/components/Education";
import Blog from "@/components/Blog";
import Personal from "@/components/Personal";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import SecretCode from "@/components/SecretCode";
import secretKey from "@/assets/icons/secret-key.svg";

const CONTACT_PROMPT_SESSION_KEY = "trudev-contact-prompt-shown";

export default function Home() {
  const [showContact, setShowContact] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false);

  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(CONTACT_PROMPT_SESSION_KEY)) return;
    } catch {
      // Continue with the timed prompt when browser storage is unavailable.
    }

    const timer = window.setTimeout(() => {
      setShowContact(true);
      try {
        window.sessionStorage.setItem(CONTACT_PROMPT_SESSION_KEY, "1");
      } catch {
        // The prompt remains available even if session storage is blocked.
      }
    }, 3000);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    function handleScroll() {
      const scrollPosition = window.scrollY + window.innerHeight;
      const pageHeight = document.documentElement.scrollHeight;

      setIsAtBottom(scrollPosition >= pageHeight - 10);
    }

    handleScroll();

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  function handlePageNavigation() {
    window.scrollTo({
      top: isAtBottom ? 0 : document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  }

  function openContactForm() {
    try {
      window.sessionStorage.setItem(CONTACT_PROMPT_SESSION_KEY, "1");
    } catch {
      // The contact form can still be opened when storage is blocked.
    }
    setShowContact(true);
  }

  function closeContactForm() {
    try {
      window.sessionStorage.setItem(CONTACT_PROMPT_SESSION_KEY, "1");
    } catch {
      // Dismissal still works when storage is blocked.
    }
    setShowContact(false);
  }

  return (
    <>
      <CustomCursor />

      <RevealOnScroll />

      <Navigation
        onContactClick={openContactForm}
      />

      <main id="top">
        <Hero />
        <About />
        <Skills />
        <Achievements />
        <Clients />
        <Experience />
        <Work />
        <Tools />
        <Testimonials />
        <Education />
        <Blog />
        <Personal />
        <Contact />
      </main>

      <Footer />

      <button
  type="button"
  className="secret-button"
  onClick={() => setShowSecret(true)}
  aria-label="Open secret code"
  title="Secret"
>
  <Image
    src={secretKey}
    width={21}
    height={21}
    alt=""
    aria-hidden="true"
  />
</button>

      <button
        type="button"
        className="top-button"
        onClick={handlePageNavigation}
        aria-label={isAtBottom ? "Back to top" : "Go to bottom"}
      >
        {isAtBottom ? "↑︎" : "↓︎"}
      </button>

      {showContact && (
        <ContactForm
          onClose={closeContactForm}
        />
      )}
      {showSecret && (
  <SecretCode
    onClose={() => setShowSecret(false)}
  />
)}
    </>
  );
}
