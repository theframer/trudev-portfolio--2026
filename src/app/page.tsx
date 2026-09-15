"use client";

import { useEffect, useState } from "react";

import ContactForm from "@/components/ContactForm";
import CustomCursor from "@/components/CustomCursor";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Skills from "@/components/Skills";
import Achievements from "@/components/Achievements";
import Clients from "@/components/Clients";
import Experience from "@/components/Experience";
import Work from "@/components/Work";
import Projects from "@/components/Projects";
import Testimonials from "@/components/Testimonials";
import Education from "@/components/Education";
import Blog from "@/components/Blog";
import Personal from "@/components/Personal";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import SecretCode from "@/components/SecretCode";
import secretKey from "@/assets/icons/secret-key.svg";

export default function Home() {
  const [showContact, setShowContact] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false);

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

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setShowContact(true);
    }, 5000);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  function handlePageNavigation() {
    window.scrollTo({
      top: isAtBottom ? 0 : document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  }

  return (
    <>
      <CustomCursor />

      <Navigation
        onContactClick={() => setShowContact(true)}
      />

      <main id="top">
        <Hero />
        <About />
        <Skills />
        <Achievements />
        <Clients />
        <Experience />
        <Work />
        <Projects />
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
  <img
    src={secretKey.src}
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
        {isAtBottom ? "↑" : "↓"}
      </button>

      <button
        type="button"
        className="top-button"
        onClick={handlePageNavigation}
        aria-label={isAtBottom ? "Back to top" : "Go to bottom"}
      >
        {isAtBottom ? "↑" : "↓"}
      </button>

      {showContact && (
        <ContactForm
          onClose={() => setShowContact(false)}
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