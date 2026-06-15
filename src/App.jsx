import { useState, useEffect } from 'react';
import Lenis from '@studio-freight/lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import Awakening      from './components/Awakening.jsx';
import Cursor         from './components/Cursor.jsx';
import SiteCanvas     from './components/SiteCanvas.jsx';
import MobileSite     from './components/MobileSite.jsx';
import TerminalSection from './components/TerminalSection.jsx';

gsap.registerPlugin(ScrollTrigger);

/**
 * App.jsx — Root Orchestrator
 * ─────────────────────────────────────────────────────────────────────
 *  Desktop (fine pointer): Lenis smooth scroll + GSAP ScrollTrigger
 *  Mobile  (coarse pointer): native scroll + GSAP ScrollTrigger only
 *
 *  Lenis is intentionally skipped on touch devices because:
 *  - It runs a 60fps RAF loop that saturates mobile CPUs
 *  - Its scroll interception conflicts with iOS Safari's native
 *    momentum scroll and ScrollTrigger pinning
 *  - Native scroll is already hardware-accelerated on mobile
 * ─────────────────────────────────────────────────────────────────────
 */
export default function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Computed once — won't change mid-session
  const isCoarsePointer = typeof window !== 'undefined' ? window.matchMedia('(pointer: coarse)').matches : false;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 900 || window.matchMedia('(pointer: coarse)').matches);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    gsap.ticker.lagSmoothing(0);

    if (isCoarsePointer) {
      // Touch device: let native scroll drive ScrollTrigger directly.
      // No Lenis wrapper needed — it only adds overhead on mobile.
      window.__lenis = null;
      return;
    }

    // Desktop: full Lenis smooth scroll wired into GSAP ticker
    const lenis = new Lenis({
      duration: 1.2,
      easing:   (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    window.__lenis = lenis;

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
  }, [isCoarsePointer]);

  return (
    <>
      {/* Custom cursor — fine-pointer (mouse) devices only */}
      {!isCoarsePointer && <Cursor active={isLoaded} />}

      {!isLoaded && (
        <Awakening onComplete={() => setIsLoaded(true)} />
      )}

      <main>
        {isMobile ? (
          <MobileSite />
        ) : (
          <>
            <SiteCanvas />
            <TerminalSection />
          </>
        )}
      </main>
    </>
  );
}
