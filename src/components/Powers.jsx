import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

/* ─── design tokens (mirror SiteCanvas) ─────────────────────────────────── */
const OBSID  = '#0A0A0A';
const CEMENT = '#D4D3D0';

/* ─── capability data ───────────────────────────────────────────────────── */
const POWERS = [
  {
    id:   '01',
    title: 'APPLICATIONS',
    techs: ['React', 'Next.js', 'TypeScript', 'WebGL'],
    statement: 'Crafting high-performance interfaces with architectural precision and editorial clarity.',
  },
  {
    id:   '02',
    title: 'SYSTEMS',
    techs: ['Python', 'Node.js', 'FastAPI', 'PostgreSQL'],
    statement: 'Building scalable systems and resilient API architectures for production load.',
  },
  {
    id:   '03',
    title: 'INTELLIGENCE',
    techs: ['Python', 'LangChain', 'RAG', 'Agents'],
    statement: 'Designing autonomous systems that reason, retrieve and act.',
  },
  {
    id:   '04',
    title: 'INFRASTRUCTURE',
    techs: ['Docker', 'Kubernetes', 'AWS', 'Terraform'],
    statement: 'Operating distributed systems that scale, self-heal, and stay observable.',
  },
];

export default function Powers({
  overlayRef,        // the entire Powers frame (autoAlpha 0→1 on phase entry)
  dividersRef,       // ref.current[0..2] — the 3 thin dividing lines
  columnsRef,        // ref.current[0..3] — the 4 cement column containers
  titleRef,          // ref.current[0..3] — title wrapper container (for active shift)
  titleEmergenceRef, // ref.current[0..3] — h2 title element (for baseline emergence)
  techRef,           // ref.current[0..3] — tech annotation stacks
  statementRef,      // ref.current[0..3] — capability statement per column
  headersRef,        // ref.current[0..3] — index + pole headers per column
  visibleRef,        // ref flag for "should we listen to mouse moves?"
  onCloseDossier,    // called once at phase A so any open Quests dossier closes
  scrollActiveIndex, // column active index driven by scroll position
}) {
  /* ── active column state (driven by cursor proximity) ─────────────── */
  const [activeId, setActiveId] = useState('03'); // default to center-most column (INTELLIGENCE)
  const lastMoveRef = useRef(Date.now());

  /* ── cursor proximity → active column ─────────────────────────────── */
  useEffect(() => {
    const onMove = (e) => {
      lastMoveRef.current = Date.now();
      if (!visibleRef?.current) return;

      const vw = window.innerWidth;
      const colWidth = vw / 4;
      const cursorX = e.clientX;

      let nearest = 0;
      let nearestDist = Infinity;
      for (let i = 0; i < 4; i++) {
        const cx = colWidth * (i + 0.5);
        const d  = Math.abs(cursorX - cx);
        if (d < nearestDist) { nearestDist = d; nearest = i; }
      }
      setActiveId(POWERS[nearest].id);
    };

    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [visibleRef]);

  /* ── fallback/secondary: mouse stopped or touch/mobile scroll ─────── */
  useEffect(() => {
    let raf;
    const tick = () => {
      if (visibleRef?.current && Date.now() - lastMoveRef.current > 2000) {
        if (scrollActiveIndex !== undefined && scrollActiveIndex !== -1) {
          setActiveId(POWERS[scrollActiveIndex].id);
        } else {
          setActiveId('03'); // fallback: center-most
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [visibleRef, scrollActiveIndex]);

  /* ── close any open dossier when Powers phase begins ───────────────── */
  useEffect(() => {
    if (visibleRef?.current && onCloseDossier) {
      onCloseDossier();
    }
  }, [visibleRef, onCloseDossier]);

  /* ── flex-grow the active column, compress the others ──────────────── */
  useEffect(() => {
    // CRITICAL: Don't touch columns until the GSAP timeline has reached
    // the distribution phase. Before that, the columns must stay in
    // their packed state (3vw each, lefts 0,3,6,9vw) so the fracture
    // and distribution animations work as designed.
    if (!visibleRef?.current) {
      // Only run the "active column flex" logic after the timeline
      // has finished distributing the 4 columns (phase H+, position 2.45+).
      return;
    }

    const getLayout = (activeId) => {
      const idx = POWERS.findIndex(p => p.id === activeId);
      let widths = ['23.333%', '23.333%', '23.333%', '23.333%'];
      let lefts = [];
      let divs = [];

      widths[idx] = '30%';
      let cur = 0;
      for (let i = 0; i < 4; i++) {
        lefts.push(`${cur}%`);
        cur += parseFloat(widths[i]);
      }
      divs = [lefts[1], lefts[2], lefts[3]];
      return { widths, lefts, divs };
    };

    const { widths, lefts, divs } = getLayout(activeId);

    POWERS.forEach((p, idx) => {
      const isActive = p.id === activeId;
      const col = columnsRef?.current?.[idx];
      if (!col) return;

      // Animate left, width, and background opacity of columns
      gsap.to(col, {
        left: lefts[idx],
        width: widths[idx],
        opacity: isActive ? 1 : 0.35, // inactive columns dim deeply
        duration: 0.55,
        ease: 'power3.out',
        overwrite: 'auto',
      });

      // Animate title y position (slide up to make room for content)
      const title = titleRef?.current?.[idx];
      if (title) {
        gsap.to(title, {
          y: isActive ? '-12vh' : '0vh',
          duration: 0.55,
          ease: 'power3.out',
          overwrite: 'auto',
        });
      }

      // Statement opacity / tech contrast
      const stmt = statementRef?.current?.[idx];
      if (stmt) {
        gsap.to(stmt, {
          autoAlpha: isActive ? 1 : 0.0,
          y:         isActive ? 0 : 6,
          duration:  0.5,
          ease:      'power2.out',
          overwrite: 'auto',
        });
      }
      const tech = techRef?.current?.[idx];
      if (tech) {
        gsap.to(tech, {
          autoAlpha: isActive ? 1 : 0.0,
          y:         isActive ? 0 : 8,
          duration:  0.5,
          ease:      'power2.out',
          overwrite: 'auto',
        });
      }
    });

    // Animate structural dividing lines
    dividersRef.current.forEach((d, idx) => {
      if (!d) return;
      if (visibleRef?.current) {
        gsap.to(d, {
          left: divs[idx],
          duration: 0.55,
          ease: 'power3.out',
          overwrite: 'auto',
        });
      }
    });
  }, [activeId, columnsRef, titleRef, statementRef, techRef, dividersRef, visibleRef]);

  return (
    <div
      ref={overlayRef}
      style={{
        position:      'absolute',
        inset:         0,
        display:       'flex',
        flexDirection: 'row',
        background:    'transparent', // Quests cement backdrop shows through
                                      // during fracture/expansion. The 4 black
                                      // columns expand OUTWARD over the Quests
                                      // text body, gradually covering it.
        overflow:      'hidden',
        visibility:    'hidden', // autoAlpha-managed
        opacity:       0,
        zIndex:        20,
      }}
    >
      {/* ══════════════════════════════════════════════════════════════
          3 STRUCTURAL DIVIDERS (between the 4 columns)
          Each divider is a thin 1px line that sits on the boundary.
          ═══════════════════════════════════════════════════════════ */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={`div-${i}`}
          ref={(el) => { if (dividersRef) dividersRef.current[i] = el; }}
          style={{
            position:   'absolute',
            top:        0,
            left:       0,           // left is animated by timeline
            width:      '1px',       // 1px hairline divider
            height:     '100%',
            background: OBSID,
            willChange: 'left',
            zIndex:     10,          // render in front of columns
            transform:  'translateX(-0.5px)', // center the 1px line on the boundary
          }}
        />
      ))}

      {/* ══════════════════════════════════════════════════════════════
          4 CAPABILITY COLUMNS (positioned absolutely)
          ═══════════════════════════════════════════════════════════ */}
      {POWERS.map((p, i) => {
        return (
          <div
            key={`col-${p.id}`}
            ref={(el) => { if (columnsRef) columnsRef.current[i] = el; }}
            style={{
              position:      'absolute',
              top:           0,
              left:          0,
              width:         0,
              height:        '100%',
              background:    CEMENT,
              display:       'flex',
              flexDirection: 'column',
              padding:       '6vh 3vw',
              overflow:      'hidden',
              willChange:    'left, width, opacity',
            }}
          >
            {/* Subtle dot grid texture */}
            <div style={{
              position: 'absolute', inset: 0, opacity: 0.04, pointerEvents: 'none',
              backgroundImage: `radial-gradient(${OBSID} 1px, transparent 1px)`,
              backgroundSize: '24px 24px',
            }} />
            
            {/* Geometric Crosshairs (Corners) */}
            <div style={{ position: 'absolute', top: '2vh', left: '1.5vw', width: '6px', height: '1px', background: `${OBSID}40` }} />
            <div style={{ position: 'absolute', top: '2vh', right: '1.5vw', width: '6px', height: '1px', background: `${OBSID}40` }} />
            <div style={{ position: 'absolute', bottom: '2vh', left: '1.5vw', width: '6px', height: '1px', background: `${OBSID}40` }} />
            <div style={{ position: 'absolute', bottom: '2vh', right: '1.5vw', width: '6px', height: '1px', background: `${OBSID}40` }} />
            {/* Index + pole label */}
            <div
              ref={(el) => { if (headersRef) headersRef.current[i] = el; }}
              style={{
                position: 'absolute',
                top: '3.5vh',
                left: '3vw',
                right: '3vw',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                flexShrink: 0,
              }}
            >
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '0.4em', textTransform: 'uppercase', color: `${OBSID}99`, userSelect: 'none' }}>{p.id}</span>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase', color: `${OBSID}45`, userSelect: 'none' }}>POLE</span>
            </div>

            {/* Vertically centered layout wrapper */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, width: '100%', position: 'relative' }}>
              
              {/* TITLE — Anton, monumental. Positioned centered, slides up when active */}
              <div
                ref={(el) => { if (titleRef) titleRef.current[i] = el; }}
                style={{ transform: 'translateY(0px)', willChange: 'transform' }}
              >
                {/* Emergence mask (overflow hidden) for initial text rise */}
                <div style={{ overflow: 'hidden' }}>
                  <h2
                    ref={(el) => { if (titleEmergenceRef) titleEmergenceRef.current[i] = el; }}
                    style={{
                      fontFamily:    'var(--font-sans)',
                      fontSize:      'clamp(2.1rem, 3.6vw, 4.2rem)',
                      lineHeight:    0.92,
                      fontWeight:    900,
                      textTransform: 'uppercase',
                      letterSpacing: '0.01em',
                      color:         OBSID,
                      margin:        0,
                      userSelect:    'none',
                      textAlign:     'center',
                      willChange:    'transform',
                    }}
                  >
                    {p.title}
                  </h2>
                </div>
              </div>

              {/* CONTENT — Positioned absolutely below the centered title. Appears when hovered */}
              <div
                style={{
                  position:      'absolute',
                  top:           '55%',
                  display:       'flex',
                  flexDirection: 'column',
                  alignItems:    'center',
                  gap:           '2.4vh',
                  width:         '100%',
                  left:          0,
                  padding:       '0 2vw',
                  pointerEvents: 'none',
                }}
              >
                {/* Tech annotations — small, sparse, vertical, centered */}
                <div
                  ref={(el) => { if (techRef) techRef.current[i] = el; }}
                  style={{
                    display:        'flex',
                    flexDirection: 'column',
                    gap:            '0.6vh',
                    fontFamily:    'var(--font-sans)',
                    fontSize:      '10px',
                    letterSpacing: '0.22em',
                    textTransform: 'uppercase',
                    color:         OBSID,
                    alignItems:    'center',
                    width:         '100%',
                    opacity:       0, // managed by autoAlpha
                    visibility:    'hidden',
                  }}
                >
                  {p.techs.map((t, j) => (
                    <span
                      key={j}
                      style={{
                        display:        'block',
                        paddingBottom:  '0.4vh',
                        width:          'fit-content',
                        borderBottom:  `1px solid ${OBSID}10`,
                        userSelect:     'none',
                        textAlign:      'center',
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>

                {/* Capability statement — serif italic, single line */}
                <p
                  ref={(el) => { if (statementRef) statementRef.current[i] = el; }}
                  style={{
                    fontFamily:   'var(--font-serif)',
                    fontStyle:    'italic',
                    fontSize:     'clamp(13px, 1.05vw, 16px)',
                    lineHeight:   1.55,
                    color:        OBSID,
                    margin:       0,
                    maxWidth:     '28ch',
                    textAlign:    'center',
                    opacity:      0, // managed by autoAlpha
                    visibility:   'hidden',
                    willChange:   'transform, opacity',
                  }}
                >
                  {p.statement}
                </p>
              </div>

            </div>

            {/* Footer rule — anchors the column */}
            <div style={{ height: '1px', background: `${OBSID}18`, flexShrink: 0 }} />
          </div>
        );
      })}
    </div>
  );
}
