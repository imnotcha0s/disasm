// Opt-in "debugger" dark variant, toggled from the toolbar. Light is the
// default and prefers-color-scheme is deliberately ignored — XP had no dark mode.

const KEY = "disasm:theme";

export function initTheme(root = document) {
  const btn = root.querySelector("[data-theme-toggle]");

  let saved = null;
  try { saved = localStorage.getItem(KEY); } catch (_) {}
  if (saved === "debugger") apply("debugger", btn);

  if (!btn) return;
  btn.hidden = false;
  btn.addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "debugger" ? "light" : "debugger";
    apply(next, btn);
    try { localStorage.setItem(KEY, next); } catch (_) {}
  });
}

function apply(mode, btn) {
  if (mode === "debugger") document.documentElement.dataset.theme = "debugger";
  else delete document.documentElement.dataset.theme;
  if (btn) btn.setAttribute("aria-pressed", String(mode === "debugger"));
}
