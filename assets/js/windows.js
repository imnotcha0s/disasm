// Window buttons and optional dragging. Everything here is additive: the
// buttons are rendered as real controls only when this script runs.

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function initWindows(root = document) {
  root.querySelectorAll("[data-window]").forEach((win) => {
    wireButtons(win);
    if (win.dataset.draggable === "true" && !reduced()) makeDraggable(win);
  });
}

function wireButtons(win) {
  const bar = win.querySelector(".titlebar");
  if (!bar) return;

  bar.querySelectorAll("[data-win-action]").forEach((btn) => {
    btn.hidden = false;
    btn.addEventListener("click", (e) => {
      const action = btn.dataset.winAction;
      if (action === "close") return; // plain link to home; let it navigate
      e.preventDefault();

      if (action === "minimize") {
        const collapsed = win.classList.toggle("is-collapsed");
        btn.setAttribute("aria-expanded", String(!collapsed));
      } else if (action === "maximize") {
        const host = win.closest(".mdi") || win;
        const max = host.classList.toggle("is-maximized");
        btn.setAttribute("aria-pressed", String(max));
      }
    });
  });

  // Double-clicking a title bar collapses, as in XP.
  bar.addEventListener("dblclick", (e) => {
    if (e.target.closest("button, a")) return;
    win.classList.toggle("is-collapsed");
  });
}

function makeDraggable(win) {
  const bar = win.querySelector(".titlebar");
  if (!bar) return;
  let startX = 0, startY = 0, baseX = 0, baseY = 0, dragging = false;

  bar.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "touch") return;      // touch keeps the page scrollable
    if (window.innerWidth <= 720) return;       // stacked layout: no dragging
    if (e.target.closest("button, a")) return;
    dragging = true;
    startX = e.clientX; startY = e.clientY;
    const style = getComputedStyle(win);
    baseX = parseFloat(style.getPropertyValue("--dx")) || 0;
    baseY = parseFloat(style.getPropertyValue("--dy")) || 0;
    win.classList.add("is-dragging");
    bar.setPointerCapture(e.pointerId);
  });

  bar.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const dx = baseX + e.clientX - startX;
    const dy = baseY + e.clientY - startY;
    win.style.setProperty("--dx", dx);
    win.style.setProperty("--dy", dy);
    win.style.transform = `translate(${dx}px, ${dy}px)`;
  });

  const stop = (e) => {
    if (!dragging) return;
    dragging = false;
    win.classList.remove("is-dragging");
    try { bar.releasePointerCapture(e.pointerId); } catch (_) {}
  };
  bar.addEventListener("pointerup", stop);
  bar.addEventListener("pointercancel", stop);
}
