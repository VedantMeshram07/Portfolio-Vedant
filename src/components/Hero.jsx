import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { PRELOAD_FADE_START } from './Awakening.jsx';
import RightColumn from './RightColumn.jsx';

/**
 * Hero.jsx — Architecture Zero: The 70 / 30 Split
 * --------------------------------------------------------------------
 *  The first thing the user sees after Awakening hands off.
 *
 *  Layout
 *  ──────
 *  • Left 70%   — cement. Holds the massive 3-line identity block
 *                 (FULL STACK / AI & BACKEND / ENGINEER) and the two
 *                 top-corner labels (name, get-in-touch).
 *  • Right 30%  — obsidian. RightColumn owns its own width/min-h
 *                 (md:w-[30%] min-h-screen) so it composites cleanly
 *                 with the flex row.
 *
 *  Animation
 *  ─────────
 *  The identity lines + top labels slam in at PRELOAD_FADE_START so
 *  they hit the page at the exact moment the preloader hard-cuts —
 *  the handoff reads as one continuous reveal, not a fade-then-pop.
 * --------------------------------------------------------------------
 */

const TAGLINE_LINES = ['FULL STACK', 'AI & BACKEND', 'ENGINEER']

const Hero = () => {
  const leftRef = useRef(null)
  const topLeftRef = useRef(null)
  const topRightRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Identity lines slam upward into place
      gsap.from('.tagline-line', {
        y: 80,
        opacity: 0,
        duration: 0.7,
        ease: 'power4.out',
        stagger: 0.1,
        delay: PRELOAD_FADE_START,
      })
      // Top corner labels drop in
      gsap.from([topLeftRef.current, topRightRef.current], {
        y: -16,
        opacity: 0,
        duration: 0.5,
        ease: 'power2.out',
        stagger: 0.08,
        delay: PRELOAD_FADE_START,
      })
    }, leftRef)
    return () => ctx.revert()
  }, [])

  return (
    <section className="relative w-full min-h-screen flex flex-col md:flex-row">
      {/* Left 70% — cement editorial slab */}
      <div
        ref={leftRef}
        className="relative w-full md:w-[70%] bg-[#D4D3D0] text-[#0A0A0A] px-6 md:px-12 py-6 md:py-10 flex flex-col min-h-screen"
      >
        {/* Top corner labels */}
        <header className="flex justify-between items-start font-sans-brutal text-[10px] md:text-xs tracking-[0.3em] uppercase font-medium">
          <span ref={topLeftRef}>Vedant Meshram</span>
          <span ref={topRightRef} data-cursor="hover">Get in touch ↗</span>
        </header>

        {/* Identity block — Anton 3-line, medium weight. The main
            thing the page is about.
            • font-medium (500) — quieter than bold; lets the type
              sit calmly in the slab instead of punching.
            • justify-end + tight bottom pad — pins the block to the
              floor of the first viewport, with just a hair of
              breathing room from the edge.
            • leading-[1.0] — Anton's full vertical extent is ~1.0×
              font-size, so 1.0 is the tightest no-overlap setting:
              lines sit flush, no visible gap. */}
        <div className="flex-1 flex flex-col items-start justify-end font-sans-brutal uppercase font-medium tracking-tighter leading-[1.0] text-[clamp(3rem,10vw,9rem)] pb-2 md:pb-4">
          {TAGLINE_LINES.map((line, i) => (
            <div key={i} className="tagline-line" data-cursor="hover">
              {line}
            </div>
          ))}
        </div>
      </div>

      {/* Right 30% — obsidian. RightColumn owns its own width + min-h. */}
      <RightColumn />
    </section>
  )
}

export default Hero