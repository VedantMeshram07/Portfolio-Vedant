/* ─────────────────────────────────────────────────────────────────────────────
   Powers.jsx — The final interactive state after the transition.

   VISIBILITY CONTRACT
   ───────────────────
   The overlay uses autoAlpha (opacity + visibility) managed by SiteCanvas.
   All columns and their headers/titles are visible via CSS — they are hidden
   only because the parent overlay has opacity:0, which CSS compounds.

   When the overlay becomes visible (opacity:1), EVERYTHING inside appears:
   • Column backgrounds (cement)
   • Index + POLE headers
   • Capability titles (APPLICATIONS, SYSTEMS, etc.)

   Tech annotations + statements start at opacity:0 individually.
   They are revealed by the SiteCanvas hover effect (gsap.to).

   Zero GSAP in this component. Zero effects. Pure render only.
   ───────────────────────────────────────────────────────────────────────────── */

const OBSID  = '#0A0A0A';
const CEMENT = '#D4D3D0';
const BLUE   = '#3B82F6';

export const POWERS_DATA = [
  {
    id: '01',
    title: 'PRODUCTS',
    techs: [
      'React',
      'JavaScript',
      'Laravel',
      'SQL',
      'UI/UX',
      'Responsive Design'
    ],
    statement:
      'Building software that people can use, learn from, and rely on every day.',
    accent: '#3B82F6',
  },

  {
    id: '02',
    title: 'SYSTEMS',
    techs: [
      'Python',
      'FastAPI',
      'REST APIs',
      'Databases',
      'Authentication',
      'Automation'
    ],
    statement:
      'Designing the foundations that keep applications scalable, maintainable, and reliable.',
    accent: '#FF4D00',
  },

  {
    id: '03',
    title: 'INTELLIGENCE',
    techs: [
      'LangGraph',
      'RAG',
      'AI Agents',
      'NLP',
      'Prompt Engineering',
      'Semantic Search'
    ],
    statement:
      'Exploring how software can reason, retrieve knowledge, and assist with complex tasks.',
    accent: '#10B981',
  },

  {
    id: '04',
    title: 'FOUNDATIONS',
    techs: [
      'Algorithms',
      'Data Structures',
      'Problem Solving',
      'OOP',
      'Git',
      'Debugging'
    ],
    statement:
      'Strong fundamentals are behind every project I build, regardless of the technology stack.',
    accent: '#8B5CF6',
  },
];

