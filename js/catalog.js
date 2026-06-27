(function (global) {
  "use strict";

  function getConfig() {
    return typeof GENECODE_CONFIG !== "undefined" ? GENECODE_CONFIG : null;
  }

  function getDrops() {
    var cfg = getConfig();
    return cfg && Array.isArray(cfg.drops) ? cfg.drops : [];
  }

  function getDrop(id) {
    return getDrops().find(function (d) {
      return d.id === id;
    }) || null;
  }

  function getActiveDrop() {
    var cfg = getConfig();
    if (!cfg || !cfg.activeDropId) return getDrops()[0] || null;
    return getDrop(cfg.activeDropId) || getDrops()[0] || null;
  }

  function getArchiveDrops() {
    return getDrops()
      .filter(function (d) {
        return d.status === "sold_out";
      })
      .sort(function (a, b) {
        var ay = a.year || 0;
        var by = b.year || 0;
        if (by !== ay) return by - ay;
        return String(b.number || "").localeCompare(String(a.number || ""));
      });
  }

  function formatShirtCode(drop, shirt) {
    return drop.year + "/" + drop.number + "/" + shirt.code;
  }

  function formatDropTitle(drop) {
    var base = drop.label || "DROP " + (drop.number || "");
    if (drop.name) {
      return base + " — " + drop.name;
    }
    return base;
  }

  function shirtKey(drop, shirt) {
    return drop.id + ":" + shirt.code;
  }

  function isRevealed() {
    return true;
  }

  function isBuyable(drop, shirt) {
    return !shirt.soldOut && drop.status !== "sold_out";
  }

  function flattenShirt(drop, shirt) {
    return {
      drop: drop,
      shirt: shirt,
      code: formatShirtCode(drop, shirt),
      key: shirtKey(drop, shirt),
      dropTitle: formatDropTitle(drop),
      revealed: isRevealed(shirt),
      buyable: isBuyable(drop, shirt),
      soldOut: !!shirt.soldOut || drop.status === "sold_out",
    };
  }

  function flattenDropShirts(drop) {
    return (drop.shirts || []).map(function (shirt) {
      return flattenShirt(drop, shirt);
    });
  }

  function getPrimaryShirts() {
    var drop = getActiveDrop();
    if (!drop) return [];
    return flattenDropShirts(drop);
  }

  function getCarryOverShirts() {
    var cfg = getConfig();
    var activeId = cfg && cfg.activeDropId;
    var result = [];

    getDrops().forEach(function (drop) {
      if (drop.id === activeId) return;
      if (drop.status === "sold_out") return;
      flattenDropShirts(drop).forEach(function (item) {
        if (!item.soldOut) {
          result.push(item);
        }
      });
    });

    return result;
  }

  function findShirtByKey(key) {
    var parts = String(key || "").split(":");
    if (parts.length !== 2) return null;
    var drop = getDrop(parts[0]);
    if (!drop) return null;
    var shirt = (drop.shirts || []).find(function (s) {
      return s.code === parts[1];
    });
    if (!shirt) return null;
    return flattenShirt(drop, shirt);
  }

  var Catalog = {
    getDrop: getDrop,
    getActiveDrop: getActiveDrop,
    getArchiveDrops: getArchiveDrops,
    formatShirtCode: formatShirtCode,
    formatDropTitle: formatDropTitle,
    shirtKey: shirtKey,
    isRevealed: isRevealed,
    isBuyable: isBuyable,
    getPrimaryShirts: getPrimaryShirts,
    getCarryOverShirts: getCarryOverShirts,
    flattenShirt: flattenShirt,
    findShirtByKey: findShirtByKey,
  };

  global.GenecodeCatalog = Catalog;
})(typeof window !== "undefined" ? window : globalThis);
