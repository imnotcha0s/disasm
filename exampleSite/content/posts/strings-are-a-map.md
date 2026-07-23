---
title: "Strings are a map of the binary"
date: 2026-01-22
draft: false
categories: ["reversing"]
tags: ["reversing", "notes"]
summary: "Before opening the graph view, read the string table. It tells you what the program thinks it is."
---

The first thing I do with an unfamiliar binary is not to disassemble anything.
It is to read every string in it, top to bottom, the way you would skim a book's
index.

Strings are written by people, for people. Error messages name the subsystems.
Format specifiers reveal structure. Registry paths and file extensions tell you
where the program lives on disk. A binary with `%s: verification failed for %s`
in it has a verification subsystem, and now you know two of its parameters
before you have looked at a single instruction.

## What to look for first

- **Version banners.** They date the code and often name the vendor's internal
  project, which is frequently more searchable than the product name.
- **Format strings.** Each one is a function signature in disguise.
- **Paths.** Build paths left in PDB references tell you the developer's
  directory layout, and sometimes the branch name.
- **Anything base64-shaped.** Usually a key, a serialized blob, or a joke.

## Cross-reference before you read code

A string is only useful once you know who uses it. Take the most specific string
you can find — not `"error"`, but `"handshake rejected: unsupported suite %u"` —
and follow its cross-references. That lands you in the middle of the protocol
code with the surrounding logic already labelled by the message itself.

Working outward from a named location beats working inward from `main`, because
`main` in a real program is a thousand lines of argument parsing and the
interesting part is four call levels down.
