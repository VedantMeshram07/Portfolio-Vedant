import { useEffect, useRef } from 'react';
import gsap from 'gsap';

/**
 * BrutalistSlice.jsx — Horizontal Typography Splice v4
 * -----------------------------------------------------------------------
 *  Root must be overflow:hidden — without it the halves bleed outside
 *  the element and overlap adjacent rows.
 *
 *  Sub-text fix:
 *  The sub-text bar is sized to EXACTLY fill the gap between the halves
 *  (height = 2×travel, top = 50%, marginTop = -travel). This means:
 *   • In CLOSED state — both halves at y=0 completely cover the bar area
 *   • In OPEN state  — the gap is exactly 2×travel, filled by the bar
 *  With overflow:hidden the halves are clipped at the container boundary,
 *  making the gap appear exactly in the centre. The dark-bg bar covers
 *  the semantic copy that would otherwise show through the gap.
 *
 *  Orange crack line appears first (scaleX 0→1) before the bar fades in,
 *  so the eye registers "something cracked open" immediately.
 * -----------------------------------------------------------------------
 */
const BrutalistSlice = ({
  mainText,
  subText,
  className     = '',
  as: Tag       = 'div',
  mainClassName = '',
  subClassName  = '',
  travel        = 28,
  ...rest
}) => {
  const rootRef = useRef(null);
  const topRef  = useRef(null);
  const botRef  = useRef(null);
  const subRef  = useRef(null);
  const lineRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    const top  = topRef.current;
    const bot  = botRef.current;
    const sub  = subRef.current;
    const line = lineRef.current;
    if (!root || !top || !bot || !sub || !line) return;

    // Closed state — halves flush, bar/line invisible
    gsap.set([top, bot], { y: 0 });
    // sub and line start invisible (also set via inline style for SSR safety)
    gsap.set(sub,  { autoAlpha: 0 });
    gsap.set(line, { scaleX: 0, opacity: 0, transformOrigin: 'left center' });

    const open = () => {
      gsap.to(top,  { y: -travel, duration: 0.38, ease: 'power3.out' });
      gsap.to(bot,  { y:  travel, duration: 0.38, ease: 'power3.out' });
      // Orange line races across first — signals the crack before text appears
      gsap.to(line, {
        scaleX: 1, opacity: 1,
        duration: 0.2, ease: 'power3.out',
        transformOrigin: 'left center',
      });
      // Bar fades in after line is visible
      gsap.to(sub, { autoAlpha: 1, duration: 0.25, ease: 'power2.out', delay: 0.12 });
    };

    const close = () => {
      gsap.to(top,  { y: 0, duration: 0.28, ease: 'power3.inOut' });
      gsap.to(bot,  { y: 0, duration: 0.28, ease: 'power3.inOut' });
      gsap.to(sub,  { autoAlpha: 0, duration: 0.15, ease: 'power2.in' });
      gsap.to(line, {
        scaleX: 0, opacity: 0,
        duration: 0.18, ease: 'power2.in',
        transformOrigin: 'right center',
      });
    };

    root.addEventListener('mouseenter', open);
    root.addEventListener('mouseleave', close);

    return () => {
      root.removeEventListener('mouseenter', open);
      root.removeEventListener('mouseleave', close);
      gsap.killTweensOf([top, bot, sub, line]);
    };
  }, [travel]);

  return (
    <Tag
      ref={rootRef}
      /* overflow-hidden is mandatory — clips halves at container edge */
      className={`relative inline-grid overflow-hidden cursor-none ${className}`}
      data-cursor="hover"
      {...rest}
    >
      {/*
        Semantic copy AND layout sizing layer.
        By rendering both mainText and subText invisibly inside a CSS Grid at gridArea 1/1,
        the container intrinsically sizes itself to the maximum width of the two.
      */}
      <span className={mainClassName} style={{ opacity: 0, gridArea: '1/1' }}>{mainText}</span>
      <span
        className={`font-sans-brutal uppercase tracking-[0.22em] ${subClassName}`}
        style={{ opacity: 0, gridArea: '1/1', fontSize: `${Math.max(9, travel * 0.42)}px`, whiteSpace: 'nowrap' }}
      >
        {subText}
      </span>

      {/* Top half — absolute, clips the upper 50% of the element box */}
      <span
        ref={topRef}
        aria-hidden="true"
        className={`absolute inset-0 will-change-transform ${mainClassName}`}
        style={{ clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 50%)' }}
      >
        {mainText}
      </span>

      {/* Bottom half — absolute, clips the lower 50% of the element box */}
      <span
        ref={botRef}
        aria-hidden="true"
        className={`absolute inset-0 will-change-transform ${mainClassName}`}
        style={{ clipPath: 'polygon(0 50%, 100% 50%, 100% 100%, 0 100%)' }}
      >
        {mainText}
      </span>

      {/*
        Orange crack line — full width, exactly at 50% height.
        Grows left→right on open, shrinks right→left on close.
      */}
      <span
        ref={lineRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-0 right-0 h-[2px] bg-[#FF4D00]"
        style={{
          top: '50%',
          marginTop: '-1px',
          willChange: 'transform, opacity',
        }}
      />

      {/*
        Sub-text bar — exactly fills the gap between the two halves.
        Height = 2×travel, top offset = -travel from 50% centre.
        Dark obsidian bg + electric orange text = maximum contrast.
        Sits behind halves in CLOSED state (they cover it at y=0).
        Visible in gap in OPEN state (halves retracted, gap revealed).
      */}
      <span
        ref={subRef}
        aria-hidden="true"
        className={`
          pointer-events-none absolute left-0 right-0
          flex items-center justify-center
          font-sans-brutal uppercase tracking-[0.22em]
          text-[#FF4D00] bg-[#0A0A0A]
          will-change-[opacity]
          ${subClassName}
        `}
        style={{
          top:        '50%',
          marginTop:  `-${travel}px`,
          height:     `${travel * 2}px`,
          fontSize:   `${Math.max(9, travel * 0.42)}px`,  // scales with travel
          opacity:    0,
          visibility: 'hidden',
        }}
      >
        {subText}
      </span>
    </Tag>
  );
};

export default BrutalistSlice;
