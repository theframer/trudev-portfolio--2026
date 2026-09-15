"use client";
import "./ContactForm.css";

import { FormEvent, useState } from "react";

type ContactFormProps = {
  onClose: () => void;
};

export default function ContactForm({ onClose }: ContactFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSubmitting(true);
    setError("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch(
        "https://formspree.io/f/mldlrjdp",
        {
          method: "POST",
          body: formData,
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Form submission failed");
      }

      setSubmitted(true);
      form.reset();
    } catch {
      setError(
        "Something went wrong while sending your message. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="contact-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="contact-modal">
        <button
          type="button"
          className="contact-close"
          onClick={onClose}
          aria-label="Close contact form"
        >
          ×
        </button>

        {!submitted ? (
          <>
            <div className="contact-header">
              <p className="contact-eyebrow">
                WANT TO
              </p>

              <h2 id="contact-title">
                CONNECT?
              </h2>

              <p>
              got a question or just want to know about _____?
              </p>
            </div>

            <form
              className="contact-form"
              onSubmit={handleSubmit}
            >
              <div className="contact-field">
                <label htmlFor="contact-name">
                  Name
                </label>

                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  placeholder="Your name"
                  autoComplete="name"
                  required
                />
              </div>

              <div className="contact-field">
                <label htmlFor="contact-email">
                  Email
                </label>

                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>

              <div className="contact-field">
                <label htmlFor="contact-subject">
                  Subject
                </label>

                <input
                  id="contact-subject"
                  name="subject"
                  type="text"
                  placeholder="What would you like to discuss?"
                  required
                />
              </div>

              <div className="contact-field">
                <label htmlFor="contact-message">
                  Message
                </label>

                <textarea
                  id="contact-message"
                  name="message"
                  placeholder="Tell me a little about it..."
                  rows={6}
                  required
                />
              </div>

              <input
                type="text"
                name="_gotcha"
                tabIndex={-1}
                autoComplete="off"
                className="contact-honeypot"
                aria-hidden="true"
              />

              <button
                type="submit"
                className="contact-submit"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "SENDING..."
                  : "SEND MESSAGE"}

                <span>↗</span>
              </button>

              {error && (
                <p
                  className="contact-error"
                  role="alert"
                >
                  {error}
                </p>
              )}
            </form>
          </>
        ) : (
          <div className="contact-success">
            <p className="contact-eyebrow">
              MESSAGE SENT
            </p>

            <h2>
              THANK
              <br />
              YOU.
            </h2>

            <p>
              Your message has been received. I&apos;ll get
              back to you as soon as possible.
            </p>

            <button
              type="button"
              className="contact-submit"
              onClick={onClose}
            >
              CLOSE
              <span>×</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}