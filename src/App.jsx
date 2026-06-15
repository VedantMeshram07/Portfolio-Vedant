import { useState, useEffect } from 'react';
import Lenis from '@studio-freight/lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import Awakening     from './components/Awakening.jsx';
import Cursor        from './components/Cursor.jsx';
import SiteCanvas    from './components/SiteCanvas.jsx';
import TerminalSection from './components/TerminalSection.jsx';

gsap.registerPlugin(ScrollTrigger);

/**
 * App.jsx — Root Orchestrator
 * ─────────────────────────────────────────────────────────────────────
 *  Single Lenis instance wired into the GSAP ticker.
 *  SiteCanvas is the single-pin component that owns the entire
 *  Hero → Lore → Quests → Powers → Artifacts scroll journey.
 *
 *  Custom cursor is shown only on fine-pointer (mouse) devices;
 *  touch devices use native tap cursors (see index.css).
 * ─────────────────────────────────────────────────────────────────────
 */
export default function App() {
  const [isLoaded, setIsLoaded] = useState(false);

  /* Detect mouse vs touch — only affects cursor rendering */
  const [hasFinePointer] = useState(
    () => window.matchMedia('(pointer: fine)').matches
  );

  useEffect(() => {
    const lenis = new Lenis({
      duration:    1.2,
      easing:      (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothTouch: false, // native momentum on touch screens
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
      {/* Custom cursor — only on mouse-driven devices */}
      {hasFinePointer && <Cursor active={isLoaded} />}

      {!isLoaded && (
        <Awakening onComplete={() => setIsLoaded(true)} />
      )}

      <main>
        <SiteCanvas />
        <TerminalSection />
      </main>
    </>
  );
}
