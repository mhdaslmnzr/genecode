import type { SiteSettings } from "@/lib/types";

export function Ticker({ settings }: { settings: SiteSettings }) {
  if (!settings.ticker.enabled || !settings.ticker.messages.length) return null;

  const messages = settings.ticker.messages;

  return (
    <div className="site-ticker" aria-live="polite">
      <div className="site-ticker__track">
        {[...messages, ...messages].map((msg, i) => (
          <span key={i}>
            {i > 0 && <span className="site-ticker__sep" aria-hidden="true">·</span>}
            <span className="site-ticker__item">{msg}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
