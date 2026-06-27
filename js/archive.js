(function () {
  "use strict";

  var cfg = typeof GENECODE_CONFIG !== "undefined" ? GENECODE_CONFIG : null;
  var catalog = window.GenecodeCatalog;
  var detailModal = window.GenecodeDetailModal;

  if (!cfg || !catalog || !Array.isArray(cfg.drops)) {
    return;
  }

  var archiveRootEl = document.getElementById("archive-root");
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

  function renderArchiveCard(item) {
    var drop = item.drop;
    var shirt = item.shirt;
    var code = item.code;
    var key = item.key;
    var displayName = shirt.name || shirt.code;

    var sizesHtml = (shirt.sizes || [])
      .map(function (s) {
        return '<span class="shirt-card__size">' + escapeHtml(s) + "</span>";
      })
      .join("");

    return (
      '<article class="shirt-card shirt-card--revealed shirt-card--sold-out shirt-card--clickable archive-card" data-shirt-key="' +
      escapeHtml(key) +
      '" role="listitem" tabindex="0">' +
      '<div class="shirt-card__media">' +
      '<img src="' +
      escapeHtml(shirt.image) +
      '" alt="' +
      escapeHtml(displayName) +
      '" loading="lazy" width="800" height="1000" />' +
      '<div class="shirt-card__sold-out-overlay">' +
      '<span class="shirt-card__sold-out-label">Sold out</span>' +
      "</div>" +
      '<span class="archive-card__ribbon">Drop ended</span>' +
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
      (shirt.price ? '<p class="shirt-card__price">' + escapeHtml(shirt.price) + "</p>" : "") +
      (sizesHtml ? '<div class="shirt-card__sizes">' + sizesHtml + "</div>" : "") +
      "</div>" +
      "</article>"
    );
  }

  function renderDropSection(drop) {
    var title = catalog.formatDropTitle(drop);
    var items = (drop.shirts || []).map(function (shirt) {
      return catalog.flattenShirt(drop, shirt);
    });

    var cardsHtml = items.map(renderArchiveCard).join("");

    return (
      '<section class="archive-drop" aria-labelledby="archive-drop-' +
      escapeHtml(drop.id) +
      '">' +
      '<div class="archive-drop__header">' +
      '<h2 class="archive-drop__title" id="archive-drop-' +
      escapeHtml(drop.id) +
      '">' +
      escapeHtml(title) +
      "</h2>" +
      '<span class="archive-drop__year">' +
      escapeHtml(String(drop.year)) +
      "</span>" +
      "</div>" +
      '<div class="collection__grid archive-drop__grid" role="list">' +
      cardsHtml +
      "</div>" +
      "</section>"
    );
  }

  function initFooter() {
    var activeDrop = catalog.getActiveDrop();
    var dropTitle = activeDrop ? catalog.formatDropTitle(activeDrop) : "DROP 01";

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

  function initArchive() {
    if (!archiveRootEl) return;

    var drops = catalog.getArchiveDrops();
    if (!drops.length) {
      archiveRootEl.innerHTML =
        '<p class="archive-empty">No archived drops yet. Sold-out collections will appear here.</p>';
      return;
    }

    archiveRootEl.innerHTML = drops.map(renderDropSection).join("");

    var grids = archiveRootEl.querySelectorAll(".archive-drop__grid");
    Array.prototype.forEach.call(grids, function (grid) {
      if (detailModal) {
        detailModal.bindCardDetailClicks(grid, "archive");
      }
    });
  }

  if (detailModal) {
    detailModal.initDetailModal();
  }

  initFooter();
  initArchive();
})();
