# MUJ Online Manipal — Design System & UI Specification

---

## 1. Overview

This document defines the complete UI/UX system for the MUJ Online Manipal website.

### Core Objectives
- Maximize user conversion (lead generation + enrollments)
- Build trust through institutional design
- Maintain clarity and accessibility across devices

### Design Principles
- Clarity over creativity
- Consistency over experimentation
- Trust-driven visuals
- Structured storytelling via sections

---

## 2. Design Tokens

### 2.1 Color System

#### Primary Colors
- Navy Blue: #0B1F3F
- Deep Blue: #102A43

#### Accent Colors
- Orange (CTA): #F36F21

#### Neutral Colors
- White: #FFFFFF
- Light Grey Background: #F5F7FA
- Border Grey: #E5E7EB
- Text Dark: #1F2937
- Text Muted: #6B7280

#### Usage Rules
- Primary CTAs must always be Orange
- Dark sections use white text only
- Alternate section backgrounds (light/dark)

---

### 2.2 Typography

#### Font Family
- Primary: Inter / Roboto / Open Sans (fallback: sans-serif)

#### Scale

| Element | Size | Weight | Line Height |
|--------|------|--------|-------------|
| H1 | 48px | 700 | 1.2 |
| H2 | 36px | 600 | 1.3 |
| H3 | 24px | 500 | 1.4 |
| Body Large | 18px | 400 | 1.6 |
| Body | 16px | 400 | 1.6 |
| Small | 14px | 400 | 1.5 |

#### Rules
- Headings use tighter line-height
- Body text optimized for readability
- Avoid long paragraphs (>3 lines)

---

### 2.3 Spacing System

Base unit: 8px

| Token | Value |
|------|------|
| xs | 8px |
| sm | 16px |
| md | 24px |
| lg | 32px |
| xl | 48px |
| xxl | 80px |
| section | 100px |

---

### 2.4 Border Radius

- Small: 6px
- Medium: 10px
- Large: 16px

---

### 2.5 Shadows

```css
box-shadow: 0px 4px 20px rgba(0,0,0,0.08);

Hover Shadow:

box-shadow: 0px 8px 30px rgba(0,0,0,0.12);
3. Layout System
Container
Max width: 1200px
Margin: auto (centered)
Padding: 16px (mobile), 24px (desktop)
Grid
12-column grid
Gutter: 24px
Section Structure
<section>
  <div class="container">
    content
  </div>
</section>
Section Spacing
Top: 80–120px
Bottom: 80–120px
4. Components
4.1 Navbar
Structure
Left: Logo
Center: Navigation links
Right: Login + CTA button
Behavior
Sticky on scroll
Transparent → solid background transition
Styles
Height: 64px
Border-bottom: 1px solid #E5E7EB
4.2 Buttons
Primary Button
Background: #F36F21
Text: #FFFFFF
Padding: 12px 24px
Border-radius: 8px
Font-weight: 600

Hover:

Darker orange
Scale: 1.02
Secondary Button
Background: transparent
Border: 1px solid #F36F21
Text: #F36F21
4.3 Cards
Base Card
Background: #FFFFFF
Border-radius: 10px
Padding: 24px
Shadow: default shadow

Hover:

TranslateY(-4px)
Stronger shadow
4.4 Input Fields
Border: 1px solid #E5E7EB
Padding: 12px
Border-radius: 6px

Focus:

Border color: #F36F21
Outline: none
Subtle glow
5. Page Sections
5.1 Hero Section
Layout
Two columns (text + image)
Content
H1 headline
Supporting paragraph
Primary CTA
Secondary CTA
Style
Background: dark/navy
Text: white
Animation
Fade-up text
Slide-in image
5.2 Programs Section
Layout
3–4 cards per row
Card Content
Icon/image
Title
Description
CTA
5.3 Stats Section
Layout
Horizontal grid
Style
Dark background
White text
Animation
Count-up numbers
5.4 Accreditation Section
Layout
Logo grid
Behavior
Grayscale → color on hover
5.5 Course Details
UI Pattern
Tabs OR accordion
Behavior
Smooth expand/collapse
Only one active section
5.6 Testimonials
Layout
Carousel/slider
Card
Student image
Quote
Name + course
5.7 Lead Form
Fields
Name
Email
Phone
Program
Behavior
Inline validation
CTA always visible
5.8 Footer
Style
Background: #0B1F3F
Text: white/grey
Layout
Multi-column links
6. Animations
Timing
Duration: 300ms
Easing: ease-in-out
Scroll Animations
Fade-up (opacity 0 → 1, translateY 20px → 0)
Staggered children (delay 0.1s each)
Hover Effects
Buttons: scale + color shift
Cards: lift + shadow increase
Sticky Behavior
Navbar sticks after scroll
Optional floating CTA
7. Responsiveness
Breakpoints
Device	Width
Mobile	<768px
Tablet	768–1024px
Desktop	>1024px
Mobile Adjustments
Stack columns vertically
Full-width buttons
Hamburger menu
8. UX Patterns
Conversion Optimization
Repeated CTA placement
Short forms
Clear value proposition
Trust Signals
Accreditation logos
Stats
Testimonials
Content Strategy
Chunked sections
Minimal text blocks
Visual hierarchy
9. Accessibility
Contrast ratio ≥ 4.5:1
Click targets ≥ 44px
Keyboard navigable
Alt text for images
10. Implementation Notes
Recommended Stack
React / Next.js
Tailwind CSS
Framer Motion
Example Tokens
colors: {
  primary: "#0B1F3F",
  accent: "#F36F21",
  background: "#F5F7FA"
}
11. Key Takeaways
Design prioritizes trust and conversion
Strong consistency across components
Minimal but effective animation usage
Section-based storytelling structure