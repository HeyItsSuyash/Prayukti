# Prayukti vLAB - Comprehensive Codebase & UX Architecture Summary

This document provides a detailed breakdown of the **Prayukti vLAB** platform architecture, codebase structure, backend integration, and end-to-end user experience (UX) flows.

---

## 1. Project Overview & Architecture

Prayukti vLAB is a Next.js 16 + Express.js virtual laboratory platform designed for engineering curricula (Computer Networks, Digital Logic Design, Database Management Systems, Data Structures & Algorithms, MPMC 8086, etc.).

### System Architecture Stack
- **Frontend Framework**: Next.js 16 (App Router) + TypeScript + React 19 + Tailwind CSS + Lucide Icons + Boxicons (`bx`).
- **Interactive Canvases & Simulation Engines**: `@xyflow/react` (ReactFlow) for digital logic circuit drag-and-drop engines, custom WebGL/SVG/Canvas components for network packet flows, and interactive code execution interfaces.
- **Backend Services**: Express.js (Node.js) with JWT authentication, Nodemailer (OTP verification), Groq AI Chat API integration (`/api/chat`), and PostgreSQL / MongoDB endpoints.
- **Styling System**: Theme-consistent tokens (`bg-card`, `bg-background`, `text-foreground`, `border-border`, `primary: #10b981`), supporting both Light Mode (clean white) and Dark Mode (sleek dark gray `#0d1526`).

---

## 2. Directory Structure & Key Files

```
Prayukti_Legacy/
├── GEMINI.md                     # Self-correcting rules engine & strict style guidelines
├── summary.md                    # Detailed codebase & UX documentation (this file)
├── backend/                      # Primary Express API backend (Auth, OTP, AI Chatbot proxy)
├── backend_teacher/              # Teacher portal API backend (Exams, Submissions, Analytics)
├── frontend/                     # Next.js 16 Client Application
│   ├── src/
│   │   ├── app/                  # Next.js App Router Pages & API routes
│   │   │   ├── (auth)/           # Login, Register, Forgot Password, Verification
│   │   │   ├── (dashboard)/      # Student & Educator Dashboards, Course pages, Analytics
│   │   │   ├── (labs)/           # Interactive Simulation & Experiment pages
│   │   │   ├── explore/          # Course/Syllabus exploration hub
│   │   │   ├── page.tsx          # Public Landing Page with auto-redirect check
│   │   │   └── layout.tsx        # Global Layout, Providers & Theme Context
│   │   ├── components/           # UI Components
│   │   │   ├── lab/              # Chatbot.tsx (AI Assistant widget)
│   │   │   ├── ui/               # AssistantBot.tsx, Button, Badge, Cards
│   │   │   ├── simulation/       # Subject Simulators
│   │   │   │   ├── dld/          # DLD Circuit Engine (CircuitCanvas, DldSidebar, NodeTypes)
│   │   │   │   ├── cn/           # Computer Networks Simulations (CSMA, OSI, Token, DVR, ARP)
│   │   │   │   ├── dbms/         # DBMS Operations & SQL Query Simulators
│   │   │   │   ├── daa/          # DAA Compiler & Algorithm Visualizer
│   │   │   │   ├── mpmc/         # 8086 Assembly Kit & Memory Map Simulator
│   │   │   │   └── core/         # LabTest.tsx (Assessment), CodeCompiler.tsx, WorkspacesPanel.tsx
│   │   │   ├── ExperimentPage.tsx# Core container for experiment sections (Aim, Theory, Procedure, Simulation, Test)
│   │   │   └── layout/           # PremiumNavbar, PremiumFooter
│   │   ├── lib/                  # Lab Registries, Circuit Engines & Utilities
│   │   └── styles/               # globals.css (Theme tokens, scrollbar hiding, keyframes)
```

---

## 3. Detailed UX Walkthrough & User Flows

### A. Landing & Onboarding Flow
1. **Public Landing Page (`/`)**:
   - Shows hero section with university alignment banner (MMMUT syllabus mapped).
   - Clean navigation bar (`PremiumNavbar.tsx`) with links to Features, Labs, Educators, and Login.
   - **Smart Redirect**: Automatically checks `vlab_access_token` and `vlab_user` in storage. If authenticated, redirects directly to `/dashboard`. If not, renders the public lander.

2. **Authentication Flow (`/login`, `/register`, `/verify`)**:
   - **Login**: Email/Password authentication. Sets HTTP-only / cookie token `vlab_access_token`.
   - **Register & OTP**: Triggers email OTP verification via backend Nodemailer service.
   - **Verification**: Dedicated 6-digit OTP code verification card (`/verify`).

---

### B. Dashboard & Subject Exploration (`/dashboard`)
1. **Student Dashboard (`StudentDashboard.tsx`)**:
   - Displays student name, enrolled semester, overall attendance percentage, completed practicals, and upcoming assessments.
   - Subject cards for Computer Networks, Digital Logic Design, DBMS, DAA, MPMC.
