# Mouseion Design System

A design reference for building the Mouseion Web GUI, combining Swiss Typography principles with an Academic Fintech aesthetic suited to a reversible transaction blockchain.

---

## 1. Color Palette

### Core Colors

| Role | Hex | Usage |
|---|---|---|
| **Primary (Slate)** | `#1e293b` | Headings, primary text |
| **Accent (Amber)** | `#d97706` | CTAs, interactive highlights |
| **Success (Emerald)** | `#059669` | Confirmations, FINALIZED state |
| **Danger (Rose)** | `#e11d48` | Errors, CANCELLED/RECOVERED state |

### Backgrounds & Surfaces

| Role | Hex | Usage |
|---|---|---|
| **Background** | `#fafaf9` | Light mode base |
| **Dark Background** | `#0f172a` | Dark mode base |
| **Surface** | `#ffffff` | Cards, dialogs, overlays |
| **Border** | `#e2e8f0` | Dividers, card borders, input outlines |
| **Muted** | `#64748b` | Secondary text, captions, metadata |

---

## 2. Typography

### Font Families

| Category | English | Japanese | Usage |
|---|---|---|---|
| **Serif Headings** | Fraunces | Noto Serif JP | h1--h3, hero text, feature titles |
| **Sans Body** | Inter | Noto Sans JP | Body copy, labels, UI elements, navigation |
| **Monospace** | JetBrains Mono | JetBrains Mono | Wallet addresses, transaction hashes, token amounts |

### Type Scale

```
12px  — Caption, fine print
14px  — Small body, labels, metadata
16px  — Base body text (1rem)
18px  — Large body, lead paragraphs
20px  — h4, sub-section headings
24px  — h3, section headings
30px  — h2, page titles
36px  — h1, major headings
48px  — Display, hero text
```

### Line Heights

| Token | Value | Usage |
|---|---|---|
| `tight` | 1.25 | Headings, display text |
| `normal` | 1.5 | Body text, paragraphs |
| `relaxed` | 1.75 | Long-form reading, documentation |

---

## 3. Spacing & Grid

### Base Unit

All spacing derives from an **8px base unit**. Use multiples and half-steps for consistent rhythm.

### Spacing Scale

```
 4px  — Tight gaps, inline spacing
 8px  — Base unit, minimum padding
12px  — Compact component padding
16px  — Standard gap, paragraph spacing
24px  — Card padding, section inner spacing
32px  — Section spacing
48px  — Large section breaks
64px  — Page-level spacing
96px  — Hero and major section separation
```

### Layout

| Property | Value |
|---|---|
| Content max-width | 1280px |
| Sidebar width (expanded) | 256px |
| Sidebar width (collapsed) | 64px |
| Card padding | 24px |
| Grid system | 12-column, responsive |

### Responsive Breakpoints

```
sm:  640px   — Mobile landscape
md:  768px   — Tablets
lg:  1024px  — Small desktops
xl:  1280px  — Standard desktops
2xl: 1536px  — Large displays
```

---

## 4. Transaction State Colors

Transaction states are the most critical visual element of the Mouseion interface. Each state must be immediately distinguishable.

| State | Light Mode | Dark Mode | Meaning |
|---|---|---|---|
| **PENDING** | amber-500 `#f59e0b` | amber-400 | Awaiting confirmation |
| **FINALIZED** | emerald-500 `#10b981` | emerald-400 | Completed successfully |
| **CANCELLED** | rose-500 `#f43f5e` | rose-400 | Cancelled by sender |
| **FROZEN** | blue-500 `#3b82f6` | blue-400 | Under guardian review |
| **RECOVERED** | rose-600 `#e11d48` | rose-500 | Funds recovered |

### Usage Guidelines

- Always display the state label alongside the color indicator to avoid reliance on color alone.
- Use filled badges for active/current states and outlined badges for historical states.
- In lists and tables, apply a subtle left-border or dot indicator using the state color.

---

## 5. Component Patterns

### Card

