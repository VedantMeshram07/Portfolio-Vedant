import { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ARTIFACTS, FEATURED_ARTIFACTS } from '../data/artifacts.js';

/* ─── design tokens (mirror SiteCanvas) ─────────────────────────────────── */
const OBSID  = '#0A0A0A';
const CEMENT = '#D4D3D0';
const ORANGE = '#FF4D00';
const BLUE   = '#3B82F6';

const TRANSITION = 'opacity 0.55s ease, transform 0.55s ease, color 0.55s ease';

/* ─── single artifact record ────────────────────────────────────────────── */
function ArtifactRecord({ item, align = 'left', recordRef, compact = false }) {
  const [active, setActive] = useState(false);
  const isRight = align === 'right';

  return (
    <div
      ref={recordRef}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      style={{
        position:       'relative',
        width:          '100%',
        overflow:       'visible',
        opacity:        recordRef ? 0 : 1,
        visibility:     recordRef ? 'hidden' : 'visible',
        userSelect:     'none',
        cursor:         'none',
        flexShrink:     compact ? 0 : undefined,
        padding:        '2vh 0',
      }}
    >
      {/* Domain watermark — full-row environmental layer */}
      <span
        aria-hidden="true"
        style={{
          position:       'absolute',
          top:            '50%',
          left:           isRight ? 'auto' : '-2vw',
          right:          isRight ? '-2vw' : 'auto',
          transform:      `translateY(calc(-50% + ${active ? '-1.5vh' : '0vh'})) scale(${active ? 1.02 : 1})`,
          fontFamily:     'var(--font-sans)',
          fontSize:       compact ? 'clamp(4.8rem, 14.5vw, 10.5rem)' : 'clamp(5.2rem, 18vw, 12.5rem)',
          fontWeight:     900,
          lineHeight:     0.82,
          letterSpacing:  '-0.02em',
          textTransform:  'uppercase',
          color:          OBSID,
          opacity:        active ? 0.06 : 0.03,
          whiteSpace:     'nowrap',
          pointerEvents:  'none',
          zIndex:         0,
          transition:     'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {item.watermark}
      </span>

      {/* Foreground content — editorial alignment within the row */}
      <div
        style={{
          position:       'relative',
          zIndex:         1,
          width:          isRight ? 'min(68vw, 720px)' : 'min(62vw, 680px)',
          marginLeft:     isRight ? 'auto' : 0,
          marginRight:    isRight ? 0 : 'auto',
          display:        'flex',
          flexDirection:  'column',
          gap:            compact ? '0.4rem' : '0.6rem',
          textAlign:      'left',
          paddingRight:   isRight ? 0 : '2vw',
          paddingLeft:    isRight ? '2vw' : 0,
          transform:      active ? (isRight ? 'translateX(-1.5vw)' : 'translateX(1.5vw)') : 'translateX(0)',
          transition:     'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Year and Archive index row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{
            fontFamily:     'var(--font-sans)',
            fontSize:       '12px',
            letterSpacing:  '0.2em',
            textTransform:  'uppercase',
            color:          ORANGE,
            display:        'flex',
            alignItems:     'center',
            gap:            '0.5rem',
            transition:     'all 0.6s ease',
          }}>
            <span style={{ 
              width: active ? '16px' : '0px', 
              height: '2px', 
              background: ORANGE, 
              transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
              display: 'inline-block' 
            }} />
            {item.year}
          </span>
          
          <span style={{
            fontFamily:     'var(--font-sans)',
            fontSize:       '9px',
            letterSpacing:  '0.3em',
            textTransform:  'uppercase',
            color:          `${OBSID}50`,
          }}>
            Artifact {item.id}
          </span>
        </div>

        {/* Title */}
        <span style={{
          fontFamily:     'var(--font-sans)',
          fontSize:       compact ? 'clamp(1.4rem, 2.3vw, 2.6rem)' : 'clamp(1.5rem, 2.4vw, 2.8rem)',
          lineHeight:     1.05,
          fontWeight:     900,
          textTransform:  'uppercase',
          letterSpacing:  '-0.01em',
          color:          OBSID,
          marginTop:      '0.2rem',
          maxWidth:       '48ch',
          opacity:        active ? 1 : 0.85,
          transition:     'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        }}>
          {item.title}
        </span>

        {/* Domain container */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', marginTop: '0.4rem' }}>
          <span style={{
            fontFamily:  'var(--font-serif)',
            fontStyle:   'italic',
            fontSize:    compact ? 'clamp(14px, 1.1vw, 16px)' : 'clamp(14px, 1.1vw, 16px)',
            lineHeight:  1.4,
            color:       `${OBSID}${active ? 'DD' : 'A0'}`,
            transition:  'color 0.6s ease',
          }}>
            {item.domain}
          </span>
        </div>

        {/* Verification metadata pills */}
        <div style={{
          display:    'flex',
          flexWrap:   'wrap',
          gap:        '0.5rem 0.6rem',
          marginTop:  compact ? '0.5rem' : '0.8rem',
        }}>
          {item.annotations.map((note, j) => (
            <span
              key={j}
              style={{
                fontFamily:     'var(--font-sans)',
                fontSize:       '8px',
                letterSpacing:  '0.15em',
                textTransform:  'uppercase',
                color:          active ? CEMENT : BLUE,
                backgroundColor: active ? BLUE : 'transparent',
                border:         `1px solid ${active ? BLUE : BLUE + '40'}`,
                padding:        '0.3rem 0.6rem',
                borderRadius:   '100px',
                whiteSpace:     'nowrap',
                transition:     'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              {note}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── archive dossier — single active record display ────────────────────── */
function ArchiveDossierDisplay({ item }) {
  const panelRef = useRef(null);

  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    gsap.fromTo(
      el,
      { autoAlpha: 0, y: 10 },
      { autoAlpha: 1, y: 0, duration: 0.38, ease: 'power2.out' },
    );
  }, [item.id]);

  return (
    <div
      ref={panelRef}
      style={{
        position:       'relative',
        width:          '100%',
        height:         '100%',
        overflow:       'hidden',
        display:        'flex',
        alignItems:     'center',
        padding:        '0 6vw',
        userSelect:     'none',
      }}
    >
      {/* Single domain watermark */}
      <span
        aria-hidden="true"
        style={{
          position:       'absolute',
          top:            '50%',
          left:           '-2vw',
          transform:      'translateY(-50%)',
          fontFamily:     'var(--font-sans)',
          fontSize:       'clamp(5rem, 18vw, 12.5rem)',
          fontWeight:     900,
          lineHeight:     0.82,
          letterSpacing:  '-0.02em',
          textTransform:  'uppercase',
          color:          OBSID,
          opacity:        0.035,
          whiteSpace:     'nowrap',
          pointerEvents:  'none',
          zIndex:         0,
        }}
      >
        {item.watermark}
      </span>

      {/* Record content */}
      <div
        style={{
          position:       'relative',
          zIndex:         1,
          display:        'flex',
          flexDirection:  'column',
          gap:            '0.4rem',
          maxWidth:       'min(62vw, 680px)',
        }}
      >
        <span style={{
          fontFamily:     'var(--font-sans)',
          fontSize:       '11px',
          letterSpacing:  '0.3em',
          textTransform:  'uppercase',
          color:          ORANGE,
        }}>
          {item.year}
        </span>

        <span style={{
          fontFamily:     'var(--font-sans)',
          fontSize:       '8px',
          letterSpacing:  '0.38em',
          textTransform:  'uppercase',
          color:          `${OBSID}38`,
        }}>
          Artifact {item.id}
        </span>

        <span style={{
          fontFamily:     'var(--font-sans)',
          fontSize:       'clamp(1.6rem, 2.8vw, 2.85rem)',
          lineHeight:     0.95,
          fontWeight:     900,
          textTransform:  'uppercase',
          letterSpacing:  '-0.01em',
          color:          OBSID,
          marginTop:      '0.15rem',
          maxWidth:       '52ch',
        }}>
          {item.title}
        </span>

        <span style={{
          fontFamily:  'var(--font-serif)',
          fontStyle:   'italic',
          fontSize:    'clamp(14px, 1.1vw, 16px)',
          lineHeight:  1.4,
          color:       `${OBSID}B3`,
          marginTop:   '0.2rem',
        }}>
          {item.domain}
        </span>



        <div style={{
          display:    'flex',
          flexWrap:   'wrap',
          gap:        '0.45rem 0.9rem',
          marginTop:  '0.55rem',
        }}>
          {item.annotations.map((note, j) => (
            <span
              key={j}
              style={{
                fontFamily:     'var(--font-sans)',
                fontSize:       '7px',
                letterSpacing:  '0.24em',
                textTransform:  'uppercase',
                color:          BLUE,
                opacity:        0.72,
                whiteSpace:     'nowrap',
              }}
            >
              {note}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── archive index rail ──────────────────────────────────────────────────── */
function ArchiveIndexRail({ items, activeIndex, onSelect }) {
  return (
    <div
      style={{
        width:          '26vw',
        minWidth:       '220px',
        maxWidth:       '320px',
        flexShrink:     0,
        height:         '100%',
        background:     OBSID,
        borderRight:    `1px solid ${CEMENT}15`,
        display:        'flex',
        flexDirection:  'column',
        overflow:       'hidden',
      }}
    >
      {/* Rail header */}
      <div style={{ padding: '2rem 1.5rem 0', flexShrink: 0 }}>
        <span style={{
          fontFamily:     'var(--font-sans)',
          fontSize:       '9px',
          letterSpacing:  '0.35em',
          textTransform:  'uppercase',
          color:          `${CEMENT}55`,
          display:        'block',
          userSelect:     'none',
        }}>
          Index
        </span>
        <div style={{ marginTop: '0.75rem', height: '1px', background: `${CEMENT}18` }} />
      </div>

      {/* Index entries */}
      <div style={{
        flex:           1,
        display:        'flex',
        flexDirection:  'column',
        justifyContent: 'space-evenly',
        padding:        '1.5rem 1.5rem',
        overflow:       'hidden',
      }}>
        {items.map((item, i) => {
          const isActive = i === activeIndex;
          return (
            <button
              key={item.id}
              type="button"
              data-cursor="hover"
              onMouseEnter={() => onSelect(i)}
              onClick={() => onSelect(i)}
              style={{
                display:        'flex',
                flexDirection:  'column',
                alignItems:     'flex-start',
                gap:            '6px',
                background:     'none',
                border:         'none',
                padding:        0,
                cursor:         'none',
                textAlign:      'left',
              }}
            >
              <span style={{
                fontFamily:     'var(--font-sans)',
                fontSize:       '11px',
                letterSpacing:  '0.32em',
                textTransform:  'uppercase',
                color:          isActive ? CEMENT : `${CEMENT}30`,
                transition:     'color 0.35s ease',
                userSelect:     'none',
              }}>
                {item.id}
              </span>
              <span style={{
                fontFamily:     'var(--font-sans)',
                fontSize:       '9px',
                letterSpacing:  '0.22em',
                textTransform:  'uppercase',
                color:          isActive ? `${CEMENT}CC` : `${CEMENT}28`,
                lineHeight:     1.35,
                maxWidth:       '18ch',
                transition:     'color 0.35s ease',
                userSelect:     'none',
              }}>
                {item.indexLabel}
              </span>
              <div style={{
                height:           '2px',
                width:            isActive ? '20px' : '0px',
                backgroundColor:  isActive ? ORANGE : 'transparent',
                transition:       'width 0.35s ease, background-color 0.35s ease',
              }} />
            </button>
          );
        })}
      </div>

      {/* Rail footer */}
      <div style={{ padding: '0 1.5rem 1.75rem', flexShrink: 0 }}>
        <div style={{ height: '1px', background: `${CEMENT}12`, marginBottom: '1rem' }} />
        <span style={{
          fontFamily:     'var(--font-sans)',
          fontSize:       '8px',
          letterSpacing:  '0.28em',
          textTransform:  'uppercase',
          color:          `${CEMENT}32`,
          userSelect:     'none',
          display:        'block',
        }}>
          {String(items.length).padStart(2, '0')} Records
        </span>
      </div>
    </div>
  );
}

/* ─── full archive layer — indexed dossier system ───────────────────────── */
function ArchiveLayer({ onClose }) {
  const layerRef   = useRef(null);
  const contentRef = useRef(null);
  const closing    = useRef(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const activeItem = ARTIFACTS[activeIndex];

  useEffect(() => {
    gsap.set(layerRef.current,  { autoAlpha: 0 });
    gsap.set(contentRef.current, { y: 18 });
    gsap.timeline()
      .to(layerRef.current,  { autoAlpha: 1, duration: 0.45, ease: 'power2.out' })
      .to(contentRef.current, { y: 0, duration: 0.55, ease: 'power3.out' }, 0.08);
  }, []);

  const handleClose = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    gsap.timeline({ onComplete: onClose })
      .to(contentRef.current, { y: 14, autoAlpha: 0, duration: 0.28, ease: 'power2.in' })
      .to(layerRef.current,  { autoAlpha: 0, duration: 0.35, ease: 'power2.in' }, 0.1);
  }, [onClose]);

  useEffect(() => {
    // Prevent underlying page scroll while overlay is open
    window.__lenis?.stop();
    return () => window.__lenis?.start();
  }, []);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleClose]);

  // Block wheel events so they don't reach Lenis
  const onWheel = (e) => e.stopPropagation();

  return (
    <div
      ref={layerRef}
      onWheel={onWheel}
      style={{
        position:   'fixed',
        inset:      0,
        zIndex:     300,
        background: CEMENT,
        overflow:   'hidden',
      }}
    >
      <div
        ref={contentRef}
        style={{
          height:        '100%',
          display:       'flex',
          overflow:      'hidden',
        }}
      >
        <ArchiveIndexRail
          items={ARTIFACTS}
          activeIndex={activeIndex}
          onSelect={setActiveIndex}
        />

        <div style={{
          flex:           1,
          display:        'flex',
          flexDirection:  'column',
          minWidth:       0,
          overflow:       'hidden',
        }}>
          {/* Dossier header */}
          <div style={{
            flexShrink: 0,
            padding:    '2rem 2.5rem 0.75rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{
                fontFamily:     'var(--font-sans)',
                fontSize:       '9px',
                letterSpacing:  '0.35em',
                textTransform:  'uppercase',
                color:          `${OBSID}99`,
                userSelect:     'none',
              }}>
                Archive
              </span>
              <button
                onClick={handleClose}
                data-cursor="hover"
                style={{
                  fontFamily:     'var(--font-sans)',
                  fontSize:       '9px',
                  letterSpacing:  '0.35em',
                  textTransform:  'uppercase',
                  color:          BLUE,
                  background:     'none',
                  border:         'none',
                  cursor:         'none',
                  padding:        0,
                }}
              >
                ← Close
              </button>
            </div>
            <div style={{ marginTop: '0.75rem', height: '1px', background: `${OBSID}18` }} />
          </div>

          {/* Active dossier */}
          <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
            {activeItem && (
              <ArchiveDossierDisplay key={activeItem.id} item={activeItem} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── main section ──────────────────────────────────────────────────────── */
export default function Artifacts({
  overlayRef,
  headerRef,
  recordsRef,
  archiveActionRef,
}) {
  const [archiveOpen, setArchiveOpen] = useState(false);

  return (
    <>
      <div
        ref={overlayRef}
        style={{
          position:      'absolute',
          inset:         0,
          background:    CEMENT,
          overflow:      'hidden',
          visibility:    'hidden',
          opacity:       0,
          zIndex:        30,
        }}
      >
        <div
          style={{
            height:         '100%',
            display:        'flex',
            flexDirection:  'column',
            padding:        '5.5vh 10vw 4vh',
            overflow:       'hidden',
          }}
        >
          {/* Section header */}
          <div
            ref={headerRef}
            style={{
              flexShrink: 0,
              opacity:    0,
              visibility: 'hidden',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{
                fontFamily:     'var(--font-sans)',
                fontSize:       '9px',
                letterSpacing:  '0.35em',
                textTransform:  'uppercase',
                color:          `${OBSID}99`,
                userSelect:     'none',
              }}>
                ARTIFACTS
              </span>
              <span style={{
                fontFamily:     'var(--font-sans)',
                fontSize:       '9px',
                letterSpacing:  '0.35em',
                textTransform:  'uppercase',
                color:          `${OBSID}45`,
                userSelect:     'none',
              }}>
                05
              </span>
            </div>
            <div style={{ marginTop: '0.65rem', height: '1px', background: `${OBSID}18` }} />
          </div>

          {/* Featured records — alternating editorial rhythm */}
          <div
            style={{
              flex:           1,
              minHeight:      0,
              display:        'flex',
              flexDirection:  'column',
              justifyContent: 'space-between',
              paddingTop:     '1.5vh',
              paddingBottom:  '0.5vh',
            }}
          >
            {FEATURED_ARTIFACTS.map((item, i) => (
              <ArtifactRecord
                key={item.id}
                item={item}
                align={i % 2 === 0 ? 'left' : 'right'}
                recordRef={(el) => { if (recordsRef) recordsRef.current[i] = el; }}
              />
            ))}
          </div>

          {/* Archive expansion — subtle editorial action */}
          <div
            ref={archiveActionRef}
            style={{
              flexShrink:     0,
              display:        'flex',
              justifyContent: 'flex-end',
              paddingTop:     '0.75vh',
              opacity:        0,
              visibility:     'hidden',
            }}
          >
            <button
              onClick={() => setArchiveOpen(true)}
              data-cursor="hover"
              style={{
                fontFamily:     'var(--font-sans)',
                fontSize:       '9px',
                letterSpacing:  '0.32em',
                textTransform:  'uppercase',
                color:          `${OBSID}55`,
                background:     'none',
                border:         'none',
                cursor:         'none',
                padding:        0,
                transition:     'color 0.4s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = BLUE; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = `${OBSID}55`; }}
            >
              Open Archive →
            </button>
          </div>
        </div>
      </div>

      {archiveOpen && (
        <ArchiveLayer onClose={() => setArchiveOpen(false)} />
      )}
    </>
  );
}
