---
title: "TLS callbacks run before you do"
date: 2026-03-08
draft: false
categories: ["windows"]
tags: ["windows", "reversing", "anti-debug"]
summary: "A short note on the oldest trick in the packer handbook, and why your breakpoint on the entry point never hit."
segment: ".tls"
address: "0x0041C880"
---

You set a breakpoint on the entry point. The process runs, exits with a status
you did not expect, and the breakpoint never fired. Somewhere in the PE there is
a TLS directory, and its callbacks ran first.

The directory is small — a pointer to a null-terminated array of function
pointers, plus some index and template bookkeeping:

```c
typedef struct _IMAGE_TLS_DIRECTORY64 {
    ULONGLONG StartAddressOfRawData;
    ULONGLONG EndAddressOfRawData;
    ULONGLONG AddressOfIndex;
    ULONGLONG AddressOfCallBacks;   // → PIMAGE_TLS_CALLBACK[]
    DWORD     SizeOfZeroFill;
    DWORD     Characteristics;
} IMAGE_TLS_DIRECTORY64;
```

Every callback in that array is invoked with `DLL_PROCESS_ATTACH` before the
entry point, on the loader's thread, while the loader lock is held. That makes
it an attractive place to put an unpacking stub, an anti-debug check, or both.

The fix is procedural rather than technical: before running anything, list the
callbacks and break on each of them. Any tool that parses a PE will show you the
directory; the only mistake is not looking.
