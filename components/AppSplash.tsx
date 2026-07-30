"use client";

import { useEffect, useState } from "react";

const MINIMUM_DISPLAY_MS = 650;
const FADE_DURATION_MS = 450;

export function AppSplash() {
  const [phase, setPhase] = useState<"loading" | "leaving" | "hidden">("loading");

  useEffect(() => {
    const startedAt = Date.now();
    let fadeTimer: ReturnType<typeof setTimeout> | undefined;
    let hideTimer: ReturnType<typeof setTimeout> | undefined;

    function finish() {
      const remaining = Math.max(0, MINIMUM_DISPLAY_MS - (Date.now() - startedAt));
      fadeTimer = setTimeout(() => {
        setPhase("leaving");
        hideTimer = setTimeout(() => setPhase("hidden"), FADE_DURATION_MS);
      }, remaining);
    }

    if (document.readyState === "complete") {
      finish();
    } else {
      window.addEventListener("load", finish, { once: true });
    }

    return () => {
      window.removeEventListener("load", finish);
      if (fadeTimer) clearTimeout(fadeTimer);
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, []);

  if (phase === "hidden") return null;

  return (
    <div
      className={`app-splash${phase === "leaving" ? " app-splash--leaving" : ""}`}
      aria-label="Loading Genecode"
      role="status"
    >
      <div className="app-splash__content">
        <img className="app-splash__logo" src="/assets/logo.png" alt="Genecode" />
        <div className="app-splash__bar" aria-hidden="true">
          <span />
        </div>
      </div>
    </div>
  );
}
