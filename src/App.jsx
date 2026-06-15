import { useState, useEffect } from 'react';
import Lenis from '@studio-freight/lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import Awakening     from './components/Awakening.jsx';
import Cursor        from './components/Cursor.jsx';
import SiteCanvas    from './components/SiteCanvas.jsx';
import TerminalSection from './components/TerminalSection.jsx';
import MobileSite    from './components/MobileSite.jsx';

gsap.registerPlugin(ScrollTrigger);

/** Breakpoint below which we serve the touch-native MobileSite layout */
const MOBILE_BP = 900;

const isTouchDevice = () =>
  window.matchMedia('(pointer: coarse)').matches ||
  window.matchMedia('(max-width: ' + MOBILE_BP + 'px)').matches;

/**
 * App.jsx — Root Orchestrator
 * ─────────────────────────────────────────────────────────────────────
 *  • Desktop (≥900px / fine pointer): pinned GSAP scroll experience
 *  • Mobile  (< 900px / coarse pointer): scroll-native MobileSite layout
 *
 *  Single Lenis instance is used on both paths.
 *  SiteCanvas owns the entire Hero → Quests → Powers → Artifacts journey
 *  on desktop; MobileSite handles all sections in a flat scroll on mobile.
 * ─────────────────────────────────────────────────────────────────────
 */
export default function App() {
  const [isLoaded, setIsLoaded]   = useState(false);
  const [isMobile, setIsMobile]   = useState(() => isTouchDevice());

  /* Respond to resize / orientation changes */
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_BP}px)`);
    const pt = window.matchMedia('(pointer: coarse)');
    const update = () => setIsMobile(mq.matches || pt.matches);
    mq.addEventListener('change', update);
    pt.addEventListener('change', update);
    return () => {
      mq.removeEventListener('change', update);
      pt.removeEventListener('change', update);
    };
  }, []);

  /* Lenis smooth scroll — works on both layouts */
  useEffect(() => {
    const lenis = new Lenis({
      duration:    1.2,
      easing:      (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothTouch: false, // keep native momentum on touch
    });

    window.__lenis = lenis;
    gsap.ticker.lagSmoothing(0);

    const onTick = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(onTick);

    const onScroll = () => {
      ScrollTrigger.update();
      if (lenis.scroll > lenis.limit) {
        lenis.scrollTo(lenis.limit, { immediate: true });
      }
    };
    lenis.on('scroll', onScroll);

    return () => {
      gsap.ticker.remove(onTick);
      lenis.destroy();
      window.__lenis = null;
    };
  }, []);

  return (
    <>
      {/* Custom cursor — desktop only; hidden automatically on coarse-pointer
          devices via the CSS media query in index.css                        */}
      {!isMobile && <Cursor active={isLoaded} />}

      {!isLoaded && (
        <Awakening onComplete={() => setIsLoaded(true)} />
      )}

      <main>
        {isMobile ? (
          /* ── Mobile: all sections in a natural scroll layout ── */
          <MobileSite />
        ) : (
          /* ── Desktop: GSAP-pinned cinematic scroll experience ── */
          <>
            <SiteCanvas />
            <TerminalSection />
          </>
        )}
      </main>
    </>
  );
}
