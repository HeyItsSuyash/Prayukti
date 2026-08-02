# Prayukti Design System — Complete Specification
**Theme Name: "Naval Ember"**
*Extracted from source files. All observations are code-backed. Inferences are marked.*

---

## Source Files Analyzed

| File | Purpose |
|---|---|
| `frontend/tailwind.config.ts` | Tailwind token definitions |
| `frontend/src/styles/globals.css` | CSS custom properties (light + dark mode) |
| `frontend/src/components/ui/button.tsx` | Button CVA variants |
| `frontend/src/components/ui/card.tsx` | Card + sub-slots |
| `frontend/src/components/ui/input.tsx` | Input field |
| `frontend/src/components/ui/badge.tsx` | Badge variants |
| `frontend/src/components/ui/dialog.tsx` | Modal / Dialog |
| `frontend/src/components/ui/tabs.tsx` | Tabs (Radix) |
| `frontend/src/components/ui/select.tsx` | Select dropdown |
| `frontend/src/components/ui/table.tsx` | Data table |
| `frontend/src/components/ui/sonner.tsx` | Toast (Sonner) |
| `frontend/src/components/ui/progress.tsx` | Progress bar |
| `frontend/src/components/ui/switch.tsx` | Toggle switch |
| `frontend/src/components/ui/spotlight-mouse.tsx` | Mouse-tracking spotlight |
| `frontend/src/components/ui/AssistantBot.tsx` | Floating chatbot widget |
| `frontend/src/components/layout/Navbar.tsx` | Sticky navigation bar |
| `frontend/src/components/layout/Footer.tsx` | Footer |
| `frontend/src/components/dashboard/StudentDashboard.tsx` | Main student view |
| `frontend/src/components/auth/Login.tsx` | Login page |
| `frontend/src/app/page.tsx` | Home / landing page |

---

## 1. Color System

### 1.1 Light Mode (:root)

| Token | HSL | Hex (Approx) | Semantic Name |
|---|---|---|---|
| `--background` | `214 32% 97%` | `#F4F6FB` | Page background |
| `--foreground` | `215 28% 17%` | `#1F2D40` | Primary text |
| `--card` | `0 0% 100%` | `#FFFFFF` | Card surface |
| `--card-foreground` | `215 28% 17%` | `#1F2D40` | Card text |
| `--popover` | `0 0% 100%` | `#FFFFFF` | Popover surface |
| `--popover-foreground` | `215 28% 17%` | `#1F2D40` | Popover text |
| `--primary` | `216 70% 15%` | `#0B1F3F` | Navy Blue — brand |
| `--primary-foreground` | `0 0% 100%` | `#FFFFFF` | White on primary |
| `--secondary` | `210 61% 16%` | `#102A43` | Deep Blue |
| `--secondary-foreground` | `0 0% 100%` | `#FFFFFF` | White on secondary |
| `--muted` | `214 32% 91%` | `#DDE3EE` | Muted surface |
| `--muted-foreground` | `215 16% 47%` | `#687080` | Secondary text |
| `--accent` | `22 90% 54%` | `#F36F21` | Ember Orange — CTA |
| `--accent-foreground` | `0 0% 100%` | `#FFFFFF` | White on accent |
| `--destructive` | `0 84.2% 60.2%` | `#F04B4B` | Error red |
| `--destructive-foreground` | `210 40% 98%` | `#F5F8FF` | Text on error |
| `--border` | `220 13% 91%` | `#E2E5ED` | Default border |
| `--input` | `220 13% 91%` | `#E2E5ED` | Input border |
| `--ring` | `22 90% 54%` | `#F36F21` | Focus ring (= accent) |

### 1.2 Dark Mode (.dark)

