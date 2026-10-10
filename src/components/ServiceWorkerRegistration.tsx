"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!("serviceWorker" in navigator) || !window.isSecureContext) return;

    void navigator.serviceWorker
      .register("/service-worker.js", { scope: "/" })
      .catch((error: unknown) => {
        console.warn("TRUDEV offline fallback could not be enabled.", error);
      });
  }, []);

  return null;
}
