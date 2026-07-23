// "Analyzing…" splash. Created entirely by JS, so it cannot hide content from
// crawlers or no-JS readers. Skippable, short, once per session, and skipped
// outright under prefers-reduced-motion.

export function initLoading() {
  const cfg = window.__disasmLoading;
  if (!cfg || !cfg.enabled) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const key = "disasm:loaded";
  if (cfg.once) {
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch (_) { /* private mode: just show it */ }
  }

  const boot = cfg.style === "boot";
  const overlay = document.createElement("div");
  overlay.className = "loading" + (boot ? " loading--boot" : "");
  overlay.setAttribute("aria-hidden", "true");

  const messages = (cfg.messages || []).slice(0, 8);

  overlay.innerHTML = boot ? `
    <div class="loading__wordmark">${escapeHtml(cfg.title || "disasm")}</div>
    <div class="progress"><div class="progress__fill" data-fill></div></div>
    <p class="loading__hint">press any key to continue</p>
  ` : `
    <div class="dialog" role="presentation">
      <div class="titlebar titlebar--sm"><span class="titlebar__text">Please wait…</span></div>
      <div class="progress"><div class="progress__fill" data-fill></div></div>
      <div class="loading__log" data-log></div>
      <p class="loading__hint">Press any key or click to continue.</p>
    </div>
  `;

  document.body.appendChild(overlay);

  const duration = Math.max(200, Number(cfg.duration) || 1200);
  const fill = overlay.querySelector("[data-fill]");
  const log = overlay.querySelector("[data-log]");
  const start = performance.now();
  let raf = 0, shown = 0, done = false;

  const tick = (now) => {
    const p = Math.min(1, (now - start) / duration);
    if (fill) fill.style.width = `${(p * 100).toFixed(1)}%`;
    if (log) {
      const want = Math.ceil(p * messages.length);
      while (shown < want) {
        const p2 = document.createElement("p");
        p2.textContent = messages[shown];
        log.appendChild(p2);
        log.scrollTop = log.scrollHeight;
        shown++;
      }
    }
    if (p < 1) raf = requestAnimationFrame(tick);
    else dismiss();
  };
  raf = requestAnimationFrame(tick);

  function dismiss() {
    if (done) return;
    done = true;
    cancelAnimationFrame(raf);
    overlay.remove();
    document.removeEventListener("keydown", onKey, true);
    document.removeEventListener("click", dismiss, true);
    const main = document.getElementById("main");
    if (main) { main.setAttribute("tabindex", "-1"); main.focus({ preventScroll: true }); }
  }

  function onKey() { dismiss(); }

  document.addEventListener("keydown", onKey, true);
  document.addEventListener("click", dismiss, true);
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}
