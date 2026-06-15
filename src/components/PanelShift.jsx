import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Magnetic from './Magnetic.jsx';
import BrutalistSlice from './BrutalistSlice.jsx';
import RightColumn from './RightColumn.jsx';

gsap.registerPlugin(ScrollTrigger);

/* ═══════════════════════════════════════════════════════════════════════════
   THE "130vw STRIP" — DEFINITIVE LAYOUT
   ═══════════════════════════════════════════════════════════════════════════

   [ 30vw OBS-L (LORE) ][ 70vw CEMENT (MANIFESTO) ][ 30vw OBS-R (HERO) ]
                            ↑ 130vw total ↑

   Hero state  → xPercent ≈ -23.077%  (OBS-L hidden off left)
   Lore state  → xPercent = 0          (OBS-L visible, OBS-R hidden off right)

   TIMING — designed for cinematic anticipation:
   • end: '+=320vh'  → 320vh of pinned scroll budget (long, deliberate)
   • scrub: 2.5      → 2.5-second lag gives a fluid, heavyweight feel
   ═══════════════════════════════════════════════════════════════════════════ */

/* ─── data ─────────────────────────────────────────────────────────────── */

const TAGLINE_LINES = ['FULL STACK', 'AI & BACKEND', 'ENGINEER'];

const LORE_TIMELINE = [
  { year: '2026',      role: 'Architect',    detail: 'Founding Engineer',      stack: 'Distributed Systems'  },
  { year: '2025–2026', role: 'AI Developer', detail: 'Autonomous Agents',      stack: 'LLM · RAG · Tool-Use' },
  { year: 'Present',   role: 'Co-Convenor',  detail: 'IEEEXtreme Programming', stack: 'Leadership'           },
];

// Three core principles — each gets a BrutalistSlice reveal
const PRINCIPLES = [
  { word: 'AUTONOMY',   sub: 'SELF-DIRECTED SYSTEMS'  },
  { word: 'RIGOR',      sub: 'ENGINEERED PRECISION'   },
  { word: 'RESTRAINT',  sub: 'ABSOLUTE MINIMALISM'    },
];

const MANIFESTO_TEXT =
  'I build systems that go beyond simple interfaces and create meaningful impact through ' +
  'automation, intelligence, and scalability. My focus is on transforming ideas into working ' +
  'products rather than limiting myself to theoretical concepts. I engineer spaces where complex ' +
  'logic meets absolute minimalism.';

// Starting xPercent — -30vw as a percentage of the 130vw strip (constant ratio)
const STRIP_START_XPCT = -(30 / 130) * 100; // ≈ -23.077

/* ─── word splitter ─────────────────────────────────────────────────────── */
const splitWords = (text) =>
  text.split(/(\s+)/).map((chunk, i) => {
    if (/^\s+$/.test(chunk)) return chunk;
    return { key: i, word: chunk };
  });

const BODY_CHUNKS = splitWords(MANIFESTO_TEXT);

/* ═══════════════════════════════════════════════════════════════════════════
   PanelShift
   ═══════════════════════════════════════════════════════════════════════════ */
