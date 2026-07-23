# disasm

A Hugo theme that dresses a personal blog as **IDA Pro running on Windows XP**.
Posts are functions, the post list is the Names window, tags are the Strings
window, and the footer is the status bar.

The chrome is a costume over plain semantic HTML. Turn JavaScript off and you
lose a typewriter animation, a loading splash, a search dialog and the hex
line-number rewrite — everything else works exactly as before.

Requires **Hugo Extended ≥ 0.134** (for the asset pipeline and the table render
hook). No Node toolchain, no CSS framework, no JS framework.

---

## Install

As a submodule:

```bash
git submodule add https://example.org/disasm themes/disasm
```

Then in `hugo.toml`:

```toml
theme = "disasm"
```

Run the bundled demo:

```bash
hugo server -s exampleSite
```

---

## Configuration

### Required-ish scaffolding

```toml
[outputs]
  home = ["html", "rss", "json"]   # json powers the search index

[taxonomies]
  tag      = "tags"
  category = "categories"

[markup.highlight]
  noClasses          = false       # required: the IDA palette is class-based
  lineNos            = true
  lineNumbersInTable = true

[markup.goldmark.renderer]
  unsafe = true                    # only if your content uses raw HTML
```

If `noClasses` is left at Hugo's default (`true`), Chroma inlines its own
colours and the IDA palette will not apply.

### `params`

