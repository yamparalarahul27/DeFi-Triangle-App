/* ──────────────────────────────────────────────────────────────
   Static prototype interactivity. Renders the repeated cards from
   PROTO_DATA using markup copied 1:1 from the React components, and
   wires the vanilla-JS equivalents of the app's React state:
   tab switching, rail scroll, and the token / stablecoin / search modals.
   No network. No frameworks.
   ────────────────────────────────────────────────────────────── */
(function () {
  var D = window.PROTO_DATA || {};

  // ── formatting (mirrors src/lib/format.ts behaviour) ───────────
  function fmtUsd(v, opts) {
    opts = opts || {};
    v = Number(v) || 0;
    if (opts.compact) {
      var a = Math.abs(v);
      if (a >= 1e9) return "$" + (v / 1e9).toFixed(2) + "B";
      if (a >= 1e6) return "$" + (v / 1e6).toFixed(2) + "M";
      if (a >= 1e3) return "$" + (v / 1e3).toFixed(1) + "K";
      return "$" + v.toFixed(2);
    }
    if (v !== 0 && Math.abs(v) < 0.01) {
      return "$" + v.toPrecision(2);
    }
    return "$" + v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: v < 1 ? 6 : 2 });
  }
  function fmtNum(v, opts) {
    opts = opts || {};
    v = Number(v) || 0;
    if (opts.compact) {
      var a = Math.abs(v);
      if (a >= 1e9) return (v / 1e9).toFixed(1) + "B";
      if (a >= 1e6) return (v / 1e6).toFixed(1) + "M";
      if (a >= 1e3) return (v / 1e3).toFixed(1) + "K";
    }
    return String(Math.round(v));
  }
  function fmtPctMag(v) {
    return Math.abs(Number(v) || 0).toFixed(2) + "%";
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function truncate(a) {
    if (!a) return "";
    return a.length <= 12 ? a : a.slice(0, 4) + "…" + a.slice(-4);
  }

  // TokenIcon — initials fallback (matches src/components/ui/TokenIcon.tsx)
  function tokenIcon(src, symbol, size) {
    var sz = { sm: "w-5 h-5", md: "w-6 h-6", lg: "w-8 h-8" }[size || "md"];
    var tx = { sm: "text-[9px]", md: "text-[10px]", lg: "text-xs" }[size || "md"];
    var initials = (symbol || "?").slice(0, 2).toUpperCase();
    if (src) {
      return '<img src="' + esc(src) + '" alt="' + esc(symbol) + '" class="' + sz + ' rounded-full object-cover shrink-0" onerror="this.outerHTML=PROTO.iconFallback(\'' + esc(symbol) + "','" + (size || "md") + "')\">";
    }
    return '<div class="' + sz + " " + tx + ' rounded-full bg-surface-bright text-fg flex items-center justify-center font-semibold shrink-0" aria-label="' + esc(symbol) + '">' + esc(initials) + "</div>";
  }

  // ── DexCard (src/components/ui/DexCard.tsx) ────────────────────
  function dexCard(pair) {
    var base = pair.baseToken || {}, quote = pair.quoteToken || {}, info = pair.info || {};
    var priceUsd = Number(pair.priceUsd || 0);
    var change = Number((pair.priceChange || {}).h24 || 0);
    var liq = Number((pair.liquidity || {}).usd || 0);
    var fdv = Number(pair.fdv || 0);
    var vol = Number((pair.volume || {}).h24 || 0);
    var buys = Number(((pair.txns || {}).h24 || {}).buys || 0);
    var sells = Number(((pair.txns || {}).h24 || {}).sells || 0);
    var total = buys + sells;
    var buyPct = total > 0 ? Math.round((buys / total) * 100) : 50;
    var up = change >= 0;
    var color = up ? "text-buy" : "text-sell";
    var icon = up ? "/app/Up.svg" : "/app/Down.svg";
    var verified = pair.isVerified;

    function stat(label, value) {
      return '<div><div class="text-[10px] uppercase tracking-wider text-fg-muted">' + label + '</div><div class="font-mono text-xs text-fg mt-0.5">' + value + "</div></div>";
    }

    return (
      '<div data-card="' + esc(pair.pairAddress) + '" role="button" tabindex="0" class="group relative bg-surface-container rounded-[14px] border border-outline/10 p-4 transition-[border-color,box-shadow,transform] duration-150 active:scale-[0.98] hover:border-outline/20 cursor-pointer" style="box-shadow:0 1px 3px rgba(0,0,0,0.06),0 1px 2px rgba(0,0,0,0.04)">' +
        '<div class="flex items-start justify-between gap-2 mb-3">' +
          '<div class="flex items-center gap-2 min-w-0">' + tokenIcon(info.imageUrl, base.symbol, "md") +
            '<div class="min-w-0"><div class="text-sm font-semibold text-fg truncate inline-flex items-center gap-1"><span class="truncate">' + esc(base.symbol || "???") + "</span>" +
              (verified ? '<img src="/app/ic_correct.svg" alt="Verified by Tokens.xyz" class="h-3.5 w-3.5 shrink-0">' : "") +
              (quote.symbol ? '<span class="text-fg-muted font-normal">/ ' + esc(quote.symbol) + "</span>" : "") +
            '</div><div class="text-xs text-fg-muted truncate">' + esc(base.name || "") + "</div></div>" +
          "</div>" +
          '<button type="button" data-star aria-label="Add to watchlist" aria-pressed="false" class="text-base leading-none shrink-0 transition-colors text-fg-muted hover:text-warning">☆</button>' +
        "</div>" +
        '<div class="flex items-baseline justify-between gap-2 mb-3"><div class="font-mono text-base text-fg">' + fmtUsd(priceUsd) + "</div>" +
          '<div class="flex items-center gap-1 text-xs ' + color + '"><img src="' + icon + '" alt="" aria-hidden="true" class="h-3 w-3 shrink-0"><span class="font-mono">' + fmtPctMag(change) + "</span></div></div>" +
        '<div class="grid grid-cols-3 gap-2 mb-3">' + stat("Liquidity", fmtUsd(liq, { compact: true })) + stat("FDV", fmtUsd(fdv, { compact: true })) + stat("Vol 24h", fmtUsd(vol, { compact: true })) + "</div>" +
        '<div class="mb-3"><div class="flex items-center justify-between text-[10px] text-fg-muted mb-1"><span class="uppercase tracking-wider">Buy / Sell · 24h</span><span class="font-mono">' + fmtNum(buys, { compact: true }) + " / " + fmtNum(sells, { compact: true }) + "</span></div>" +
          '<div class="relative h-1.5 rounded-full bg-sell/15 overflow-hidden"><div class="absolute inset-y-0 left-0 bg-buy" style="width:' + buyPct + '%"></div></div>' +
          '<div class="flex items-center justify-between text-[10px] font-mono mt-1"><span class="text-buy">' + buyPct + '% buys</span><span class="text-sell">' + (100 - buyPct) + "% sells</span></div></div>" +
      "</div>"
    );
  }

  // ── Stablecoin cards (src/components/home/StableCard.tsx) ───────
  function pegState(bps) {
    var m = Math.abs(bps);
    if (m <= 25) return { label: "On peg", bg: "bg-buy/10", t: "text-buy", dev: "text-buy" };
    if (m <= 75) return { label: "Drifting", bg: "bg-warning-strong/10", t: "text-warning-strong", dev: "text-warning-strong" };
    return { label: "Depegged", bg: "bg-sell/10", t: "text-sell", dev: "text-sell" };
  }
  function fmtStable(p) {
    return p > 0 ? "$" + Number(p).toFixed(4) : "—";
  }
  function stableCardLive(t) {
    var ps = pegState(t.pegDeviationBps);
    var dev = t.pegDeviationBps / 100;
    return (
      '<div data-stable="' + esc(t.mint) + '" role="button" tabindex="0" class="shrink-0 bg-surface-container rounded-[14px] border border-outline/10 p-4 transition-[border-color,box-shadow,transform] duration-150 w-[260px] cursor-pointer hover:border-outline/25 active:scale-[0.98]" style="box-shadow:0 1px 3px rgba(0,0,0,0.06),0 1px 2px rgba(0,0,0,0.04)">' +
        '<div class="flex items-start justify-between gap-2 mb-3"><div class="flex items-center gap-2 min-w-0">' + tokenIcon(t.iconUrl, t.symbol, "md") +
          '<div class="min-w-0"><div class="text-sm font-semibold text-fg truncate">' + esc(t.symbol) + '</div><div class="text-xs text-fg-muted truncate">' + esc(t.name) + "</div></div></div>" +
          '<span class="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0 whitespace-nowrap ' + ps.bg + " " + ps.t + '">' + ps.label + "</span></div>" +
        '<div class="flex items-baseline justify-between gap-2 mb-3"><div class="font-mono text-base text-fg">' + fmtStable(t.priceUsd) + '</div><div class="text-xs font-mono ' + ps.dev + '">' + (t.priceUsd > 0 ? (dev >= 0 ? "+" : "") + dev.toFixed(2) + "%" : "—") + "</div></div>" +
        '<div class="grid grid-cols-2 gap-2"><div><div class="text-[10px] uppercase tracking-wider text-fg-muted">Liquidity</div><div class="font-mono text-xs text-fg mt-0.5">' + fmtUsd(t.liquidityUsd, { compact: true }) + '</div></div><div><div class="text-[10px] uppercase tracking-wider text-fg-muted">Vol 24h</div><div class="font-mono text-xs text-fg mt-0.5">' + fmtUsd(t.volume24hUsd, { compact: true }) + "</div></div></div>" +
      "</div>"
    );
  }
  function stableCardFeatured(t) {
    return (
      '<a href="' + esc(t.learnMoreUrl) + '" target="_blank" rel="noopener noreferrer" class="shrink-0 bg-surface-container rounded-[14px] p-4 transition-[border-color,box-shadow,transform] duration-150 block w-[260px] border-2 border-brand bg-gradient-to-br from-surface-container to-surface-container-high cursor-pointer hover:border-brand-hover hover:shadow-md active:scale-[0.98]" style="box-shadow:0 1px 3px rgba(0,0,0,0.06),0 1px 2px rgba(0,0,0,0.04)">' +
        '<div class="flex items-start justify-between gap-2 mb-3"><div class="flex items-center gap-2 min-w-0">' + tokenIcon(t.iconUrl, t.symbol, "md") +
          '<div class="min-w-0"><div class="text-sm font-semibold text-fg truncate">' + esc(t.symbol) + '</div><div class="text-xs text-fg-muted truncate">' + esc(t.name) + "</div></div></div>" +
          '<span class="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-brand/10 text-brand shrink-0 whitespace-nowrap">★ Featured</span></div>' +
        '<p class="text-xs text-fg leading-snug mb-3">' + esc(t.tagline) + '</p><p class="text-[11px] text-brand font-medium">Learn more →</p>' +
      "</a>"
    );
  }

  // ── Search row (src/components/search/SearchRow.tsx) ────────────
  function searchRow(row) {
    var up = (row.priceChange24 || 0) >= 0;
    var hasPrice = typeof row.priceUsd === "number";
    return (
      '<button type="button" role="option" data-search-row="' + esc(row.address) + '" class="w-full flex items-center gap-3 px-3 py-2 text-left transition-colors border-l-2 border-transparent hover:bg-surface">' +
        tokenIcon(row.imageUrl, row.symbol, "md") +
        '<div class="flex-1 min-w-0"><div class="text-xs font-semibold text-fg truncate">' + esc(row.symbol || "???") + '</div><div class="text-[10px] text-fg-muted truncate">' + esc(row.name) + (row.secondary ? " · " + esc(row.secondary) : "") + "</div></div>" +
        (hasPrice
          ? '<div class="text-right shrink-0"><div class="font-mono text-xs text-fg">' + fmtUsd(row.priceUsd) + '</div><div class="font-mono text-[10px] ' + (up ? "text-buy" : "text-sell") + '">' + (up ? "▲" : "▼") + " " + fmtPctMag(row.priceChange24) + "</div></div>"
          : "") +
      "</button>"
    );
  }

  // colourful offline placeholder for NFT art
  function nftArt(i) {
    var pals = [["#5ad8c4", "#143f79"], ["#f4d35e", "#f59e0b"], ["#f87171", "#7f1d1d"], ["#75a7ff", "#1e3a8a"], ["#a7fff0", "#0f766e"], ["#c084fc", "#4c1d95"]];
    var p = pals[i % pals.length];
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + p[0] + '"/><stop offset="1" stop-color="' + p[1] + '"/></linearGradient></defs><rect width="240" height="240" fill="url(#g)"/><circle cx="120" cy="100" r="46" fill="rgba(255,255,255,.25)"/><rect x="64" y="160" width="112" height="40" rx="20" fill="rgba(0,0,0,.25)"/></svg>';
    return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
  }

  // ── public hooks for inline onerror ────────────────────────────
  window.PROTO = {
    iconFallback: function (symbol, size) {
      var sz = { sm: "w-5 h-5", md: "w-6 h-6", lg: "w-8 h-8" }[size];
      var tx = { sm: "text-[9px]", md: "text-[10px]", lg: "text-xs" }[size];
      return '<div class="' + sz + " " + tx + ' rounded-full bg-surface-bright text-fg flex items-center justify-center font-semibold shrink-0">' + (symbol || "?").slice(0, 2).toUpperCase() + "</div>";
    },
  };

  // ── scroller wiring (arrows + edge fades) ──────────────────────
  function wireScroller(section) {
    var scroller = section.querySelector("[data-scroller]");
    var left = section.querySelector("[data-arrow=left]");
    var right = section.querySelector("[data-arrow=right]");
    var fadeL = section.querySelector("[data-fade=left]");
    var fadeR = section.querySelector("[data-fade=right]");
    if (!scroller) return;
    function update() {
      var canL = scroller.scrollLeft > 2;
      var canR = scroller.scrollLeft + scroller.clientWidth < scroller.scrollWidth - 2;
      if (left) left.disabled = !canL;
      if (right) right.disabled = !canR;
      if (fadeL) fadeL.style.display = canL ? "" : "none";
      if (fadeR) fadeR.style.display = canR ? "" : "none";
    }
    function by(dir) {
      var amt = Math.max(280, Math.floor(scroller.clientWidth * 0.75));
      scroller.scrollBy({ left: dir === "left" ? -amt : amt, behavior: "smooth" });
    }
    if (left) left.addEventListener("click", function () { by("left"); });
    if (right) right.addEventListener("click", function () { by("right"); });
    scroller.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  // ── modal helpers ──────────────────────────────────────────────
  function openModal(html) {
    var root = document.getElementById("modal-root");
    root.innerHTML = html;
    root.querySelectorAll("[data-close]").forEach(function (b) {
      b.addEventListener("click", closeModal);
    });
    document.body.style.overflow = "hidden";
  }
  function closeModal() {
    document.getElementById("modal-root").innerHTML = "";
    document.body.style.overflow = "";
  }
  window.PROTO.closeModal = closeModal;

  function tokenModal(pair) {
    var base = pair.baseToken || {}, info = pair.info || {};
    var price = Number(pair.priceUsd || 0);
    var change = Number((pair.priceChange || {}).h24 || 0);
    var up = change >= 0;
    var icon = up ? "/app/Up.svg" : "/app/Down.svg";
    function stat(l, v) {
      return '<div class="flex items-center justify-between gap-3"><span class="text-fg-subtle">' + l + '</span><span class="font-mono text-fg text-right truncate">' + v + "</span></div>";
    }
    var data =
      stat("Liquidity", fmtUsd((pair.liquidity || {}).usd, { compact: true })) +
      stat("Volume 24h", fmtUsd((pair.volume || {}).h24, { compact: true })) +
      stat("Market cap", fmtUsd(pair.marketCap, { compact: true })) +
      stat("FDV", fmtUsd(pair.fdv, { compact: true })) +
      stat("DEX", esc(pair.dexId || "—")) +
      stat("Buys / Sells 24h", fmtNum(((pair.txns || {}).h24 || {}).buys, { compact: true }) + " / " + fmtNum(((pair.txns || {}).h24 || {}).sells, { compact: true }));
    return (
      '<div class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm" data-close role="dialog" aria-modal="true">' +
        '<div class="relative w-full sm:max-w-[480px] max-h-[100vh] sm:max-h-[92vh] overflow-y-auto bg-surface-container sm:rounded-lg sm:m-4" style="box-shadow:0 25px 50px rgba(0,0,0,0.5)" onclick="event.stopPropagation()">' +
          '<div class="sticky top-0 z-10 bg-surface-container flex items-center justify-between gap-3 p-4 border-b border-outline-variant">' +
            '<div class="flex items-center gap-3 min-w-0">' + tokenIcon(info.imageUrl, base.symbol, "lg") +
              '<div class="min-w-0"><div class="text-base font-semibold text-fg truncate">' + esc(base.symbol) + '</div><div class="text-xs text-fg-subtle truncate">' + esc(base.name) + "</div></div></div>" +
            '<button type="button" data-close aria-label="Close" class="text-2xl text-fg-subtle hover:text-fg transition-colors leading-none w-8 h-8 flex items-center justify-center">×</button></div>' +
          '<div class="p-4 space-y-4">' +
            '<div><div class="flex items-baseline justify-between"><div><div class="text-[10px] uppercase tracking-wider text-fg-subtle">Current price</div><div class="font-mono text-xl text-fg mt-1">' + fmtUsd(price) + '</div></div>' +
              '<div class="flex items-center gap-1 text-sm ' + (up ? "text-buy" : "text-sell") + '"><img src="' + icon + '" alt="" aria-hidden="true" class="h-3 w-3 shrink-0"><span class="font-mono">' + fmtPctMag(change) + "</span></div></div>" +
              '<div class="mt-3"><div class="h-20 flex items-center justify-center text-xs text-fg-subtle rounded-sm bg-surface-page">Chart snapshot</div></div></div>' +
            '<div><div class="text-[10px] uppercase tracking-wider text-fg-subtle mb-2">Token data</div><div class="grid grid-cols-2 gap-y-1 gap-x-3 text-xs">' + data + "</div></div>" +
            '<div><div class="text-[10px] uppercase tracking-wider text-fg-subtle mb-2">Contract address</div><div class="flex items-center gap-2"><code class="flex-1 font-mono text-[11px] text-fg break-all bg-surface-page p-2 rounded-sm">' + esc(base.address) + '</code><button type="button" class="text-xs px-3 py-2 rounded-sm bg-brand text-on-brand hover:bg-brand-hover transition-colors">Copy</button></div></div>' +
            '<a href="token.html" class="block w-full text-center text-sm text-on-brand bg-brand hover:bg-brand-hover py-3 rounded-sm transition-colors">View token details</a>' +
          "</div></div></div>"
    );
  }

  function stableModal(t) {
    var ps = pegState(t.pegDeviationBps);
    var dev = t.pegDeviationBps / 100;
    function row(l, v) {
      return '<div class="flex items-center justify-between text-xs"><span class="text-fg-subtle">' + l + '</span><span class="font-mono text-fg">' + v + "</span></div>";
    }
    function section(l, inner) {
      return '<div><div class="text-[10px] uppercase tracking-wider text-fg-subtle mb-2">' + l + '</div><div class="space-y-1.5">' + inner + "</div></div>";
    }
    var stats = row("Liquidity", fmtUsd(t.liquidityUsd, { compact: true })) + row("Volume 24h", fmtUsd(t.volume24hUsd, { compact: true })) + row("Market Cap", fmtUsd(t.marketCapUsd, { compact: true })) + row("Circulating", t.circulatingSupply > 0 ? fmtNum(t.circulatingSupply, { compact: true }) + " " + t.symbol : "—");
    var trust = row("Mint Authority", t.mintAuthorityDisabled ? "✓ Disabled" : "Enabled") + row("Freeze Authority", t.freezeAuthorityDisabled ? "✓ Disabled" : "Enabled") + row("Jupiter Verified", t.jupiterVerified ? "✓ Yes" : "— No");
    return (
      '<div class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm" data-close role="dialog" aria-modal="true">' +
        '<div class="relative w-full sm:max-w-[480px] max-h-[100vh] sm:max-h-[92vh] overflow-y-auto bg-surface-container sm:rounded-lg sm:m-4" style="box-shadow:0 25px 50px rgba(0,0,0,0.5)" onclick="event.stopPropagation()">' +
          '<div class="sticky top-0 z-10 bg-surface-container flex items-center justify-between gap-3 p-4 border-b border-outline-variant"><div class="flex items-center gap-3 min-w-0">' + tokenIcon(t.iconUrl, t.symbol, "lg") +
            '<div class="min-w-0"><div class="text-base font-semibold text-fg truncate">' + esc(t.symbol) + '</div><div class="text-xs text-fg-subtle truncate">' + esc(t.name) + "</div></div></div>" +
            '<button type="button" data-close aria-label="Close" class="text-2xl text-fg-subtle hover:text-fg transition-colors leading-none w-8 h-8 flex items-center justify-center shrink-0">×</button></div>' +
          '<div class="p-4 space-y-4"><div class="flex items-baseline justify-between gap-3"><div><div class="text-[10px] uppercase tracking-wider text-fg-subtle">Current price</div><div class="font-mono text-xl text-fg mt-1">' + fmtStable(t.priceUsd) + '</div></div>' +
            '<div class="text-right ' + ps.dev + '"><span class="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded whitespace-nowrap ' + ps.bg + " " + ps.t + '">' + ps.label + '</span><div class="font-mono text-xs mt-1">' + (t.priceUsd > 0 ? (dev >= 0 ? "+" : "") + dev.toFixed(2) + "% from peg" : "— from peg") + "</div></div></div>" +
            section("Stats", stats) + section("Trust", trust) +
            section("Mint", '<div class="flex items-center justify-between gap-2"><code class="font-mono text-[11px] text-fg break-all">' + truncate(t.mint) + '</code><button type="button" class="text-[10px] uppercase tracking-wider px-2 py-1 rounded border border-outline-variant bg-surface-container text-fg hover:bg-surface-page transition-colors shrink-0">Copy</button></div>') +
          "</div></div></div>"
    );
  }

  // ── search modal ───────────────────────────────────────────────
  function searchSection(title, count, rows, action) {
    return (
      '<div><div class="sticky top-0 z-10 flex items-center justify-between px-3 py-1.5 bg-surface/95 backdrop-blur-sm border-b border-outline-variant"><div class="text-[10px] uppercase tracking-wider text-fg-muted">' + title + (typeof count === "number" ? '<span class="ml-1.5 text-fg-subtle">· ' + count + "</span>" : "") + "</div>" + (action || "") + "</div>" + rows + "</div>"
    );
  }
  function renderSearchResults(q) {
    var list = document.getElementById("search-list");
    if (!list) return;
    q = (q || "").trim().toLowerCase();
    if (!q) {
      var recents = (D.recents || []).map(searchRow).join("");
      var rec = (D.recommended || []).map(searchRow).join("");
      list.innerHTML =
        '<div class="py-1">' +
        (recents ? searchSection("Recent", D.recents.length, recents) : "") +
        (rec ? searchSection("Recommended", D.recommended.length, rec) : "") +
        "</div>";
    } else {
      var pool = (D.recommended || []).concat(D.recents || []);
      // de-dupe by address
      var seen = {}, all = [];
      pool.forEach(function (r) { if (!seen[r.address]) { seen[r.address] = 1; all.push(r); } });
      var hits = all.filter(function (r) {
        return (r.symbol || "").toLowerCase().indexOf(q) >= 0 || (r.name || "").toLowerCase().indexOf(q) >= 0;
      });
      list.innerHTML = hits.length
        ? '<div class="py-1">' + searchSection("Tokens", hits.length, hits.map(searchRow).join("")) + "</div>"
        : '<div class="py-10 text-center text-xs text-fg-muted">No matches for “' + esc(q) + "”</div>";
    }
  }
  function openSearch() {
    var m = document.getElementById("search-modal");
    if (!m) return;
    m.classList.remove("hidden");
    renderSearchResults("");
    var input = document.getElementById("search-input");
    if (input) { input.value = ""; setTimeout(function () { input.focus(); }, 0); }
    document.body.style.overflow = "hidden";
  }
  function closeSearch() {
    var m = document.getElementById("search-modal");
    if (m) m.classList.add("hidden");
    document.body.style.overflow = "";
  }
  window.PROTO.openSearch = openSearch;

  // header action-button idle style depends on scroll position
  // (mirrors Header.tsx actionBtnClass: glass over hero → surface on scroll)
  var _scrolled = false;
  function actionIdle() {
    return _scrolled
      ? "bg-surface-container border border-outline-variant text-fg hover:bg-surface-container-high"
      : "bg-white/10 border border-white/15 text-white hover:bg-white/20";
  }
  var _tab = "home";

  // ── tab switching (home / watchlist / nft-edge) ────────────────
  function setTab(tab) {
    _tab = tab;
    ["home", "watchlist", "nft-edge"].forEach(function (t) {
      var el = document.querySelector('[data-view="' + t + '"]');
      if (el) el.classList.toggle("hidden", t !== tab);
    });
    refreshActionButtons();
  }
  function refreshActionButtons() {
    var active = "bg-brand text-on-brand border border-brand";
    var wb = document.getElementById("btn-watchlist");
    var nb = document.getElementById("btn-nft");
    if (wb) wb.className = "h-7 px-2 rounded-sm text-xs transition-colors duration-300 inline-flex items-center " + (_tab === "watchlist" ? active : actionIdle());
    if (nb) nb.className = "h-7 px-2 rounded-sm text-xs transition-colors duration-300 inline-flex items-center " + (_tab === "nft-edge" ? active : actionIdle());
    document.querySelectorAll("[data-actionbtn]").forEach(function (b) {
      var base = b.getAttribute("data-actionbtn-base") || "";
      b.className = base + " " + actionIdle();
    });
  }
  window.PROTO.setTab = setTab;

  // ── NFT edge selection ─────────────────────────────────────────
  var nftIndex = 0;
  function lamportsToSol(l) { return l == null ? "—" : (l / 1e9).toFixed(2) + " SOL"; }
  function renderNftDetail() {
    var host = document.getElementById("nft-detail");
    if (!host) return;
    var a = D.nft.assets[nftIndex];
    var col = D.nft.collection;
    var traitCards = a.attributes.map(function (tr) {
      var key = tr.trait_type + "::" + tr.value;
      var r = D.nft.rarity[key];
      var pct = r && col.total_supply ? ((r.count / col.total_supply) * 100).toFixed(0) : null;
      return (
        '<div class="rounded-[8px] border border-outline/10 bg-surface-page p-2.5"><div class="text-[9px] font-medium uppercase tracking-[0.08em] text-fg-muted mb-1.5">' + esc(tr.trait_type) + '</div><div class="font-mono text-[13px] text-fg break-words">' + esc(tr.value) + "</div>" +
        (r ? '<div class="flex items-center gap-1.5 mt-2 text-[11px] font-mono text-fg-muted">' + r.count + (pct ? '<span class="inline-flex items-center h-[18px] px-1.5 rounded-full bg-buy-surface text-buy text-[10px] font-semibold">' + pct + "%</span>" : "") + "</div>" : "") +
        "</div>"
      );
    }).join("");
    function row(l, v) {
      return '<div class="flex items-center justify-between gap-3"><dt class="text-fg-muted">' + l + '</dt><dd class="text-fg font-mono">' + v + "</dd></div>";
    }
    host.innerHTML =
      '<h1 class="text-center font-mono text-2xl sm:text-3xl font-bold text-fg mb-6 [text-wrap:balance]">' + esc(a.name.toUpperCase()) + "</h1>" +
      '<div class="grid grid-cols-1 md:grid-cols-2 gap-6">' +
        '<div class="flex flex-col gap-4"><img src="' + nftArt(nftIndex) + '" alt="' + esc(a.name) + '" class="block w-[71.4%] mx-auto aspect-square rounded-[10px] border border-outline/10 object-cover">' +
          '<div class="rounded-[10px] border border-outline/10 bg-surface-container p-4"><div class="text-[11px] font-semibold uppercase tracking-[0.1em] text-fg-muted mb-2">About ' + esc(col.name) + '</div><p class="text-sm text-fg [text-wrap:pretty]">' + esc(a.description) + "</p></div></div>" +
        '<div class="flex flex-col gap-3">' +
          '<div class="rounded-[10px] border border-outline/10 bg-surface-container p-4"><div class="flex items-center justify-between mb-3"><div class="text-[11px] font-semibold uppercase tracking-[0.1em] text-fg-muted">Owner Profile</div></div><div class="flex items-center gap-3"><div class="w-10 h-10 rounded-full border-2 border-white shrink-0" style="background:linear-gradient(135deg,#fbbf24,#f59e0b);box-shadow:0 1px 3px rgba(0,0,0,0.06),0 1px 2px rgba(0,0,0,0.04)"></div><div class="min-w-0"><div class="font-mono text-sm text-fg truncate">' + truncate(a.owner) + '</div><div class="text-xs text-fg-muted">Solana wallet</div></div></div></div>' +
          '<div class="rounded-[10px] border border-outline/10 bg-surface-container p-4"><div class="text-[11px] font-semibold uppercase tracking-[0.1em] text-fg-muted mb-3 flex items-center gap-2">Traits<span class="inline-flex items-center justify-center h-[18px] min-w-[18px] px-1.5 rounded-full bg-surface-page text-[10px] text-fg">' + a.attributes.length + '</span></div><div class="grid grid-cols-2 sm:grid-cols-4 gap-2">' + traitCards + "</div></div>" +
          '<div class="rounded-[10px] border border-outline/10 bg-surface-container p-4"><div class="text-[11px] font-semibold uppercase tracking-[0.1em] text-fg-muted mb-3">Details</div><dl class="space-y-2 text-xs">' +
            row("Asset ID", truncate(a.id)) + row("On-chain Collection", truncate(col.id)) + row("Royalties", (col.royalty_bps / 100).toFixed(1) + "%") + row("Collection floor", lamportsToSol(a.floorPrice)) + row("Listing status", a.listStatus === "listed" && a.listPrice ? lamportsToSol(a.listPrice) + " (listed)" : a.listStatus) +
          "</dl></div>" +
          '<div class="rounded-[10px] border border-outline/10 bg-surface-container p-4"><div class="text-[11px] font-semibold uppercase tracking-[0.1em] text-fg-muted mb-3">JSON Metadata</div><a href="' + esc(a.metadata_url) + '" target="_blank" rel="noopener noreferrer" class="font-mono text-xs text-brand hover:underline truncate block">' + esc(a.metadata_url) + "</a></div>" +
        "</div></div>";
  }
  function renderNftRail() {
    var rail = document.getElementById("nft-rail");
    if (!rail) return;
    rail.innerHTML = D.nft.assets.map(function (nft, i) {
      var sel = i === nftIndex;
      return '<button data-nft="' + i + '" type="button" aria-pressed="' + sel + '" class="group relative shrink-0 w-[72px] h-[72px] rounded-[8px] overflow-hidden cursor-pointer transition-[transform,box-shadow] duration-150 active:scale-[0.96] hover:-translate-y-[2px] border border-outline/10 ' + (sel ? "ring-2 ring-brand ring-offset-2 ring-offset-surface-page" : "") + '" style="scroll-snap-align:center"><img src="' + nftArt(i) + '" alt="" class="w-full h-full object-cover"></button>';
    }).join("");
    var count = document.getElementById("nft-count");
    if (count) count.textContent = D.nft.assets.length + " of " + D.nft.collection.total_supply;
  }
  function selectNft(i) {
    nftIndex = Math.max(0, Math.min(D.nft.assets.length - 1, i));
    renderNftDetail();
    renderNftRail();
  }

  // ── header scroll state (over-hero → scrolled) ─────────────────
  function wireHeader() {
    var header = document.getElementById("site-header");
    if (!header || header.dataset.nohero === "1") return;
    var wordmark = document.getElementById("wordmark");
    function onScroll() {
      var hero = document.querySelector("[data-hero]");
      var threshold = Math.max(80, (hero ? hero.offsetHeight : 200) - 48);
      _scrolled = window.scrollY > threshold;
      header.className = "sticky top-0 z-20 transition-colors duration-300 ease-in-out " + (_scrolled
        ? "bg-surface-page/90 backdrop-blur-lg border-b border-outline-variant shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)]"
        : "bg-transparent backdrop-blur-lg border-b border-white/10");
      if (wordmark) wordmark.className = "inline-flex items-center gap-2 text-sm font-semibold tracking-tight transition-colors duration-300 " + (_scrolled ? "text-fg hover:text-fg" : "text-white hover:text-white/80");
      refreshActionButtons();
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
  }

  // ── init ───────────────────────────────────────────────────────
  function buildHome() {
    var park = document.getElementById("rail-park");
    if (park && D.stablecoins) {
      var cards = D.stablecoins.pending.map(stableCardFeatured).join("") + D.stablecoins.live.map(stableCardLive).join("");
      park.querySelector("[data-scroller] > div").innerHTML = cards;
    }
    document.querySelectorAll("[data-rail]").forEach(function (section) {
      var key = section.getAttribute("data-rail");
      var tokens = (D.sections || {})[key] || [];
      var holder = section.querySelector("[data-scroller] > div");
      if (holder) holder.innerHTML = tokens.map(dexCard).join("");
    });
    document.querySelectorAll("[data-railsection]").forEach(wireScroller);
  }

  function buildWatchlist() {
    var grid = document.getElementById("watchlist-grid");
    if (!grid) return;
    var items = (D.sections.longTerm || []).slice(0, 3);
    grid.innerHTML = items.map(function (p) {
      return '<div class="flex flex-col gap-2">' + dexCard(p).replace("☆", "★").replace("text-fg-muted hover:text-warning", "text-warning") +
        '<button type="button" class="h-7 rounded-sm bg-surface-container border border-outline-variant text-xs text-fg-muted hover:text-sell-strong hover:border-sell/40 transition-colors">Remove</button></div>';
    }).join("");
    var cnt = document.getElementById("watchlist-count");
    if (cnt) cnt.textContent = "(" + items.length + ")";
  }

  function findPair(addr) {
    var all = [];
    Object.keys(D.sections || {}).forEach(function (k) { all = all.concat(D.sections[k]); });
    return all.filter(function (p) { return p.pairAddress === addr; })[0];
  }
  function findStable(mint) {
    return (D.stablecoins.live || []).concat(D.stablecoins.pending || []).filter(function (t) { return t.mint === mint; })[0];
  }

  document.addEventListener("DOMContentLoaded", function () {
    wireHeader();

    if (document.getElementById("rail-park") || document.querySelector("[data-rail]")) {
      buildHome();
      buildWatchlist();
      renderNftDetail();
      renderNftRail();
    }

    // delegated clicks
    document.addEventListener("click", function (e) {
      var card = e.target.closest("[data-card]");
      var star = e.target.closest("[data-star]");
      var stable = e.target.closest("[data-stable]");
      var nft = e.target.closest("[data-nft]");
      var srow = e.target.closest("[data-search-row]");
      if (star) {
        e.stopPropagation();
        star.textContent = star.textContent.trim() === "★" ? "☆" : "★";
        star.className = star.textContent.trim() === "★"
          ? "text-base leading-none shrink-0 transition-colors text-warning"
          : "text-base leading-none shrink-0 transition-colors text-fg-muted hover:text-warning";
        return;
      }
      if (card) { var p = findPair(card.getAttribute("data-card")); if (p) openModal(tokenModal(p)); return; }
      if (stable && !e.target.closest("a")) { var t = findStable(stable.getAttribute("data-stable")); if (t) openModal(stableModal(t)); return; }
      if (nft) { selectNft(Number(nft.getAttribute("data-nft"))); return; }
      if (srow) { closeSearch(); var sp = findPair(srow.getAttribute("data-search-row")); if (sp) openModal(tokenModal(sp)); return; }
    });

    // search wiring
    var sInput = document.getElementById("search-input");
    if (sInput) sInput.addEventListener("input", function () { renderSearchResults(sInput.value); });
    var sOverlay = document.getElementById("search-modal");
    if (sOverlay) sOverlay.addEventListener("click", function (e) { if (e.target === sOverlay || e.target.hasAttribute("data-close")) closeSearch(); });

    // nft prev/next
    var prev = document.getElementById("nft-prev"), next = document.getElementById("nft-next");
    if (prev) prev.addEventListener("click", function () { selectNft(nftIndex - 1); });
    if (next) next.addEventListener("click", function () { selectNft(nftIndex + 1); });

    // keyboard
    document.addEventListener("keydown", function (e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); openSearch(); }
      if (e.key === "Escape") { closeModal(); closeSearch(); }
    });
  });
})();
