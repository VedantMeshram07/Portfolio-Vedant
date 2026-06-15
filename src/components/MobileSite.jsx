import { useState, useEffect, useRef } from 'react';

/* ─── design tokens ──────────────────────────────────────────── */
const OBSID  = '#0A0A0A';
const CEMENT = '#D4D3D0';
const BLUE   = '#3B82F6';
const ORANGE = '#FF4D00';
const GREEN  = '#10B981';
const PURPLE = '#8B5CF6';

/* ─── copy (identical to desktop) ───────────────────────────── */
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
    accent: BLUE,
  },
  {
    num: '02', title: 'SENTINEL', year: '2025', role: 'Backend Engineer',
    stack: 'Python · FastAPI · Redis · Docker · K8s',
    description: 'Real-time threat detection and system monitoring platform. Architected the event-driven pipeline for zero-latency anomaly detection across distributed infrastructure.',
    outcome: 'Reduced incident response time from 4 minutes to 12 seconds.',
    status: 'DEPLOYED',
    accent: ORANGE,
  },
  {
    num: '03', title: 'MINDSYNC', year: '2025', role: 'AI Developer',
    stack: 'LangChain · OpenAI · Pinecone · React',
    description: 'Enterprise knowledge automation framework. Built the RAG pipeline with multi-tool agent capabilities, enabling autonomous document analysis and intelligent workflow execution.',
    outcome: 'Automated 68% of manual knowledge retrieval processes.',
    status: 'DEPLOYED',
    accent: GREEN,
  },
  {
    num: '04', title: 'SPECTRA', year: '2024', role: 'Full Stack Developer',
    stack: 'Next.js · TypeScript · Prisma · AWS',
    description: 'Data visualisation and analytics platform for complex system monitoring. Designed the real-time streaming dashboard with architectural precision and editorial clarity.',
    outcome: 'Unified 12 disparate data sources into one analytical surface.',
    status: 'SHIPPED',
    accent: PURPLE,
  },
];

const POWERS_DATA = [
  { id: '01', title: 'APPLICATIONS',  techs: ['React', 'Next.js', 'TypeScript', 'WebGL'], statement: 'High-performance interfaces with architectural precision.', accent: BLUE   },
  { id: '02', title: 'SYSTEMS',       techs: ['Python', 'Node.js', 'FastAPI', 'PostgreSQL'], statement: 'Scalable systems and resilient API architectures.', accent: ORANGE },
  { id: '03', title: 'INTELLIGENCE',  techs: ['Python', 'LangChain', 'RAG', 'Agents'], statement: 'Autonomous systems that reason, retrieve and act.', accent: GREEN  },
  { id: '04', title: 'INFRASTRUCTURE',techs: ['Docker', 'Kubernetes', 'AWS', 'Terraform'], statement: 'Distributed systems that scale, self-heal, and stay observable.', accent: PURPLE },
];

const CONTACT_LINKS = [
  { label: 'Email',    value: 'vedant.meshram@example.com',    href: 'mailto:vedant.meshram@example.com' },
  { label: 'GitHub',   value: 'github.com/vedantmeshram',      href: 'https://github.com/vedantmeshram' },
  { label: 'LinkedIn', value: 'linkedin.com/in/vedantmeshram', href: 'https://linkedin.com/in/vedantmeshram' },
  { label: 'Resume',   value: 'Download PDF',                  href: '/resume.pdf' },
];

/* ─── shared style primitives ───────────────────────────────── */
const label = {
  fontFamily:    'var(--font-sans)',
  fontSize:      '9px',
  letterSpacing: '0.35em',
  textTransform: 'uppercase',
  userSelect:    'none',
};

const hairline = (color = `${OBSID}20`) => ({
  height: '1px',
  background: color,
  width: '100%',
});

