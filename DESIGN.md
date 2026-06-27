# Design

Visual system for the Sin Rueda Tecnológica landing. Dark-first with a real light theme. Follows the DESIGN.md spec.

## Theme

Dual theme, user-selectable, persisted to `localStorage`, defaults to `prefers-color-scheme`. Dark is the hero (the product art is dark-native); light is a fully-designed alternate, not an afterthought. The brand's electric blue→cyan carries identity in both.

Physical scene: a developer at their desk late, dark editor open, the one bright thing on screen is a cyan accent. That's the brand — a calm dark surface with one confident electric signal.

## Color

OKLCH throughout. Brand color is identity-preserved from the existing logo and banner (electric blue → cyan), not invented.

### Dark theme (default)
- `--bg`: `oklch(0.17 0.018 250)` — deep blue-charcoal, not pure black; carries a faint brand-hue tint so it reads as "the brand's dark," not generic.
- `--surface`: `oklch(0.21 0.020 250)` — cards/panels.
- `--surface-2`: `oklch(0.25 0.022 250)` — raised/hover.
- `--border`: `oklch(0.30 0.020 250)`.
- `--ink`: `oklch(0.96 0.005 250)` — primary text (≥7:1).
- `--muted`: `oklch(0.72 0.012 250)` — secondary text (≥4.5:1).
- `--primary`: `oklch(0.70 0.165 245)` — electric blue, the CTA/brand fill.
- `--accent`: `oklch(0.82 0.155 195)` — cyan, the second signal (gradients, glows, highlights).
- Brand gradient: `linear-gradient(135deg, --primary → --accent)` — the banner's blue→cyan, used sparingly (logo glow, hero accent, primary CTA).

### Light theme
- `--bg`: `oklch(1.000 0 0)` — pure white (let primary carry warmth/coolness).
- `--surface`: `oklch(0.975 0.004 245)`.
- `--surface-2`: `oklch(0.955 0.006 245)`.
- `--border`: `oklch(0.90 0.008 245)`.
- `--ink`: `oklch(0.22 0.020 250)` (≥7:1).
- `--muted`: `oklch(0.46 0.020 250)` (≥4.5:1).
- `--primary`: `oklch(0.55 0.175 250)` — darker electric blue for white-bg contrast; white text on fill.
- `--accent`: `oklch(0.62 0.135 205)` — cyan, darkened so it can carry text/icons on white.

Text on primary/accent fills: white (`--ink` inverse), per Helmholtz-Kohlrausch. Product cards keep their own dark artwork in both themes (framed on a surface).

Strategy: **Committed** — one electric blue-cyan identity carries the whole surface in dark; in light it concentrates into CTAs, links, and accents.

## Typography

Brand voice: direct, capable, friendly. Avoided reflex defaults (Inter, Space Grotesk).

Three-axis pairing (characterful display + neutral body + technical mono):
- **Display / headings**: **Bricolage Grotesque** — a contemporary, slightly idiosyncratic grotesque with warmth and bite. Friendly + capable without being a reflex default (not Inter / Space Grotesk / Geist-everywhere). Carries every h1–h3, card title, step title, CTA.
- **Body / UI**: **Geist** — clean, highly legible neo-grotesk for paragraphs, nav, buttons, labels. Recedes so Bricolage leads.
- **Technical accent**: **JetBrains Mono** — prices, stack tags, code-flavored kickers (`// stack`), the step numbers. Legitimate here: this is a code shop, mono is the subject matter, not costume. Sparing, never body copy.

No gradient text anywhere — emphasis is solid `--primary`, weight, and size (gradient-on-text is a banned tell).
- Scale: fluid `clamp()`, ratio ≥1.25. Hero `clamp(2.5rem, 6vw, 4.5rem)` (ceiling ≤6rem). `text-wrap: balance` on h1–h3, `pretty` on prose.
- Display letter-spacing: `-0.03em` (≥ -0.04em floor).

## Layout

- Max content width ~1200px, fluid `clamp()` gutters.
- Products: `grid-template-columns: repeat(auto-fit, minmax(240px, 1fr))` — breakpoint-free.
- Process (3 steps): a genuine numbered sequence (01→02→03 earns its numbers — it IS an ordered flow).
- Asymmetric hero: copy left, founder/banner art right (stacks on mobile).
- Semantic z-index scale.

## Motion

- One orchestrated hero entrance (staggered, ease-out-expo). Section reveals via `IntersectionObserver` enhancing already-visible content (no visibility gating).
- Card hover: lift + cyan glow border.
- Theme toggle: smooth crossfade of color tokens.
- Full `prefers-reduced-motion: reduce` path (instant, no transforms).

## Components

Header (sticky, blurred, logo + nav + theme toggle), hero, product card (dark artwork + stack tag + price + Ver producto), value-prop band, numbered process, tech-stack marquee/row, founder card, FAQ accordion (native `<details>`), footer.
