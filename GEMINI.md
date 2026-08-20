# Agent Instructions

Read this entire file before starting any task.

## Self-Correcting Rules Engine

This file contains a growing ruleset that improves over time. **At session start, read the entire "Learned Rules" section before doing anything.**

### How it works

1. When the user corrects you or you make a mistake, **immediately append a new rule** to the "Learned Rules" section at the bottom of this file.
2. Rules are numbered sequentially and written as clear, imperative instructions.
3. Format: `N. [CATEGORY] Never/Always do X — because Y.`
4. Categories: `[STYLE]`, `[CODE]`, `[ARCH]`, `[TOOL]`, `[PROCESS]`, `[DATA]`, `[UX]`, `[OTHER]`
5. Before starting any task, scan all rules below for relevant constraints.
6. If two rules conflict, the higher-numbered (newer) rule wins.
7. Never delete rules. If a rule becomes obsolete, append a new rule that supersedes it.

### When to add a rule

- User explicitly corrects your output ("no, do it this way")
- User rejects a file, approach, or pattern
- You hit a bug caused by a wrong assumption about this codebase
- User states a preference ("always use X", "never do Y")

### Rule format example

```
14. [CODE] Always use `bun` instead of `npm` — user preference, bun is installed globally.
15. [STYLE] Never add emojis to commit messages — project convention.
16. [ARCH] API routes live in `src/server/routes/`, not `src/api/` — existing codebase pattern.
```

---

## Learned Rules

<!-- New rules are appended below this line. Do not edit above this section. -->

1. [STYLE] Always check GEMINI.md before performing any task — system requirement.
2. [STYLE] Never use dark blue background colors (#021D24 or similar) across chatbot dialogs, chat responses, simulation cards, or canvas backgrounds. Always use theme-consistent background colors (white for light mode, dark gray for dark mode).
3. [UX] Start simulation overview cards must use green gradients (`from-[#021D24]` is prohibited, use green/emerald gradient).
4. [UX] For DLD simulation, consolidate components palette and truth/excitation table analysis into a single toggleable left sidebar; remove floating top menus and top canvas buttons.
5. [UX] Place zoom in and zoom out controls horizontally to the left of the Exit Simulation button in the top navigation header.
6. [UX] Remove extra top navs ("simulation", "comparison", "quiz") inside non-DLD simulations.
7. [UX] In the center of the active simulation top navigation bar, dynamically display the current experiment's title.
8. [UX] Ensure breadcrumbs ("Dashboard > Subject > Experiment") are fully functional links with proper href routing.
9. [STYLE] Never use em-dashes (—) in the codebase UI/prose; use standard hyphens (-) instead.
10. [UX] Redesign LabTest results page to be modern, theme-consistent (white/dark gray), and visually appealing.
11. [STYLE] Ensure DLD simulation canvas strictly uses theme-consistent backgrounds (white in light mode, dark gray in dark mode); remove all lingering blue tint/bg-blue classes.
12. [UX] Hide scrollbars globally across the entire website while keeping all scrollable areas fully functional (`::-webkit-scrollbar { display: none }` / `scrollbar-width: none`).
13. [UX] Always use custom React state-driven dropdown menus instead of native HTML `<select>` elements to prevent OS-level blue highlights and ensure 100% theme consistency.