/* ═══════════════════════════════════════════════════════════════
   MobileSite — scroll-native layout for ≤900 px viewports
   All content is identical to the desktop version;
   interactions are adapted for touch (tap to expand, etc.)
═══════════════════════════════════════════════════════════════ */
export default function MobileSite() {
  const [expandedProject, setExpandedProject] = useState(null);
  const [timeStr, setTimeStr] = useState('');
  const heroRef = useRef(null);

  /* live clock */
  useEffect(() => {
    const tick = () =>
      setTimeStr(new Date().toLocaleTimeString('en-US', { hour12: false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  /* hero entrance lines */
  useEffect(() => {
    if (!heroRef.current) return;
    const lines = heroRef.current.querySelectorAll('[data-hero-line]');
    lines.forEach((el, i) => {
      el.style.transform = 'translateY(60px)';
      el.style.opacity   = '0';
    });
    const id = setTimeout(() => {
      lines.forEach((el, i) => {
        setTimeout(() => {
          el.style.transition = 'transform 0.9s cubic-bezier(0.16,1,0.3,1), opacity 0.9s ease';
          el.style.transform  = 'translateY(0)';
          el.style.opacity    = '1';
        }, i * 130);
      });
    }, 4050); /* sync with Awakening preloader */
    return () => clearTimeout(id);
  }, []);

  const toggleProject = (idx) =>
    setExpandedProject(prev => (prev === idx ? null : idx));

  return (
    <div style={{ background: CEMENT, color: OBSID, minHeight: '100vh' }}>

      {/* ═══════════════ 1. HERO ═══════════════ */}
      <section
        ref={heroRef}
        style={{
          minHeight:     '100svh',
          background:    OBSID,
          display:       'flex',
          flexDirection: 'column',
          padding:       '0',
          overflow:      'hidden',
        }}
      >
        {/* Mini nav bar */}
        <header style={{
          display:       'flex',
          justifyContent:'space-between',
          alignItems:    'center',
          padding:       '20px 24px',
          flexShrink:    0,
        }}>
          <span style={{ ...label, color: `${CEMENT}55`, fontSize: '9px' }}>Vedant Meshram</span>
          <a
            href="mailto:vedant.meshram@example.com"
            style={{ ...label, color: `${CEMENT}55`, fontSize: '9px', textDecoration: 'none' }}
          >
            Get in touch ↗
          </a>
        </header>

        {/* Big tagline */}
        <div style={{
          flex:          1,
          display:       'flex',
          flexDirection: 'column',
          justifyContent:'flex-end',
          padding:       '0 24px 40px',
        }}>
          {TAGLINE_LINES.map((line, i) => (
            <div
              key={i}
              data-hero-line
              style={{
                fontFamily:    'var(--font-sans)',
                fontSize:      'clamp(3rem, 14vw, 7rem)',
                lineHeight:    0.92,
                fontWeight:    900,
                textTransform: 'uppercase',
                letterSpacing: '-0.01em',
                color:         CEMENT,
                opacity:       0,
              }}
            >
              {line}
            </div>
          ))}
          {/* Accent line */}
          <div style={{ display: 'flex', gap: '16px', marginTop: '28px', alignItems: 'center' }}>
            <div style={{ width: '32px', height: '2px', background: ORANGE }} />
            <span style={{ ...label, color: `${CEMENT}40`, fontSize: '8px' }}>Full Stack · AI · Systems</span>
          </div>
        </div>

        {/* Section label bottom */}
        <div style={{
          display:       'flex',
          justifyContent:'space-between',
          padding:       '16px 24px',
          borderTop:     `1px solid ${CEMENT}12`,
          flexShrink:    0,
        }}>
          <span style={{ ...label, color: `${CEMENT}30`, fontSize: '8px' }}>Architecture Zero</span>
          <span style={{ ...label, color: `${CEMENT}30`, fontSize: '8px' }}>01</span>
        </div>
      </section>

      {/* ═══════════════ 2. LORE ═══════════════ */}
      <section style={{ background: OBSID, padding: '0 0 40px' }}>
        {/* Header */}
        <div style={{ padding: '32px 24px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ ...label, color: `${CEMENT}45`, fontSize: '9px' }}>LORE</span>
            <span style={{ ...label, color: `${CEMENT}25`, fontSize: '9px' }}>02</span>
          </div>
          <div style={hairline(`${CEMENT}15`)} />
        </div>

        {/* Timeline items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {LORE_TIMELINE.map((item, i) => (
            <div
              key={i}
              style={{
                padding:     '28px 24px',
                borderBottom:`1px solid ${CEMENT}12`,
              }}
            >
              <span style={{ ...label, color: ORANGE, fontSize: '10px', display: 'block', marginBottom: '10px' }}>
                {item.year}
              </span>
              <div style={{
                fontFamily:    'var(--font-sans)',
                fontSize:      'clamp(1.8rem, 7vw, 2.8rem)',
                lineHeight:    1.0,
                fontWeight:    900,
                textTransform: 'uppercase',
                letterSpacing: '-0.01em',
                color:         CEMENT,
                marginBottom:  '8px',
              }}>
                {item.role}
              </div>
              <div style={{
                fontFamily: 'var(--font-serif)',
                fontSize:   '15px',
                fontStyle:  'italic',
                color:      `${CEMENT}70`,
                lineHeight: 1.5,
                marginBottom:'6px',
              }}>
                {item.detail}
              </div>
              <span style={{ ...label, color: `${CEMENT}35`, fontSize: '9px' }}>{item.stack}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════ 3. MANIFESTO ═══════════════ */}
      <section style={{ background: CEMENT, padding: '40px 0' }}>
        {/* Header */}
        <div style={{ padding: '0 24px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ ...label, color: `${OBSID}55`, fontSize: '9px' }}>MANIFESTO</span>
            <span style={{ ...label, color: `${OBSID}30`, fontSize: '9px' }}>02</span>
          </div>
          <div style={{ marginTop: '12px', ...hairline() }} />
        </div>

        {/* Big statement */}
        <div style={{ padding: '32px 24px 0' }}>
          <div style={{
            fontFamily:    'var(--font-sans)',
            fontSize:      'clamp(2.4rem, 10vw, 5rem)',
            lineHeight:    0.92,
            fontWeight:    900,
            textTransform: 'uppercase',
            letterSpacing: '-0.01em',
            color:         OBSID,
            marginBottom:  '40px',
          }}>
            <div>I BUILD</div>
            <div>SYSTEMS</div>
            <div>THAT GO BEYOND.</div>
          </div>

          {/* Principles */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {PRINCIPLES.map(({ word, sub }, i) => (
              <div
                key={i}
                style={{
                  padding:     '20px 0',
                  borderTop:   `1px solid ${OBSID}15`,
                  display:     'flex',
                  alignItems:  'baseline',
                  gap:         '16px',
                }}
              >
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: ORANGE, flexShrink: 0, marginBottom: '2px' }} />
                <div>
                  <div style={{
                    fontFamily:    'var(--font-sans)',
                    fontSize:      'clamp(1.6rem, 7vw, 2.4rem)',
                    lineHeight:    1,
                    fontWeight:    900,
                    textTransform: 'uppercase',
                    color:         OBSID,
                  }}>{word}</div>
                  <span style={{ ...label, color: `${OBSID}45`, fontSize: '9px' }}>{sub}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Body text */}
          <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: `1px solid ${OBSID}15` }}>
            <p style={{
              fontFamily: 'var(--font-serif)',
              fontSize:   '16px',
              lineHeight: 1.72,
              color:      `${OBSID}99`,
              margin:     0,
            }}>
              {MANIFESTO_TEXT}
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════ 4. QUESTS ═══════════════ */}
      <section style={{ background: CEMENT, borderTop: `1px solid ${OBSID}12` }}>
        {/* Header */}
        <div style={{ padding: '32px 24px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ ...label, color: `${OBSID}55`, fontSize: '9px' }}>QUESTS</span>
            <span style={{ ...label, color: `${OBSID}30`, fontSize: '9px' }}>03</span>
          </div>
          <div style={{ marginTop: '12px', ...hairline() }} />
        </div>

        {/* Project rows — tap to expand */}
        {PROJECTS.map((p, i) => {
          const open = expandedProject === i;
          return (
            <div key={p.num} style={{ borderBottom: `1px solid ${OBSID}12` }}>
              {/* Row header — always visible */}
              <button
                onClick={() => toggleProject(i)}
                style={{
                  width:         '100%',
                  background:    'none',
                  border:        'none',
                  padding:       '24px',
                  display:       'flex',
                  alignItems:    'center',
                  gap:           '16px',
                  cursor:        'pointer',
                  textAlign:     'left',
                }}
              >
                {/* Accent bar */}
                <div style={{ width: '3px', height: '40px', background: p.accent, flexShrink: 0, borderRadius: '1px' }} />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      fontFamily:    'var(--font-sans)',
                      fontSize:      'clamp(1.6rem, 7vw, 2.5rem)',
                      lineHeight:    1,
                      fontWeight:    900,
                      textTransform: 'uppercase',
                      letterSpacing: '-0.01em',
                      color:         OBSID,
                    }}>
                      {p.title}
                      <span style={{ color: BLUE, fontSize: '0.75em', marginLeft: '2px' }}>.</span>
                    </span>
                    <span style={{
                      fontFamily:    'var(--font-sans)',
                      fontSize:      '18px',
                      color:         `${OBSID}40`,
                      transform:     open ? 'rotate(45deg)' : 'rotate(0deg)',
                      transition:    'transform 0.3s ease',
                      flexShrink:    0,
                    }}>+</span>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '6px', flexWrap: 'wrap' }}>
                    <span style={{ ...label, color: ORANGE, fontSize: '8px' }}>{p.year}</span>
                    <span style={{ ...label, color: `${OBSID}45`, fontSize: '8px' }}>{p.role}</span>
                    <span style={{ ...label, color: BLUE, fontSize: '8px', opacity: 0.9 }}>{p.status}</span>
                  </div>
                </div>
              </button>

              {/* Expanded content */}
              <div style={{
                maxHeight:   open ? '400px' : '0',
                overflow:    'hidden',
                transition:  'max-height 0.45s cubic-bezier(0.16,1,0.3,1)',
              }}>
                <div style={{ padding: '0 24px 28px 48px' }}>
                  <span style={{ ...label, color: `${OBSID}45`, fontSize: '8px', display: 'block', marginBottom: '10px' }}>
                    {p.stack}
                  </span>
                  <p style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize:   '15px',
                    lineHeight: 1.65,
                    color:      `${OBSID}BB`,
                    margin:     '0 0 16px',
                  }}>
                    {p.description}
                  </p>
                  <div style={{
                    display:      'flex',
                    alignItems:   'flex-start',
                    gap:          '10px',
                    padding:      '14px',
                    background:   `${p.accent}08`,
                    borderLeft:   `2px solid ${p.accent}`,
                  }}>
                    <span style={{ ...label, color: `${OBSID}50`, fontSize: '8px', flexShrink: 0, marginTop: '1px' }}>OUTCOME</span>
                    <p style={{
                      fontFamily:  'var(--font-sans)',
                      fontSize:    '11px',
                      letterSpacing:'0.04em',
                      color:        OBSID,
                      margin:       0,
                      lineHeight:   1.5,
                    }}>
                      {p.outcome}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* ═══════════════ 5. POWERS ═══════════════ */}
      <section style={{ background: CEMENT, borderTop: `1px solid ${OBSID}12` }}>
        {/* Header */}
        <div style={{ padding: '32px 24px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ ...label, color: `${OBSID}55`, fontSize: '9px' }}>POWERS</span>
            <span style={{ ...label, color: `${OBSID}30`, fontSize: '9px' }}>04</span>
          </div>
          <div style={{ marginTop: '12px', ...hairline() }} />
        </div>

        {/* 2×2 grid */}
        <div style={{
          display:             'grid',
          gridTemplateColumns: '1fr 1fr',
          gap:                 '1px',
          background:          `${OBSID}15`,
          margin:              '0 24px 40px',
          border:              `1px solid ${OBSID}15`,
        }}>
          {POWERS_DATA.map((p, i) => (
            <div
              key={p.id}
              style={{
                background:    CEMENT,
                padding:       '28px 20px',
                display:       'flex',
                flexDirection: 'column',
                gap:           '16px',
                position:      'relative',
                overflow:      'hidden',
              }}
            >
              {/* Accent dot */}
              <div style={{
                width:        '6px',
                height:       '6px',
                borderRadius: '50%',
                background:   p.accent,
                flexShrink:   0,
              }} />

              <div>
                <span style={{ ...label, color: `${OBSID}35`, fontSize: '8px', display: 'block', marginBottom: '8px' }}>
                  {p.id}
                </span>
                <div style={{
                  fontFamily:    'var(--font-sans)',
                  fontSize:      'clamp(14px, 3.5vw, 20px)',
                  lineHeight:    1.0,
                  fontWeight:    900,
                  textTransform: 'uppercase',
                  letterSpacing: '-0.01em',
                  color:         OBSID,
                  marginBottom:  '12px',
                }}>
                  {p.title}
                </div>

                {/* Tech list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' }}>
                  {p.techs.map((t, j) => (
                    <span
                      key={j}
                      style={{
                        fontFamily:    'var(--font-sans)',
                        fontSize:      '9px',
                        letterSpacing: '0.15em',
                        textTransform: 'uppercase',
                        color:         j === 0 ? p.accent : `${OBSID}60`,
                        userSelect:    'none',
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <p style={{
                  fontFamily: 'var(--font-serif)',
                  fontStyle:  'italic',
                  fontSize:   '12px',
                  lineHeight: 1.5,
                  color:      `${OBSID}70`,
                  margin:     0,
                }}>
                  {p.statement}
                </p>
              </div>

              {/* Bottom accent bar */}
              <div style={{
                position:  'absolute',
                bottom:    0,
                left:      0,
                width:     '100%',
                height:    '3px',
                background: p.accent,
              }} />
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════ 6. CONTACT ═══════════════ */}
      <section style={{ background: CEMENT, borderTop: `1px solid ${OBSID}12` }}>
        {/* Header */}
        <div style={{ padding: '32px 24px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ ...label, color: `${OBSID}55`, fontSize: '9px' }}>CONTACT</span>
            <span style={{ ...label, color: `${OBSID}30`, fontSize: '9px' }}>05</span>
          </div>
          <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
            <span style={{ ...label, color: `${OBSID}50`, fontSize: '9px' }}>Location: India</span>
            <span style={{ ...label, color: `${OBSID}50`, fontSize: '9px' }}>{timeStr || '--:--:--'}</span>
          </div>
          <div style={{ marginTop: '12px', ...hairline() }} />
        </div>

        {/* Headline */}
        <div style={{ padding: '24px 24px 0' }}>
          <h2 style={{
            fontFamily:    'var(--font-serif)',
            fontSize:      'clamp(2.4rem, 10vw, 5rem)',
            lineHeight:    0.92,
            fontWeight:    400,
            letterSpacing: '-0.02em',
            color:         OBSID,
            margin:        '0 0 32px',
          }}>
            Let's build <br />
            something <br />
            <span style={{ fontStyle: 'italic', color: BLUE }}>extraordinary.</span>
          </h2>

          {/* Areas of expertise tags */}
          <div style={{ marginBottom: '32px' }}>
            <span style={{ ...label, color: `${OBSID}45`, fontSize: '9px', display: 'block', marginBottom: '10px' }}>
              Areas of Expertise
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {['Software Engineering', 'AI Systems', 'Full Stack Development'].map(skill => (
                <span
                  key={skill}
                  style={{
                    padding:       '8px 14px',
                    border:        `1px solid ${OBSID}25`,
                    borderLeft:    `2px solid ${OBSID}40`,
                    fontFamily:    'var(--font-sans)',
                    fontSize:      '9px',
                    letterSpacing: '0.25em',
                    textTransform: 'uppercase',
                    color:         OBSID,
                    userSelect:    'none',
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Contact links */}
        <div style={{ padding: '0 24px' }}>
          {CONTACT_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.href.startsWith('http') ? '_blank' : undefined}
              rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              style={{
                display:        'flex',
                justifyContent: 'space-between',
                alignItems:     'center',
                padding:        '20px 0',
                borderBottom:   `1px solid ${OBSID}20`,
                color:          OBSID,
                textDecoration: 'none',
                fontFamily:     'var(--font-sans)',
                textTransform:  'uppercase',
                fontSize:       'clamp(18px, 5vw, 28px)',
                fontWeight:     400,
                letterSpacing:  '0.02em',
              }}
            >
              <span>{link.label}</span>
              <span style={{ fontSize: '20px', color: `${OBSID}40` }}>↗</span>
            </a>
          ))}
        </div>

        {/* Big VEDANT footer — static (no scroll expansion on mobile) */}
        <div style={{ marginTop: '48px', overflow: 'hidden' }}>
          <svg
            width="100%"
            viewBox="0 0 1000 380"
            preserveAspectRatio="xMidYMid meet"
            style={{ display: 'block' }}
          >
            <text
              x="500"
              y="340"
              textAnchor="middle"
              fontFamily="Anton, sans-serif"
              fontSize="360"
              fontWeight="400"
              fill={OBSID}
              textLength="980"
              lengthAdjust="spacingAndGlyphs"
            >
              VEDANT
            </text>
          </svg>

          {/* Footer bar */}
          <div style={{
            display:        'flex',
            justifyContent: 'space-between',
            alignItems:     'center',
            padding:        '16px 24px',
            borderTop:      `1px solid ${OBSID}12`,
          }}>
            <span style={{ ...label, color: `${OBSID}50`, fontSize: '8px' }}>
              Crafting elegant systems &amp; bold digital experiences.
            </span>
            <span style={{ ...label, color: `${OBSID}50`, fontSize: '8px' }}>
              © {new Date().getFullYear()} Vedant
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