const PanelShift = () => {
  const pinnedRef      = useRef(null);   // GSAP pins this 100vh frame
  const stripRef       = useRef(null);   // 130vw horizontal strip
  const leftBlockRef   = useRef(null);   // 30vw left obsidian — compresses to 12vw

  const heroContentRef = useRef(null);
  const heroRightBlockRef = useRef(null);
  const taglineRefs    = useRef([]);

  const manifestoRef   = useRef(null);
  const loreItemRefs   = useRef([]);
  const wordEls        = useRef([]);
  // Extra refs for layered per-element reveals inside manifesto
  const statementRef      = useRef(null);  // "I BUILD SYSTEMS" block
  const principleItemRefs = useRef([]);    // the 3 border-t principle rows


  /* ── Hero entrance ────────────────────────────────────────────────────── */
  useEffect(() => {
    const lines = taglineRefs.current.filter(Boolean);
    if (!lines.length) return;

    gsap.set(lines, { y: 90, opacity: 0 });

    const id = setTimeout(() => {
      gsap.to(lines, {
        y: 0, opacity: 1,
        duration: 0.8, ease: 'power4.out', stagger: 0.12,
      });
    }, 4050); // synced with Awakening.jsx PRELOAD_FADE_START

    return () => clearTimeout(id);
  }, []);

  /* ── Main lateral scroll animation ────────────────────────────────────── */
  useEffect(() => {
    const pinned        = pinnedRef.current;
    const strip         = stripRef.current;
    const heroContent   = heroContentRef.current;
    const manifestoPane = manifestoRef.current;
    const loreItems     = loreItemRefs.current.filter(Boolean);
    const words         = wordEls.current.filter(Boolean);

    if (!pinned || !strip) return;

    /* ── Initial state ────────────────────────────────────────────────── */
    const statement      = statementRef.current;
    const principleItems = principleItemRefs.current.filter(Boolean);

    gsap.set(strip,         { xPercent: STRIP_START_XPCT, force3D: true });
    if (heroContent)   gsap.set(heroContent,   { autoAlpha: 1, y: 0 });
    if (manifestoPane) gsap.set(manifestoPane, { autoAlpha: 0, y: 40 });

    // Lore items: slide from left AND slightly from below + faint scale
    if (loreItems.length) gsap.set(loreItems, { x: -36, y: 24, autoAlpha: 0, scale: 0.97 });

    // Sub-elements inside manifesto pane: start hidden with y offset
    if (statement)            gsap.set(statement,      { y: 36, autoAlpha: 0 });
    if (principleItems.length) gsap.set(principleItems, { y: 28, autoAlpha: 0 });

    if (words.length)  gsap.set(words, { color: '#A3A3A3' });


    const ctx = gsap.context(() => {
      /*
        TIMING MAP (fractions of the 1.0 timeline, driven by 900vh scrub):

        0.00 → 0.20  ── ANTICIPATION: strip barely moves (~180vh of nothing changing)
        0.20 → 1.00  ── LATERAL SLIDE: strip sweeps from hero to lore state
        0.20 → 0.55  ── HERO FADE: hero text slowly dissolves
        0.50 → 0.72  ── MANIFESTO PANE: the whole cement content fades in + rises
        0.58 → 0.76  ── STATEMENT: "I BUILD SYSTEMS" slides up into place
        0.68 → 0.90  ── PRINCIPLES: AUTONOMY · RIGOR · RESTRAINT stagger up
        0.72 → 0.96  ── LORE ITEMS: stagger in from x+y with scale
        0.80 → 1.00  ── WORD SCRUB: paragraph colours ignite left → right

        The user scrolls through ≥900vh with most of the content not
        appearing until 70%+ of the scroll budget is used. This is the
        "anticipation" the brutalist build-up requires.
      */

      const tl = gsap.timeline({ paused: true });

      // 1. STRIP SLIDE — starts at 20%, ends at 100% (linear)
      //    First 180vh (20%) = pure anticipation, nothing moves.
      tl.to(strip, { xPercent: 0, ease: 'none', duration: 0.80 }, 0.20);

      // 2. HERO FADE OUT — 20% → 55%
      const heroFadeTargets = [heroContent, heroRightBlockRef.current].filter(Boolean);
      if (heroFadeTargets.length) {
        tl.to(heroFadeTargets, {
          autoAlpha: 0, y: -44,
          ease: 'power2.in', duration: 0.35,
        }, 0.20);
      }

      // 3. MANIFESTO PANE — 50% → 72% (whole pane rises + fades in)
      if (manifestoPane) {
        tl.to(manifestoPane, {
          autoAlpha: 1, y: 0,
          ease: 'power3.out', duration: 0.22,
        }, 0.50);
      }

      // 4. STATEMENT — "I BUILD SYSTEMS" — 58% → 76%
      //    Slides up into place after the pane is mostly visible.
      if (statement) {
        tl.to(statement, {
          y: 0, autoAlpha: 1,
          ease: 'power4.out', duration: 0.18,
        }, 0.58);
      }

      // 5. PRINCIPLES — 68% → 90% (staggered y-rise, one by one)
      if (principleItems.length) {
        tl.to(principleItems, {
          y: 0, autoAlpha: 1,
          ease: 'power3.out', duration: 0.16,
          stagger: 0.045,
        }, 0.68);
      }

      // 6. LORE ITEMS — 72% → 96% (x + y + scale, staggered)
      if (loreItems.length) {
        tl.to(loreItems, {
          x: 0, y: 0, scale: 1, autoAlpha: 1,
          ease: 'power4.out', duration: 0.20, stagger: 0.07,
        }, 0.72);
      }

      // 7. WORD COLOUR SCRUB — 80% → 100%
      //    Final reward: paragraph lights up word by word.
      if (words.length) {
        tl.to(words, {
          color: '#0A0A0A',
          ease: 'none', duration: 0.20,
          stagger: { each: 0.008, from: 'start' },
        }, 0.80);
      }

      /*
        ── PHASE: HOLD ─────────────────────────────────────────────────
        Lore rests at final state for ~150vh. Gives scrub lag time to
        fully settle before the structural transition begins.
        Timeline: 1.0 → 1.167 (+0.167 units = 150vh)
      */
      tl.to({}, { duration: 0.167 });

      /*
        ── PHASE: LORE → QUESTS COMPRESSION ───────────────────────────
        The left 30vw obsidian block compresses to 12vw. This IS the
        "sliding block" handoff. It lives inside PanelShift's scrubbed
        timeline so it is fully reversible (scrub up = block expands).

        Simultaneously the lore/manifesto content fades out so the
        viewport transitions cleanly to [12vw black | cement].
        Quests picks up at exactly 12vw — no separate entry animation.

        Timeline: 1.167 → 1.367 (+0.20 units = 180vh)
      */
      const leftBlock = leftBlockRef.current;
      if (leftBlock) {
        tl.to(leftBlock, {
          width:    '12vw',
          minWidth: '12vw',
          duration: 0.20,
          ease:     'power3.inOut',
        }, 1.167);
      }

      // Fade out ALL lore + manifesto content during compression
      const fadeTargets = [
        manifestoPane,
        statement,
        ...principleItems,
        ...loreItems,
      ].filter(Boolean);

      if (fadeTargets.length) {
        tl.to(fadeTargets, {
          autoAlpha: 0,
          duration:  0.14,
          ease:      'power2.in',
        }, 1.167);
      }

      /*
        ── PHASE: HOLD AT COMPRESSED STATE ─────────────────────────────
        Brief hold so the [12vw | cement] state settles and Quests'
        content can fade in smoothly on the next section.
        Timeline: 1.367 → 1.478 (+0.111 units ≈ 100vh)

        TOTAL TIMELINE: 1.478 units
        TOTAL SCROLL:   900 × 1.478 ≈ 1330vh
        RATE:           1330 / 1.478 ≈ 900vh per unit (unchanged pace)
      */
      tl.to({}, { duration: 0.111 });

      ScrollTrigger.create({
        trigger:             pinned,
        pin:                 true,
        pinSpacing:          true,
        start:               'top top',
        end:                 '+=1330vh',
        scrub:               5,
        animation:           tl,
        invalidateOnRefresh: true,
      });
    });

    return () => ctx.revert();
  }, []);

  /* ────────────────────────────────────────────────────────────────────── */

  return (
    <div
      ref={pinnedRef}
      style={{ height: '100vh', width: '100vw', overflow: 'hidden', position: 'relative', zIndex: 10 }}
    >

      {/* ════════════════════════════════════════════════════════════════
          THE 130vw STRIP
          ════════════════════════════════════════════════════════════════ */}
      <div
        ref={stripRef}
        style={{
          position: 'absolute', top: 0, left: 0,
          width: '130vw', height: '100%',
          display: 'flex', willChange: 'transform',
        }}
      >

        {/* ╔═══════════════════════════════════════════════════════════╗
            ║  BLOCK 1 — Left Obsidian 30vw — LORE                    ║
            ╚═══════════════════════════════════════════════════════════╝ */}
        <div
          ref={leftBlockRef}
          style={{ width: '30vw', minWidth: '30vw', flex: 'none', height: '100%', willChange: 'width' }}
          className="bg-[#0A0A0A] text-[#D4D3D0] flex flex-col overflow-hidden"
        >
          {/* ── Top label + rule ───────────────────────────────────── */}
          <div className="px-7 pt-8 shrink-0">
            <span className="font-sans-brutal text-[9px] tracking-[0.35em] uppercase text-[#D4D3D0]/50 select-none">
              LORE
            </span>
            <div className="mt-3 h-px bg-[#D4D3D0]/15" />
          </div>

          {/* ── Timeline items — evenly distributed ────────────────── */}
          <div className="flex-1 flex flex-col justify-evenly px-7 py-8">
            {LORE_TIMELINE.map((item, i) => (
              <div
                key={i}
                ref={(el) => { loreItemRefs.current[i] = el; }}
              >
                <Magnetic strength={0.35}>
                  <div className="flex flex-col gap-[6px] select-none">
                    {/* Year tag */}
                    <span className="font-sans-brutal text-[11px] tracking-[0.3em] uppercase text-[#FF4D00]">
                      {item.year}
                    </span>
                    {/* Role — bumped to text-3xl for legibility */}
                    <span className="font-sans-brutal text-2xl md:text-3xl leading-[1.0] uppercase tracking-tight">
                      {item.role}
                    </span>
                    {/* Detail — bumped to text-base */}
                    <span className="font-serif italic text-base md:text-[17px] text-[#D4D3D0]/80 leading-[1.4]">
                      {item.detail}
                    </span>
                    {/* Stack — bumped to 11px */}
                    <span className="font-sans-brutal text-[11px] tracking-[0.22em] uppercase text-[#D4D3D0]/45 mt-1">
                      {item.stack}
                    </span>
                  </div>
                </Magnetic>
              </div>
            ))}
          </div>
        </div>

        {/* ╔═══════════════════════════════════════════════════════════╗
            ║  BLOCK 2 — Cement 70vw — shared, content swaps           ║
            ╚═══════════════════════════════════════════════════════════╝ */}
        <div
          style={{ width: '70vw', minWidth: '70vw', flex: 'none', height: '100%', position: 'relative' }}
          className="bg-[#D4D3D0] overflow-hidden"
        >

          {/* ── HERO CONTENT ──────────────────────────────────────── */}
          <div
            ref={heroContentRef}
            className="absolute inset-0 flex flex-col px-10 md:px-14 py-8"
          >
            <header className="flex justify-between items-start font-sans-brutal text-[9px] tracking-[0.35em] uppercase text-[#0A0A0A]/60 shrink-0">
              {/* data-cursor="name" suspends the blend effect on the nameplate */}
              <span data-cursor="name">Vedant Meshram</span>
              <a href="https://mail.google.com/mail/?view=cm&fs=1&to=meshramvedant7@gmail.com" target="_blank" rel="noopener noreferrer" data-cursor="hover" className="cursor-none" style={{ textDecoration: 'none', color: 'inherit' }}>Get in touch ↗</a>
            </header>

            {/* Massive taglines — bottom-anchored exactly like the hero spec */}
            <div className="flex-1 flex flex-col items-start justify-end font-sans-brutal uppercase tracking-tighter leading-[0.97] text-[clamp(2.8rem,8vw,8.5rem)] pb-3 text-[#0A0A0A]">
              {TAGLINE_LINES.map((line, i) => (
                <div
                  key={i}
                  ref={(el) => { taglineRefs.current[i] = el; }}
                  data-cursor="hover"
                  className="cursor-none"
                >
                  {line}
                </div>
              ))}
            </div>
          </div>

          {/* ── MANIFESTO CONTENT — Awwwards-level brutalist redesign ── */}
          {/*
              LAYOUT CONCEPT (mirrors hero's negative-space discipline):
              ┌──────────────────────────────────────────────┐
              │  MANIFESTO                               02  │  ← 9px label
              │  ─────────────────────────────────────────  │  ← rule
              │                                             │
              │  I BUILD                                    │
              │  SYSTEMS                                    │  ← large Anton
              │  THAT GO BEYOND.                            │    top-anchored
              │                                             │
              │  [flex-1 negative space]                    │
              │                                             │
              │  ┌──────────────┬─────────────────────────┐ │
              │  │ AUTONOMY     │ I build systems that go  │ │
              │  │ [Slice]      │ beyond simple interfaces │ │
              │  │              │ and create meaningful    │ │
              │  │ RIGOR        │ impact through automati- │ │
              │  │ [Slice]      │ on, intelligence, and   │ │
              │  │              │ scalability.             │ │
              │  │ RESTRAINT    │                          │ │
              │  │ [Slice]      │ I engineer spaces where  │ │
              │  │              │ complex logic meets      │ │
              │  └──────────────┴─────────────────────────┘ │
              │  ─────────────────────────────────────────  │  ← rule
              └──────────────────────────────────────────────┘
          */}
          <div
            ref={manifestoRef}
            className="absolute inset-0 flex flex-col px-10 md:px-14"
          >

            {/* Top: label row */}
            <div className="pt-8 flex justify-between items-baseline shrink-0">
              <span className="font-sans-brutal text-[9px] tracking-[0.35em] uppercase text-[#0A0A0A]/60 select-none">
                MANIFESTO
              </span>
              <span className="font-sans-brutal text-[9px] tracking-[0.35em] uppercase text-[#0A0A0A]/40 select-none tabular-nums">
                02
              </span>
            </div>

            {/* Top rule */}
            <div className="mt-4 h-px bg-[#0A0A0A]/20 shrink-0" />

            {/* Main area */}
            <div className="flex-1 flex flex-col pt-10">

              {/*
                Large brutalist statement — same rhythm as the hero taglines
                but at ~55% the scale: creates visual hierarchy between
                sections while preserving the "anchored stone" aesthetic.
              */}
              <div
                ref={statementRef}
                className="font-sans-brutal uppercase tracking-tighter leading-[0.92] text-[clamp(2.4rem,5.5vw,6.2rem)] text-[#0A0A0A] shrink-0"
                data-cursor="hover"
              >
                <div>I BUILD</div>
                <div>SYSTEMS</div>
                <div>THAT GO BEYOND.</div>
              </div>

              {/* Critical: the negative space that gives the layout air */}
              <div className="flex-1 min-h-[3vh]" />

              {/*
                BOTTOM GRID — 2 columns, brutalist proportion.
                Left (5fr): Three BrutalistSlice principles, each under
                           a hairline rule → reads as a mini-manifesto index.
                Right (8fr): Full body paragraph in Instrument Serif,
                            aligned bottom with the keywords column.
              */}
              <div className="grid shrink-0" style={{ gridTemplateColumns: '5fr 8fr', gap: '0 2.5vw' }}>

                {/* LEFT: Principles with BrutalistSlice */}
                <div className="flex flex-col justify-end gap-0 pb-1">
                {PRINCIPLES.map(({ word, sub }, i) => (
                    <div
                      key={i}
                      ref={(el) => { principleItemRefs.current[i] = el; }}
                      className="border-t border-[#0A0A0A]/20 pt-3 pb-4"
                    >
                      <BrutalistSlice
                        mainText={word}
                        subText={sub}
                        travel={34}
                        as="div"
                        className="font-sans-brutal uppercase tracking-tighter leading-[1.0] text-[clamp(1.7rem,2.8vw,3.2rem)] text-[#0A0A0A]"
                        mainClassName="font-sans-brutal text-[#0A0A0A]"
                      />
                    </div>
                  ))}
                </div>

                {/* RIGHT: Body paragraph with word scrub */}
                <div className="flex flex-col justify-end pb-1 border-t border-[#0A0A0A]/20 pt-3">
                  <p className="sr-only">{MANIFESTO_TEXT}</p>
                  <p
                    aria-hidden="true"
                    className="font-serif text-[17px] md:text-[20px] leading-[1.72] flex flex-wrap gap-x-[0.3em] gap-y-1"
                  >
                    {BODY_CHUNKS.map((chunk, idx) => {
                      if (typeof chunk === 'string') return chunk;
                      return (
                        <span
                          key={chunk.key}
                          ref={(el) => { wordEls.current[idx] = el; }}
                          className="inline-block will-change-[color]"
                        >
                          {chunk.word}
                        </span>
                      );
                    })}
                  </p>
                </div>

              </div>{/* /bottom grid */}

            </div>{/* /main area */}

            {/* Bottom rule */}
            <div className="mt-5 mb-7 h-px bg-[#0A0A0A]/20 shrink-0" />

          </div>{/* /manifesto content */}

        </div>{/* /cement */}

        {/* ╔═══════════════════════════════════════════════════════════╗
            ║  BLOCK 3 — Right Obsidian 30vw — RightColumn (Hero)     ║
            ╚═══════════════════════════════════════════════════════════╝ */}
        <div
          ref={heroRightBlockRef}
          style={{ width: '30vw', minWidth: '30vw', flex: 'none', height: '100%' }}
          className="overflow-hidden"
        >
          <RightColumn />
        </div>

      </div>{/* /strip */}
    </div>   /* /pinned */
  );
};

export default PanelShift;
