---
title: "{{ replace .File.ContentBaseName "-" " " | title }}"
date: {{ .Date }}
draft: true
categories: ["reversing"]   # groups the post into a segment in the Names window
tags: []                    # each becomes a row in the Strings window
summary: ""                 # Names-window row + meta description; keep it one line
# --- optional flavour fields (safe to delete) ------------------------------
# segment: ".text"          # gutter segment label; defaults to ".text"
# address: "0x00401A2F"     # base address for the gutter; auto-derived if unset
# toc:     true             # force the Graph-overview / TOC window
---

Open with the point of the piece — the Names-window row shows `summary`, so the
first paragraph is free to get straight to work.

## First subroutine

Headings render as IDA labels (`sub_XXXXXX:`) with their own gutter address, so
keep them short and declarative.

```c
// Fenced code blocks are colored in the IDA palette and get address-style
// line numbers, whatever the language.
int main(void) { return 0; }
```
