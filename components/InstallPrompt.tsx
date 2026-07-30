"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type InstallChoice = { outcome: "accepted" | "dismissed"; platform: string };
type InstallEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<InstallChoice>;
};

const DISMISS_KEY = "genecode-install-dismissed";
const DISMISS_MS = 7 * 24 * 60 * 60 * 1000;

export function InstallPrompt() {
  const pathname = usePathname();
  const [installEvent, setInstallEvent] = useState<InstallEvent | null>(null);
  const [show, setShow] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone;
    if (standalone) return;
    const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) || 0);
    if (Date.now() - dismissedAt < DISMISS_MS) return;

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    setIsIos(ios);
    const onInstallAvailable = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as InstallEvent);
      setShow(true);
    };
    const onInstalled = () => {
      setShow(false);
      setShowIosGuide(false);
    };
    window.addEventListener("beforeinstallprompt", onInstallAvailable);
    window.addEventListener("appinstalled", onInstalled);
    const iosTimer = ios ? window.setTimeout(() => setShow(true), 12000) : 0;
    return () => {
      window.removeEventListener("beforeinstallprompt", onInstallAvailable);
      window.removeEventListener("appinstalled", onInstalled);
      if (iosTimer) window.clearTimeout(iosTimer);
    };
  }, [pathname]);

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setShow(false);
    setShowIosGuide(false);
  }

  async function install() {
    if (isIos) {
      setShowIosGuide(true);
      return;
    }
    if (!installEvent) return;
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    if (choice.outcome === "dismissed") localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setInstallEvent(null);
    setShow(false);
  }

  if (!show || pathname.startsWith("/admin")) return null;

  return (
    <aside className="install-prompt" aria-label="Install Genecode">
      <img src="/assets/logo%20no%20text.png" alt="" />
      <div className="install-prompt__copy">
        <strong>Install Genecode</strong>
        {showIosGuide ? (
          <p>Tap the Share button in Safari, then choose <b>Add to Home Screen</b>.</p>
        ) : (
          <p>Get quick access to new drops.</p>
        )}
      </div>
      {!showIosGuide && <button className="install-prompt__install" type="button" onClick={install}>Install</button>}
      <button className="install-prompt__dismiss" type="button" onClick={dismiss}>{showIosGuide ? "Got it" : "Not now"}</button>
    </aside>
  );
}