| Token | HSL | Hex (Approx) |
|---|---|---|
| `--background` | `217 70% 15%` | `#0B1B3A` |
| `--foreground` | `216 33% 97%` | `#F2F5FB` |
| `--card` | `210 61% 16%` | `#102A43` |
| `--primary` | `217 70% 15%` | `#0B1B3A` |
| `--secondary` | `210 61% 16%` | `#102A43` |
| `--muted` | `210 61% 16%` | `#102A43` |
| `--muted-foreground` | `215 20.2% 65.1%` | `#8A9BB5` |
| `--accent` | `22 90% 54%` | `#F36F21` (unchanged) |
| `--destructive` | `0 62.8% 30.6%` | `#7D1A1A` |
| `--border` | `215 28% 17%` | `#1F2D40` |

### 1.3 Ad-hoc Colors (not tokenized — design debt)

| Color | Usage | Value |
|---|---|---|
| `indigo-600` / `indigo-700` | Smart Classroom card | `#4F46E5` / `#4338CA` |
| `purple-800` | AI Video Tutor gradient | `#3B0764` |
| `blue-600` | Card hover, loading | `#2563EB` |
| `green-500` | "Active Lab" dot | `#22C55E` |
| `red-600` | Logout, errors | `#DC2626` |
| `slate-950` | Hero bg, dark page | `#020617` |
| `#d32f2f` | CSS .loader spinner | Material Red |
| `bg-indigo-600` | Switch checked | `#4F46E5` (hardcoded) |

### 1.4 Gradients

| Location | Gradient |
|---|---|
| Hero overlay | `from-slate-950 via-slate-950/80 to-transparent` |
| `.btn-gradient` (globals.css) | `from-blue-600 to-indigo-600` |
| AI Video Tutor card | `from-indigo-700 to-purple-800` |
| `.glass` light | `rgba(255,255,255,0.7)` + `blur(10px)` |
| `.glass` dark | `rgba(15,23,42,0.8)` + `blur(10px)` |
| Hero grid pattern | `linear-gradient(to_right,#ffffff03 1px,transparent 1px)` 30px grid |

---

## 2. Typography

### 2.1 Font Families

- **Primary:** Inter via `@fontsource/inter` (`var(--font-inter)`)
- **Fallback:** `sans-serif`
- Both `font-inter` and `font-sans` map to the same Inter variable
- `page.module.css` references `var(--font-geist-mono)` — unused boilerplate remnant

### 2.2 Type Scale

| Role | Size | Weight | Tracking | Transform |
|---|---|---|---|---|
| Hero H1 | `5xl → 8xl` | Black (900) | `tighter` | UPPERCASE |
| Section H2 | `4xl → 6xl` | Black (900) | `tighter` | UPPERCASE |
| Card H3 | `2xl` | Black (900) | `tight` | UPPERCASE |
| Dialog Title | `lg` | Semibold (600) | `tight` | — |
| Card Title (component) | `2xl` | Semibold (600) | `tight` | — |
| Body | `base → lg` | Medium (500) | normal | — |
| Secondary text | `sm` | Medium (500) | normal | — |
| Micro labels / tags | `[10px] → xs` | Black (900) | `[0.3em]` | UPPERCASE |
| Badge | `xs` | Semibold (600) | normal | — |
| Footer section headings | `[14px]` | Bold (700) | `wider` | UPPERCASE |

### 2.3 Two-Tier Tracking System

- **Tight:** `tracking-tighter`, `tracking-tight` on large headlines (editorial)
- **Extreme wide:** `tracking-[0.3em]`, `tracking-widest`, `tracking-[0.2em]` on micro-labels (military/tech)

### 2.4 Responsive Typography

Step-based via Tailwind prefixes (no CSS clamp):
- `text-5xl md:text-8xl` (hero H1)
- `text-4xl md:text-6xl` (section headings)
- `text-base md:text-lg` (body)

---

## 3. Spacing System

### 3.1 Philosophy: 4pt base (Tailwind default, 1 unit = 4px)

### 3.2 Common Values

