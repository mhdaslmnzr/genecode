(function (global) {
  "use strict";

  function getSupabaseConfig() {
    var cfg = typeof GENECODE_CONFIG !== "undefined" ? GENECODE_CONFIG : null;
    if (!cfg || !cfg.supabase) return null;
    var url = String(cfg.supabase.url || "").trim();
    var key = String(cfg.supabase.anonKey || "").trim();
    if (!url || !key) return null;
    return { url: url.replace(/\/$/, ""), anonKey: key };
  }

  function fetchCatalog() {
    var sb = getSupabaseConfig();
    if (!sb) {
      return Promise.reject(new Error("Supabase not configured"));
    }

    var endpoint =
      sb.url +
      "/rest/v1/drops?select=*,shirts(*,shirt_sizes(size))&order=sort_order&shirts.order=sort_order";

    return fetch(endpoint, {
      headers: {
        apikey: sb.anonKey,
        Authorization: "Bearer " + sb.anonKey,
        Accept: "application/json",
      },
    }).then(function (res) {
      if (!res.ok) {
        return res.text().then(function (body) {
          throw new Error("Supabase fetch failed (" + res.status + "): " + body);
        });
      }
      return res.json();
    });
  }

  function transformShirt(row) {
    var sizes = (row.shirt_sizes || [])
      .map(function (s) {
        return s.size;
      })
      .sort();

    return {
      code: row.code,
      name: row.name,
      tagline: row.tagline,
      price: row.price,
      sizes: sizes,
      image: row.image_url,
      revealDate: row.reveal_date,
      soldOut: !!row.sold_out,
    };
  }

  function transformDrop(row) {
    var shirts = (row.shirts || [])
      .slice()
      .sort(function (a, b) {
        return (a.sort_order || 0) - (b.sort_order || 0);
      })
      .map(transformShirt);

    return {
      id: row.id,
      year: row.year,
      number: row.number,
      label: row.label,
      name: row.name,
      tagline: row.tagline,
      status: row.status,
      shirts: shirts,
    };
  }

  function transformCatalog(rows) {
    return (rows || []).map(transformDrop);
  }

  global.GenecodeSupabase = {
    isConfigured: function () {
      return !!getSupabaseConfig();
    },
    fetchCatalog: fetchCatalog,
    transformCatalog: transformCatalog,
  };
})(typeof window !== "undefined" ? window : globalThis);
