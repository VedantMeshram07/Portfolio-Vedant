import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const OBSID  = '#0A0A0A';
const CEMENT = '#D4D3D0';
const BLUE   = '#3B82F6';

const CONTACT_LINKS = [
  {
    label: 'Email',
    value: 'meshramvedant7@gmail.com',
    href: 'https://mail.google.com/mail/?view=cm&fs=1&to=meshramvedant7@gmail.com'
  },
  {
    label: 'GitHub',
    value: 'github.com/VedantMeshram07',
    href: 'https://github.com/VedantMeshram07'
  },
  {
    label: 'LinkedIn',
    value: 'linkedin.com/in/vedant-meshram-aa6a34304',
    href: 'https://www.linkedin.com/in/vedant-meshram-aa6a34304/'
  },
  {
    label: 'Resume',
    value: 'Download Resume',
    href: '/Vedant_Meshram_Resume.pdf',
    download: true
  },
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
    font-family: Anton, var(--font-sans), sans-serif;
    text-transform: uppercase;
    font-size: clamp(20px, 2.5vw, 40px);
    font-weight: 400;
    letter-spacing: 0.04em;
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
    padding: 0.55rem 1.1rem;
    border: 1px solid ${OBSID}35;
    border-left: 2px solid ${OBSID}35;
    border-radius: 0;
    font-family: Anton, var(--font-sans), sans-serif;
    font-size: 10px;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: ${OBSID};
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    cursor: default;
    user-select: none;
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

  useLayoutEffect(() => {
    const section   = sectionRef.current;
    const container = containerRef.current;
    if (!section || !container) return;

    let unmounted = false;
    let ctx;

    const init = async () => {
      try {
        await document.fonts.load('400 16px Anton');
      } catch {
        /* already loaded */
      }
      await document.fonts.ready;
      if (unmounted) return;

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
      unmounted = true;
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
        {/* Top Header — location + clock only */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
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
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '0.35em', textTransform: 'uppercase', color: `${OBSID}55`, userSelect: 'none' }}>
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
                target={(link.href.startsWith('http') || link.href.includes('mail.google.com')) ? '_blank' : undefined}
                rel={(link.href.startsWith('http') || link.href.includes('mail.google.com')) ? 'noopener noreferrer' : undefined}
                download={link.download || undefined}
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

      {/* Typography Container — in normal flow. GSAP scrub grows it 25vh→80vh,
           pushing the contact content above upward. SVG fills the container
           via height:100% + preserveAspectRatio:none so the letters scale up. */}
      <div
        ref={containerRef}
        style={{
          width:    '100%',
          overflow: 'hidden',
          height:   '25vh',
        }}
      >
        {/* Desktop: SVG sized to fill everything above the footer */}
        <svg
          className="hidden md:block"
          width="100%"
          height="calc(100% - max(3.5vh, 28px))"
          viewBox="0 0 1000 420"
          preserveAspectRatio="none"
          style={{ display: 'block' }}
        >
          <text
            x="500"
            y="390"
            textAnchor="middle"
            fontFamily="Anton, sans-serif"
            fontSize="390"
            fontWeight="400"
            fill={OBSID}
            textLength="1000"
            lengthAdjust="spacingAndGlyphs"
          >
            VEDANT
          </text>
        </svg>

        {/* Mobile: Standard text that doesn't distort into spaghetti */}
        <div 
          className="md:hidden flex items-end justify-center w-full"
          style={{ height: 'calc(100% - max(3.5vh, 28px))' }}
        >
          <span 
            style={{ fontFamily: 'Anton, sans-serif' }}
            className="text-[clamp(4rem,25vw,10rem)] leading-[0.8] text-[#0A0A0A] tracking-tight"
          >
            VEDANT
          </span>
        </div>

        {/* Footer — plain block, sits flush below the SVG */}
        <div style={{
          height:         'max(3.5vh, 28px)',
          display:        'flex',
          justifyContent: 'space-between',
          alignItems:     'center',
          padding:        '0 4vw',
          fontFamily:     'var(--font-sans)',
          fontSize:       '9px',
          letterSpacing:  '0.15em',
          textTransform:  'uppercase',
          color:          `${OBSID}80`,
        }}>
          <span className='text-xs'>Crafting elegant systems &amp; bold digital experiences.</span>
          <span className='text-xs'>© {new Date().getFullYear()} Vedant</span>
        </div>
      </div>



    </section>
  );
}