| Token | px | Usage |
|---|---|---|
| `gap-2` | 8px | Icon + text gap |
| `gap-3` | 12px | Button icon gap |
| `gap-4` | 16px | Grid gap (tight) |
| `p-4` | 16px | Compact padding |
| `p-6` | 24px | Standard card padding |
| `p-8` | 32px | Generous card padding |
| `p-10` | 40px | Feature block padding |
| `gap-8` | 32px | Card grid (standard) |
| `gap-12` | 48px | Footer columns |
| `mb-16` | 64px | Section header margin |
| `pt-28` | 112px | Navbar clearance |
| `py-16` | 64px | Footer padding |
| `mt-20` | 80px | Section separation |

### 3.3 Container

```
center: true
padding: 2rem (32px)
max-width: 1400px at 2xl
dashboard explicit: max-w-7xl (1280px)
```

---

## 4. Border Radius

### 4.1 Token System

```css
--radius:    0.625rem  /* 10px */
--radius-sm: 0.375rem  /* 6px */
--radius-lg: 1rem      /* 16px */
```

Tailwind mappings:
```
rounded-lg → 10px  (var(--radius))
rounded-md → 8px   (var(--radius) - 2px)
rounded-sm → 6px   (var(--radius) - 4px)
```
Note: `--radius-sm` and `--radius-lg` are defined in globals.css but NOT mapped in tailwind.config.ts.

### 4.2 Component Radii

| Component | Radius | Value |
|---|---|---|
| Badge | `rounded-none` | 0px (inconsistency) |
| Tab trigger | `rounded-sm` | 6px |
| Input, Select, Button (base) | `rounded-md` | 8px |
| Card (base), Dialog | `rounded-lg` / `rounded-[10px]` | 10px |
| Social links (footer) | `rounded-xl` | 12px |
| Icon containers, dashboard buttons | `rounded-2xl` | 16px |
| Subject icon wrapper | `rounded-3xl` | 24px |
| Dashboard subject cards, AssistantBot | `rounded-[2.5rem]` | 40px |
| Feature CTA blocks | `rounded-[3rem]` | 48px |
| Switch, Progress, status dots | `rounded-full` | 50% |

### 4.3 Design Character

**Mixed** — primarily Highly Rounded (40-48px) for content blocks, Sharp-Medium (6-10px) for controls.

---

## 5. Shadows & Elevation

### 5.1 Tokens

```css
--shadow-default: 0px 4px 20px rgba(0, 0, 0, 0.08);
--shadow-hover:   0px 8px 30px rgba(0, 0, 0, 0.12);
```

### 5.2 Elevation Scale

| Level | Value | Usage |
|---|---|---|
| 0 | none | Flat elements |
| 1 | `shadow-sm` | Navbar (scrolled), tabs |
| 2 | `shadow-md` | Buttons |
| 3 | `0px 4px 20px rgba(0,0,0,0.08)` | Card default |
| 4 | `shadow-lg` | Dialogs, dropdowns, toasts |
| 5 | `shadow-xl` | Hero CTA button |
| 6 | `shadow-2xl` | Feature cards, floating bot |
| 7 | `0px 8px 30px rgba(0,0,0,0.12)` | Card hover |
| 8 | `shadow-2xl + color tint` | Exam/CTA hero cards |

---

## 6. Components

### 6.1 Button (button.tsx — CVA + Radix Slot)

