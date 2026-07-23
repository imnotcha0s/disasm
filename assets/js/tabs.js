// Tab strip: anchors by default. This only adds roving-tabindex keyboard
// behaviour (Left/Right/Home/End) — activation stays a plain link navigation.

export function initTabs(root = document) {
  const strip = root.querySelector('[data-tabstrip]');
  if (!strip) return;

  const tabs = Array.from(strip.querySelectorAll(".tab"));
  if (tabs.length < 2) return;

  const activeIndex = Math.max(0, tabs.findIndex((t) => t.getAttribute("aria-current") === "page"));
  tabs.forEach((tab, i) => { tab.tabIndex = i === activeIndex ? 0 : -1; });

  strip.addEventListener("keydown", (e) => {
    const current = tabs.indexOf(document.activeElement);
    if (current === -1) return;
    let next = null;
    if (e.key === "ArrowRight") next = (current + 1) % tabs.length;
    else if (e.key === "ArrowLeft") next = (current - 1 + tabs.length) % tabs.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = tabs.length - 1;
    if (next === null) return;
    e.preventDefault();
    tabs[current].tabIndex = -1;
    tabs[next].tabIndex = 0;
    tabs[next].focus();
  });
}
