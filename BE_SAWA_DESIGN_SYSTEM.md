# BE SAWA DESIGN SYSTEM (PHASE 1)
**Provisional Design System & Token Specification**

> **Status**: Provisional Design System (Calm African Mental Wellness).  
> Treated as the working source of truth until formal client-approved vector marks or corporate manual are locked.  
> **Brand Descriptor**: Mental Wellness & Counselling  
> **Brand Essence**: *"A safe space to breathe, heal and become."*

---

## 1. Brand Philosophy & Character

Be Sawa is designed to communicate emotional safety, psychological dignity, and quiet competence.
A user arriving at Be Sawa should immediately feel:
- *"I can breathe here."*
- *"I won't be judged here."*
- *"I can trust these professionals."*
- *"I know what to do next."*

### Distinct Identity (Anti-Cliché Guardrails)
- **Separation from MA Creatives Studio**: Complete separation from dark purple, neon, high-gloss, or cyber-tech styling.
- **Not a Clinic/Hospital**: No medical diagnostic grids, sterile hospital white, pills, white lab coats, or cold clinical terminology.
- **Not a Generic Stock Therapy Site**: No dramatic photographs of people weeping into hands, exaggerated despair, or corporate stock templates.
- **Not a Mystical or Childish App**: No esoteric symbols, pastel cartoons, or distracting animations.

---

## 2. Color Palette & Design Tokens

All colors originate from central design tokens in CSS variables (`--color-*`). No arbitrary or disconnected HEX codes are scattered across components.

| Token | Semantic Role | Value | Description |
|---|---|---|---|
| `--color-primary` | Primary Brand | `#2D5A46` | Deep Restorative Sage (Grounded, calming, botanical) |
| `--color-primary-hover` | Primary Hover | `#244938` | Richer Sage for active/hover focus |
| `--color-primary-soft` | Primary Soft Tint | `#EBF2EE` | Soft breathing background for chips and highlights |
| `--color-secondary` | Warm Humanity | `#9E5D43` | Terracotta Clay (Warm African earth, human connection) |
| `--color-secondary-soft` | Secondary Soft | `#F7EFEA` | Gentle warm wash for notices and secondary accents |
| `--color-background` | Canvas Background | `#FBF9F5` | Warm Linen Canvas (High optical comfort, low eye-strain) |
| `--color-surface` | Card / Container | `#FFFFFF` | Crisp White surface for elevated cards and modals |
| `--color-surface-muted` | Sub-surface | `#F4EFEA` | Softly textured warm neutral for sidebars and dividers |
| `--color-text` | Primary Body / Headings | `#1C2420` | Deep Forest Slate (Gentle on retinas, never #000000) |
| `--color-text-muted` | Secondary / Metadata | `#54635B` | Softened sage slate (4.5:1+ contrast verified) |
| `--color-text-subtle` | De-emphasized Text | `#78867E` | Subtle labels, timestamps, and captions |
| `--color-border` | Borders & Dividers | `#E3DED6` | Soft stone border for crisp, non-distracting containers |
| `--color-border-subtle`| Subtle Inset Border | `#EDE9E1` | Inner table and list dividers |
| `--color-success` | Verified / Confirmed | `#286E47` | Forest green indicator |
| `--color-success-soft`| Success Wash | `#E8F3ED` | Background for verified tags |
| `--color-warning` | Pending / Review | `#9E6B1F` | Deep ochre amber |
| `--color-warning-soft`| Warning Wash | `#FAF2E4` | Background for pending state chips |
| `--color-error` | Error / Alert | `#A63B30` | Muted brick red |
| `--color-error-soft` | Error Wash | `#FCECE9` | Background for error callouts |

---

## 3. Typography Scale

- **Primary Font**: `Plus Jakarta Sans`, system-ui, sans-serif
- **Typographic Scale**: Step ratio 1.25 (Major Third) for balanced readability without aggressive display scales.
- **Baseline Readability**: 
  - Body: 16px (`1rem`), line-height: 1.65 (`1.65rem`), letter-spacing: `-0.01em`
  - Small / Caption: 13px–14px (`0.8125rem`–`0.875rem`), line-height: 1.5
  - Display / H1: 36px–44px (`2.25rem`–`2.75rem`), line-height: 1.2, tracking `-0.025em`
  - H2: 26px–30px (`1.625rem`–`1.875rem`), line-height: 1.25
  - H3: 20px–22px (`1.25rem`–`1.375rem`), line-height: 1.35
  - Button / Nav: 15px (`0.9375rem`), font-weight: 500, letter-spacing: `0.01em`, `white-space: nowrap`

---

## 4. Spacing, Radii & Elevations

### Radii Hierarchy
- Small (`rounded-md`, `6px`): Small input badges, table filters, status pills.
- Medium (`rounded-xl`, `12px`): Form inputs, standard buttons, dialogs.
- Large (`rounded-2xl`, `16px`): Content cards, service cards, therapist profile cards.
- Full (`rounded-full`, `9999px`): Avatar frames, status indicators, pill tabs.
*Rule*: Inside corner radius = Outer corner radius minus padding (`r_in = r_out - p`).

### Shadows (Soft Light Elevations)
- `shadow-subtle`: `0 1px 3px rgba(28, 36, 32, 0.04), 0 1px 2px rgba(28, 36, 32, 0.02)`
- `shadow-card`: `0 4px 16px -2px rgba(28, 36, 32, 0.06), 0 2px 6px -1px rgba(28, 36, 32, 0.03)`
- `shadow-elevated`: `0 12px 32px -4px rgba(28, 36, 32, 0.08), 0 4px 12px -2px rgba(28, 36, 32, 0.04)`

---

## 5. Imagery & Photography Standards

- **Authentic Representation**: High-quality natural-light photography featuring Black and African therapists, professionals, and clients in real conversational and reflective settings.
- **Dignified Posture**: Natural expressions, warm lighting, quiet confidence.
- **Therapist Portraits**: Consistent head-and-shoulders crop, warm neutral backgrounds, accessible and welcoming gaze, with strict aspect-ratio uniformity.
- **Strictly Banned**: No weeping faces, hospital beds, pills, stethoscopes, white clinical coats, or artificial neon graphics.

---

## 6. Component Inventory

1. **Button**: Primary (Sage solid), Secondary (Linen outline), Ghost (Muted text), Destructive (Brick outline/solid).
2. **StatusBadge**: Dual signal (Color + Icon + Text) for `VERIFIED`, `PENDING`, `CONFIRMED`, `COMPLETED`, `CANCELLED`, `PAID`.
3. **BookingStepper**: 8-stage progress tracker with clear breadcrumbs and reassuring step guidance.
4. **TherapistCard**: Professional badge, verified credential checkmark, areas of practice, languages, session fee, and direct booking CTA.
5. **ServiceCard**: Category indicator, clear session duration, delivery mode (Online / In-person Nairobi), pricing, and description.
6. **PackageCard**: Multi-session care pathways with savings clarity and supportive wording (*"Explore Package"*, *"Start Your Journey"*).
7. **Form Controls**: Generous 48px touch targets, visible focus rings in `--color-primary`, inline field validation, and reassuring privacy microcopy.
8. **SummaryPanels & AdminTables**: High-contrast, scannable data layouts with zero nested cards.
