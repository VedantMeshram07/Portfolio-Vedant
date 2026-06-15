import { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Magnetic from './Magnetic.jsx';
import BrutalistSlice from './BrutalistSlice.jsx';
import RightColumn from './RightColumn.jsx';
import Powers from './Powers.jsx';
import PowersTransition from './PowersTransition.jsx';
import Artifacts from './Artifacts.jsx';

gsap.registerPlugin(ScrollTrigger);

/* ─── design tokens ──────────────────────────────────────────────────────── */
const BLUE   = '#3B82F6';
const OBSID  = '#0A0A0A';
const CEMENT = '#D4D3D0';
const ORANGE = '#FF4D00';

/* ─── copy ───────────────────────────────────────────────────────────────── */
const TAGLINE_LINES = ['FULL STACK', 'AI & BACKEND', 'ENGINEER'];

const LORE_TIMELINE = [
  { year: '2026',      role: 'Architect',    detail: 'Founding Engineer',      stack: 'Distributed Systems'  },
  { year: '2025–2026', role: 'AI Developer', detail: 'Autonomous Agents',      stack: 'LLM · RAG · Tool-Use' },
  { year: 'Present',   role: 'Co-Convenor',  detail: 'IEEEXtreme Programming', stack: 'Leadership'           },
];

const PRINCIPLES = [
  { word: 'AUTONOMY',  sub: 'SELF-DIRECTED SYSTEMS' },
  { word: 'RIGOR',     sub: 'ENGINEERED PRECISION'  },
  { word: 'RESTRAINT', sub: 'ABSOLUTE MINIMALISM'   },
];

const MANIFESTO_TEXT =
  'I build systems that go beyond simple interfaces and create meaningful impact through ' +
  'automation, intelligence, and scalability. My focus is on transforming ideas into working ' +
  'products rather than limiting myself to theoretical concepts. I engineer spaces where complex ' +
  'logic meets absolute minimalism.';

const PROJECTS = [
  {
    num: '01', title: 'AURA', year: '2026', role: 'Founding Engineer',
    stack: 'React · Node.js · PostgreSQL · LLM',
    description: 'Autonomous infrastructure platform. Engineered the core agent orchestration pipeline, distributed task scheduling, and real-time monitoring systems from ground zero.',
    outcome: 'Processing 10K+ autonomous tasks daily with 99.7% uptime.',
    status: 'ACTIVE',
  },
  {
    num: '02', title: 'SENTINEL', year: '2025', role: 'Backend Engineer',
    stack: 'Python · FastAPI · Redis · Docker · K8s',
    description: 'Real-time threat detection and system monitoring platform. Architected the event-driven pipeline for zero-latency anomaly detection across distributed infrastructure.',
    outcome: 'Reduced incident response time from 4 minutes to 12 seconds.',
    status: 'DEPLOYED',
  },
  {
    num: '03', title: 'MINDSYNC', year: '2025', role: 'AI Developer',
    stack: 'LangChain · OpenAI · Pinecone · React',
    description: 'Enterprise knowledge automation framework. Built the RAG pipeline with multi-tool agent capabilities, enabling autonomous document analysis and intelligent workflow execution.',
    outcome: 'Automated 68% of manual knowledge retrieval processes.',
    status: 'DEPLOYED',
  },
  {
    num: '04', title: 'SPECTRA', year: '2024', role: 'Full Stack Developer',
    stack: 'Next.js · TypeScript · Prisma · AWS',
    description: 'Data visualisation and analytics platform for complex system monitoring. Designed the real-time streaming dashboard with architectural precision and editorial clarity.',
    outcome: 'Unified 12 disparate data sources into one analytical surface.',
    status: 'SHIPPED',
  },
];

/* ─── helpers ────────────────────────────────────────────────────────────── */
const STRIP_START_XPCT = -(30 / 130) * 100; // ≈ -23.077

/* ─── mobile responsive overrides ───────────────────────────────────────── */
const MOBILE_CSS = `
  @media (max-width: 768px) {
    /* Lore block — 30vw becomes ~112px; reduce text to fit */
    .lore-role   { font-size: 13px !important; line-height: 1.1 !important; }
    .lore-detail { font-size: 10px !important; }
    .lore-stack  { font-size: 8px  !important; }

    /* Manifesto — stack 5fr/8fr grid to single column */
    .manifesto-body-grid { grid-template-columns: 1fr !important; }

    /* Quests — prevent project title overflow in narrow column */
    .quests-proj-title { font-size: clamp(1.3rem, 5.5vw, 2.2rem) !important; }
    .quests-proj-meta  { flex-wrap: wrap !important; gap: 4px 10px !important; }

    /* Powers — show tech + statement by default (no hover on touch) */
    .powers-title { font-size: clamp(0.65rem, 3.2vw, 1.2rem) !important; letter-spacing: -0.01em !important; }
    .powers-tech  { opacity: 0.85 !important; visibility: visible !important; font-size: 8px !important; gap: 2px !important; }
    .powers-stmt  { opacity: 0.65 !important; visibility: visible !important; font-size: 10px !important; }
  }
`;

const splitWords = (text) =>
  text.split(/(\s+)/).map((chunk, i) => {
    if (/^\s+$/.test(chunk)) return chunk;
    return { key: i, word: chunk };
  });

const BODY_CHUNKS = splitWords(MANIFESTO_TEXT);

/* ═══════════════════════════════════════════════════════════════════════════
   SiteCanvas — THE SINGLE PIN

   Architecture
   ────────────
   One 100vh fixed frame sits in the DOM.
   One GSAP ScrollTrigger pins it for the entire scroll journey (~1700vh).
   One scrubbed timeline drives ALL state changes inside the frame.

   Scroll budget  Phase
   ──────────────────────────────────────────────────────────────────────────
   0   → 180vh   ANTICIPATION  — nothing moves
   180 → 900vh   LATERAL SLIDE — 130vw strip sweeps hero→lore
   900 → 1020vh  LORE HOLD     — lore final state breathes
   1020→ 1180vh  COMPRESSION   — left block 30vw→12vw, content fades out
   1180→ 1300vh  BRIDGE HOLD   — [12vw | cement] settles
   1300→ 1470vh  QUESTS REVEAL — project rows + rail content fade in
   1470→ 1620vh  INTERACTION   — user scrolls rail to cycle projects

   Since all phases share ONE pinned element, there is ZERO handoff problem.
   No z-index fighting. No separate pin spacers. No gap.
   ═══════════════════════════════════════════════════════════════════════════ */
export default function SiteCanvas() {
  /* ── refs (scrubbed animation targets) ──────────────────────────────── */
  const canvasRef       = useRef(null);  // pinned 100vh frame
  const stripRef        = useRef(null);  // 130vw horizontal strip
  const leftBlockRef    = useRef(null);  // 30vw left obsidian → compresses
  const heroContentRef  = useRef(null);
  const heroRightBlockRef = useRef(null);
  const taglineRefs     = useRef([]);
  const manifestoRef    = useRef(null);
  const loreItemRefs    = useRef([]);
  const wordEls         = useRef([]);
  const statementRef    = useRef(null);
  const principleRefs   = useRef([]);

  /* ── refs (Quests overlay — NOT scrubbed, fades in on phase entry) ── */
  const questsOverlayRef = useRef(null); // the [30vw→12vw | cement] quests frame
  const questsRailRef    = useRef(null); // the rail body content
  const questsCementRef  = useRef(null); // all 4 project rows
  const questsRailWidthRef = useRef(null); // the 30vw→12vw rail container
  const transitionPhraseRef = useRef(null); // the 'ENTERING QUESTS' phrase that appears during compression

  /* ── refs (PowersTransition — obsidian column cinematic) ────────────── */
  const ptOverlayRef  = useRef(null); // plain-opacity container
  const ptColumnsRef  = useRef([]);   // 4 obsidian columns that expand

  /* ── refs (Powers — Act IV final state) ─────────────────────────── */
  const powersOverlayRef   = useRef(null);
  const powersDividersRef  = useRef([]);
  const powersColumnsRef   = useRef([]);
  const powersTitlesRef    = useRef([]);
  const powersTechRef      = useRef([]);
  const powersStatementRef = useRef([]);
  const powersHeadersRef   = useRef([]);
  const powersActiveRef    = useRef(false); // true while Powers is on-screen (enables hover)

  /* ── refs (Artifacts — Act V overlay) ─────────────────────────────── */
  const artifactsOverlayRef = useRef(null);
  const artifactsHeaderRef  = useRef(null);
  const artifactsRecordsRef = useRef([]);
  const artifactsArchiveActionRef = useRef(null);

  /* ── Quests interaction state (React, outside GSAP timeline) ────────── */
  const [activeIndex, setActiveIndex] = useState(0);
  const [dossier,     setDossier]     = useState(null);

  /* ── indicator dots ─────────────────────────────────────────────────── */
  const dot1Ref = useRef(null);
  const dot2Ref = useRef(null);
  const dot3Ref = useRef(null);
  const numRefs    = useRef([]);
  const lineRefs   = useRef([]);
  const periodRefs = useRef([]);

  /* ── flags ───────────────────────────────────────────────────── */
  const questsRevealedRef = useRef(false);
  const railWheelActive   = useRef(false);
    

  /* ════════════════════════════════════════════════════════════════════════
     HERO ENTRANCE (real-time, not scrubbed)
  */
  useEffect(() => {
    const lines = taglineRefs.current.filter(Boolean);
    if (!lines.length) return;
    gsap.set(lines, { y: 90, opacity: 0 });
    const id = setTimeout(() => {
      gsap.to(lines, { y: 0, opacity: 1, duration: 0.8, ease: 'power4.out', stagger: 0.12 });
    }, 4050);
    return () => clearTimeout(id);
  }, []);

  /* ════════════════════════════════════════════════════════════════════════
     MAIN SCROLL ANIMATION — single pin + single scrubbed timeline
  */
  useEffect(() => {
    const canvas       = canvasRef.current;
    const strip        = stripRef.current;
    const leftBlock    = leftBlockRef.current;
    const heroContent  = heroContentRef.current;
    const manifestoPane = manifestoRef.current;
    const loreItems    = loreItemRefs.current.filter(Boolean);
    const words        = wordEls.current.filter(Boolean);
    const statement    = statementRef.current;
    const principles   = principleRefs.current.filter(Boolean);
    const questsOverlay = questsOverlayRef.current;
    const questsRail   = questsRailRef.current;
    const questsCement = questsCementRef.current;
    const questsRailWidth = questsRailWidthRef.current;

    if (!canvas || !strip) return;

    /* ── initial states ──────────────────────────────────────────────── */
    gsap.set(strip,         { xPercent: STRIP_START_XPCT, force3D: true });
    gsap.set(heroContent,   { autoAlpha: 1, y: 0 });
    gsap.set(manifestoPane, { autoAlpha: 0, y: 40 });
    gsap.set(loreItems,     { x: -36, y: 24, autoAlpha: 0, scale: 0.97 });
    gsap.set(statement,     { y: 36, autoAlpha: 0 });
    gsap.set(principles,    { y: 28, autoAlpha: 0 });
    gsap.set(words,         { color: '#A3A3A3' });
    gsap.set(questsOverlay, { autoAlpha: 0 });
    gsap.set(questsRail,    { autoAlpha: 0 });
    gsap.set(questsCement,  { autoAlpha: 0 });
    if (transitionPhraseRef.current) {
      gsap.set(transitionPhraseRef.current, { autoAlpha: 0, y: 8 });
    }

    /* ── PowersTransition: use plain opacity so CSS compounds correctly.
       No autoAlpha / visibility — children are hidden purely by parent opacity:0 */
    if (ptOverlayRef.current) {
      gsap.set(ptOverlayRef.current, { opacity: 0 });
    }
    ptColumnsRef.current.forEach((c, i) => {
      if (c) gsap.set(c, { left: `${i * 3}vw`, width: '3vw', backgroundColor: OBSID });
    });

    /* ── Powers: hide overlay; explicitly set columns + dividers to their
       equal 25% positions so no residual GSAP state can override CSS. */
    if (powersOverlayRef.current) gsap.set(powersOverlayRef.current, { autoAlpha: 0 });
    powersColumnsRef.current.forEach((c, i) => {
      if (c) gsap.set(c, { left: `${i * 25}%`, width: '25%', opacity: 1 });
    });
    powersDividersRef.current.forEach((d, i) => {
      if (d) gsap.set(d, { left: `${(i + 1) * 25}%` });
    });


    /* Artifacts — initial states. */
    if (artifactsOverlayRef.current) gsap.set(artifactsOverlayRef.current, { autoAlpha: 0 });
    if (artifactsHeaderRef.current) gsap.set(artifactsHeaderRef.current, { autoAlpha: 0, y: 6 });
    artifactsRecordsRef.current.forEach((r) => { if (r) gsap.set(r, { autoAlpha: 0, y: 10 }); });
    if (artifactsArchiveActionRef.current) gsap.set(artifactsArchiveActionRef.current, { autoAlpha: 0, y: 6 });

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ paused: true });
      
      /* ───────────────────────────────────────────────────────────── */

      /* ── 1. STRIP SLIDE  (0.20 → 1.00) ───────────────────────────── */
      tl.to(strip, { xPercent: 0, ease: 'none', duration: 0.80 }, 0.20);

      /* ── 2. HERO FADE   (0.20 → 0.55) ───────────────────────────── */
      const heroFadeTargets = [heroContent, heroRightBlockRef.current].filter(Boolean);
      if (heroFadeTargets.length) {
        tl.to(heroFadeTargets, { autoAlpha: 0, y: -44, ease: 'power2.in', duration: 0.35 }, 0.20);
      }

      /* ── 3. MANIFESTO PANE  (0.50 → 0.72) ───────────────────────── */
      tl.to(manifestoPane, { autoAlpha: 1, y: 0, ease: 'power3.out', duration: 0.22 }, 0.50);

      /* ── 4. STATEMENT  (0.58 → 0.76) ────────────────────────────── */
      tl.to(statement, { y: 0, autoAlpha: 1, ease: 'power4.out', duration: 0.18 }, 0.58);

      /* ── 5. PRINCIPLES  (0.68 → 0.90) ───────────────────────────── */
      tl.to(principles, { y: 0, autoAlpha: 1, ease: 'power3.out', duration: 0.16, stagger: 0.045 }, 0.68);

      /* ── 6. LORE ITEMS  (0.72 → 0.96) ───────────────────────────── */
      tl.to(loreItems, { x: 0, y: 0, scale: 1, autoAlpha: 1, ease: 'power4.out', duration: 0.20, stagger: 0.07 }, 0.72);

      /* ── 7. WORD SCRUB  (0.80 → 1.00) ───────────────────────────── */
      tl.to(words, { color: OBSID, ease: 'none', duration: 0.20, stagger: { each: 0.008, from: 'start' } }, 0.80);

      /* ── 8. LORE HOLD   (1.00 → 1.133)  +120vh ─────────────────── */
      tl.to({}, { duration: 0.133 });

      tl.to(questsOverlay, { autoAlpha: 1, duration: 0.001, ease: 'none' }, 1.133);
      tl.to(strip, { autoAlpha: 0, duration: 0.001, ease: 'none' }, 1.133);

      if (questsRailWidth) {
        tl.to(questsRailWidth, { width: '12vw', duration: 0.30, ease: 'power2.inOut' }, 1.134);
      }

      if (transitionPhraseRef.current) {
        tl.to(transitionPhraseRef.current, { autoAlpha: 1, y: 0, duration: 0.10, ease: 'power2.out' }, 1.20);
        tl.to(transitionPhraseRef.current, { autoAlpha: 0, y: -8, duration: 0.12, ease: 'power2.in' }, 1.40);
      }

      const fadeTargets = [manifestoPane, statement, ...principles, ...loreItems].filter(Boolean);
      if (fadeTargets.length) {
        tl.to(fadeTargets, { autoAlpha: 0, duration: 0.10, ease: 'power2.inOut' }, 1.033);
      }

      tl.to(questsCement, { autoAlpha: 1, duration: 0.14, ease: 'power2.out' }, 1.434);
      tl.to(questsRail,   { autoAlpha: 1, duration: 0.11, ease: 'power2.out' }, 1.474);

      // ─────────────────────────────────────────────────────────────────────
      // STEP 1 — At 1.87: Transition overlay SNAPS on. Entire Quests (including
      //          its overlay wrapper) fades out so nothing bleeds through.
      // ─────────────────────────────────────────────────────────────────────
      if (ptOverlayRef.current) {
        tl.to(ptOverlayRef.current, { opacity: 1, duration: 0.001 }, 1.87);
      }
      // Fade out the ENTIRE Quests section — overlay + rail + cement
      tl.to([questsOverlay, questsRail, questsCement].filter(Boolean), { autoAlpha: 0, duration: 0.14 }, 1.87);

      // STEP 2 — 1.87 → 1.99: 4 obsidian columns fan out left→right, shift to cement.
      ptColumnsRef.current.forEach((c, i) => {
        if (!c) return;
        tl.to(c, {
          left:            `${i * 25}%`,
          width:           '25%',
          backgroundColor: CEMENT,
          duration:        0.16,
          ease:            'power2.inOut',
        }, 1.87 + i * 0.022); // cascade stagger
      });

      // STEP 3 — At 2.10: Transition SNAPS off. Powers SNAPS on.
      //          Seamless handoff — transition cement == Powers cement.
      if (ptOverlayRef.current) {
        tl.to(ptOverlayRef.current, { opacity: 0, duration: 0.001 }, 2.10);
      }
      if (powersOverlayRef.current) {
        tl.to(powersOverlayRef.current, { autoAlpha: 1, duration: 0.001 }, 2.10);
      }

      tl.to({}, { duration: 0.10 }, 2.20);
      if (artifactsOverlayRef.current) {
        tl.to(artifactsOverlayRef.current, { autoAlpha: 1, duration: 0.10, ease: 'power2.out' }, 2.30);
      }
      
      if (powersOverlayRef.current) {
        tl.to(powersOverlayRef.current, { autoAlpha: 0, duration: 0.14, ease: 'power2.inOut' }, 2.34);
      }

      if (artifactsHeaderRef.current) {
        tl.to(artifactsHeaderRef.current, { autoAlpha: 1, y: 0, duration: 0.10, ease: 'power2.out' }, 2.44);
      }

      artifactsRecordsRef.current.forEach((r, i) => {
        if (!r) return;
        tl.to(r, { autoAlpha: 1, y: 0, duration: 0.10, ease: 'power2.out' }, 2.48 + i * 0.04);
      });

      if (artifactsArchiveActionRef.current) {
        tl.to(artifactsArchiveActionRef.current, { autoAlpha: 1, y: 0, duration: 0.10, ease: 'power2.out' }, 2.62);
      }

      tl.to({}, { duration: 0.46 }, 2.60);

      ScrollTrigger.create({
        trigger:             canvas,
        pin:                 true,
        pinSpacing:          true,
        start:               'top top',
        end:                 '+=2934vh',
        scrub:               1.2, // crisp, highly responsive catch-up
        animation:           tl,
        invalidateOnRefresh: true,
        onUpdate(self) {
          const TOTAL = 3.26;

          // Map Quests to strict scroll progress
          const questsStart = 1.474 / TOTAL;
          const questsEnd = 1.87 / TOTAL;
          if (self.progress >= questsStart && self.progress < questsEnd) {
            const range = questsEnd - questsStart;
            const normalized = (self.progress - questsStart) / range;
            const idx = Math.min(Math.floor(normalized * PROJECTS.length), PROJECTS.length - 1);
            setActiveIndex(idx);
          }

          // Powers is visible from 2.10 (after transition) to 2.34 (before Artifacts)
          const wasActive = powersActiveRef.current;
          powersActiveRef.current = self.progress >= 2.10 / TOTAL && self.progress < 2.34 / TOTAL;

          // On entry into Powers, snap columns back to equal layout
          if (powersActiveRef.current && !wasActive) {
            powersColumnsRef.current.forEach((c, i) => {
              if (c) gsap.set(c, { left: `${i * 25}%`, width: '25%', opacity: 1 });
            });
            powersDividersRef.current.forEach((d, i) => {
              if (d) gsap.set(d, { left: `${(i + 1) * 25}%` });
            });
            powersTechRef.current.forEach(t => { if (t) gsap.set(t, { autoAlpha: 0 }); });
            powersStatementRef.current.forEach(s => { if (s) gsap.set(s, { autoAlpha: 0 }); });
            powersTitlesRef.current.forEach(t => { if (t) gsap.set(t, { y: 0 }); });
          }
        },
      });

    }, canvas);

    return () => ctx.revert();
  }, []);

  /* ════════════════════════════════════════════════════════════════════════
     POWERS MOUSE HOVER — uses gsap.to with overwrite:'auto' and direct %
     strings. No unit-conversion: 25% passed as '25%' string → unambiguous.
  */
  useEffect(() => {
    const EQUAL  = 25;      // % width each column at rest
    const ACTIVE = 30;      // % width for hovered column
    const IDLE   = 23.333;  // % width for inactive columns

    let lastIdx = -1;

    const setLayout = (hoverIdx) => {
      if (!powersActiveRef.current) return;
      if (hoverIdx === lastIdx) return;
      lastIdx = hoverIdx;

      const widths = [0, 1, 2, 3].map(i =>
        hoverIdx >= 0 ? (i === hoverIdx ? ACTIVE : IDLE) : EQUAL
      );
      let cur = 0;
      const lefts = widths.map(w => { const l = cur; cur += w; return l; });

      // Columns — width + left + opacity
      [0, 1, 2, 3].forEach(i => {
        const col = powersColumnsRef.current[i];
        if (col) gsap.to(col, {
          left:      `${lefts[i]}%`,
          width:     `${widths[i]}%`,
          opacity:   hoverIdx >= 0 ? (i === hoverIdx ? 1 : 0.35) : 1,
          duration:  0.45,
          ease:      'power3.out',
          overwrite: 'auto',
        });
      });

      // Dividers — follow the right-edge of each column
      [0, 1, 2].forEach(i => {
        const div = powersDividersRef.current[i];
        if (div) gsap.to(div, {
          left:      `${lefts[i + 1]}%`,
          duration:  0.45,
          ease:      'power3.out',
          overwrite: 'auto',
        });
      });

      // Tech annotations + Statements — fade in on active column
      [0, 1, 2, 3].forEach(i => {
        const tech = powersTechRef.current[i];
        const stmt = powersStatementRef.current[i];
        const title = powersTitlesRef.current[i];
        if (tech)  gsap.to(tech,  { autoAlpha: i === hoverIdx ? 1 : 0, duration: 0.3, ease: 'power2.out', overwrite: 'auto' });
        if (stmt)  gsap.to(stmt,  { autoAlpha: i === hoverIdx ? 1 : 0, duration: 0.3, ease: 'power2.out', overwrite: 'auto' });
        if (title) gsap.to(title, { y: i === hoverIdx ? '-8vh' : '0vh', duration: 0.4, ease: 'power2.out', overwrite: 'auto' });
      });
    };

    const onMove = (e) => {
      if (!powersActiveRef.current) { lastIdx = -1; return; }
      const idx = Math.min(Math.floor((e.clientX / window.innerWidth) * 4), 3);
      setLayout(idx);
    };

    const onLeave = () => {
      if (!powersActiveRef.current) return;
      lastIdx = -1;
      setLayout(-1);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseleave', onLeave);

    /* Touch support for Powers — map touch X position to column hover */
    const onTouchMove = (e) => {
      if (!powersActiveRef.current) return;
      const touch = e.touches[0];
      if (!touch) return;
      const col = Math.floor((touch.clientX / window.innerWidth) * 4);
      const idx = Math.max(0, Math.min(3, col));
      setLayout(idx);
    };
    const onTouchEnd = () => {
      if (!powersActiveRef.current) return;
      lastIdx = -1;
      setLayout(-1);
    };
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend',  onTouchEnd,  { passive: true });

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend',  onTouchEnd);
    };
  }, []);

  /* ════════════════════════════════════════════════════════════════════════
     RAIL WHEEL — cycle projects, block Lenis during Quests phase
  */
  useEffect(() => {
    const rail = questsRailRef.current?.parentElement; // the 12vw rail container
    if (!rail) return;

    let lastCycle = 0;
    const onWheel = (e) => {
      if (!railWheelActive.current) return;
      const isScrollDown = e.deltaY > 0;
      if (isScrollDown && activeIndex === PROJECTS.length - 1) {
        // Allow default scroll to advance past Quests
        return;
      }
      if (!isScrollDown && activeIndex === 0) {
        // Allow default scroll to go back to Lore
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      const now = Date.now();
      if (now - lastCycle < 160) return;
      lastCycle = now;
      setActiveIndex(prev => isScrollDown ? Math.min(prev + 1, PROJECTS.length - 1) : Math.max(prev - 1, 0));
    };
    rail.addEventListener('wheel', onWheel, { passive: false });
    return () => rail.removeEventListener('wheel', onWheel);
  }, []);


  /* ════════════════════════════════════════════════════════════════════════
     RAIL WHEEL — cycle projects, block Lenis during Quests phase
  */
  useEffect(() => {
    const rail = questsRailRef.current?.parentElement; // the 12vw rail container
    if (!rail) return;

    let lastCycle = 0;
    const onWheel = (e) => {
      if (!railWheelActive.current) return;
      const isScrollDown = e.deltaY > 0;
      if (isScrollDown && activeIndex === PROJECTS.length - 1) {
        // Allow default scroll to advance past Quests
        return;
      }
      if (!isScrollDown && activeIndex === 0) {
        // Allow default scroll to go back to Lore
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      const now = Date.now();
      if (now - lastCycle < 160) return;
      lastCycle = now;
      setActiveIndex(prev => isScrollDown ? Math.min(prev + 1, PROJECTS.length - 1) : Math.max(prev - 1, 0));
    };
    rail.addEventListener('wheel', onWheel, { passive: false });
    return () => rail.removeEventListener('wheel', onWheel);
  }, [activeIndex]);

  /* ── Rail number highlight sync ─────────────────────────────────────── */
  useEffect(() => {
    numRefs.current.forEach((el, i) => {
      if (el) el.style.color = i === activeIndex ? CEMENT : `${CEMENT}30`;
    });
    lineRefs.current.forEach((el, i) => {
      if (el) {
        el.style.width           = i === activeIndex ? '18px' : '0px';
        el.style.backgroundColor = i === activeIndex ? ORANGE  : 'transparent';
      }
    });
  }, [activeIndex]);

  /* ── Cascading dots ──────────────────────────────────────────────────── */
  useEffect(() => {
    const dots = [dot1Ref, dot2Ref, dot3Ref].map(r => r.current).filter(Boolean);
    if (!dots.length) return;
    gsap.set(dots, { opacity: 0.2, y: 0 });
    const tl = gsap.timeline({ repeat: -1 });
    dots.forEach((d, i) => {
      tl.to(d, { y: 7, opacity: 0.9, duration: 0.35, ease: 'sine.inOut' }, i * 0.22)
        .to(d, { y: 0, opacity: 0.2, duration: 0.35, ease: 'sine.inOut' }, i * 0.22 + 0.35);
    });
    return () => tl.kill();
  }, []);

  /* ── Period hover glow ───────────────────────────────────────────────── */
  useEffect(() => {
    const cleanup = periodRefs.current.filter(Boolean).map(el => {
      const on  = () => gsap.to(el, { scale: 1.45, textShadow: `0 0 18px ${BLUE}AA`, duration: 0.24, ease: 'power2.out', overwrite: 'auto' });
      const off = () => gsap.to(el, { scale: 1,    textShadow: 'none',               duration: 0.24, ease: 'power2.out', overwrite: 'auto' });
      el.addEventListener('mouseenter', on);
      el.addEventListener('mouseleave', off);
      return () => { el.removeEventListener('mouseenter', on); el.removeEventListener('mouseleave', off); };
    });
    return () => cleanup.forEach(fn => fn());
  }, []);

  /* ── Dossier ─────────────────────────────────────────────────────────── */
  const openDossier = useCallback((idx) => {
    const period = periodRefs.current[idx];
    if (!period) return;
    const r = period.getBoundingClientRect();
    setDossier({ index: idx, x: r.left + r.width / 2, y: r.top + r.height / 2 });
  }, []);

  const closeDossier = useCallback(() => setDossier(null), []);

  /* ════════════════════════════════════════════════════════════════════════
     RENDER
  */
  return (
    <>
      <style>{MOBILE_CSS}</style>
      {/* ══════════════════════════════════════════════════════════════════
          THE CANVAS — 100vh, pinned for 1680vh of scroll budget.
          Everything inside is driven by the scrubbed timeline.
          ══════════════════════════════════════════════════════════════════ */}
      <div
        ref={canvasRef}
        style={{ height: '100vh', width: '100vw', overflow: 'hidden', position: 'relative' }}
      >


        {/* ══════════════════════════════════════════════════════════════
            130VW STRIP — hero + lore layout
            Slides from xPercent ≈ -23% (hero) to 0% (lore)
            via the scrubbed timeline.
            ══════════════════════════════════════════════════════════════ */}
        <div
          ref={stripRef}
          style={{
            position: 'absolute', top: 0, left: 0,
            width: '130vw', height: '100%',
            display: 'flex', willChange: 'transform',
          }}
        >
          {/* ── BLOCK 1: Left obsidian 30vw — LORE ─────────────────── */}
          <div
            ref={leftBlockRef}
            style={{ width: '30vw', minWidth: '30vw', flex: 'none', height: '100%', willChange: 'width' }}
            className="bg-[#0A0A0A] text-[#D4D3D0] flex flex-col overflow-hidden"
          >
            <div className="px-7 pt-8 shrink-0">
              <span className="font-sans-brutal text-[9px] tracking-[0.35em] uppercase text-[#D4D3D0]/50 select-none">LORE</span>
              <div className="mt-3 h-px bg-[#D4D3D0]/15" />
            </div>
            <div className="flex-1 flex flex-col justify-evenly px-7 py-8">
              {LORE_TIMELINE.map((item, i) => (
                <div key={i} ref={(el) => { loreItemRefs.current[i] = el; }}>
                  <Magnetic strength={0.35}>
                    <div className="flex flex-col gap-[6px] select-none">
                      <span className="font-sans-brutal text-[11px] tracking-[0.3em] uppercase text-[#FF4D00]">{item.year}</span>
                      <span className="lore-role font-sans-brutal text-2xl md:text-3xl leading-[1.0] uppercase tracking-tight">{item.role}</span>
                      <span className="lore-detail font-serif italic text-base md:text-[17px] text-[#D4D3D0]/80 leading-[1.4]">{item.detail}</span>
                      <span className="lore-stack font-sans-brutal text-[11px] tracking-[0.22em] uppercase text-[#D4D3D0]/45 mt-1">{item.stack}</span>
                    </div>
                  </Magnetic>
                </div>
              ))}
            </div>
          </div>

          {/* ── BLOCK 2: Cement 70vw — shared hero/manifesto ────────── */}
          <div
            style={{ width: '70vw', minWidth: '70vw', flex: 'none', height: '100%', position: 'relative' }}
            className="bg-[#D4D3D0] overflow-hidden"
          >
            {/* Hero content */}
            <div ref={heroContentRef} className="absolute inset-0 flex flex-col px-10 md:px-14 py-8">
              <header className="flex justify-between items-start font-sans-brutal text-[9px] tracking-[0.35em] uppercase text-[#0A0A0A]/60 shrink-0">
                <span data-cursor="name">Vedant Meshram</span>
                <span data-cursor="hover" className="cursor-none">Get in touch ↗</span>
              </header>
              <div className="flex-1 flex flex-col items-start justify-end font-sans-brutal uppercase tracking-tighter leading-[0.97] text-[clamp(2.8rem,8vw,8.5rem)] pb-3 text-[#0A0A0A]">
                {TAGLINE_LINES.map((line, i) => (
                  <div key={i} ref={(el) => { taglineRefs.current[i] = el; }} data-cursor="hover" className="cursor-none">{line}</div>
                ))}
              </div>
            </div>

            {/* Manifesto content */}
            <div ref={manifestoRef} className="absolute inset-0 flex flex-col px-10 md:px-14">
              <div className="pt-8 flex justify-between items-baseline shrink-0">
                <span className="font-sans-brutal text-[9px] tracking-[0.35em] uppercase text-[#0A0A0A]/60 select-none">MANIFESTO</span>
                <span className="font-sans-brutal text-[9px] tracking-[0.35em] uppercase text-[#0A0A0A]/40 select-none tabular-nums">02</span>
              </div>
              <div className="mt-4 h-px bg-[#0A0A0A]/20 shrink-0" />
              <div className="flex-1 flex flex-col pt-10">
                <div ref={statementRef} className="font-sans-brutal uppercase tracking-tighter leading-[0.92] text-[clamp(2.4rem,5.5vw,6.2rem)] text-[#0A0A0A] shrink-0" data-cursor="hover">
                  <div>I BUILD</div>
                  <div>SYSTEMS</div>
                  <div>THAT GO BEYOND.</div>
                </div>
                <div className="flex-1 min-h-[3vh]" />
                <div className="grid manifesto-body-grid shrink-0" style={{ gridTemplateColumns: '5fr 8fr', gap: '0 2.5vw' }}>
                  <div className="flex flex-col justify-end gap-0 pb-1">
                    {PRINCIPLES.map(({ word, sub }, i) => (
                      <div key={i} ref={(el) => { principleRefs.current[i] = el; }} className="border-t border-[#0A0A0A]/20 pt-3 pb-4">
                        <BrutalistSlice mainText={word} subText={sub} travel={34} as="div"
                          className="font-sans-brutal uppercase tracking-tighter leading-[1.0] text-[clamp(1.7rem,2.8vw,3.2rem)] text-[#0A0A0A]"
                          mainClassName="font-sans-brutal text-[#0A0A0A]" />
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col justify-end pb-1 border-t border-[#0A0A0A]/20 pt-3">
                    <p className="sr-only">{MANIFESTO_TEXT}</p>
                    <p aria-hidden="true" className="font-serif text-[17px] md:text-[20px] leading-[1.72] flex flex-wrap gap-x-[0.3em] gap-y-1">
                      {BODY_CHUNKS.map((chunk, idx) => {
                        if (typeof chunk === 'string') return chunk;
                        return (
                          <span key={chunk.key} ref={(el) => { wordEls.current[idx] = el; }} className="inline-block will-change-[color]">
                            {chunk.word}
                          </span>
                        );
                      })}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 mb-7 h-px bg-[#0A0A0A]/20 shrink-0" />
            </div>
          </div>

          {/* ── BLOCK 3: Right obsidian 30vw — hero rail ────────────── */}
          <div ref={heroRightBlockRef} style={{ width: '30vw', minWidth: '30vw', flex: 'none', height: '100%' }} className="overflow-hidden">
            <RightColumn />
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            QUESTS OVERLAY
            Sits on top of the strip, initially invisible (autoAlpha 0).
            The scrubbed timeline fades it in at timeline position 1.22
            (during the compression phase) — exactly when left block is
            halfway compressed and lore content is gone.

            Layout: [12vw obsidian rail | 88vw cement projects]
            This matches the compressed left block width exactly.
            ══════════════════════════════════════════════════════════════ */}
        <div
          ref={questsOverlayRef}
          style={{
            position:   'absolute',
            inset:      0,
            display:    'flex',
            overflow:   'hidden',
            visibility: 'hidden', /* autoAlpha manages this */
            opacity:    0,
            zIndex:     10,
          }}
        >
          {/* ── Quests rail (30vw→12vw) ──────────────────────────── */}
          <div
            ref={questsRailWidthRef}
            style={{
              width:         '30vw',
              flexShrink:    0,
              height:        '100%',
              background:    OBSID,
              borderRight:   `1px solid ${CEMENT}15`,
              overflow:      'hidden',
              display:       'flex',
              flexDirection: 'column',
              willChange:    'width',
            }}
          >
            {/* Rail body — fades in later (position 1.528) */}
            <div
              ref={questsRailRef}
              style={{
                opacity:       0,
                visibility:    'hidden',
                flex:          1,
                display:       'flex',
                flexDirection: 'column',
                overflow:      'hidden',
              }}
            >
              {/* Header */}
              <div style={{ padding: '2rem 1.25rem 0', flexShrink: 0 }}>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '0.35em', textTransform: 'uppercase', color: `${CEMENT}55`, display: 'block', userSelect: 'none' }}>INDEX</span>
                <div style={{ marginTop: '0.75rem', height: '1px', background: `${CEMENT}18` }} />
              </div>

              {/* Numbers */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly', padding: '1.5rem 1.25rem' }}>
                {PROJECTS.map((p, i) => (
                  <div key={i} onMouseEnter={() => setActiveIndex(i)} style={{ display: 'flex', flexDirection: 'column', gap: '5px', cursor: 'none' }}>
                    <span ref={el => { numRefs.current[i] = el; }}
                      style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', letterSpacing: '0.3em', textTransform: 'uppercase', color: i === 0 ? CEMENT : `${CEMENT}30`, userSelect: 'none', display: 'block', transition: 'color 0.35s ease' }}>
                      {p.num}
                    </span>
                    <div ref={el => { lineRefs.current[i] = el; }}
                      style={{ height: '2px', width: i === 0 ? '18px' : '0px', backgroundColor: i === 0 ? ORANGE : 'transparent', transition: 'width 0.35s ease, background-color 0.35s ease' }} />
                  </div>
                ))}
              </div>

              {/* Cascading dots */}
              <div style={{ padding: '0 1.25rem 1.75rem', flexShrink: 0 }}>
                <div style={{ height: '1px', background: `${CEMENT}12`, marginBottom: '1rem' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '0.6rem' }}>
                  {[dot1Ref, dot2Ref, dot3Ref].map((r, i) => (
                    <div key={i} ref={r} style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: BLUE, opacity: 0.2, willChange: 'transform, opacity' }} />
                  ))}
                </div>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: '8px', letterSpacing: '0.28em', textTransform: 'uppercase', color: `${CEMENT}32`, userSelect: 'none', display: 'block' }}>SCROLL</span>
              </div>
            </div>
          </div>

          {/* ── Quests cement (88vw) ──────────────────────────────── */}
          <div style={{ position: 'relative', flex: 1, height: '100%', background: CEMENT, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {/* Section header — always visible once overlay is shown */}
            <div style={{ padding: '2rem 2.5rem 0.75rem', flexShrink: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '0.35em', textTransform: 'uppercase', color: `${OBSID}99`, userSelect: 'none' }}>QUESTS</span>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '0.35em', textTransform: 'uppercase', color: `${OBSID}45`, userSelect: 'none' }}>03</span>
              </div>
              <div style={{ marginTop: '0.75rem', height: '1px', background: `${OBSID}20` }} />
            </div>

            {/* Transition phrase — appears during compression, fades out as
                the project rows come in. Sits on top via flex overlay.   */}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 5 }}>
              <div ref={transitionPhraseRef} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.85rem', willChange: 'transform, opacity' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ width: '32px', height: '1px', background: OBSID, opacity: 0.3 }} />
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '0.4em', textTransform: 'uppercase', color: `${OBSID}99` }}>Phase 03</span>
                  <span style={{ width: '32px', height: '1px', background: OBSID, opacity: 0.3 }} />
                </div>
                <span style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.8rem, 3.6vw, 3.8rem)', fontWeight: 400, fontStyle: 'italic', letterSpacing: '-0.005em', color: OBSID, lineHeight: 1.05 }}>
                  Quests I've Completed
                </span>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase', color: `${OBSID}55` }}>
                  Real Engineering
                </span>
              </div>
            </div>

            {/* Project rows */}
            <div ref={questsCementRef} style={{ opacity: 0, visibility: 'hidden', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: CEMENT }}>
              {PROJECTS.map((project, i) => {
                const isActive = i === activeIndex;
                return (
                  <div key={project.num}
                    onMouseEnter={() => setActiveIndex(i)}
                    onClick={() => {
                      /* Touch-friendly: first tap highlights, second tap opens dossier */
                      if (activeIndex === i) {
                        openDossier(i);
                      } else {
                        setActiveIndex(i);
                      }
                    }}
                    data-cursor="hover"
                    style={{
                      flex: 1, position: 'relative', display: 'flex', flexDirection: 'column',
                      justifyContent: 'center', padding: '0 2.5rem',
                      borderBottom: `1px solid ${OBSID}18`, cursor: 'none',
                      opacity: isActive ? 1 : 0.22, transition: 'opacity 0.4s ease',
                    }}
                  >
                    {/* Orange accent */}
                    <div style={{ position: 'absolute', left: 0, top: '20%', bottom: '20%', width: '3px', background: ORANGE, opacity: isActive ? 1 : 0, transition: 'opacity 0.4s ease' }} />

                    {/* Title + meta */}
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '1rem' }}>
                      <h2 className="quests-proj-title" style={{ fontFamily: 'var(--font-sans)', fontSize: 'clamp(2.1rem, 4.4vw, 5rem)', lineHeight: '0.92', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.01em', color: OBSID, margin: 0, display: 'flex', alignItems: 'baseline', gap: '0.04em', userSelect: 'none', flexShrink: 0 }}>
                        <span style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '0.3em', fontWeight: 400, color: `${OBSID}50`, marginRight: '1.5rem', alignSelf: 'center' }}>{project.num}</span>
                        {project.title}
                        <span ref={el => { periodRefs.current[i] = el; }} aria-hidden="true"
                          style={{ color: BLUE, fontSize: '0.82em', fontFamily: '"Georgia", serif', fontWeight: 400, display: 'inline-block', transformOrigin: 'center bottom', willChange: 'transform' }}>.</span>
                      </h2>
                      <div className="quests-proj-meta" style={{ display: 'flex', gap: '1.1rem', alignItems: 'center', flexShrink: 0 }}>
                        <span style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '0.28em', textTransform: 'uppercase', color: ORANGE,         userSelect: 'none' }}>{project.year}</span>
                        <span style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase', color: `${OBSID}55`, userSelect: 'none' }}>{project.role}</span>
                        <span style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '0.2em',  textTransform: 'uppercase', color: BLUE,           userSelect: 'none', opacity: 0.85 }}>{project.status}</span>
                      </div>
                    </div>

                    {/* Stack (fixed height, no layout shift) */}
                    <div style={{ marginTop: '0.45rem', height: '14px', overflow: 'hidden', display: 'flex', alignItems: 'center', opacity: isActive ? 0.55 : 0, transition: 'opacity 0.4s ease' }}>
                      {project.stack.split(' · ').map((s, j, arr) => (
                        <span key={j} style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: `${OBSID}90` }}>
                          {s}{j < arr.length - 1 && <span style={{ color: BLUE, margin: '0 0.4em', opacity: 0.6 }}>·</span>}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <PowersTransition
          overlayRef={ptOverlayRef}
          columnsRef={ptColumnsRef}
        />

        {/* Powers interactive overlay */}
        <Powers
          overlayRef={powersOverlayRef}
          dividersRef={powersDividersRef}
          columnsRef={powersColumnsRef}
          titleRef={powersTitlesRef}
          techRef={powersTechRef}
          statementRef={powersStatementRef}
          headersRef={powersHeadersRef}
        />

        {/* ══════════════════════════════════════════════════════════════
            ACT V — ARTIFACTS
            Full cement canvas. Editorial verification records.
            Quiet restraint after the fractured Powers matrix.
            ═════════════════════════════════════════════════════════════ */}
        <Artifacts
          overlayRef={artifactsOverlayRef}
          headerRef={artifactsHeaderRef}
          recordsRef={artifactsRecordsRef}
          archiveActionRef={artifactsArchiveActionRef}
        />

      </div>

      {/* Dossier overlay */}
      {dossier !== null && (
        <DossierOverlay
          project={PROJECTS[dossier.index]}
          originX={dossier.x}
          originY={dossier.y}
          onClose={closeDossier}
        />
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   DossierOverlay — circle expand from the blue period
*/
function DossierOverlay({ project, originX, originY, onClose }) {
  const overlayRef = useRef(null);
  const contentRef = useRef(null);
  const closing    = useRef(false);

  const vpW    = typeof window !== 'undefined' ? window.innerWidth  : 1440;
  const vpH    = typeof window !== 'undefined' ? window.innerHeight : 900;
  const origin = `${((originX / vpW) * 100).toFixed(3)}% ${((originY / vpH) * 100).toFixed(3)}%`;

  useEffect(() => {
    // Lock Lenis while dossier is open
    window.__lenis?.stop();
    return () => window.__lenis?.start();
  }, []);

  useEffect(() => {
    gsap.set(overlayRef.current, { clipPath: `circle(0px at ${origin})` });
    gsap.set(contentRef.current, { opacity: 0, y: 26 });
    gsap.timeline()
      .to(overlayRef.current, { clipPath: `circle(150vmax at ${origin})`, duration: 0.65, ease: 'power3.inOut' })
      .to(contentRef.current, { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out' }, 0.35);
  }, [origin]);

  const handleClose = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    gsap.timeline({ onComplete: onClose })
      .to(contentRef.current, { opacity: 0, y: -20, duration: 0.22, ease: 'power2.in' })
      .to(overlayRef.current, { clipPath: `circle(0px at ${origin})`, duration: 0.55, ease: 'power3.inOut' }, 0.12);
  }, [origin, onClose]);

  const stackParts = project.stack.split(' · ');

  return (
    <div ref={overlayRef} onClick={handleClose} data-cursor="hover"
      onWheel={e => e.stopPropagation()}
      style={{ position: 'fixed', inset: 0, zIndex: 300, background: OBSID, cursor: 'none', overflow: 'hidden', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div ref={contentRef} onClick={e => e.stopPropagation()}
        style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '4.5vh 8vw 5vh', color: CEMENT, overflow: 'hidden' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3.5vh', flexShrink: 0 }}>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '0.35em', textTransform: 'uppercase', color: `${CEMENT}45`, userSelect: 'none' }}>{project.num} / {String(PROJECTS.length).padStart(2, '0')}</span>
          <button onClick={handleClose} data-cursor="hover" style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '0.35em', textTransform: 'uppercase', color: BLUE, background: 'none', border: 'none', cursor: 'none', padding: 0 }}>← CLOSE</button>
        </div>

        <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: 'clamp(3.8rem, 12vw, 12rem)', lineHeight: '0.82', textTransform: 'uppercase', letterSpacing: '-0.03em', fontWeight: 900, color: CEMENT, margin: '0 0 2.5vh', display: 'flex', alignItems: 'baseline', gap: '0.03em', userSelect: 'none', flexShrink: 0 }}>
          {project.title}<span style={{ color: BLUE, fontSize: '0.82em', fontFamily: '"Georgia", serif', fontWeight: 400 }}>.</span>
        </h2>

        <div style={{ height: '1px', background: `${CEMENT}20`, marginBottom: '2.5vh', flexShrink: 0 }} />

        <div style={{ display: 'grid', gridTemplateColumns: 'auto auto 1fr', gap: '0 4vw', marginBottom: '2.5vh', flexShrink: 0, rowGap: '1.5vh' }}>
          {[['ROLE', project.role, false], ['YEAR', project.year, true]].map(([label, val, hasStatus]) => (
            <div key={label}>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase', color: `${CEMENT}50`, display: 'block', marginBottom: '0.4rem', userSelect: 'none' }}>{label}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: '16px', color: `${CEMENT}DD` }}>{val}</span>
                {hasStatus && <span style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: BLUE }}>{project.status}</span>}
              </div>
            </div>
          ))}
          <div>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase', color: `${CEMENT}50`, display: 'block', marginBottom: '0.4rem', userSelect: 'none' }}>STACK</span>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              {stackParts.map((s, i) => <span key={i} style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: `${CEMENT}99` }}>{s}{i < stackParts.length - 1 && <span style={{ color: BLUE, margin: '0 0.45em' }}>·</span>}</span>)}
            </div>
          </div>
        </div>

        <div style={{ height: '1px', background: `${CEMENT}15`, marginBottom: '2.5vh', flexShrink: 0 }} />

        <div style={{ flex: 1, minHeight: 0, marginBottom: '2.5vh' }}>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase', color: `${CEMENT}50`, display: 'block', marginBottom: '0.9rem', userSelect: 'none' }}>DESCRIPTION</span>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(14px,1.5vw,19px)', lineHeight: 1.7, color: `${CEMENT}CC`, maxWidth: '68ch', margin: 0 }}>{project.description}</p>
        </div>

        <div style={{ height: '1px', background: `${CEMENT}15`, marginBottom: '2.5vh', flexShrink: 0 }} />

        <div style={{ flexShrink: 0 }}>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase', color: `${CEMENT}50`, display: 'block', marginBottom: '0.5rem', userSelect: 'none' }}>OUTCOME</span>
          <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 'clamp(13px,1.35vw,17px)', lineHeight: 1.6, color: `${CEMENT}EE`, margin: 0 }}>{project.outcome}</p>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: '1.75rem', left: '50%', transform: 'translateX(-50%)', fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase', color: `${CEMENT}22`, userSelect: 'none', pointerEvents: 'none' }}>
        CLICK ANYWHERE TO CLOSE
      </div>
    </div>
  );
}
