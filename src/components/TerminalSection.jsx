import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const OBSID  = '#0A0A0A';
const CEMENT = '#D4D3D0';
const BLUE   = '#3B82F6';

const CONTACT_LINKS = [
  { label: 'Email',    value: 'vedant.meshram@example.com', href: 'mailto:vedant.meshram@example.com' },
  { label: 'GitHub',   value: 'github.com/vedantmeshram',   href: 'https://github.com/vedantmeshram' },
  { label: 'LinkedIn', value: 'linkedin.com/in/vedantmeshram', href: 'https://linkedin.com/in/vedantmeshram' },
  { label: 'Resume',   value: 'Download PDF',               href: '/resume.pdf' },
];

const AVAILABILITY = [
  'Software Engineering',
  'AI Systems',
  'Full Stack Development',
];

const CUSTOM_CSS = `
  .contact-grid {
    display: grid;
    grid-template-columns: 1.2fr 1fr;
    gap: 8vw;
  }
  @media (max-width: 900px) {
    .contact-grid {
      grid-template-columns: 1fr;
      gap: 10vh;
    }
  }

  .contact-link-awwwards {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 3.5vh 0;
    border-bottom: 1px solid ${OBSID}30;
    color: ${OBSID};
    text-decoration: none;
    font-family: 'var(--font-sans)', sans-serif;
    text-transform: uppercase;
    font-size: clamp(20px, 2.5vw, 40px);
    font-weight: 500;
    transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .contact-link-awwwards:first-child {
    border-top: 1px solid ${OBSID}30;
  }
  .contact-link-awwwards:hover {
    color: ${BLUE};
    padding-left: 2vw;
    padding-right: 2vw;
    border-bottom-color: ${BLUE};
  }
  .contact-link-awwwards:hover:first-child {
    border-top-color: ${BLUE};
  }
  .contact-link-awwwards .link-arrow {
    opacity: 0;
    transform: translateX(-1vw) rotate(-45deg);
    transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .contact-link-awwwards:hover .link-arrow {
    opacity: 1;
    transform: translateX(0) rotate(-45deg);
  }
  
  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #10B981;
    animation: pulse-green 2s infinite;
  }
  
  @keyframes pulse-green {
    0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
    70% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
    100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
  }

  .expertise-pill {
    padding: 0.6rem 1.2rem;
    border: 1px solid ${OBSID}30;
    border-radius: 100px;
    font-family: 'var(--font-sans)', sans-serif;
    font-size: 11px;
    letter-spacing: 0.05em;
    color: ${OBSID};
    transition: all 0.3s ease;
    cursor: default;
  }
  .expertise-pill:hover {
    background: ${OBSID};
    color: ${CEMENT};
    border-color: ${OBSID};
  }
`;

export default function TerminalSection() {
  const sectionRef   = useRef(null);
  const containerRef = useRef(null);
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => setTimeStr(new Date().toLocaleTimeString('en-US', { hour12: false }));
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const section   = sectionRef.current;
    const container = containerRef.current;
    if (!section || !container) return;

    let ctx;

    const init = async () => {
      try {
        await document.fonts.load('400 16px Anton');
      } catch {
        /* already loaded */
      }
      await document.fonts.ready;

      ctx = gsap.context(() => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: container,
            start: 'bottom bottom',
            end: () => '+=' + (window.innerHeight * 0.55),
            scrub: true,
            invalidateOnRefresh: true,
          }
        });

        tl.fromTo(container,
          { height: '25vh' },
          { height: '80vh', ease: 'none' },
          0
        ).fromTo(section,
          { paddingBottom: '55vh' },
          { paddingBottom: '0vh', ease: 'none' },
          0
        );
      }, section);

      ScrollTrigger.refresh();
      window.__lenis?.resize?.();
    };

    init();

    const onResize = () => {
      ScrollTrigger.refresh();
      window.__lenis?.resize?.();
    };

    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      ctx?.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{
        position:   'relative',
        width:      '100%',
        margin:     0,
        padding:    0,
        paddingBottom: '55vh',
        background: CEMENT,
        display:    'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
      }}
    >
      <style>{CUSTOM_CSS}</style>

      {/* Contact Content — Awwwards Style */}
      <div
        style={{
          padding:       '8vh 4vw 5vh',
          zIndex:        2,
          pointerEvents: 'auto',
          display:       'flex',
          flexDirection: 'column',
          gap:           '12vh',
        }}
      >
        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="status-dot" />
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: `${OBSID}80` }}>
              Available for freelance work
            </span>
          </div>
          <div style={{ display: 'flex', gap: '4vw', flexWrap: 'wrap' }}>
             <span style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: `${OBSID}80` }}>
               Location: India
             </span>
             <span style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: `${OBSID}80`, width: '120px', textAlign: 'right' }}>
               {timeStr || '--:--:--'}
             </span>
          </div>
        </div>

        {/* Main Grid */}
        <div className="contact-grid">
          {/* Left Column: Big Headline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6vh' }}>
            <h2 style={{ 
              fontFamily: 'var(--font-serif)', 
              fontSize: 'clamp(48px, 6vw, 100px)', 
              lineHeight: 0.9, 
              fontWeight: 400,
              color: OBSID,
              margin: 0,
              letterSpacing: '-0.02em'
            }}>
              Let's build <br/>
              something <br/>
              <span style={{ fontStyle: 'italic', color: BLUE }}>extraordinary.</span>
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginTop: 'auto' }}>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: `${OBSID}60` }}>
                Areas of Expertise
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {AVAILABILITY.map(skill => (
                  <div key={skill} className="expertise-pill">
                    {skill}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Links */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {CONTACT_LINKS.map((link) => (
              <a 
                key={link.label}
                href={link.href}
                className="contact-link-awwwards"
                target={link.href.startsWith('http') ? '_blank' : undefined}
                rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                data-cursor="hover"
              >
                <span>{link.label}</span>
                <svg className="link-arrow" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Typography Container */}
      <div
        ref={containerRef}
        style={{
          width: '100%',
          position: 'relative',
          overflow: 'hidden',
          height: '25vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ 
          flex: 1, 
          position: 'relative', 
          overflow: 'hidden',
          padding: '2vh 4vw 0 4vw' 
        }}>
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 1000 450"
            preserveAspectRatio="none"
            style={{ display: 'block', overflow: 'visible' }}
          >
            <text
              x="50%"
              y="380"
              textAnchor="middle"
              fontFamily="var(--font-sans)"
              fontSize="350px"
              fontWeight="400"
              textTransform="uppercase"
              letterSpacing="0.05em"
              fill={OBSID}
              textLength="1000"
              lengthAdjust="spacingAndGlyphs"
            >
              VEDANT
            </text>
          </svg>
        </div>

        {/* Bottom Footer Bar */}
        <div style={{
          height: '3.5vh',
          minHeight: '28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 4vw',
          fontFamily: 'var(--font-sans)',
          fontSize: '9px',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: `${OBSID}80`,
          flexShrink: 0,
        }}>
          <span>Crafting elegant systems &amp; bold digital experiences.</span>
          <span>© {new Date().getFullYear()} Vedant</span>
        </div>
      </div>
    </section>
  );
}
