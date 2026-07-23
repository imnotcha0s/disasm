// Output-window typewriter. The lines are already in the HTML; this only
// re-reveals them character by character. Reduced motion → leave as-is.

export function initConsole(root = document) {
  const box = root.querySelector("[data-console]");
  if (!box) return;
  if (box.dataset.animate !== "true") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const lines = Array.from(box.querySelectorAll(".console__line"));
  if (!lines.length) return;

  const texts = lines.map((l) => l.textContent);
  lines.forEach((l) => { l.textContent = ""; });

  let li = 0, ci = 0;
  const step = () => {
    if (li >= lines.length) return;
    const text = texts[li];
    ci += 3;
    lines[li].textContent = text.slice(0, ci);
    if (ci >= text.length) { li++; ci = 0; box.scrollTop = box.scrollHeight; }
    setTimeout(step, li >= lines.length ? 0 : 16);
  };
  setTimeout(step, 120);
}
