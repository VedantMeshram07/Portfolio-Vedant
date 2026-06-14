import { useEffect, useRef } from 'react'
import gsap from 'gsap'

// Moment the preloader starts fading to the landing page. Hero.jsx
// imports this so its kinetic text "slam" stays in sync with the
// preloader handoff. Single source of truth.
//   0.0–4.0s  loading   (counter fills slowly, 0 → 100,
//                       power2.inOut, 4.0s — the only animation)
//   4.0s      fade      (counter + overlay fade out together,
//                       0.4s, power2.in — short, clean handoff)
//   4.4s      handoff   (overlay autoAlpha 0, onComplete fires,
//                       parent setIsLoaded(true), Awakening
//                       unmounts, landing page visible)
export const PRELOAD_FADE_START = 4.0

/**
 * Awakening.jsx — Architecture Zero: The Preloader & Timeline
 * --------------------------------------------------------------------
 *  Master timeline (fires on mount, after fonts.ready):
 *
 *    0.0s - 4.0s   Loading (the only animation in the preloader)
 *                  • CounterText    0 → 100        (power2.inOut, 4.0s)
 *                                  → slow, deliberate count. The
 *                                    preloader is just a number on
 *                                    cement. No ball, no drop, no
 *                                    bounce, no colour shift. Pure
 *                                    brutalist restraint.
 *
 *    4.0s          Fade Out (0.4s, power2.in)
 *                  • CounterText + Overlay fade together
 *                                  → short, clean exit. Counter
 *                                    rises 20px and fades; overlay
 *                                    fades to transparent.
 *
 *    4.4s          Handoff
 *                  • onComplete → parent's setIsLoaded(true)
 *                                 (Awakening unmounts; landing page
 *                                  is already rendered behind the
 *                                  overlay, so it appears as the
 *                                  overlay fades. No elaborate ball
 *                                  → cursor handoff — just cement
 *                                  → hero.)
 * --------------------------------------------------------------------
 */
const Awakening = ({ onComplete }) => {
  const overlayRef = useRef(null)
  const counterRef = useRef(null)
  const counterVal = useRef({ n: 0 })

  useEffect(() => {
    let tl = null
    let cancelled = false

    // Atomic write of the integer counter — no React re-renders
    // means no chance of a half-stepped frame.
    const writeCounter = () => {
      if (!counterRef.current) return
      counterRef.current.textContent = String(Math.round(counterVal.current.n))
    }

    const start = () => {
      if (cancelled) return
      writeCounter()

      tl = gsap.timeline()

      // ── 0.0s — Loading (4.0s) ─────────────────────────────────
      // Counter 0 → 100. The only animation in the preloader.
      // Long duration lets the user actually watch the count,
      // not just see it flash past. power2.inOut = slow start,
      // fast middle, slow end — reads as deliberate, not rushed.
      tl.to(
        counterVal.current,
        {
          n: 100,
          duration: 4.0,
          ease: 'power2.inOut',
          onUpdate: writeCounter,
        },
        0,
      )

      // ── 4.0s — Fade Out (0.4s, power2.in) ─────────────────────
      // Counter and overlay fade together. Counter rises 20px
      // as it fades (subtle "exiting upward" gesture). Overlay
      // fades to transparent. Short, clean handoff to the
      // landing page — no elaborate ball drop, bounce, or
      // colour transition. Just cement → hero.
      tl.to(
        [counterRef.current, overlayRef.current],
        {
          autoAlpha: 0,
          y: -20,
          duration: 0.4,
          ease: 'power2.in',
          onComplete: () => onComplete?.(),
        },
        4.0,
      )
    }

    // Wait for fonts so the massive counter glyphs don't swap
    // mid-tween.
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(start)
    } else {
      start()
    }

    // Safety net: if for any reason the GSAP timeline is stuck
    // (fonts.ready never resolves, ticker is paused, etc.) the
    // overlay must still hand off so the user can see the Hero.
    // 5.5s = 4.0s (counter) + 0.4s (fade) + 1.1s grace.
    const safetyId = setTimeout(() => {
      if (cancelled) return
      onComplete?.()
    }, 5500)

    return () => {
      cancelled = true
      clearTimeout(safetyId)
      if (tl) tl.kill()
    }
  }, [onComplete])

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[60] bg-[#D4D3D0] flex items-center justify-center overflow-hidden"
    >
      {/* CounterText — massive sans, obsidian on cement. The sole
          element in the preloader. No ball, no animation beyond
          the count itself. Pure brutalist restraint: one number,
          one background, one job. */}
      <div
        ref={counterRef}
        className="font-sans-brutal text-[#0A0A0A] text-[clamp(4rem,16vw,13rem)] leading-none tracking-[-0.02em] select-none tabular-nums"
      >
        0
      </div>
    </div>
  )
}

export default Awakening