| Param | Type | Default | What it does |
|---|---|---|---|
| `author` | string | — | Shown in the post comment header and the status bar © line |
| `description` | string | — | Meta description, and the home window's intro text if `content/_index.md` has no body |
| `desktopColor` | `blue` \| `teal` \| `luna` | `blue` | Desktop background behind the main window |
| `menuStyle` | `ida` \| `literal` | `ida` | Menu bar labels — see [Menu bar](#menu-bar) |
| `idaMenu` | array of dicts | built-in | Overrides the `ida` menu items: `{label, accel, name, url, search}` |
| `retroFont` | bool | `false` | Opt into a bitmap-style UI font (drop `assets/fonts/retro.woff2` in your site); never blocks render |
| `sourceURL` | string | — | Toolbar icon linking to your repo |
| `github` | string | — | Extra toolbar icon |
| `cpu` | string | `x86` | Status text at the end of the toolbar |
| `diskGag` | string | `19GB` | The `Disk: NNGB` joke in the status bar |
| `console.messages` | []string | generated | Output-window log lines; defaults reference your real post count |
| `console.animate` | bool | `false` | Type the log lines in on load (ignored under reduced motion) |
| `postSort.groupByCategory` | bool | `false` | Group the post list into category "segments" |
| `postSort.categoryOrder` | []string | `[]` | Explicit group order; unlisted categories fall to the end **alphabetically** |
| `postSort.within` | `date` \| `title` \| `weight` | `date` | Sort inside each group |
| `postSort.dir` | `asc` \| `desc` | `desc` | Sort direction |
| `postSort.unassignedLabel` | string | `unassigned` | Segment label for posts with no category |
| `loadingScreen.enabled` | bool | `true` | The "Analyzing…" splash |
| `loadingScreen.style` | `analysis` \| `boot` | `analysis` | Progress dialog, or XP-boot bar |
| `loadingScreen.duration` | int (ms) | `1200` | Auto-dismiss delay |
| `loadingScreen.once` | bool | `true` | Show once per session (`sessionStorage`) |
| `loadingScreen.messages` | []string | `console.messages` | Log lines streamed during the splash |

### Menus

The **tab strip** is built from `menus.main` and is the primary navigation:

```toml
[[menus.main]]
  name = "Posts"
  url  = "/posts/"
  weight = 20
```

---

## New posts

The theme ships archetypes, so `hugo new` scaffolds a post with every field
below already in place (and commented flavour fields you can delete):

```bash
hugo new posts/my-post.md
```

The generated post is `draft: true`; drop that line, or build with `hugo -D`,
to publish it.

## Front matter

```toml
title    = "Hooking the Windows loader"
date     = 2026-02-14
tags     = ["windows", "reversing"]
categories = ["reversing"]     # or: category = "reversing"
summary  = "Shown in the Names window row and the meta description."

segment  = ".text"             # optional — gutter segment name, default ".text"
address  = "0x00401A2F"        # optional — base address for the gutter
```

If `address` is omitted, the theme derives a stable pseudo-address from a hash
of the page path (`0x00401000`–`0x0042FFF0`, 16-byte aligned), so a post's
gutter numbers never change between builds.

Grouping reads `category` (a string) first, then falls back to the first entry
of `categories`.

---

## Customising

**Colours and metrics** — every value lives in `assets/css/tokens.css` as a
custom property. Override them in your own stylesheet, or copy the file into
`assets/css/tokens.css` in your site to shadow the theme's copy.

**The console log** — set `params.console.messages`. The defaults are generated
from your real post count ("Building functions list... N functions found.").

**The desktop** — `params.desktopColor`, or override `--desk`.

**The menu bar** — `params.menuStyle` and `params.idaMenu`.

**Popup pages** — set `layout: dialog` in a page's front matter to render it as
an XP modal instead of a window, the way the bundled About page does. The
dialog caps itself to the desktop area and scrolls its prose, so the title bar
and the OK button are always reachable.

**Dark mode** — an opt-in "debugger" variant (green on charcoal) ships in
`tokens.css` under `html[data-theme="debugger"]`, toggled by the moon icon in
the toolbar and remembered in `localStorage`. It is never applied from
`prefers-color-scheme`: XP had no dark mode, so light is the only default.

---

## Decisions

The spec left four choices open. These are the calls, and why:

**Menu bar uses literal IDA labels** (`File / Jump / View / Windows / Help`)
rather than real nav words. The tab strip directly below already carries
obvious, literal section navigation, so the menu bar is free to be flavour.
Every item is a real link and carries an `aria-label` naming its real
destination, so screen readers announce "Home", not "File". Set
`params.menuStyle = "literal"` to use your `menus.main` labels instead.

**Desktop defaults to `#3a6ea5`** (the muted 9x/XP desktop blue) rather than
classic teal. Teal against the beige window face is loud at full-page scale;
the blue lets the chrome read first. `desktopColor = "teal"` restores `#008080`.

**The Graph overview is real**, not decorative. On a post it renders the actual
table of contents under a decorative thumbnail; on mobile it collapses into a
`<details>` disclosure above the body. A purely ornamental minimap would have
been wasted space in a 232px column.

**Loading screen defaults to `analysis`** — the IDA progress dialog — because it
matches the rest of the conceit. `boot` is the stripped XP-boot alternative.

One deviation from the spec worth flagging: category groups in the Names window
are `<tbody>` elements introduced by a `scope="colgroup"` header row, not
`<section>`s. Separate sections would mean a separate `<table>` per group and
columns that no longer line up across groups; the colgroup header announces the
group name to assistive tech and keeps one aligned grid.

---

## Accessibility

- Semantic HTML under the chrome: `header`, `nav`, `main`, `article`, `footer`,
  headings in order, real `<table>` markup with `<th scope>`.
- All decorative chrome (title bars, gutter addresses, jump arrows, segment
  dashes) is `aria-hidden` or generated from CSS pseudo-elements.
- The dotted XP focus rectangle *is* the focus indicator; it is never removed.
- `prefers-reduced-motion: reduce` disables the typewriter, window dragging and
  the loading splash entirely.
- Title bar and body colours were deepened from the reference screenshot so all
  reading text clears WCAG AA.
- Mobile (≤720px): windows stack into full-width cards keeping their title
  bars, the single toolbar row scrolls horizontally (with its scrollbar
  suppressed), and the gutter moves its address above each block and drops the
  arrows.

## Layout model

The application window fills the viewport exactly and the page itself never
scrolls. On desktop (≥721px) the MDI child windows fill the region the chrome
leaves and each scrolls **inside its own frame**, so the menu bar, toolbars,
tab strip, every window title bar, the output window and the status bar all
stay put — the way a real MDI application behaves. List-view headers stay
stuck to the top of their own window while its rows scroll.

Below 721px that inverts: windows keep their natural height and the MDI region
scrolls as one column, which is what touch users expect. The chrome stays
pinned in both modes.

If you would rather have the whole document scroll normally, remove
`overflow: hidden` from `body` in `chrome.css` and the `@media (min-width:
721px)` block at the end of the MDI section in `windows.css`.

---

## Demo site

`exampleSite/` is the demo. It resolves the theme through
`themesDir = "../.."`, so it builds when the repository directory is named
`disasm`:

```bash
hugo server -s exampleSite
```

`.github/workflows/pages.yml` publishes it to GitHub Pages on every push to
`main` (set Settings → Pages → Source to "GitHub Actions"). The workflow passes
the Pages base URL, including the `/disasm/` subpath, to `--baseURL`.

Note for subdirectory deployments generally: build internal links with
`{{ partial "func/url.html" "/posts/" }}` rather than `relURL`. Hugo's `relURL`
only prepends the baseURL path when its argument has *no* leading slash, so
`"/posts/" | relURL` silently drops the subpath and 404s.

## Icons

Every icon in `layouts/partials/icons.html` is original artwork drawn from SVG
primitives for this theme. No IDA, Microsoft, or third-party icon art is
included, and no trademarked logos are used.

---

## License

MIT. See `LICENSE`.
