(function () {
  "use strict";

  var catalog = window.GenecodeCatalog;
  var cfg = typeof GENECODE_CONFIG !== "undefined" ? GENECODE_CONFIG : null;

  var modalEl = null;
  var contentEl = null;
  var panelEl = null;
  var closeBtnEl = null;
  var lastFocusEl = null;
  var isOpen = false;

  function escapeHtml(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function buildWhatsAppUrl(drop, shirt) {
    var num = String(cfg.whatsappNumber || "").replace(/\D/g, "");
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

  function renderContent(ctx) {
    var drop = ctx.drop;
    var shirt = ctx.shirt;
    var mode = ctx.mode || "buy";
    var code = catalog.formatShirtCode(drop, shirt);
    var dropTitle = catalog.formatDropTitle(drop);
    var displayName = shirt.name || shirt.code;
    var buyable = mode === "buy" && catalog.isBuyable(drop, shirt);
    var soldOut = shirt.soldOut || drop.status === "sold_out" || mode === "archive";

    var sizesHtml = (shirt.sizes || [])
      .map(function (s) {
        return '<span class="shirt-detail__size">' + escapeHtml(s) + "</span>";
      })
      .join("");

    var statusLabel = soldOut ? "Sold out" : "Available";
    var statusClass = soldOut ? "shirt-detail__status--sold-out" : "shirt-detail__status--available";

    var ctaHtml = buyable
      ? '<a class="shirt-detail__cta" href="' +
        escapeHtml(buildWhatsAppUrl(drop, shirt)) +
        '" target="_blank" rel="noopener noreferrer">Buy via WhatsApp</a>'
      : "";

    return (
      '<div class="shirt-detail__layout">' +
      '<div class="shirt-detail__image">' +
      '<img src="' +
      escapeHtml(shirt.image) +
      '" alt="' +
      escapeHtml(displayName) +
      '" width="800" height="1000" />' +
      (soldOut ? '<span class="shirt-detail__badge">Sold out</span>' : "") +
      "</div>" +
      '<div class="shirt-detail__meta">' +
      '<p class="shirt-detail__code">' +
      escapeHtml(code) +
      "</p>" +
      '<p class="shirt-detail__drop">' +
      escapeHtml(dropTitle) +
      "</p>" +
      '<h2 class="shirt-detail__title" id="detail-title">' +
      escapeHtml(displayName) +
      "</h2>" +
      (shirt.tagline
        ? '<p class="shirt-detail__tagline">' + escapeHtml(shirt.tagline) + "</p>"
        : "") +
      (shirt.price ? '<p class="shirt-detail__price">' + escapeHtml(shirt.price) + "</p>" : "") +
      (sizesHtml ? '<div class="shirt-detail__sizes" aria-label="Available sizes">' + sizesHtml + "</div>" : "") +
      '<p class="shirt-detail__status ' +
      statusClass +
      '">' +
      escapeHtml(statusLabel) +
      "</p>" +
      ctaHtml +
      "</div>" +
      "</div>"
    );
  }

  function getFocusable(root) {
    return Array.prototype.slice.call(
      root.querySelectorAll(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      )
    );
  }

  function trapFocus(e) {
    if (!isOpen || !panelEl) return;
    if (e.key !== "Tab") return;

    var focusable = getFocusable(panelEl);
    if (!focusable.length) return;

    var first = focusable[0];
    var last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else if (document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function onKeyDown(e) {
    if (!isOpen) return;
    if (e.key === "Escape") {
      e.preventDefault();
      closeShirtDetail();
    }
    trapFocus(e);
  }

  function onBackdropClick(e) {
    if (e.target && e.target.hasAttribute("data-detail-close")) {
      closeShirtDetail();
    }
  }

  function openShirtDetail(ctx) {
    if (!modalEl || !contentEl || !ctx || !ctx.drop || !ctx.shirt) return;

    contentEl.innerHTML = renderContent(ctx);
    lastFocusEl = document.activeElement;

    modalEl.hidden = false;
    modalEl.setAttribute("aria-hidden", "false");
    document.body.classList.add("shirt-detail-open");
    isOpen = true;

    if (closeBtnEl) {
      closeBtnEl.focus();
    }
  }

  function closeShirtDetail() {
    if (!modalEl) return;

    modalEl.hidden = true;
    modalEl.setAttribute("aria-hidden", "true");
    document.body.classList.remove("shirt-detail-open");
    isOpen = false;
    contentEl.innerHTML = "";

    if (lastFocusEl && typeof lastFocusEl.focus === "function") {
      lastFocusEl.focus();
    }
    lastFocusEl = null;
  }

  function bindCardDetailClicks(containerEl, mode) {
    if (!containerEl) return;

    function openFromCard(card) {
      if (!card || !card.classList.contains("shirt-card--clickable")) return;

      var key = card.getAttribute("data-shirt-key");
      var item = catalog.findShirtByKey(key);
      if (!item) return;

      openShirtDetail({ drop: item.drop, shirt: item.shirt, mode: mode });
    }

    containerEl.addEventListener("click", function (e) {
      var cta = e.target.closest(".shirt-card__cta");
      if (cta) {
        e.stopPropagation();
        return;
      }

      var card = e.target.closest(".shirt-card--clickable");
      if (!card || !containerEl.contains(card)) return;

      openFromCard(card);
    });

    containerEl.addEventListener("keydown", function (e) {
      if (e.key !== "Enter" && e.key !== " ") return;

      var card = e.target.closest(".shirt-card--clickable");
      if (!card || !containerEl.contains(card)) return;

      e.preventDefault();
      openFromCard(card);
    });
  }

  function initDetailModal() {
    modalEl = document.getElementById("shirt-detail");
    contentEl = document.getElementById("shirt-detail-content");
    if (!modalEl || !contentEl) return;

    panelEl = modalEl.querySelector(".shirt-detail__panel");
    closeBtnEl = modalEl.querySelector(".shirt-detail__close");

    modalEl.addEventListener("click", onBackdropClick);
    document.addEventListener("keydown", onKeyDown);
  }

  window.GenecodeDetailModal = {
    initDetailModal: initDetailModal,
    openShirtDetail: openShirtDetail,
    closeShirtDetail: closeShirtDetail,
    bindCardDetailClicks: bindCardDetailClicks,
  };
})();
