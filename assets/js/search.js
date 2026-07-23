// "Jump to address" — client-side search over Hugo's /index.json.
// Without this script the trigger is a plain link to /search/, which renders a
// server-side list of every post. Nothing here is required to find content.

let index = null;
let loading = null;

function loadIndex(url) {
  if (index) return Promise.resolve(index);
  if (!loading) {
    loading = fetch(url)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => { index = Array.isArray(data) ? data : []; return index; })
      .catch(() => { index = []; return index; });
  }
  return loading;
}

// Subsequence match with a light proximity score — good enough, tiny.
function score(query, text) {
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  if (!q) return 0;
  const direct = t.indexOf(q);
  if (direct !== -1) return 1000 - direct;

  let ti = 0, hits = 0, gaps = 0, last = -1;
  for (const ch of q) {
    const found = t.indexOf(ch, ti);
    if (found === -1) return -1;
    if (last !== -1) gaps += found - last - 1;
    last = found;
    ti = found + 1;
    hits++;
  }
  return hits * 10 - gaps;
}

function search(query, items) {
  return items
    .map((item) => {
      const s = Math.max(
        score(query, item.title) * 2,
        score(query, (item.tags || []).join(" ")),
        score(query, item.summary || "")
      );
      return { item, s };
    })
    .filter((r) => r.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, 20)
    .map((r) => r.item);
}

function renderResults(container, results, query) {
  if (!query) { container.innerHTML = ""; return; }
  if (!results.length) { container.innerHTML = ""; return; }

  const rows = results.map((r) => `
    <tr>
      <td class="cell--name"><a href="${r.url}">${escapeHtml(r.title)}</a></td>
      <td class="cell--addr">${escapeHtml(r.address || "")}</td>
      <td class="cell--type">${escapeHtml(r.type || "post")}</td>
    </tr>`).join("");

  container.innerHTML = `
    <table class="listview">
      <thead><tr><th scope="col">Name</th><th scope="col">Address</th><th scope="col">Type</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

function wireForm(form, resultsEl, indexUrl, statusEl) {
  const input = form.querySelector("input[type=search], input[type=text]");
  if (!input) return;

  let timer = null;
  const run = () => {
    const q = input.value.trim();
    loadIndex(indexUrl).then((items) => {
      const results = search(q, items);
      renderResults(resultsEl, results, q);
      if (statusEl) {
        statusEl.textContent = q
          ? `${results.length} address${results.length === 1 ? "" : "es"} matched.`
          : "";
      }
    });
  };

  input.addEventListener("input", () => {
    clearTimeout(timer);
    timer = setTimeout(run, 90);
  });
  form.addEventListener("submit", (e) => { e.preventDefault(); run(); });
}

export function initSearch(root = document) {
  const indexUrl = document.documentElement.dataset.searchIndex;
  if (!indexUrl) return;

  // Standalone /search/ page
  const page = root.querySelector("[data-search-page]");
  if (page) {
    const form = page.querySelector("form");
    const results = page.querySelector("[data-search-results]");
    const fallback = page.querySelector("[data-search-fallback]");
    if (form && results) {
      form.hidden = false;
      wireForm(form, results, indexUrl, page.querySelector("[data-search-status]"));
      if (fallback) fallback.querySelector("caption")?.remove();
    }
  }

  // Toolbar dialog
  const dialog = root.querySelector("[data-search-dialog]");
  const triggers = root.querySelectorAll("[data-search-open]");
  if (!dialog || !triggers.length) return;

  const form = dialog.querySelector("form");
  const results = dialog.querySelector("[data-search-results]");
  const status = dialog.querySelector("[data-search-status]");
  const input = dialog.querySelector("input");
  let opener = null;

  wireForm(form, results, indexUrl, status);

  const open = () => {
    opener = document.activeElement;
    dialog.hidden = false;
    input.focus();
    input.select();
    loadIndex(indexUrl);
  };
  const close = () => {
    dialog.hidden = true;
    if (opener && opener.focus) opener.focus();
  };

  triggers.forEach((t) => {
    t.addEventListener("click", (e) => { e.preventDefault(); open(); });
  });

  dialog.querySelectorAll("[data-search-close]").forEach((b) => {
    b.addEventListener("click", (e) => { e.preventDefault(); close(); });
  });

  dialog.addEventListener("mousedown", (e) => { if (e.target === dialog) close(); });

  dialog.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { e.preventDefault(); close(); return; }
    if (e.key !== "Tab") return;
    const focusable = dialog.querySelectorAll("a[href], button, input, [tabindex]:not([tabindex='-1'])");
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  // "/" focuses search, as in most reading UIs.
  document.addEventListener("keydown", (e) => {
    if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
    const tag = (document.activeElement?.tagName || "").toLowerCase();
    if (tag === "input" || tag === "textarea") return;
    e.preventDefault();
    open();
  });
}