export default function Powers({
  overlayRef,    // outer div — SiteCanvas controls opacity 0↔1 (autoAlpha)
  dividersRef,   // [0..2] — 3 hairline dividers between columns
  columnsRef,    // [0..3] — 4 cement column panels
  titleRef,      // [0..3] — title wrapper (y-shifted by hover)
  techRef,       // [0..3] — tech stack (opacity 0→1 by hover)
  statementRef,  // [0..3] — statement text (opacity 0→1 by hover)
  headersRef,    // [0..3] — index + pole headers
}) {
  return (
    <div
      ref={overlayRef}
      style={{
        position:   'absolute',
        inset:      0,
        overflow:   'hidden',
        opacity:    0,          /* GSAP owns this via autoAlpha */
        background: CEMENT,     /* full-screen cement — stops anything bleeding through */
        zIndex:     20,
      }}
    >
      {/* ── 3 Hairline Dividers ───────────────────────────────────────────── */}
      {[0, 1, 2].map(i => (
        <div
          key={`div-${i}`}
          ref={el => { if (dividersRef) dividersRef.current[i] = el; }}
          style={{
            position:   'absolute',
            top:        0,
            left:       `${(i + 1) * 25}%`,
            width:      '1px',
            height:     '100%',
            background: `${OBSID}28`,
            zIndex:     10,
            transform:  'translateX(-0.5px)',
            willChange: 'left',
          }}
        />
      ))}

      {/* ── 4 Columns ─────────────────────────────────────────────────────── */}
      {POWERS_DATA.map((p, i) => (
        <div
          key={`col-${p.id}`}
          ref={el => { if (columnsRef) columnsRef.current[i] = el; }}
          data-cursor="hover"
          style={{
            position:      'absolute',
            top:           0,
            left:          `${i * 25}%`,
            width:         '25%',
            height:        '100%',
            background:    CEMENT,
            display:       'flex',
            flexDirection: 'column',
            overflow:      'hidden',
            willChange:    'left, width, opacity',
          }}
        >
          {/* Subtle dot grid texture */}
          <div style={{
            position:        'absolute',
            inset:           0,
            opacity:         0.045,
            pointerEvents:   'none',
            backgroundImage: `radial-gradient(${OBSID} 1px, transparent 1px)`,
            backgroundSize:  '22px 22px',
          }} />

          {/* Bottom accent bar — colour-coded per discipline, revealed by hover */}
          <div style={{
            position:         'absolute',
            bottom:           0,
            left:             0,
            width:            '100%',
            height:           '3px',
            background:       p.accent,
            opacity:          0,       /* faded in by onEntry gsap.set */
            zIndex:           5,
            willChange:       'opacity',
          }} />

          {/* ── Index + POLE ─────────────────────────────────────────────── */}
          <div
            ref={el => { if (headersRef) headersRef.current[i] = el; }}
            style={{
              position:       'absolute',
              top:            '3.2vh',
              left:           '1.8vw',
              right:          '1.8vw',
              display:        'flex',
              justifyContent: 'space-between',
              alignItems:     'baseline',
            }}
          >
            <span style={{
              fontFamily:    'var(--font-sans)',
              fontSize:      '9px',
              letterSpacing: '0.4em',
              textTransform: 'uppercase',
              color:         p.accent,
              userSelect:    'none',
            }}>{p.id}</span>
            <span style={{
              fontFamily:    'var(--font-sans)',
              fontSize:      '9px',
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color:         `${OBSID}35`,
              userSelect:    'none',
            }}>POLE</span>
          </div>

          {/* ── Centred content ──────────────────────────────────────────── */}
          <div style={{
            display:       'flex',
            flexDirection: 'column',
            alignItems:    'center',
            justifyContent:'center',
            flex:           1,
            position:      'relative',
          }}>

            {/* Title — y-shifted on active column by hover effect */}
            <div
              ref={el => { if (titleRef) titleRef.current[i] = el; }}
              style={{ willChange: 'transform' }}
            >
              <h2 className="powers-title" style={{
                fontFamily:    'var(--font-sans)',
                fontSize:      'clamp(1.8rem, 3vw, 4rem)',
                lineHeight:    0.92,
                fontWeight:    900,
                textTransform: 'uppercase',
                letterSpacing: '0.01em',
                color:         OBSID,
                margin:        0,
                userSelect:    'none',
                textAlign:     'center',
                willChange:    'transform',
              }}>
                {p.title}
              </h2>
            </div>

            {/* Tech + Statement — revealed on hover */}
            <div style={{
              position:      'absolute',
              top:           '55%',
              left:          0,
              width:         '100%',
              padding:       '0 1.8vw',
              display:       'flex',
              flexDirection: 'column',
              alignItems:    'center',
              gap:           '2vh',
              pointerEvents: 'none',
            }}>
              <div
                ref={el => { if (techRef) techRef.current[i] = el; }}
                className="powers-tech"
                style={{
                  display:       'flex',
                  flexDirection: 'column',
                  gap:           '0.5vh',
                  fontFamily:    'var(--font-sans)',
                  fontSize:      '10px',
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color:         OBSID,
                  alignItems:    'center',
                  width:         '100%',
                  opacity:       0,
                  visibility:    'hidden',
                }}
              >
                {p.techs.map((t, j) => (
                  <span key={j} style={{
                    display:      'block',
                    paddingBottom:'0.4vh',
                    width:        'fit-content',
                    borderBottom: `1px solid ${p.accent}30`,
                    userSelect:   'none',
                    textAlign:    'center',
                    color:        j === 0 ? p.accent : OBSID,
                  }}>{t}</span>
                ))}
              </div>

              <p
                ref={el => { if (statementRef) statementRef.current[i] = el; }}
                className="powers-stmt"
                style={{
                  fontFamily:   'var(--font-serif)',
                  fontStyle:    'italic',
                  fontSize:     'clamp(12px, 0.95vw, 15px)',
                  lineHeight:   1.6,
                  color:        `${OBSID}BB`,
                  margin:       0,
                  maxWidth:     '26ch',
                  textAlign:    'center',
                  opacity:      0,
                  visibility:   'hidden',
                }}
              >
                {p.statement}
              </p>
            </div>
          </div>

          {/* Footer rule */}
          <div style={{ height: '1px', background: `${OBSID}10`, flexShrink: 0 }} />
        </div>
      ))}
    </div>
  );
}
