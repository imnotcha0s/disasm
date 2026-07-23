// Entry point. Every module is optional flavour; the site is complete without
// any of it. Bundled by Hugo's esbuild (js.Build).

import { initLoading } from "./loading.js";
import { initTabs } from "./tabs.js";
import { initWindows } from "./windows.js";
import { initConsole } from "./console.js";
import { initSearch } from "./search.js";
import { initGutter } from "./gutter.js";
import { initTheme } from "./theme.js";

function boot() {
  document.documentElement.classList.add("has-js");
  const safe = (fn) => { try { fn(); } catch (e) { console.warn("[disasm]", e); } };
  safe(initTheme);
  safe(initLoading);
  safe(initTabs);
  safe(initWindows);
  safe(initConsole);
  safe(initSearch);
  safe(initGutter);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
