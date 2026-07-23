---
title: "Hooking the Windows loader"
date: 2026-02-14
draft: false
categories: ["reversing"]
tags: ["windows", "reversing", "hooking"]
summary: "Walking LDR_DATA_TABLE_ENTRY by hand, then patching the one function that everybody hooks and nobody documents."
segment: ".text"
address: "0x00401A2F"
---

Every few years I end up back in the same place: a process that loads a DLL I
did not write, at a moment I do not control, and I need to know about it before
the DLL's `DllMain` runs. There are three well-worn answers — hooking
`LdrLoadDll`, registering a DLL notification callback, and patching the import
table — and they fail in different, interesting ways.

## Walking the loader data by hand

The loader keeps its bookkeeping in the PEB. Each loaded module gets an
`LDR_DATA_TABLE_ENTRY`, threaded onto three doubly-linked lists that differ only
in ordering. Walking `InMemoryOrderModuleList` is the usual choice because the
list head is easy to reach and the ordering is stable enough for logging.

```c
// Enumerate loaded modules without touching the Win32 API.
static void walk_modules(void)
{
    PPEB peb = (PPEB)__readgsqword(0x60);
    PLIST_ENTRY head = &peb->Ldr->InMemoryOrderModuleList;

    for (PLIST_ENTRY it = head->Flink; it != head; it = it->Flink) {
        PLDR_DATA_TABLE_ENTRY entry =
            CONTAINING_RECORD(it, LDR_DATA_TABLE_ENTRY, InMemoryOrderLinks);

        wprintf(L"%08llx  %wZ\n",
                (unsigned long long)entry->DllBase,
                &entry->FullDllName);
    }
}
```

Two things bite people here. The first is that `InMemoryOrderLinks` is *not* the
first field of the structure, so `CONTAINING_RECORD` is load-bearing — casting
the `LIST_ENTRY` pointer directly gives you a structure shifted by 16 bytes and
a plausible-looking `DllBase` that is actually a flink. The second is that the
list is not locked while you walk it. If another thread is mid-`LdrLoadDll`, you
can observe a partially linked entry.

> The loader lock is not a mutex you should take. Walk fast, copy what you need,
> and get out.

## Which hook to use

I have shipped all three of these at some point. They trade off along the same
axis: how early you see the load versus how much of the process you disturb.

| Approach | Sees loads before `DllMain` | Survives forwarded imports | Detectable |
|---|---|---|---|
| `LdrRegisterDllNotification` | yes | yes | trivially |
| Inline hook on `LdrLoadDll` | yes | yes | with effort |
| IAT patching | no | no | trivially |

The notification callback is the boring correct answer for anything that ships
to other people. It is documented enough to be stable, it runs while the loader
lock is held so ordering is sane, and it does not require you to assemble a
trampoline. The inline hook is what you reach for when you need to *change* the
result rather than observe it.

### Reading the prologue

Before you can place an inline hook you need to know how many bytes to steal.
Length-disassembling the prologue is the whole problem, and it is why every
hooking library eventually vendors a length disassembler.

```python
# Minimal x86-64 prologue measurement using capstone.
import capstone

def steal_bytes(code: bytes, base: int, need: int = 14) -> int:
    md = capstone.Cs(capstone.CS_ARCH_X86, capstone.CS_MODE_64)
    total = 0
    for insn in md.disasm(code, base):
        total += insn.size
        if total >= need:
            return total
    raise ValueError("prologue too short to hook safely")
```

Fourteen bytes is the magic number for a `jmp [rip+0]` plus an absolute address.
If the function begins with a short jump into a hot path — and on recent builds
several of them do — you will need to relocate the instruction rather than copy
it, which is the point where "small hooking helper" becomes "small hooking
library".

## What actually broke

The failure that cost me a week had nothing to do with any of the above. A
security product had already hooked `LdrLoadDll`, and its trampoline assumed it
was the only one. Installing a second hook produced a chain that worked
perfectly until the process forked a child at a specific moment, at which point
the child inherited a trampoline pointing at a page that was never re-mapped.

The lesson I keep relearning: assume you are not the first person to hook the
function, and verify the prologue is what you think it is before you patch it.
