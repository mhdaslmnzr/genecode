(function () {
  "use strict";

  var cfg = typeof GENECODE_CONFIG !== "undefined" ? GENECODE_CONFIG : null;
  var catalog = window.GenecodeCatalog;
  var detailModal = window.GenecodeDetailModal;

  if (!cfg || !catalog || !Array.isArray(cfg.drops)) {
    return;
  }

  var headerEl = document.getElementById("site-header");
  var heroEl = document.getElementById("hero");
  var gridEl = document.getElementById("shirt-grid");
  var carryOverEl = document.getElementById("carry-over");
  var carryOverGridEl = document.getElementById("carry-over-grid");
  var heroTaglineEl = document.getElementById("hero-tagline");
  var aboutTextEl = document.getElementById("about-text");
  var collectionHeadingEl = document.getElementById("collection-heading");
  var tickerEl = document.getElementById("site-ticker");
  var tickerTrackEl = document.getElementById("ticker-track");
  var footerIgEl = document.getElementById("footer-instagram");
  var footerWhatsappEl = document.getElementById("footer-whatsapp");
  var footerActiveDropEl = document.getElementById("footer-active-drop");
  var footerCopyrightEl = document.getElementById("footer-copyright");

  function escapeHtml(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function buildWhatsAppUrl(item) {
    var num = String(cfg.whatsappNumber || "").replace(/\D/g, "");
    var drop = item.drop;
    var shirt = item.shirt;
    var code = catalog.formatShirtCode(drop, shirt);
    var dropTitle = catalog.formatDropTitle(drop);
    var nm = shirt.name || shirt.code;
    var msg =
      "Hi! I'd like to order the following from Genecode:\n\n" +
      "Shirt: " +
      nm +
      " (" +
      code +
      ")\n" +
      "Drop: " +
      dropTitle +
      "\n" +
      "Price: " +
      shirt.price +
      "\n" +
      "Size: [Customer fills this in]\n\n" +
      "Please confirm availability.";
    return "https://wa.me/" + num + "?text=" + encodeURIComponent(msg);
  }

  function renderRevealedCard(item) {
    var drop = item.drop;
    var shirt = item.shirt;
    var code = item.code;
    var key = item.key;
    var displayName = shirt.name || shirt.code;
    var soldOut = item.soldOut;
    var buyable = item.buyable;

    var sizesHtml = (shirt.sizes || [])
      .map(function (s) {
        return '<span class="shirt-card__size">' + escapeHtml(s) + "</span>";
      })
      .join("");

    var cardClass = "shirt-card shirt-card--revealed shirt-card--clickable";
    if (soldOut) {
      cardClass += " shirt-card--sold-out";
    }

    var overlayHtml = soldOut
      ? '<div class="shirt-card__sold-out-overlay"><span class="shirt-card__sold-out-label">Sold out</span></div>'
      : "";

    var ctaHtml = buyable
      ? '<a class="shirt-card__cta" href="' +
        escapeHtml(buildWhatsAppUrl(item)) +
        '" target="_blank" rel="noopener noreferrer">Buy via WhatsApp</a>'
      : "";

    return (
      '<article class="' +
      cardClass +
      '" data-shirt-key="' +
      escapeHtml(key) +
      '" role="listitem" tabindex="0">' +
      '<div class="shirt-card__media">' +
      '<img src="' +
      escapeHtml(shirt.image) +
      '" alt="' +
      escapeHtml(displayName) +
      '" loading="lazy" width="800" height="1000" />' +
      overlayHtml +
      "</div>" +
      '<div class="shirt-card__body">' +
      '<p class="shirt-card__id">' +
      escapeHtml(code) +
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
      ctaHtml +
      "</div>" +
      "</article>"
    );
  }

  function renderGrid(container, items) {
    if (!container) return;
    container.innerHTML = items.map(renderRevealedCard).join("");
  }

  function initTicker() {
    if (!tickerEl || !tickerTrackEl) return;

    var ticker = cfg.ticker || {};
    var messages = Array.isArray(ticker.messages) ? ticker.messages : [];
    if (!ticker.enabled || !messages.length) {
      tickerEl.hidden = true;
      document.body.classList.remove("has-ticker");
      return;
    }

    var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var displayMessages = reducedMotion ? [messages[0]] : messages.concat(messages);

    tickerTrackEl.innerHTML = displayMessages
      .map(function (msg) {
        return '<span class="site-ticker__item">' + escapeHtml(msg) + "</span>";
      })
      .join('<span class="site-ticker__sep" aria-hidden="true">·</span>');

    tickerEl.hidden = false;
    document.body.classList.add("has-ticker");
    if (reducedMotion) {
      tickerTrackEl.classList.add("site-ticker__track--static");
    }
  }

  function syncHeader() {
    if (!headerEl || !heroEl) return;
    var h = heroEl.getBoundingClientRect().height;
    var solid = window.scrollY > Math.max(12, h - (headerEl.offsetHeight || 0));
    headerEl.classList.toggle("site-header--solid", solid);
  }

  function initChrome() {
    var activeDrop = catalog.getActiveDrop();
    if (!activeDrop) return;

    var dropTitle = catalog.formatDropTitle(activeDrop);
    heroTaglineEl.textContent = dropTitle + " — " + (activeDrop.tagline || "");
    aboutTextEl.textContent = cfg.aboutText || "";
    collectionHeadingEl.textContent = activeDrop.label || "Drop";

    var handle = (cfg.instagramHandle || "").replace(/^@/, "");
    if (footerIgEl) {
      footerIgEl.textContent = cfg.instagramHandle || "@genecode.clothing";
      footerIgEl.href = handle ? "https://www.instagram.com/" + handle + "/" : "#";
    }

    if (footerWhatsappEl) {
      var num = String(cfg.whatsappNumber || "").replace(/\D/g, "");
      footerWhatsappEl.href = num ? "https://wa.me/" + num : "#";
    }

    if (footerActiveDropEl) {
      footerActiveDropEl.textContent = "Now featuring " + dropTitle;
    }

    if (footerCopyrightEl) {
      footerCopyrightEl.textContent = "© GENECODE · " + new Date().getFullYear();
    }
  }

  function initGrids() {
    var primary = catalog.getPrimaryShirts();
    renderGrid(gridEl, primary);

    var carryOver = catalog.getCarryOverShirts();
    if (carryOverEl && carryOverGridEl) {
      if (carryOver.length > 0) {
        carryOverEl.hidden = false;
        renderGrid(carryOverGridEl, carryOver);
        if (detailModal) {
          detailModal.bindCardDetailClicks(carryOverGridEl, "buy");
        }
      } else {
        carryOverEl.hidden = true;
      }
    }

    if (detailModal) {
      detailModal.bindCardDetailClicks(gridEl, "buy");
    }
  }

  if (detailModal) {
    detailModal.initDetailModal();
  }

  initTicker();
  initChrome();
  initGrids();
  syncHeader();

  window.addEventListener("scroll", syncHeader, { passive: true });
  window.addEventListener("resize", syncHeader);
})();
