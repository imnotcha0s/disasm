// Fills the disassembly gutter for block elements the templates can't reach,
// and rewrites Chroma line numbers into incrementing hex addresses.
// Pure decoration: without this file the gutter still renders tick marks and
// code blocks keep plain line numbers.

const ARROWS = ["│", "├─", "└─", "│", "┌─"];

function hex(n) {
  return n.toString(16).toUpperCase().padStart(8, "0");
}

export function initGutter(root = document) {
  const body = root.querySelector(".disasm");
  if (!body) return;

  const segment = body.dataset.segment || ".text";
  let addr = parseInt(body.dataset.address || "0x00401000", 16);
  if (Number.isNaN(addr)) addr = 0x00401000;

  let i = 0;
  for (const el of body.children) {
    if (!el.dataset.addr) {
      el.dataset.addr = `${segment}:${hex(addr)}`;
    } else {
      // Heading addresses are authored server-side; resync so the run continues.
      const parsed = parseInt(el.dataset.addr.split(":").pop(), 16);
      if (!Number.isNaN(parsed)) addr = parsed;
    }
    if (/^H[1-6]$/.test(el.tagName) && !el.dataset.arrow) {
      el.dataset.arrow = ARROWS[i % ARROWS.length];
      i++;
    }
    // Advance by a plausible instruction span, weighted by how much text the
    // block holds, so addresses climb at a believable rate.
    addr += 4 + Math.min(0x40, (el.textContent || "").length >> 3) * 4;
  }

  rewriteLineNumbers(body, segment);
}

// Chroma line numbers → .text:004010A0 style addresses.
function rewriteLineNumbers(body, segment) {
  const base = parseInt(body.dataset.address || "0x00401000", 16);
  if (Number.isNaN(base)) return;

  body.querySelectorAll(".highlight").forEach((block, blockIndex) => {
    const nums = block.querySelectorAll(".lnt, .ln");
    if (!nums.length) return;
    let a = base + 0x1000 * (blockIndex + 1);
    nums.forEach((node) => {
      // The trailing newline is part of the span in Chroma output.
      node.textContent = `${segment}:${hex(a)}\n`;
      a += 4;
    });
    block.classList.add("has-hex-lines");
  });
}
