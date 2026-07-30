"use client";

import { useEffect, useState } from "react";

type InstallEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function AdminInstallButton() {
  const [event, setEvent] = useState<InstallEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const isInstalled = window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone;
    setInstalled(Boolean(isInstalled));
    const onPrompt = (nextEvent: Event) => {
      nextEvent.preventDefault();
      setEvent(nextEvent as InstallEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setEvent(null);
      setMessage("Genecode Admin is installed.");
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function install() {
    if (event) {
      await event.prompt();
      const choice = await event.userChoice;
      setMessage(choice.outcome === "accepted" ? "Installation started." : "Installation was cancelled.");
      setEvent(null);
      return;
    }
    if (/iphone|ipad|ipod/i.test(navigator.userAgent)) {
      setMessage("In Safari, tap Share and then Add to Home Screen.");
    } else {
      setMessage("Open the browser menu and choose Install app or Add to Home screen. If unavailable, interact with the site and try again shortly.");
    }
  }

  if (installed) return <p className="admin-notice admin-notice--success">Genecode Admin is already installed.</p>;

  return (
    <div className="admin-install">
      <button className="admin-btn" type="button" onClick={install}>Install Genecode Admin</button>
      {message && <p className="admin-hint admin-hint--wide" role="status">{message}</p>}
    </div>
  );
}
