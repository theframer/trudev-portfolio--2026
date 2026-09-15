"use client";
import { useEffect, useRef, useState } from "react";
import {
  SECRET_CODE,
  SECRET_ACTION,
} from "@/config/secret";

type SecretCodeProps = {
  onClose: () => void;
};

export default function SecretCode({ onClose }: SecretCodeProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (code.trim().toUpperCase() === SECRET_CODE) {
      setUnlocked(true);
      setError(false);
      return;
    }

    setError(true);
  }

  return (
    <div className="secret-panel-wrapper">
      <div
        ref={panelRef}
        className="secret-panel"
        role="dialog"
        aria-modal="false"
        aria-label="Secret access"
      >
        {!unlocked ? (
          <>
            <div className="secret-panel-header">
              <span className="secret-label">SECRET ACCESS</span>

              <button
                type="button"
                className="secret-panel-close"
                onClick={onClose}
                aria-label="Close secret access"
              >
                ×
              </button>
            </div>

            <p className="secret-description">
              There&apos;s something hidden here.
            </p>

            <form onSubmit={handleSubmit} className="secret-form">
              <input
                type="text"
                value={code}
                onChange={(event) => {
                  setCode(event.target.value);
                  setError(false);
                }}
                placeholder="ENTER CODE"
                autoComplete="off"
                autoFocus
                aria-label="Secret code"
              />

              <button type="submit" className="secret-submit">
                UNLOCK
                <span aria-hidden="true">↗</span>
              </button>
            </form>

            {error && (
              <p className="secret-error" role="alert">
                ACCESS DENIED.
              </p>
            )}
          </>
        ) : (
            <>
            <div className="secret-panel-header">
              <span className="secret-label">ACCESS GRANTED</span>
          
              <button
                type="button"
                className="secret-panel-close"
                onClick={onClose}
                aria-label="Close secret access"
              >
                ×
              </button>
            </div>
          
            <p className="secret-file-name">
  {SECRET_ACTION.url.split("/").pop()}
</p>
          
            {SECRET_ACTION.type === "file" && (
              <a
                className="secret-action-button"
                href={SECRET_ACTION.url}
                download
              >
                {SECRET_ACTION.title}
                {/* <span aria-hidden="true">↓</span> */}
              </a>
            )}
          
            {SECRET_ACTION.type === "link" && (
              <a
                className="secret-action-button"
                href={SECRET_ACTION.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {SECRET_ACTION.title}
                <span aria-hidden="true">↗</span>
              </a>
            )}
          </>
        )}
      </div>
    </div>
  );
}