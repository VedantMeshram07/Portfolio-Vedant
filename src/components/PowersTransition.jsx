/* ─────────────────────────────────────────────────────────────────────────────
   PowersTransition.jsx

   The cinematic bridge between Quests and Powers.
   4 obsidian columns expand left→right across the screen, colour-shift to
   cement, then hand off seamlessly to the Powers section.

   VISIBILITY CONTRACT
   ───────────────────
   The overlay uses PLAIN opacity (not autoAlpha / visibility) so that CSS
   opacity compounds correctly: parent opacity:0 → all children invisible,
   regardless of their own opacity or visibility. No leaking possible.

   SiteCanvas drives everything via the scrubbed timeline:
     opacity 0 → 1 (snap at 1.87)   – transition appears
     columns expand  (1.87 → 1.99)  – obsidian → cement
     opacity 1 → 0 (snap at 1.99)   – transition hides, Powers takes over
   ───────────────────────────────────────────────────────────────────────────── */

const OBSID = '#0A0A0A';

export default function PowersTransition({ overlayRef, columnsRef }) {
  return (
    <div
      ref={overlayRef}
      style={{
        position:      'absolute',
        inset:         0,
        overflow:      'hidden',
        opacity:       0,    /* plain opacity — SiteCanvas animates this */
        zIndex:        15,
        pointerEvents: 'none',
      }}
    >
      {[0, 1, 2, 3].map(i => (
        <div
          key={i}
          ref={el => { if (columnsRef) columnsRef.current[i] = el; }}
          style={{
            position:   'absolute',
            top:        0,
            /* initial packed position — timeline expands these */
            left:       `${i * 3}vw`,
            width:      '3vw',
            height:     '100%',
            background: OBSID,
            willChange: 'left, width, background-color',
          }}
        />
      ))}
    </div>
  );
}
