# exampleSite

The demo site for the `disasm` theme. It exercises every layout the theme
ships: home, a grouped post list, a long-form post with two languages of code,
a short note, a tag page, an about page, a project, search, and 404.

## Run it

From the repository root:

```bash
hugo server -s exampleSite
```

`hugo.toml` sets `themesDir = "../themes"` so the site picks up the theme in
place, with no submodule or module setup.

## What each piece demonstrates

| Content | Demonstrates |
|---|---|
| `content/posts/hooking-the-windows-loader.md` | Long-form: headings, a table, blockquote, C and Python code blocks, explicit `segment` + `address` |
| `content/posts/pe-section-layout.md` | A second post in the `windows` category, Python highlighting |
| `content/posts/thread-local-storage-callbacks.md` | Explicit `segment = ".tls"` flavour field |
| `content/posts/strings-are-a-map.md` | Short post, list-heavy |
| `content/posts/reproducible-builds-note.md` | **No category** — lands in the `unassigned` segment |
| `content/projects/lde.md` | A second section with its own tab |
| `content/about.md` | Standalone page with a `header:` segment |
| `content/search.md` | The "Jump to address" page (`layout = "search"`) |

`params.postSort.categoryOrder` is set to `["reversing", "windows", "notes"]`,
so `/posts/` renders the reversing segment first, then windows, then the
uncategorised post under `unassigned`.

To see the flat variant, set `params.postSort.groupByCategory = false`.
