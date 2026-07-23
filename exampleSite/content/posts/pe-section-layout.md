---
title: "Reading a PE section table without tools"
date: 2026-05-19
draft: false
categories: ["windows"]
tags: ["windows", "pe", "notes"]
summary: "Section headers are 40 bytes each and sit immediately after the optional header. That is the whole trick."
---

You do not need a parser to read a section table. You need the offset of the NT
headers, the size of the optional header, and the willingness to count in hex.

At offset `0x3C` of any PE there is a `DWORD` giving the file offset of the NT
headers. Skip four bytes of signature and twenty bytes of file header — the last
field of which, `SizeOfOptionalHeader`, tells you how far to jump — and you land
on the first `IMAGE_SECTION_HEADER`.

```python
import struct

def sections(data: bytes):
    e_lfanew = struct.unpack_from("<I", data, 0x3C)[0]
    n_sections, = struct.unpack_from("<H", data, e_lfanew + 6)
    opt_size,   = struct.unpack_from("<H", data, e_lfanew + 20)
    first = e_lfanew + 24 + opt_size

    for i in range(n_sections):
        off = first + i * 40
        name = data[off:off + 8].rstrip(b"\x00").decode("ascii", "replace")
        vsize, vaddr, rsize, raddr = struct.unpack_from("<IIII", data, off + 8)
        yield name, vaddr, vsize, raddr, rsize
```

Each header is exactly 40 bytes: an eight-byte name, then virtual size, virtual
address, raw size, raw pointer, and some relocation fields that are zero in
almost every executable you will meet.

The reason to know this by hand is that malformed files are where the
interesting behaviour lives. A section whose raw size exceeds its virtual size,
or whose name is eight bytes with no terminator, will confuse a surprising
number of tools — and the loader's own behaviour in those cases is the ground
truth you are usually trying to establish.
