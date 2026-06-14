# Vedant Meshram — Portfolio

A brutalist, continuous-scroll portfolio. React + Vite + Tailwind + GSAP + Lenis.

## Stack

- **React 18** + **Vite 5** (JavaScript / JSX)
- **Tailwind CSS 3** for utility styling
- **GSAP 3** + **ScrollTrigger** for animations
- **@studio-freight/lenis** for smooth scrolling
- Type pairing: **Anton** (display) + **Instrument Serif** (editorial)

## Getting started

```bash
npm install
npm run dev
```

The dev server boots at <http://localhost:5173>.

## Phase 1 — Foundation

- `src/index.css` — global brutalist CSS variables + scrollbar hiding + Lenis base styles
- `src/App.jsx` — Lenis + GSAP ticker sync, scroll-locking during the preloader
- `src/components/Awakening.jsx` — fixed preloader (00 → 99 → "Silence." → split reveal)
- `src/components/Hero.jsx` — first viewport with placeholder `<video>` background

## Adding the hero video

Drop a background clip at `public/hero-bg.mp4`. The `<video>` tag in
`Hero.jsx` references it directly. An optional poster image can be
uncommented (`poster="/hero-poster.jpg"`) for a smoother first paint.

## Roadmap

- **Phase 2** — R3F shader background replacing the placeholder `<video>`
- **Phase 3+** — additional scroll-driven sections
