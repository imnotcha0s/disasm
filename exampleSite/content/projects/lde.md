---
title: "lde — a length disassembler in 400 lines"
date: 2026-03-30
categories: ["reversing"]
tags: ["reversing", "tools"]
summary: "A single-header x86-64 length disassembler, written because every hooking library needs one and none of them agree."
---

`lde` measures the length of an x86-64 instruction and nothing else. No
mnemonics, no operands, no formatting — just the byte count, which is the only
thing an inline hook actually needs.

It exists because the length disassemblers vendored inside hooking libraries
tend to be copies of each other with divergent bug fixes, and I wanted one whose
table I could read in an afternoon.

Scope, deliberately small:

- 64-bit long mode only
- REX, VEX, and EVEX prefixes
- No support for anything that cannot appear in a function prologue

The test corpus is every distinct prologue from `ntdll.dll` across the builds I
had on disk, checked against a reference disassembler.
