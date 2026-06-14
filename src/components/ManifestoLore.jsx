import { useEffect, useRef, useMemo } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Magnetic from './Magnetic.jsx';
import BrutalistSlice from './BrutalistSlice.jsx';

gsap.registerPlugin(ScrollTrigger);

/**
 * ManifestoLore.jsx — Section 2: The 30 / 70 Zig-Zag (Obsidian Left)
 * -----------------------------------------------------------------------
 *  The mirror image of the Hero. Heavy mass swaps sides in the global
 *  left-right zig-zag rhythm:
 *
 *    Hero   (above) │ 70% cement │ 30% obsidian │
 *    Lore   (this)  │ 30% obsidian │ 70% cement │
 *    Quests (next)  │ 70% obsidian │ 30% cement │
 *
 *  Three cinematic effects
 *  ────────────────────────
 *  1. SHUTTER SHIFT  — The obsidian column is initially translated
 *     100% off-screen to the left AND its inner content is fully
 *     clipped (inset(0 100% 0 0)). Both animate to their final
 *     states in perfect lock-step at `start: "top 75%"` — no scrub.
 *     The clip uncovers content at exactly the rate the shutter moves,
 *     so text appears anchored in space while the box acts as a lens.
 *
 *  2. BRUTALIST SLICE — The "MANIFESTO" headline splits horizontally
 *     on hover, revealing a tech-stack tag in the crack (BrutalistSlice).
 *
 *  3. WORD SCRUB — The manifesto body on the cement column is coloured
 *     word-by-word from neutral-400 to obsidian as the user scrolls
 *     through the section (ScrollTrigger scrub: true + onUpdate).
 *
 *  Lenis / ScrollTrigger integration
 *  ─────────────────────────────────
 *  App.jsx owns the single Lenis instance and wires it into the GSAP
 *  ticker via `lenis.on('scroll', ScrollTrigger.update)` and
 *  `gsap.ticker.add(time => lenis.raf(time * 1000))`. We never call
 *  `ScrollTrigger.refresh()` here — Lenis fires it naturally on resize.
 *  Every ScrollTrigger created in this component is killed via
 *  `ctx.revert()` on unmount so the global state stays clean.
 * -----------------------------------------------------------------------
 */

// ─── Static data ────────────────────────────────────────────────────────────

const LORE_TIMELINE = [
  {
    year:   '2026',
    role:   'Architect',
    detail: 'Founding Engineer',
    stack:  'Distributed Systems',
  },
  {
    year:   '2025–2026',
    role:   'AI Developer',
    detail: 'Autonomous Agents',
    stack:  'LLM · RAG · Tool-Use',
  },
  {
    year:   'Present',
    role:   'Co-Convenor',
    detail: 'IEEEXtreme Programming',
    stack:  'Leadership',
  },
];

const MANIFESTO_TEXT =
  'I build systems that go beyond simple interfaces and create meaningful impact through ' +
  'automation, intelligence, and scalability. My focus is on transforming ideas into working ' +
  'products rather than limiting myself to theoretical concepts. I engineer spaces where complex ' +
  'logic meets absolute minimalism.';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Splits a string into an array of word-tokens and whitespace-tokens.
 * Whitespace tokens are returned as raw strings; word tokens are objects
 * `{ key: number, word: string }` keyed by their position in the array.
 *
 * We memoize the result outside the component because MANIFESTO_TEXT is
 * static — no reason to re-split on every render.
 */
const splitWords = (text) =>
  text.split(/(\s+)/).map((chunk, i) => {
    if (/^\s+$/.test(chunk)) return chunk; // preserve whitespace as raw string
    return { key: i, word: chunk };
  });

const BODY_CHUNKS = splitWords(MANIFESTO_TEXT);

// ─── Component ───────────────────────────────────────────────────────────────