- Background: white (`#ffffff`)
- Border: 1px solid `#e2e8f0`
- Border radius: 8px
- Padding: 24px
- Hover: subtle elevation (box-shadow `0 4px 12px rgba(0,0,0,0.08)`)
- Transition: `box-shadow 150ms ease`

### Badge

- Shape: pill (fully rounded)
- Background: state color at 10% opacity
- Text color: state color (full)
- Font size: 12px
- Padding: 4px horizontal, 8px vertical
- Font weight: 600

### Button Primary

- Background: accent `#d97706`
- Text: white `#ffffff`
- Border radius: 8px
- Padding: 10px 20px
- Hover: darken background to `#b45309`
- Active: darken further to `#92400e`
- Disabled: opacity 0.5, cursor not-allowed

### Button Secondary

- Background: transparent
- Border: 1px solid `#e2e8f0`
- Text: primary `#1e293b`
- Border radius: 8px
- Padding: 10px 20px
- Hover: background `#f8fafc`
- Active: background `#f1f5f9`

### Input

- Height: 40px
- Border: 1px solid `#e2e8f0`
- Border radius: 8px
- Padding: 0 12px
- Focus: ring 2px accent `#d97706` with 30% opacity
- Placeholder color: `#94a3b8`

### Dialog

- Alignment: centered overlay
- Max-width: 480px
- Padding: 24px
- Border radius: 12px
- Backdrop: black at 50% opacity with `backdrop-filter: blur(4px)`
- Entry animation: scale from 0.95 with fade-in

### Toast

- Position: bottom-right, 24px from edges
- Auto-dismiss: 5 seconds
- Left border: 4px solid, colored by state
- Background: surface white
- Border radius: 8px
- Shadow: `0 4px 16px rgba(0,0,0,0.12)`
- Entry animation: slide-in from right

---

## 6. Accessibility

### Contrast

- All text must meet **WCAG 2.1 AA** contrast ratios.
  - Normal text: minimum 4.5:1
  - Large text (18px+ or 14px bold): minimum 3:1
- State colors have been selected to meet contrast requirements against both light and dark backgrounds.

### Focus States

- All interactive elements must display a visible focus outline when navigated via keyboard.
- Focus ring: 2px solid accent color with 2px offset.
- Never remove focus outlines; restyle them instead of hiding them.

### Keyboard Navigation

- All functionality must be accessible via keyboard alone.
- Logical tab order following visual layout.
- Dialogs trap focus within their boundary until dismissed.
- Escape key closes dialogs and dropdowns.

### Screen Readers

- All icon-only buttons must include `aria-label` attributes.
- Transaction state badges must include `aria-label` with the full state description.
- Dynamic content changes must use `aria-live` regions.
- Form inputs must have associated `<label>` elements.

### Motion

- Respect `prefers-reduced-motion` media query.
- When reduced motion is preferred, replace animations with instant state changes.
- All transitions must complete within 200ms for non-decorative motion.

---

## 7. Dark Mode

Dark mode uses deeper slate tones to maintain the academic aesthetic while reducing eye strain.

### Dark Mode Palette

| Role | Hex |
|---|---|
| **Background** | `#0f172a` |
| **Surface** | `#1e293b` |
| **Border** | `#334155` |
| **Primary Text** | `#f8fafc` |
| **Muted Text** | `#94a3b8` |

### Color Adjustments

- All transaction state colors shift to their `-400` variants for improved contrast on dark surfaces.
- Accent amber remains high-contrast on dark backgrounds.
- Success and danger colors lighten to maintain readability.

### Implementation Notes

- Use `prefers-color-scheme: dark` media query for automatic detection.
- Provide a manual toggle stored in `localStorage` to allow user override.
- Transition between modes smoothly using `transition: background-color 200ms ease, color 200ms ease`.
- Avoid pure black (`#000000`); prefer deep slate tones for a softer appearance.

---

## References

- [Swiss Style / International Typographic Style](https://en.wikipedia.org/wiki/International_Typographic_Style)
- [WCAG 2.1 Guidelines](https://www.w3.org/TR/WCAG21/)
- [Tailwind CSS Color Reference](https://tailwindcss.com/docs/colors)