2. **Subject Module Page (`/dashboard/[subject]`)**:
   - Syllabus breakdown of experiments (Exp 01 to Exp 10).
   - Practical progress tracker and direct "Start Experiment" button.

---

### C. Experiment & Virtual Laboratory Flow (`ExperimentPage.tsx`)
When a student selects an experiment (e.g. DLD Exp 01 - AND/OR Gates), they enter the Experiment Interface.

#### 1. Non-Simulation Sections (Aim, Theory, Procedure)
- **Header**: Breadcrumbs `Dashboard > Subject Name > Experiment Title` (fully clickable links).
- **Left Sidebar**: Navigation tabs: `Aim`, `Theory`, `Procedure`, `Simulation`, `Test`.
- **Content Area**: Detailed theory breakdown, mathematical equations, algorithm steps, and learning objectives.

#### 2. Interactive Simulation Mode (`activeSection === "simulation"`)
Clicking **"Start Simulation"** enters the immersive fullscreen simulation view:
- **Top Navigation Bar**:
  - **Left**: Left-aligned brand text format: `Subject: Exp 0x Experiment Title` (e.g., `Digital Logic Design: Exp 01 AND & OR Gate Logic`).
  - **Center**: Clean, uncluttered layout.
  - **Right**:
    - **Zoom Controls** (rendered for canvas-based labs like DLD): Icon buttons (`-` and `+`) with live percentage display (`100%`) in between.
    - **Exit Simulation Button**: Green square icon button (`<i className="bx bx-log-out" />`) to exit fullscreen mode.

#### 3. Digital Logic Design (DLD) Canvas Engine (`CircuitCanvas.tsx` & `DldSidebar.tsx`)
- **Non-Floating Left Sidebar (`DldSidebar.tsx`)**:
  - **Components Tab**: Categorized expandable drawers for Input/Output (Switches, LEDs, Hex Display), Logic Gates (AND, OR, NOT, NAND, NOR, XOR, XNOR), and Integrated Circuits (MUX, DEMUX, Decoder, Encoder, Flip-Flops).
  - **Truth & K-Map Analysis Tab**: Live auto-generated Truth Table, K-Map analysis, and Excitation Table.
  - **Custom Theme-Consistent Dropdowns**: Replaced native HTML `<select>` with React state-driven dropdown popups to prevent OS-level blue selection highlights.
- **Canvas (`CircuitCanvas.tsx`)**:
  - Dotted canvas grid (white background in Light Mode, dark gray `#0d1526` in Dark Mode).
  - Clean signal propagation wire connections between gates and LEDs.
  - No floating canvas menu buttons or attribution watermarks.

#### 4. AI Assistant Chatbot (`Chatbot.tsx` & `AssistantBot.tsx`)
- **Floating Robot Trigger Widget**: Bottom-right floating assistant trigger.
- **Chat Dialog**:
  - Clean theme-consistent dialog (pure white in Light Mode, dark gray in Dark Mode).
  - Uses project theme variables (`bg-card`, `bg-background`, `text-foreground`, `border-border`).
  - Powered by Groq AI API backend for contextual lab guidance.

#### 5. Online Lab Assessment (`LabTest.tsx`)
- **Instructions Banner**: Gradient header banner (`from-[#021D24] to-[#059669]`).
- **Interactive Quiz Engine**: 30 multiple-choice questions, live countdown timer, question palette grid, and tab-switching warning monitor.
- **Redesigned Test Result Page**:
  - Circular percentage score indicator (Green for Pass ≥60%, Red for Fail).
  - Score breakdown bar chart (Correct, Wrong, Skipped).
  - Metric detail cards (Correct, Wrong, Skipped, Time Taken).
  - CTAs for "Review Answers" and "Retake Test".

---

## 4. GEMINI.md Learned Rules Compliance

All code changes strictly comply with `GEMINI.md`:
1. **GEMINI.md Inspected**: Always checked prior to task execution.
2. **Colors**: No dark blue `#021D24` across chatbot, cards, or canvas backgrounds; uses system theme tokens (white in light mode, dark gray in dark mode).
3. **Overview Card Gradients**: Uses green/emerald gradients (`from-[#021D24] to-[#059669]`).
4. **Single Left Sidebar**: DLD components & truth table consolidated into a single non-floating left sidebar.
5. **Zoom Controls & Header**: Zoom controls placed left of exit button with percentage indicator; top nav header format `Subject: Exp 0x Title`.
6. **No Sub-Nav Clutter**: Removed extra `simulation/comparison/quiz` top sub-tabs inside non-DLD labs.
7. **Breadcrumbs**: Clickable routing links for `Dashboard > Subject > Experiment`.
8. **Typography**: Uses standard hyphens (`-`) instead of em-dashes (`—`).
9. **Invisible Scrollbars**: Global `-ms-overflow-style: none`, `scrollbar-width: none`, and `::-webkit-scrollbar { display: none }` across the site.
10. **Custom Dropdowns**: Uses custom state-driven React dropdowns instead of native HTML `<select>` elements.