const ManifestoLore = () => {
  const sectionRef      = useRef(null);
  const shutterRef      = useRef(null); // outer obsidian column — translates
  const contentRef      = useRef(null); // inner content div — clip-pathed
  const bodyRef         = useRef(null); // cement paragraph wrapper
  // wordEls: a plain array built by ref callbacks, stable across renders.
  // We gate the word-scrub effect behind a flag so StrictMode's double-invoke
  // doesn't register the trigger twice.
  const wordEls         = useRef([]);

  // ── Effect A: SHUTTER SHIFT ─────────────────────────────────────────────
  useEffect(() => {
    const section = sectionRef.current;
    const shutter = shutterRef.current;
    const content = contentRef.current;
    if (!section || !shutter || !content) return;

    // Initial off-screen state.
    // `xPercent: -100` moves the element by -100% of its own width,
    // placing it exactly flush against the left edge of the screen
    // regardless of the column's actual pixel width.
    gsap.set(shutter, { xPercent: -100, force3D: true });
    gsap.set(content, { clipPath: 'inset(0 100% 0 0)', force3D: true });

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger:       section,
          start:         'top 75%',
          toggleActions: 'play none none none',
          // No scrub — this is a one-shot cinematic entrance, not a
          // scroll-tied effect. Once it plays, it never reverses.
        },
      });

      // Position parameter `0` on BOTH tweens forces them to start at
      // t=0 on the timeline — true simultaneous execution.
      //
      // Action A — the BOX slides in from the left.
      tl.to(
        shutter,
        { xPercent: 0, duration: 1.2, ease: 'power4.out' },
        0,
      );

      // Action B — the clip-path uncovers the content at the same rate,
      // creating the illusion that text is anchored while the shutter moves.
      tl.to(
        content,
        { clipPath: 'inset(0 0% 0 0)', duration: 1.2, ease: 'power4.out' },
        0, // ← `<` equivalent when using position param 0
      );
    }, section);

    return () => ctx.revert();
  }, []);

  // ── Effect B: WORD-BY-WORD COLOUR SCRUB ─────────────────────────────────
  useEffect(() => {
    const body  = bodyRef.current;
    // wordEls.current is populated by the ref callbacks below.
    // Filter out any null slots left by StrictMode's double-invoke.
    const words = wordEls.current.filter(Boolean);
    if (!body || words.length === 0) return;

    // Start all words in the muted neutral state.
    gsap.set(words, { color: '#A3A3A3' }); // neutral-400

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger:  body,
        start:    'top 80%',
        end:      'bottom 55%',
        scrub:    true,
        onUpdate: (self) => {
          const p = self.progress;
          // Each word flips to obsidian when scroll progress passes its
          // threshold. The `0.05` head-start prevents a choppy staircase.
          words.forEach((w, i) => {
            const threshold = (i + 0.5) / words.length;
            w.style.color = p >= threshold - 0.05 ? '#0A0A0A' : '#A3A3A3';
          });
        },
      });
    }, body);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-screen flex flex-col md:flex-row border-b border-[#0A0A0A] overflow-hidden"
    >
      {/*
        ══════════════════════════════════════════════════════════
          LEFT 30% — Obsidian shutter column
          shutterRef  → translated by GSAP (the physical shutter)
          contentRef  → clip-pathed by GSAP (the wipe lens)
        ══════════════════════════════════════════════════════════
      */}
      <div
        ref={shutterRef}
        className="relative w-full md:w-[30%] shrink-0 bg-[#0A0A0A] text-[#D4D3D0] min-h-screen"
        style={{ willChange: 'transform' }}
      >
        <div
          ref={contentRef}
          className="relative w-full h-full px-6 md:px-8 py-8 md:py-10 flex flex-col"
          style={{ willChange: 'clip-path' }}
        >
          {/* Section label */}
          <span className="font-sans-brutal text-[10px] md:text-xs tracking-[0.3em] uppercase text-[#D4D3D0]/60 select-none">
            Manifesto / Lore — 02
          </span>

          {/* ── Lore timeline ────────────────────────────────────── */}
          <div className="mt-10 md:mt-14 flex-1 flex flex-col gap-10 md:gap-14">
            {LORE_TIMELINE.map((item, i) => (
              <Magnetic key={i} strength={0.42}>
                <div className="flex flex-col gap-[3px] select-none">
                  {/* Year / era tag */}
                  <span className="font-sans-brutal text-[10px] md:text-xs tracking-[0.3em] uppercase text-[#FF4D00]">
                    {item.year}
                  </span>

                  {/* Role — brutalist all-caps */}
                  <span className="font-sans-brutal text-2xl md:text-3xl tracking-tight uppercase leading-[1.05]">
                    {item.role}
                  </span>

                  {/* Detail — soft serif italic */}
                  <span className="font-serif italic text-base md:text-lg text-[#D4D3D0]/80">
                    {item.detail}
                  </span>

                  {/* Stack annotation */}
                  <span className="font-sans-brutal text-[10px] md:text-xs tracking-[0.25em] uppercase text-[#D4D3D0]/50 mt-1">
                    {item.stack}
                  </span>
                </div>
              </Magnetic>
            ))}
          </div>

          {/* Footer label */}
          <span className="font-sans-brutal text-[10px] md:text-xs tracking-[0.3em] uppercase text-[#D4D3D0]/40 mt-10 select-none">
            § Lore
          </span>
        </div>
      </div>

      {/*
        ══════════════════════════════════════════════════════════
          RIGHT 70% — Cement manifesto column
        ══════════════════════════════════════════════════════════
      */}
      <div className="relative w-full md:w-[70%] bg-[#D4D3D0] text-[#0A0A0A] px-6 md:px-12 py-8 md:py-12 flex flex-col min-h-screen">
        {/* Top label */}
        <span className="font-sans-brutal text-[10px] md:text-xs tracking-[0.3em] uppercase text-[#0A0A0A]/60 select-none">
          Manifesto — 02 / 02
        </span>

        {/*
          ── MANIFESTO headline ─────────────────────────────────
          BrutalistSlice: hover to split, revealing the sub-tag.
        */}
        <div className="mt-8 md:mt-12">
          <BrutalistSlice
            mainText="MANIFESTO"
            subText="AUTONOMY · RIGOR · RESTRAINT"
            travel={26}
            className="font-sans-brutal uppercase tracking-tighter leading-[1.0] text-[clamp(3rem,10vw,9rem)]"
            mainClassName="font-sans-brutal"
          />
        </div>

        {/*
          ── Body — word-by-word scroll scrub ──────────────────
          The screen-reader copy (sr-only) is always available.
          The visual paragraph uses ref callbacks to populate
          `wordEls.current[]` — a flat array in DOM order.
        */}
        <div
          ref={bodyRef}
          className="mt-10 md:mt-16 max-w-3xl"
        >
          {/* Screen-reader copy — always fully visible semantically */}
          <p className="sr-only">{MANIFESTO_TEXT}</p>

          {/* Visual copy — animated word-by-word */}
          <p
            aria-hidden="true"
            className="font-serif text-lg md:text-2xl leading-[1.6] flex flex-wrap gap-x-[0.38em] gap-y-2"
          >
            {BODY_CHUNKS.map((chunk, idx) => {
              if (typeof chunk === 'string') return chunk;
              return (
                <span
                  key={chunk.key}
                  ref={(el) => {
                    // Slot into the flat array at the chunk's original
                    // string-split index. Null on unmount — the effect
                    // filters these out before building the GSAP target list.
                    wordEls.current[idx] = el;
                  }}
                  className="inline-block will-change-[color]"
                >
                  {chunk.word}
                </span>
              );
            })}
          </p>
        </div>

        {/* Bottom-right anchor label */}
        <div className="mt-auto pt-12 flex justify-end">
          <span className="font-sans-brutal text-[10px] md:text-xs tracking-[0.3em] uppercase text-[#0A0A0A]/50 select-none">
            § End of manifesto
          </span>
        </div>
      </div>
    </section>
  );
};

export default ManifestoLore;
