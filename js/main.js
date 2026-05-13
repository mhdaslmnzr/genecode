(function () {
  "use strict";

  var cfg = typeof GENECODE_CONFIG !== "undefined" ? GENECODE_CONFIG : null;
  if (!cfg || !Array.isArray(cfg.shirts)) {
    return;
  }

  var headerEl = document.getElementById("site-header");
  var heroEl = document.getElementById("hero");
  var gridEl = document.getElementById("shirt-grid");
  var heroTaglineEl = document.getElementById("hero-tagline");
  var aboutTextEl = document.getElementById("about-text");
  var collectionHeadingEl = document.getElementById("collection-heading");
  var footerIgEl = document.getElementById("footer-instagram");
  var footerLegalEl = document.getElementById("footer-legal");

  var tickHandles = [];

  function pad2(n) {
    return String(n).padStart(2, "0");
  }

  function isRevealed(shirt) {
    if (shirt.revealDate == null) return true;
    var t = new Date(shirt.revealDate).getTime();
    if (Number.isNaN(t)) return true;
    return Date.now() >= t;
  }

  function timeParts(ms) {
    if (ms <= 0) {
      return { d: 0, h: 0, m: 0, s: 0 };
    }
    var sec = Math.floor(ms / 1000);
    var d = Math.floor(sec / 86400);
    sec -= d * 86400;
    var h = Math.floor(sec / 3600);
    sec -= h * 3600;
    var m = Math.floor(sec / 60);
    var s = sec - m * 60;
    return { d: d, h: h, m: m, s: s };
  }

  var LOCK_SVG =
    '<svg class="shirt-card__lock" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
    '<path fill="currentColor" d="M18 9h-1V7a5 5 0 0 0-10 0v2H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2zm-8-2a3 3 0 0 1 6 0v2h-6V7z"/>' +
    "</svg>";

  function buildWhatsAppUrl(shirt) {
    var num = String(cfg.whatsappNumber || "").replace(/\D/g, "");
    var nm = shirt.name || shirt.id;
    var msg =
      "Hi! I'd like to order the following from Genecode:\n\n" +
      "Shirt: " +
      nm +
      " (" +
      shirt.id +
      ")\n" +
      "Price: " +
      shirt.price +
      "\n" +
      "Size: [Customer fills this in]\n\n" +
      "Please confirm availability.";
    return "https://wa.me/" + num + "?text=" + encodeURIComponent(msg);
  }

  function renderRevealedCard(shirt) {
    var displayName = shirt.name || shirt.id;
    var sizesHtml = (shirt.sizes || [])
      .map(function (s) {
        return '<span class="shirt-card__size">' + escapeHtml(s) + "</span>";
      })
      .join("");

    return (
      '<article class="shirt-card shirt-card--revealed" data-shirt-id="' +
      escapeHtml(shirt.id) +
      '" role="listitem">' +
      '<div class="shirt-card__media">' +
      '<img src="' +
      escapeHtml(shirt.image) +
      '" alt="' +
      escapeHtml(displayName) +
      '" loading="lazy" width="800" height="1000" />' +
      "</div>" +
      '<div class="shirt-card__body">' +
      '<p class="shirt-card__id">' +
      escapeHtml(shirt.id) +
      "</p>" +
      '<h3 class="shirt-card__name">' +
      escapeHtml(displayName) +
      "</h3>" +
      '<p class="shirt-card__tagline">' +
      escapeHtml(shirt.tagline || "") +
      "</p>" +
      '<p class="shirt-card__price">' +
      escapeHtml(shirt.price || "") +
      "</p>" +
      (sizesHtml ? '<div class="shirt-card__sizes">' + sizesHtml + "</div>" : "") +
      '<a class="shirt-card__cta" href="' +
      escapeHtml(buildWhatsAppUrl(shirt)) +
      '" target="_blank" rel="noopener noreferrer">Buy via WhatsApp</a>' +
      "</div>" +
      "</article>"
    );
  }

  function renderLockedCard(shirt) {
    var target = new Date(shirt.revealDate).getTime();
    var parts = timeParts(target - Date.now());

    return (
      '<article class="shirt-card shirt-card--locked" data-shirt-id="' +
      escapeHtml(shirt.id) +
      '" data-reveal-at="' +
      target +
      '" role="listitem">' +
      '<div class="shirt-card__media">' +
      '<img src="' +
      escapeHtml(shirt.image) +
      '" alt="" role="presentation" loading="lazy" width="800" height="1000" />' +
      '<div class="shirt-card__overlay">' +
      LOCK_SVG +
      '<p class="shirt-card__soon">Coming soon</p>' +
      '<div class="countdown" aria-live="polite">' +
      countdownUnit(parts.d, "Days") +
      countdownUnit(parts.h, "Hrs") +
      countdownUnit(parts.m, "Min") +
      countdownUnit(parts.s, "Sec") +
      "</div>" +
      "</div>" +
      "</div>" +
      '<div class="shirt-card__body">' +
      '<p class="shirt-card__id">' +
      escapeHtml(shirt.id) +
      "</p>" +
      "</div>" +
      "</article>"
    );
  }

  function countdownUnit(value, label) {
    return (
      '<div class="countdown__unit">' +
      '<span class="countdown__value">' +
      pad2(value) +
      "</span>" +
      '<span class="countdown__label">' +
      escapeHtml(label) +
      "</span>" +
      "</div>"
    );
  }

  function escapeHtml(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function mountCard(shirt) {
    if (isRevealed(shirt)) {
      return renderRevealedCard(shirt);
    }
    return renderLockedCard(shirt);
  }

  function updateLockedCountdowns() {
    var cards = Array.prototype.slice.call(gridEl.querySelectorAll(".shirt-card--locked"));
    cards.forEach(function (card) {
      var raw = card.getAttribute("data-reveal-at");
      var target = raw ? parseInt(raw, 10) : 0;
      var left = target - Date.now();

      if (left <= 0) {
        var id = card.getAttribute("data-shirt-id");
        var shirt = cfg.shirts.find(function (s) {
          return s.id === id;
        });
        if (shirt) {
          var wrap = document.createElement("div");
          wrap.innerHTML = renderRevealedCard(shirt);
          var next = wrap.firstElementChild;
          if (next) card.replaceWith(next);
        }
        return;
      }

      var parts = timeParts(left);
      var vals = card.querySelectorAll(".countdown__value");
      if (vals.length === 4) {
        vals[0].textContent = pad2(parts.d);
        vals[1].textContent = pad2(parts.h);
        vals[2].textContent = pad2(parts.m);
        vals[3].textContent = pad2(parts.s);
      }
    });
  }

  function renderGrid() {
    tickHandles.forEach(function (id) {
      clearInterval(id);
    });
    tickHandles = [];

    gridEl.innerHTML = cfg.shirts.map(mountCard).join("");

    var intervalId = window.setInterval(updateLockedCountdowns, 1000);
    tickHandles.push(intervalId);
    updateLockedCountdowns();
  }

  function syncHeader() {
    if (!headerEl || !heroEl) return;
    var h = heroEl.getBoundingClientRect().height;
    var solid = window.scrollY > Math.max(12, h - (headerEl.offsetHeight || 0));
    headerEl.classList.toggle("site-header--solid", solid);
  }

  function initChrome() {
    heroTaglineEl.textContent = (cfg.dropName || "") + " — " + (cfg.tagline || "");
    aboutTextEl.textContent = cfg.aboutText || "";
    collectionHeadingEl.textContent = cfg.dropName || "Drop";

    var handle = (cfg.instagramHandle || "").replace(/^@/, "");
    footerIgEl.textContent = cfg.instagramHandle || "@genecode";
    footerIgEl.href = handle ? "https://www.instagram.com/" + handle + "/" : "#";

    var year = new Date().getFullYear();
    footerLegalEl.textContent =
      (cfg.dropName || "DROP 01") + " — ALL RIGHTS RESERVED — " + year;
  }

  window.addEventListener("scroll", syncHeader, { passive: true });
  window.addEventListener("resize", syncHeader);

  initChrome();
  renderGrid();
  syncHeader();
})();
