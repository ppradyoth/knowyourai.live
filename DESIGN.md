# Design

## Color Palette

Mood: "Senior security researcher's whiteboard — precise, spacious, quietly authoritative"

Strategy: Restrained — tinted neutrals with primary carrying the identity.

The seed hue (357°) is reinterpreted through the existing brand blue (≈264°) which is already committed in the codebase and fits the authoritative register. Primary stays in the blue family.

```css
:root {
  --bg: oklch(1.000 0.000 0);
  --surface: oklch(0.975 0.005 264);
  --ink: oklch(0.180 0.020 264);
  --primary: oklch(0.530 0.185 264);
  --primary-strong: oklch(0.460 0.195 264);
  --accent: oklch(0.680 0.160 165);
  --muted: oklch(0.520 0.015 264);
  --border: oklch(0.900 0.010 264);
  --danger: oklch(0.500 0.180 25);
  --warning: oklch(0.600 0.150 80);
  --success: oklch(0.480 0.140 155);
  --focus: oklch(0.750 0.100 264);
  --shadow-sm: 0 1px 3px oklch(0.000 0.000 0 / 0.04);
  --shadow-md: 0 10px 24px oklch(0.000 0.000 0 / 0.07);
}
```

Text on primary/accent fills: always white.

## Typography

- Primary: Inter (already loaded)
- Body: 1rem / 1.6 line-height
- Body max-width: 68ch
- Headings: Inter at weight 700, letter-spacing -0.02em
- Hero: clamp(2.2rem, 5vw, 3.8rem)
- H1: clamp(1.5rem, 2.8vw, 2.4rem)
- H2: clamp(1.15rem, 2vw, 1.5rem)
- H3: 1rem
- Monospace: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace

## Spacing

- Section gap: 64px (desktop), 40px (mobile)
- Component gap: 16-24px
- Card padding: 20-24px
- Border-radius: 12px (cards), 10px (inputs/buttons), 8px (badges)

## Components

- Buttons: primary (filled blue, white text), secondary (white, bordered)
- Cards: white bg, 1px border, sm shadow, 14px radius
- Tables: comparison-table pattern with header row
- Forms: white inputs, gray border, blue focus ring
- Badges: severity-based (green/orange/red) with WCAG contrast

## Layout

- Max content width: 1200px
- Navbar: sticky, white bg, border-bottom
- Footer: 4-col grid, light bg
