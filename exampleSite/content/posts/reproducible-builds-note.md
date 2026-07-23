---
title: "Note: two builds, one hash"
date: 2026-04-02
draft: false
tags: ["notes", "builds"]
summary: "A link and a paragraph on why reproducible builds keep showing up in reverse engineering work."
---

Filed under things I keep sending to people:
[Reproducible Builds](https://reproducible-builds.org/) — the project, not the
slogan.

The reverse engineering angle is underrated. If a vendor publishes a
reproducible build, comparing the binary you were handed against the binary the
source produces becomes a hash comparison instead of a week of diffing. When
they do not, you spend that week establishing that a timestamp, a build path,
and the order of two symbols in a section account for the entire difference.

This post has no category set, which is deliberate — it shows up under the
`unassigned` segment in the post list.