Variants:
| Variant | BG | Text | Hover |
|---|---|---|---|
| `default` | accent (#F36F21) | white | `accent/90` + `scale-[1.02]` |
| `destructive` | destructive | white | `destructive/90` |
| `outline` | transparent | accent | `accent/10` bg |
| `secondary` | primary (navy) | white | `primary/90` |
| `ghost` | transparent | — | `accent/10` bg |
| `link` | transparent | accent | underline |
| `premium` | black | white | gray-900 |

Sizes: `sm` h-9, `default` h-10, `lg` h-11, `icon` h-10 w-10

Focus: `ring-2 ring-ring ring-offset-2`
Disabled: `opacity-50 pointer-events-none`

> Dashboard overrides base CVA sizes with ad-hoc h-12/h-14/h-16 — inconsistency.

### 6.2 Input

h-10, rounded-md, border-input bg-background, text-sm, focus ring-2 ring-ring

### 6.3 Card

rounded-[10px] border border-border bg-card shadow-[0px_4px_20px_rgba(0,0,0,0.08)]
hover: shadow-[0px_8px_30px_rgba(0,0,0,0.12)] -translate-y-1 (duration-300)
Padding: p-6 (header + content)

### 6.4 Badge

rounded-none (sharp!) text-xs font-semibold px-2.5 py-0.5
Variants: default(primary), secondary, destructive, outline

### 6.5 Dialog

Overlay: bg-black/80. Content: max-w-lg sm:rounded-lg shadow-lg bg-background
Animation: fade-in-0 zoom-in-95 (200ms)

### 6.6 Tabs

List: h-10 rounded-md bg-muted p-1
Trigger: rounded-sm px-3 py-1.5 text-sm font-medium
Active: bg-background text-foreground shadow-sm

### 6.7 Select

Trigger: same as Input (h-10 rounded-md border border-input)
Dropdown: rounded-md border bg-popover shadow-md
Item hover: bg-accent text-accent-foreground

### 6.8 Table

Header: h-12 px-4 font-medium text-muted-foreground
Cell: p-4 align-middle
Row hover: hover:bg-muted/50
No border radius — flat tabular.

### 6.9 Toast (Sonner)

bg-background border-border shadow-lg, adapts to next-themes
Icons: CircleCheck, Info, TriangleAlert, OctagonX, LoaderCircle (Lucide, h-4 w-4)

### 6.10 Progress

Track: h-4 rounded-full bg-secondary
Indicator: bg-primary transition-all (translateX animation)

### 6.11 Switch

h-6 w-11, checked: bg-indigo-600 (HARDCODED — not a token!), unchecked: bg-slate-200
Thumb: h-5 w-5 rounded-full bg-white shadow-lg

### 6.12 Navbar

fixed top-0 z-50 w-full transition-all duration-300
Resting: bg-white border-b border-border py-4
Scrolled (>20px): bg-white/90 backdrop-blur-md shadow-sm py-3
Height: ~60-72px

### 6.13 Footer

bg-primary (navy) text-white py-16
Grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12
Social icons: w-10 h-10 rounded-xl bg-white/10, hover bg-accent
Section headings: text-accent uppercase tracking-wider text-[14px] font-bold

### 6.14 AssistantBot

fixed bottom-10 left-10 z-50
Panel: w-[380px] rounded-[2.5rem] shadow-2xl bg-white dark:bg-slate-900
Header: bg-primary with Bot icon in bg-accent rounded-2xl
Animation: Framer Motion scale 0.9→1, y 20→0, opacity 0→1

### 6.15 SpotlightMouse

Framer Motion spring-tracked radial gradient (size 200px default)
from-zinc-50 via-zinc-100 to-zinc-200, blur-xl
Spring: { bounce: 0 } — critically damped

---

## 7. Icons

- Library: Lucide React (v0.469.0)
- 100% Lucide — no custom icon set
- Default stroke: 1.5px rounded caps (never overridden)
- Sizes: h-4 w-4 (inline), h-5 w-5 (mid), h-8 w-8 (feature), h-12/h-16 (hero)
- Spacing from text: always gap-2 or gap-3

---

## 8. Motion

### 8.1 CSS Animations

| Name | Duration | Easing |
|---|---|---|
| `rotation` (spinner) | 1s | linear infinite |
| `blob` (bg blobs) | 7s | ease infinite |
| `.animation-delay-2000` | — | 2s delay utility |
| `.animation-delay-4000` | — | 4s delay utility |

### 8.2 Tailwind Animations

| Pattern | Duration | Property |
|---|---|---|
| `accordion-down/up` | 200ms ease-out | height |
| Page entry `animate-in fade-in` | 700ms | opacity+y |
| `slide-in-from-left/right` | 700ms | x |
| `slide-in-from-bottom` | 700ms delay-100/200/300 | y (staggered) |
| `animate-pulse` | built-in | scale+opacity |
| `animate-spin` | built-in | rotate |

### 8.3 Interaction Utilities (globals.css)

```css
.btn-interaction {
  transition-all duration-500;
  hover: scale-105 -translate-y-1;
  active: scale-95 shadow-inner;
}
.card-interaction {
  transition-all duration-300;
  hover: shadow-2xl -translate-y-2 border-primary/30;
}
.link-animate::after {
  /* accent underline slides in from left over 300ms */
}
```

### 8.4 Framer Motion

- `AssistantBot`: AnimatePresence + motion.div (scale, opacity, y)
- `SpotlightMouse`: useSpring + useTransform (cursor tracking)
- Version: 11.18.2

### 8.5 Motion Summary

| Pattern | Duration | Easing |
|---|---|---|
| Accordion | 200ms | ease-out |
| Page entry | 700ms | ease |
| Card lift | 300ms | ease |
| Button scale | instant | — |
| Navbar scroll | 300ms | ease |
| Link underline | 300ms | ease |
| AssistantBot open | ~200ms | spring bounce:0 |
| SpotlightMouse | continuous | spring bounce:0 |
| Blob | 7s | ease |
| Spinner | 1s | linear |

---

## 9. Layout System

- Container: center, 2rem padding, max-w 1400px at 2xl
- Dashboard: max-w-7xl (1280px)
- Grid: pure Tailwind responsive (grid-cols-1 → lg:grid-cols-4)
- Breakpoints: sm 640, md 768, lg 1024, xl 1280, 2xl 1400
- Navbar: fixed, ~60-72px tall. Clearance: pt-28 (112px)
- No sidebar — full-width layout with top nav
- Hero: min-h-[85vh] bg-slate-950

---

## 10. Design Tokens (Complete)

```css
:root {
  /* Colors */
  --background:              214 32% 97%;   /* #F4F6FB */
  --foreground:              215 28% 17%;   /* #1F2D40 */
  --card:                    0 0% 100%;     /* #FFFFFF */
  --card-foreground:         215 28% 17%;
  --popover:                 0 0% 100%;
  --popover-foreground:      215 28% 17%;
  --primary:                 216 70% 15%;   /* #0B1F3F Navy */
  --primary-foreground:      0 0% 100%;
  --secondary:               210 61% 16%;   /* #102A43 */
  --secondary-foreground:    0 0% 100%;
  --muted:                   214 32% 91%;   /* #DDE3EE */
  --muted-foreground:        215 16% 47%;   /* #687080 */
  --accent:                  22 90% 54%;    /* #F36F21 Ember */
  --accent-foreground:       0 0% 100%;
  --destructive:             0 84.2% 60.2%; /* #F04B4B */
  --destructive-foreground:  210 40% 98%;
  --border:                  220 13% 91%;   /* #E2E5ED */
  --input:                   220 13% 91%;
  --ring:                    22 90% 54%;    /* = accent */
  /* Radii */
  --radius:    0.625rem; /* 10px */
  --radius-sm: 0.375rem; /* 6px */
  --radius-lg: 1rem;     /* 16px */
  /* Shadows */
  --shadow-default: 0px 4px 20px rgba(0, 0, 0, 0.08);
  --shadow-hover:   0px 8px 30px rgba(0, 0, 0, 0.12);
}
.glass {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
.dark .glass {
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.05);
}
```

---

## 11. Theme Architecture

**Flow:** `globals.css` CSS variables → `tailwind.config.ts` token mapping → Component Tailwind classes

- Dark mode: `darkMode: ["class"]` in Tailwind. Toggled via `classList.toggle('dark')` in Navbar.
- `next-themes` is installed and used only in `sonner.tsx` — inconsistency.
- shadcn/ui component library (Radix UI primitives + CVA).
- Token system is partially centralized — many components bypass tokens with hardcoded Tailwind colors.

**Standardization opportunities:**
1. Tokenize indigo-600 (Smart Classroom), purple-800 (AI Tutor), green-500 (Active Lab)
2. Add `--navbar-height` token
3. Fix Badge `rounded-none` → `rounded-sm`
4. Fix Switch `bg-indigo-600` → use accent/primary token
5. Add CVA size variants for h-12/h-14/h-16 button heights

---

## 12. Visual Style

**"Naval Ember" — Modern Institutional SaaS with Editorial Typography & Glassmorphism**

| Label | Evidence |
|---|---|
| Institutional | Navy primary, MMMUT branding, professional whitespace |
| Editorial/Magazine | font-black at 8xl, tracking-tighter, uppercase, dramatic scale contrast |
| Military/Tech | tracking-[0.3em] labels, phrases like "Synchronizing Modules", "Reconnect with Core" |
| Modern SaaS | Token system, Radix primitives, CVA, dark mode |
| Glassmorphism | .glass utility, navbar backdrop-blur-md, hero bg-white/5 buttons, blob animations |
| Stripe-like | White cards, subtle borders, shadow elevation, transition-all everywhere |
| Linear-inspired | Extreme tracking on labels, monochromatic base + vivid single accent |

NOT: Brutalist, Material Design, Apple-like (not minimal enough)

---

## 13. Accessibility

| Check | Status | Notes |
|---|---|---|
| Foreground on background | ✅ AAA (~10:1) | `#1F2D40` on `#F4F6FB` |
| Accent on white (button) | ⚠️ FAIL | `#F36F21` on white ≈ 3.0:1 — fails AA for text-sm |
| White on primary | ✅ AAA (~14:1) | `#FFFFFF` on `#0B1F3F` |
| Muted text on background | ✅ AA (~4.6:1) | `#687080` on `#F4F6FB` |
| Focus states | ✅ | ring-2 ring-ring on all interactives |
| Keyboard nav | ✅ | All Radix primitives keyboard-accessible |
| Dialog focus trap | ✅ | Via Radix DialogContent |
| sr-only usage | ⚠️ Partial | Only Dialog close button has sr-only |
| aria-labels on icon buttons | ❌ | Hamburger menu missing aria-label |
| Skip navigation | ❌ | Not present |
| text-[10px] micro labels | ⚠️ | Borderline legible, extreme tracking |

---

## 14. Inconsistencies Found

| # | Issue | File |
|---|---|---|
| 1 | Badge uses `rounded-none` — sharp, inconsistent with system | badge.tsx |
| 2 | Switch checked uses hardcoded `bg-indigo-600` not a design token | switch.tsx |
| 3 | Dashboard buttons override CVA with ad-hoc h-12/h-14/h-16 | StudentDashboard.tsx |
| 4 | CTA cards use indigo-600/purple-800 not in token system | StudentDashboard.tsx |
| 5 | Navbar uses `process.env.NEXT_PUBLIC_API_URL` directly, not imported `API_URL` | Navbar.tsx:41 |
| 6 | Dark mode toggled manually, bypasses `next-themes` (used in sonner.tsx) | Navbar.tsx |
| 7 | page.module.css references `--font-geist-mono` / `--font-geist-sans` — unused | page.module.css |
| 8 | `global.css` (22 bytes, @import tailwindcss) and `globals.css` coexist | src/styles/ |
| 9 | `--radius-sm` and `--radius-lg` defined in globals.css but NOT in tailwind.config.ts | globals.css |
| 10 | CSS .loader uses hardcoded `#d32f2f`, inconsistent with --destructive token | globals.css:89 |
| 11 | Card base uses `rounded-[10px]` hardcoded instead of `rounded-lg` token | card.tsx |

---

## 15. File Locations

| Category | Path |
|---|---|
| Tailwind Config | `frontend/tailwind.config.ts` |
| CSS Variables + Globals | `frontend/src/styles/globals.css` |
| App Layout | `frontend/src/app/layout.tsx` |
| API Config | `frontend/src/lib/config.ts` |
| cn utility | `frontend/src/lib/utils.ts` |
| Button | `frontend/src/components/ui/button.tsx` |
| Card | `frontend/src/components/ui/card.tsx` |
| Input | `frontend/src/components/ui/input.tsx` |
| Badge | `frontend/src/components/ui/badge.tsx` |
| Dialog | `frontend/src/components/ui/dialog.tsx` |
| Tabs | `frontend/src/components/ui/tabs.tsx` |
| Select | `frontend/src/components/ui/select.tsx` |
| Table | `frontend/src/components/ui/table.tsx` |
| Toast | `frontend/src/components/ui/sonner.tsx` |
| Progress | `frontend/src/components/ui/progress.tsx` |
| Switch | `frontend/src/components/ui/switch.tsx` |
| Spotlight SVG | `frontend/src/components/ui/spotlight.tsx` |
| SpotlightMouse | `frontend/src/components/ui/spotlight-mouse.tsx` |
| AssistantBot | `frontend/src/components/ui/AssistantBot.tsx` |
| Navbar | `frontend/src/components/layout/Navbar.tsx` |
| Footer | `frontend/src/components/layout/Footer.tsx` |
| Theme Provider | Not found — manual classList + partial next-themes |
| Design Token File | None (tokens only in globals.css CSS vars) |
| Component Library | shadcn/ui (Radix UI + CVA) |

---

## 16. Final Summary

### Theme Name
**"Naval Ember"** — Navy Blue (`#0B1F3F`) + Ember Orange (`#F36F21`).

---

### Design Philosophy

Prayukti operates at the intersection of institutional credibility and modern tech expressiveness. The color palette anchors itself in deep navy — a color of trust, academia, and authority — then cuts through with a vibrant ember orange that signals action, warmth, and energy. This opposition creates visual tension that feels both serious and inviting.

The typography system is deliberately editorial. Headlines are `font-black` at extreme scales (`text-8xl`, `tracking-tighter`), while micro-labels use all-caps with wide letter-spacing (`tracking-[0.3em]`), evoking instrument panels and military interfaces. This voice says "precision engineering tool" without feeling cold.

Spatially, Prayukti prefers generous whitespace, large rounded containers (`rounded-[3rem]`), and a subtle elevation system that lifts elements on hover with shadow growth and y-translation. The result is a UI that feels alive without being distracting — disciplined exuberance for a student-facing learning platform.

---

### Core Principles

1. **Authority through restraint** — Navy enforces brand weight; orange reserved only for critical actions
2. **Motion as feedback** — Every element responds: cards lift, buttons scale, links underline
3. **Type as texture** — Headlines are design elements, not just labels
4. **Glassy surfaces** — Frosted glass for depth without color complexity
5. **Dark mode is first-class** — Every token has an explicit dark counterpart

---

### Color Palette Table

| Role | Name | Light HEX | Dark HEX |
|---|---|---|---|
| Page background | Background | `#F4F6FB` | `#0B1B3A` |
| Primary text | Foreground | `#1F2D40` | `#F2F5FB` |
| Card / Panel | Card | `#FFFFFF` | `#102A43` |
| Brand / Navy | Primary | `#0B1F3F` | `#0B1B3A` |
| Deep navy | Secondary | `#102A43` | `#102A43` |
| Muted surface | Muted | `#DDE3EE` | `#102A43` |
| Secondary text | Muted FG | `#687080` | `#8A9BB5` |
| CTA / Action | Accent | `#F36F21` | `#F36F21` |
| Error | Destructive | `#F04B4B` | `#7D1A1A` |
| Default border | Border | `#E2E5ED` | `#1F2D40` |
| Focus ring | Ring | `#F36F21` | `#F36F21` |
| (Untokenized) | Classroom Blue | `#4F46E5` | — |
| (Untokenized) | AI Tutor Violet | `#3B0764` | — |
| (Untokenized) | Active Lab Green | `#22C55E` | — |

---

### Typography Table

| Level | Size | Weight | Tracking | Transform |
|---|---|---|---|---|
| Hero H1 | 5xl→8xl | Black 900 | tighter | UPPERCASE |
| Section H2 | 4xl→6xl | Black 900 | tighter | UPPERCASE |
| Card H3 | 2xl | Black 900 | tight | UPPERCASE |
| Dialog title | lg | Semibold 600 | tight | — |
| Body | base→lg | Medium 500 | normal | — |
| Secondary | sm | Medium 500 | normal | — |
| Tag / label | [10px]→xs | Black 900 | [0.3em] | UPPERCASE |
| Badge | xs | Semibold 600 | normal | — |
| Footer headings | [14px] | Bold 700 | wider | UPPERCASE |

---

### Spacing Scale

| Token | px | Usage |
|---|---|---|
| gap-2 | 8 | Icon+text |
| gap-3 | 12 | Button icon |
| p-6 | 24 | Card padding |
| p-8 / p-10 | 32/40 | Feature padding |
| gap-8 | 32 | Grid gap |
| mb-16 | 64 | Section margin |
| pt-28 | 112 | Navbar offset |
| py-16 | 64 | Footer padding |
| mt-20 | 80 | Section separation |

---

### Radius Scale

| Token | px | Usage |
|---|---|---|
| rounded-none | 0 | Badge (inconsistency) |
| rounded-sm | 6 | Tab trigger |
| rounded-md | 8 | Inputs, base buttons |
| rounded-lg | 10 | Cards, dialog |
| rounded-xl | 12 | Social links |
| rounded-2xl | 16 | Icon containers |
| rounded-3xl | 24 | Subject icons |
| rounded-[2.5rem] | 40 | Subject cards, bot panel |
| rounded-[3rem] | 48 | Feature CTA blocks |
| rounded-full | 50% | Switch, progress, dots |

---

### Shadow Scale

| Level | Value | Usage |
|---|---|---|
| 0 | none | Flat |
| 1 | shadow-sm | Navbar scrolled |
| 2 | shadow-md | Buttons |
| 3 | 0px 4px 20px rgba(0,0,0,.08) | Card default |
| 4 | shadow-lg | Dialogs/toasts |
| 5 | shadow-xl | Hero CTA |
| 6 | shadow-2xl | Feature cards, bot |
| 7 | 0px 8px 30px rgba(0,0,0,.12) | Card hover |
| 8 | shadow-2xl + color tint | CTA hero cards |

---

### Motion Guidelines

| Pattern | Duration | Easing |
|---|---|---|
| Accordion | 200ms | ease-out |
| Page entry | 700ms | ease |
| Card hover | 300ms | ease |
| Navbar scroll | 300ms | ease |
| Link underline | 300ms | ease |
| AssistantBot | ~200ms | spring bounce:0 |
| SpotlightMouse | continuous | spring bounce:0 |
| Blob background | 7s | ease |
| Spinner | 1s | linear |

---

### One-Paragraph Recreation Description

Build Prayukti as a modern institutional web application for an Indian engineering university. Use Inter as the sole font family. The color system is two-tone: a navy blue primary (#0B1F3F) for brand and surfaces, paired with ember orange (#F36F21) exclusively for CTAs, focus rings, and highlights. Light mode background is near-white blue-grey (#F4F6FB); dark mode is deep navy (#0B1B3A). Typography is editorial and bold — headlines are font-black uppercase tracking-tighter at 5xl–8xl, while micro-labels are text-[10px] font-black uppercase tracking-[0.3em], evoking engineering instrument panels. Cards use rounded-[10px] at base but up to rounded-[3rem] for large feature blocks; they lift on hover with shadow-[0px_8px_30px_rgba(0,0,0,0.12)] and -translate-y-1 over 300ms. The navbar is fixed with glassmorphism on scroll (bg-white/90 backdrop-blur-md). All icons come from Lucide React. Framer Motion handles the floating assistant widget and mouse-tracking spotlight. Micro-interactions are pervasive: buttons scale on hover (scale-[1.02]) and press (active:scale-95); link underlines slide in from left over 300ms; the navbar crossfades on scroll. Built with shadcn/ui (Radix UI + CVA) and Tailwind CSS, dark mode via the dark class on html.
