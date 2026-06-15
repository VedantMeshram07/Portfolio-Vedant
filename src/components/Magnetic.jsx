import { useEffect, useRef } from 'react';
import gsap from 'gsap';

/**
 * Magnetic.jsx — Physics-Based Cursor Pull
 * -----------------------------------------------------------------------
 *  A lightweight wrapper that gives any inline element a soft magnetic
 *  attraction toward the cursor while hovered. On `mouseleave` the
 *  element elastically snaps back to its origin.
 *
 *  Props
 *  ─────
 *  strength  0–1  Pull intensity. Default 0.35. At 1.0, the element
 *                 travels at ~50% of the cursor's offset from centre;
 *                 at 0.35 it's a subtle nudge.
 *  className       Forwarded to the wrapper <span>.
 *  children        Anything renderable.
 *
 *  Implementation notes
 *  ────────────────────
 *  • gsap.quickTo — one tween factory created once per axis; calling
 *    the returned function on every mousemove is orders of magnitude
 *    cheaper than spawning a new gsap.to() each time.
 *  • The wrapper is `inline-block` so it doesn't wreck grid/flex layout.
 *  • data-cursor="hover" tells the global Cursor component to scale up.
 *  • All listeners are removed in the effect cleanup → HMR-safe.
 * -----------------------------------------------------------------------
 */
const Magnetic = ({ strength = 0.35, className = '', children, ...rest }) => {
  const wrapRef = useRef(null);

  useEffect(() => {
    // Bypass magnetic pull entirely on touch devices to prevent jumpy taps
    const isCoarse = typeof window !== 'undefined' ? window.matchMedia('(pointer: coarse)').matches : false;
    if (isCoarse) return;

    const el = wrapRef.current;
    if (!el) return;

    // Prime the element for GPU compositing from the start.
    gsap.set(el, { x: 0, y: 0, force3D: true });

    // quickTo: pre-bakes a tween with a fixed ease + duration.
    // Each call to xTo(value) efficiently interpolates toward `value`.
    const xTo = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3.out' });

    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      // Offset from geometric centre.
      const relX = e.clientX - (rect.left + rect.width  / 2);
      const relY = e.clientY - (rect.top  + rect.height / 2);
      // 0.5 halves the raw offset so travel never looks uncontrolled.
      xTo(relX * strength * 0.5);
      yTo(relY * strength * 0.5);
    };

    const onLeave = () => {
      // elastic.out(1, 0.3) — springy, satisfying boing on release.
      gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.3)' });
    };

    el.addEventListener('mousemove',  onMove);
    el.addEventListener('mouseleave', onLeave);

    return () => {
      el.removeEventListener('mousemove',  onMove);
      el.removeEventListener('mouseleave', onLeave);
      gsap.killTweensOf(el);
    };
  }, [strength]);

  return (
    <span
      ref={wrapRef}
      className={`inline-block ${className}`}
      data-cursor="hover"
      {...rest}
    >
      {children}
    </span>
  );
};

export default Magnetic;
