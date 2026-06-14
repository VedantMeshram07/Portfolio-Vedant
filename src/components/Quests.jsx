import { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* ─── tokens ─────────────────────────────────────────────────────────── */
const BLUE   = '#3B82F6';
const OBSID  = '#0A0A0A';
const CEMENT = '#D4D3D0';
const ORANGE = '#FF4D00';

/* ─── data ───────────────────────────────────────────────────────────── */
const PROJECTS = [
  {
    num: '01', title: 'AURA', year: '2026', role: 'Founding Engineer',
    stack: 'React · Node.js · PostgreSQL · LLM',
    description:
      'Autonomous infrastructure platform. Engineered the core agent orchestration ' +
      'pipeline, distributed task scheduling, and real-time monitoring systems from ground zero.',
    outcome: 'Processing 10K+ autonomous tasks daily with 99.7% uptime.',
    status: 'ACTIVE',
  },
  {
    num: '02', title: 'SENTINEL', year: '2025', role: 'Backend Engineer',
    stack: 'Python · FastAPI · Redis · Docker · K8s',
    description:
      'Real-time threat detection and system monitoring platform. Architected the ' +
      'event-driven pipeline for zero-latency anomaly detection across distributed infrastructure.',
    outcome: 'Reduced incident response time from 4 minutes to 12 seconds.',
    status: 'DEPLOYED',
  },
  {
    num: '03', title: 'MINDSYNC', year: '2025', role: 'AI Developer',
    stack: 'LangChain · OpenAI · Pinecone · React',
    description:
      'Enterprise knowledge automation framework. Built the RAG pipeline with multi-tool ' +
      'agent capabilities, enabling autonomous document analysis and intelligent workflow execution.',
    outcome: 'Automated 68% of manual knowledge retrieval processes.',
    status: 'DEPLOYED',
  },
  {
    num: '04', title: 'SPECTRA', year: '2024', role: 'Full Stack Developer',
    stack: 'Next.js · TypeScript · Prisma · AWS',
    description:
      'Data visualisation and analytics platform for complex system monitoring. Designed ' +
      'the real-time streaming dashboard with architectural precision and editorial clarity.',
    outcome: 'Unified 12 disparate data sources into one analytical surface.',
    status: 'SHIPPED',
  },
];

/* ══════════════════════════════════════════════════════════════════════
   WHY ScrollTrigger pin, NOT position:sticky
   ──────────────────────────────────────────────────────────────────────
   Lenis drives scroll via transform:translateY, bypassing native
   scrollTop. CSS position:sticky relies on native scrollTop → it
   simply does not fire when Lenis is active.

   ScrollTrigger pin works because it is driven by
     lenis.on('scroll', ScrollTrigger.update)
   which keeps GSAP in sync with Lenis's virtual scroll position.

   SCROLL ZONE ROUTING (the "sliding block" interaction model):
   ┌─────────────────────────────────────────────────────────────┐
   │  RAIL (left black block)                                    │
   │    wheel → preventDefault + stopPropagation                 │
   │    Lenis never sees the event → scroll position unchanged   │
   │    → ScrollTrigger pin does NOT advance → section stays locked│
   │    → setActiveIndex cycles the project list                 │
   ├─────────────────────────────────────────────────────────────┤
   │  CEMENT (right side)                                        │
   │    wheel → no interception                                  │
   │    Lenis sees the event → advances virtual scroll           │
   │    → ScrollTrigger.update() → pin advances                 │
   │    → after 150vh of cement scrolling, pin releases → exit   │
   └─────────────────────────────────────────────────────────────┘
   ══════════════════════════════════════════════════════════════════════ */

export default function Quests() {

  /* ── refs ─────────────────────────────────────────────────────────── */
  const pinnedRef     = useRef(null);  // 100vh frame — GSAP pins this
  const railRef       = useRef(null);  // obsidian spine  (12vw)
  const railBodyRef   = useRef(null);  // rail content    (opacity 0→1)
  const cementBodyRef = useRef(null);  // project rows    (opacity 0→1)
  const numRefs       = useRef([]);    // 01–04 number spans
  const lineRefs      = useRef([]);    // orange accent lines
  const periodRefs    = useRef([]);    // blue "." spans
  const dot1Ref       = useRef(null);
  const dot2Ref       = useRef(null);
  const dot3Ref       = useRef(null);
  const hasEntered    = useRef(false); // guard: entry animation fires once

  /* ── state ────────────────────────────────────────────────────────── */
  const [activeIndex, setActiveIndex] = useState(0);
  const [dossier,     setDossier]     = useState(null);

  /* ════════════════════════════════════════════════════════════════════
     EFFECT 1 — ScrollTrigger pin + one-shot entry animation
     ════════════════════════════════════════════════════════════════════
     Pin budget: 150vh.
     - 0 → 150vh  : pin holds while user interacts with rail
     - 150vh done : pin releases, next section appears

     onEnter fires the GSAP animation ONCE when the section pins.
  */
  useEffect(() => {
    const pinned      = pinnedRef.current;
    const railBody    = railBodyRef.current;
    const cementBody  = cementBodyRef.current;
    if (!pinned || !railBody || !cementBody) return;

    /*
      Quests starts with rail already at 12vw.
      PanelShift's scrubbed timeline handled the 30vw→12vw compression
      as its final phase. We only need to fade the content in.
    */
    gsap.set(railBody,   { autoAlpha: 0 });
    gsap.set(cementBody, { autoAlpha: 0 });

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger:            pinned,
        pin:                true,
        pinSpacing:         true,
        start:              'top top',
        end:                '+=150vh',
        invalidateOnRefresh: true,

        onEnter() {
          /* Guard: prevent re-firing on ScrollTrigger.refresh() */
          if (hasEntered.current) return;
          hasEntered.current = true;

          /*
            Content reveal only — no width animation.
            PanelShift left the layout at [12vw black | cement].
            We pick up there and populate the content.
          */
          gsap.timeline()
            .to(cementBody, {
              autoAlpha: 1,
              duration:  0.75,
              ease:      'power2.out',
            }, 0)
            .to(railBody, {
              autoAlpha: 1,
              duration:  0.55,
              ease:      'power2.out',
            }, 0.25);
        },
      });
    }, pinned);

    return () => ctx.revert();
  }, []);

  /* ════════════════════════════════════════════════════════════════════
     EFFECT 2 — Rail wheel → cycle activeIndex, block Lenis
     ════════════════════════════════════════════════════════════════════
     stopPropagation ensures the event never bubbles to the window
     where Lenis listens. Without it reaching Lenis, the virtual
     scroll position stays the same, ScrollTrigger doesn't update,
     and the pin does not advance. The section appears "locked".
  */
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    let lastCycle = 0;
    const THROTTLE = 160; // ms — prevents runaway cycling

    const onWheel = (e) => {
      e.preventDefault();
      e.stopPropagation();

      const now = Date.now();
      if (now - lastCycle < THROTTLE) return;
      lastCycle = now;

      setActiveIndex(prev =>
        e.deltaY > 0
          ? Math.min(prev + 1, PROJECTS.length - 1)
          : Math.max(prev - 1, 0)
      );
    };

    rail.addEventListener('wheel', onWheel, { passive: false });
    return () => rail.removeEventListener('wheel', onWheel);
  }, []);

  /* ════════════════════════════════════════════════════════════════════
     EFFECT 3 — Sync rail indicator to activeIndex
  */
  useEffect(() => {
    numRefs.current.forEach((el, i) => {
      if (!el) return;
      el.style.color = i === activeIndex ? CEMENT : `${CEMENT}30`;
    });
    lineRefs.current.forEach((el, i) => {
      if (!el) return;
      el.style.width           = i === activeIndex ? '18px' : '0px';
      el.style.backgroundColor = i === activeIndex ? ORANGE  : 'transparent';
    });
  }, [activeIndex]);

  /* ════════════════════════════════════════════════════════════════════
     EFFECT 4 — Cascading dots (scroll-on-rail affordance)
  */
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

  /* ════════════════════════════════════════════════════════════════════
     EFFECT 5 — Period hover glow
  */
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

  /* ── dossier ─────────────────────────────────────────────────────── */
  const openDossier = useCallback((idx) => {
    const period = periodRefs.current[idx];
    if (!period) return;
    const r = period.getBoundingClientRect();
    setDossier({ index: idx, x: r.left + r.width / 2, y: r.top + r.height / 2 });
    document.body.style.overflow = 'hidden';
  }, []);

  const closeDossier = useCallback(() => {
    setDossier(null);
    document.body.style.overflow = '';
  }, []);

  /* ── render ──────────────────────────────────────────────────────── */
  return (
    <>
      {/* ══════════════════════════════════════════════════════════════
          PINNED FRAME
          100vh, pinned by ScrollTrigger for 150vh of scroll budget.
          ══════════════════════════════════════════════════════════════ */}
      <div
        ref={pinnedRef}
        style={{
          position:   'relative',
          zIndex:     0,
          height:     '100vh',
          display:    'flex',
          overflow:   'hidden',
          background: CEMENT,
        }}
      >

        {/* ════════════════════════════════════════════════════════════
            LEFT — OBSIDIAN RAIL
            Width at 12vw.
            Wheel events intercepted here → cycles projects.
            ════════════════════════════════════════════════════════════ */}
        <div
          ref={railRef}
          style={{
            width:         '12vw',
            height:        '100%',
            flexShrink:    0,
            background:    OBSID,
            borderRight:   `1px solid ${CEMENT}15`,
            overflow:      'hidden',
            display:       'flex',
            flexDirection: 'column',
          }}
        >
          {/* Rail body — hidden until entry animation fires */}
          <div
            ref={railBodyRef}
            style={{
              visibility:    'hidden', // autoAlpha manages this
              opacity:       0,
              flex:          1,
              display:       'flex',
              flexDirection: 'column',
              overflow:      'hidden',
            }}
          >
            {/* Header */}
            <div style={{ padding: '2rem 1.25rem 0', flexShrink: 0 }}>
              <span style={{
                fontFamily:    'var(--font-sans)', fontSize: '9px',
                letterSpacing: '0.35em', textTransform: 'uppercase',
                color: `${CEMENT}55`, display: 'block', userSelect: 'none',
              }}>INDEX</span>
              <div style={{ marginTop: '0.75rem', height: '1px', background: `${CEMENT}18` }} />
            </div>

            {/* Project numbers */}
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              justifyContent: 'space-evenly', padding: '1.5rem 1.25rem',
            }}>
              {PROJECTS.map((p, i) => (
                <div
                  key={i}
                  onMouseEnter={() => setActiveIndex(i)}
                  style={{ display: 'flex', flexDirection: 'column', gap: '5px', cursor: 'none' }}
                >
                  <span
                    ref={el => { numRefs.current[i] = el; }}
                    style={{
                      fontFamily:    'var(--font-sans)', fontSize: '14px',
                      letterSpacing: '0.3em', textTransform: 'uppercase',
                      color:         i === 0 ? CEMENT : `${CEMENT}30`,
                      userSelect:    'none', display: 'block',
                      transition:    'color 0.35s ease',
                    }}
                  >{p.num}</span>
                  <div
                    ref={el => { lineRefs.current[i] = el; }}
                    style={{
                      height:          '2px',
                      width:           i === 0 ? '18px' : '0px',
                      backgroundColor: i === 0 ? ORANGE : 'transparent',
                      transition:      'width 0.35s ease, background-color 0.35s ease',
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Scroll indicator — cascading blue dots */}
            <div style={{ padding: '0 1.25rem 1.75rem', flexShrink: 0 }}>
              <div style={{ height: '1px', background: `${CEMENT}12`, marginBottom: '1rem' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '0.6rem' }}>
                {[dot1Ref, dot2Ref, dot3Ref].map((r, i) => (
                  <div key={i} ref={r} style={{
                    width: '4px', height: '4px', borderRadius: '50%',
                    backgroundColor: BLUE, opacity: 0.2,
                    willChange: 'transform, opacity',
                  }} />
                ))}
              </div>
              <span style={{
                fontFamily:    'var(--font-sans)', fontSize: '8px',
                letterSpacing: '0.28em', textTransform: 'uppercase',
                color:         `${CEMENT}32`, userSelect: 'none', display: 'block',
              }}>SCROLL</span>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════
            RIGHT — CEMENT STAGE
            All 4 projects visible simultaneously as equal-height rows.
            No scroll interception — wheel events reach Lenis → pin advances.
            ════════════════════════════════════════════════════════════ */}
        <div style={{
          flex:          1,
          height:        '100%',
          background:    CEMENT,
          overflow:      'hidden',
          display:       'flex',
          flexDirection: 'column',
        }}>

          {/* Section header — always visible (not part of the fade) */}
          <div style={{ padding: '2rem 2.5rem 0.75rem', flexShrink: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{
                fontFamily: 'var(--font-sans)', fontSize: '9px',
                letterSpacing: '0.35em', textTransform: 'uppercase',
                color: `${OBSID}99`, userSelect: 'none',
              }}>QUESTS</span>
              <span style={{
                fontFamily: 'var(--font-sans)', fontSize: '9px',
                letterSpacing: '0.35em', textTransform: 'uppercase',
                color: `${OBSID}45`, userSelect: 'none',
              }}>03</span>
            </div>
            <div style={{ marginTop: '0.75rem', height: '1px', background: `${OBSID}20` }} />
          </div>

          {/* Project rows — fade in with cementBody */}
          <div
            ref={cementBodyRef}
            style={{
              visibility:    'hidden', // autoAlpha manages this
              opacity:       0,
              flex:          1,
              display:       'flex',
              flexDirection: 'column',
              overflow:      'hidden',
            }}
          >
            {PROJECTS.map((project, i) => {
              const isActive = i === activeIndex;
              return (
                <div
                  key={project.num}
                  onMouseEnter={() => setActiveIndex(i)}
                  onClick={() => openDossier(i)}
                  data-cursor="hover"
                  style={{
                    flex:           1,
                    position:       'relative',
                    display:        'flex',
                    flexDirection:  'column',
                    justifyContent: 'center',
                    padding:        '0 2.5rem',
                    borderBottom:   `1px solid ${OBSID}18`,
                    cursor:         'none',
                    opacity:        isActive ? 1 : 0.22,
                    transition:     'opacity 0.4s ease',
                  }}
                >
                  {/* Orange left accent — active only */}
                  <div style={{
                    position:   'absolute',
                    left:       0,
                    top:        '20%', bottom: '20%',
                    width:      '3px',
                    background: ORANGE,
                    opacity:    isActive ? 1 : 0,
                    transition: 'opacity 0.4s ease',
                  }} />

                  {/* Title + metadata row */}
                  <div style={{
                    display:        'flex',
                    alignItems:     'baseline',
                    justifyContent: 'space-between',
                    gap:            '1rem',
                  }}>
                    {/* Number + Title + Period */}
                    <h2 style={{
                      fontFamily:    'var(--font-sans)',
                      fontSize:      'clamp(1.9rem, 4vw, 4.5rem)',
                      lineHeight:    '0.86',
                      fontWeight:    900,
                      textTransform: 'uppercase',
                      letterSpacing: '-0.03em',
                      color:         OBSID,
                      margin:        0,
                      display:       'flex',
                      alignItems:    'baseline',
                      gap:           '0.04em',
                      userSelect:    'none',
                      flexShrink:    0,
                    }}>
                      <span style={{
                        fontFamily:    'var(--font-sans)',
                        fontSize:      '9px',
                        letterSpacing: '0.3em',
                        fontWeight:    400,
                        color:         `${OBSID}50`,
                        marginRight:   '1.5rem',
                        alignSelf:     'center',
                      }}>{project.num}</span>

                      {project.title}

                      <span
                        ref={el => { periodRefs.current[i] = el; }}
                        aria-hidden="true"
                        style={{
                          color:           BLUE,
                          fontSize:        '0.82em',
                          fontFamily:      '"Georgia", "Times New Roman", serif',
                          fontWeight:      400,
                          display:         'inline-block',
                          transformOrigin: 'center bottom',
                          willChange:      'transform',
                        }}
                      >.</span>
                    </h2>

                    {/* Metadata */}
                    <div style={{ display: 'flex', gap: '1.1rem', alignItems: 'center', flexShrink: 0 }}>
                      <span style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '0.28em', textTransform: 'uppercase', color: ORANGE,         userSelect: 'none' }}>{project.year}</span>
                      <span style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase', color: `${OBSID}55`, userSelect: 'none' }}>{project.role}</span>
                      <span style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '0.2em',  textTransform: 'uppercase', color: BLUE,           userSelect: 'none', opacity: 0.85 }}>{project.status}</span>
                    </div>
                  </div>

                  {/* Stack — fixed height, only visible on active row (no layout shift) */}
                  <div style={{
                    marginTop:  '0.45rem',
                    height:     '14px',
                    overflow:   'hidden',
                    display:    'flex',
                    alignItems: 'center',
                    opacity:    isActive ? 0.55 : 0,
                    transition: 'opacity 0.4s ease',
                  }}>
                    {project.stack.split(' · ').map((s, j, arr) => (
                      <span key={j} style={{
                        fontFamily:    'var(--font-sans)',
                        fontSize:      '9px',
                        letterSpacing: '0.18em',
                        textTransform: 'uppercase',
                        color:         `${OBSID}90`,
                      }}>
                        {s}
                        {j < arr.length - 1 && (
                          <span style={{ color: BLUE, margin: '0 0.4em', opacity: 0.6 }}>·</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* ════════════════════════════════════════════════════════════════
          DOSSIER OVERLAY
          Full-screen obsidian. Expands via clip-path circle from
          the clicked project's blue period. Single 100vh — no scroll.
          ════════════════════════════════════════════════════════════════ */}
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

/* ══════════════════════════════════════════════════════════════════════
   DossierOverlay
   ══════════════════════════════════════════════════════════════════════ */
function DossierOverlay({ project, originX, originY, onClose }) {
  const overlayRef = useRef(null);
  const contentRef = useRef(null);
  const closing    = useRef(false);

  const vpW    = typeof window !== 'undefined' ? window.innerWidth  : 1440;
  const vpH    = typeof window !== 'undefined' ? window.innerHeight : 900;
  const origin = `${((originX / vpW) * 100).toFixed(3)}% ${((originY / vpH) * 100).toFixed(3)}%`;

  useEffect(() => {
    const overlay = overlayRef.current;
    const content = contentRef.current;
    if (!overlay || !content) return;

    gsap.set(overlay, { clipPath: `circle(0px at ${origin})` });
    gsap.set(content, { opacity: 0, y: 26 });

    gsap.timeline()
      .to(overlay, { clipPath: `circle(150vmax at ${origin})`, duration: 0.65, ease: 'power3.inOut' })
      .to(content, { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out' }, 0.35);
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
    <div
      ref={overlayRef}
      onClick={handleClose}
      data-cursor="hover"
      style={{
        position:      'fixed', inset: 0, zIndex: 300,
        background:    OBSID, cursor: 'none',
        overflow:      'hidden', height: '100vh',
        display:       'flex', flexDirection: 'column',
      }}
    >
      <div
        ref={contentRef}
        onClick={e => e.stopPropagation()}
        style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          padding: '4.5vh 8vw 5vh', color: CEMENT, overflow: 'hidden',
        }}
      >
        {/* Top bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3.5vh', flexShrink: 0 }}>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '0.35em', textTransform: 'uppercase', color: `${CEMENT}45`, userSelect: 'none' }}>
            {project.num} / {String(PROJECTS.length).padStart(2, '0')}
          </span>
          <button
            onClick={handleClose}
            data-cursor="hover"
            style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '0.35em', textTransform: 'uppercase', color: BLUE, background: 'none', border: 'none', cursor: 'none', userSelect: 'none', padding: 0 }}
          >← CLOSE</button>
        </div>

        {/* Title */}
        <div style={{ flexShrink: 0, marginBottom: '2.5vh' }}>
          <h2 style={{
            fontFamily: 'var(--font-sans)', fontSize: 'clamp(3.8rem, 12vw, 12rem)',
            lineHeight: '0.82', textTransform: 'uppercase', letterSpacing: '-0.03em',
            fontWeight: 900, color: CEMENT, margin: 0,
            display: 'flex', alignItems: 'baseline', gap: '0.03em', userSelect: 'none',
          }}>
            {project.title}
            <span style={{ color: BLUE, fontSize: '0.82em', fontFamily: '"Georgia", serif', fontWeight: 400 }}>.</span>
          </h2>
        </div>

        <div style={{ height: '1px', background: `${CEMENT}20`, marginBottom: '2.5vh', flexShrink: 0 }} />

        {/* Metadata */}
        <div style={{ display: 'grid', gridTemplateColumns: 'auto auto 1fr', gap: '0 4vw', marginBottom: '2.5vh', flexShrink: 0, rowGap: '1.5vh' }}>
          <div>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase', color: `${CEMENT}50`, display: 'block', marginBottom: '0.4rem', userSelect: 'none' }}>ROLE</span>
            <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '16px', color: `${CEMENT}DD` }}>{project.role}</span>
          </div>
          <div>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase', color: `${CEMENT}50`, display: 'block', marginBottom: '0.4rem', userSelect: 'none' }}>YEAR</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: '16px', color: `${CEMENT}DD` }}>{project.year}</span>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: BLUE }}>{project.status}</span>
            </div>
          </div>
          <div>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase', color: `${CEMENT}50`, display: 'block', marginBottom: '0.4rem', userSelect: 'none' }}>STACK</span>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              {stackParts.map((s, i) => (
                <span key={i} style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: `${CEMENT}99` }}>
                  {s}{i < stackParts.length - 1 && <span style={{ color: BLUE, margin: '0 0.45em' }}>·</span>}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div style={{ height: '1px', background: `${CEMENT}15`, marginBottom: '2.5vh', flexShrink: 0 }} />

        {/* Description */}
        <div style={{ flex: 1, minHeight: 0, marginBottom: '2.5vh' }}>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase', color: `${CEMENT}50`, display: 'block', marginBottom: '0.9rem', userSelect: 'none' }}>DESCRIPTION</span>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(14px, 1.5vw, 19px)', lineHeight: 1.7, color: `${CEMENT}CC`, maxWidth: '68ch', margin: 0 }}>
            {project.description}
          </p>
        </div>

        <div style={{ height: '1px', background: `${CEMENT}15`, marginBottom: '2.5vh', flexShrink: 0 }} />

        {/* Outcome */}
        <div style={{ flexShrink: 0 }}>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase', color: `${CEMENT}50`, display: 'block', marginBottom: '0.5rem', userSelect: 'none' }}>OUTCOME</span>
          <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 'clamp(13px, 1.35vw, 17px)', lineHeight: 1.6, color: `${CEMENT}EE`, margin: 0 }}>
            {project.outcome}
          </p>
        </div>
      </div>

      <div style={{
        position: 'absolute', bottom: '1.75rem', left: '50%', transform: 'translateX(-50%)',
        fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '0.3em',
        textTransform: 'uppercase', color: `${CEMENT}22`, userSelect: 'none', pointerEvents: 'none',
      }}>
        CLICK ANYWHERE TO CLOSE
      </div>
    </div>
  );
}
