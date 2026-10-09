---
title: "{{ replace .File.ContentBaseName "-" " " | title }}"
date: {{ .Date }}
draft: true
categories: ["reversing"]   # groups the project into a segment in the Names window
tags: ["tools"]             # each becomes a row in the Strings window
summary: ""                 # Names-window row + meta description; keep it one line
# --- optional flavour fields (safe to delete) ------------------------------
# segment: ".text"          # gutter segment label; defaults to ".text"
# address: "0x00401A2F"     # base address for the gutter; auto-derived if unset
---

One line on what this is and the single problem it solves — the Names-window
row shows `summary`, so lead the body with the why.

## Scope

What it does, and just as importantly what it deliberately does not:

- bullet the boundaries
- keep it honest

```c
// Fenced code blocks are colored in the IDA palette, whatever the language.
int main(void) { return 0; }
```
