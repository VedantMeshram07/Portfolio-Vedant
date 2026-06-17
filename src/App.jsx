import { useState, useEffect } from 'react';
import Lenis from '@studio-freight/lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import Awakening from './components/Awakening.jsx';
import Cursor from './components/Cursor.jsx';
import SiteCanvas from './components/SiteCanvas.jsx';
import TerminalSection from './components/TerminalSection.jsx';
import MobileLayout from './components/MobileLayout.jsx';

gsap.registerPlugin(ScrollTrigger);

/**
 * App.jsx — Root Orchestrator
 */
export default function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth <= 900 : false);

  // Computed once — won't change mid-session
  const isCoarsePointer = typeof window !== 'undefined' ? window.matchMedia('(pointer: coarse)').matches : false;

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 900);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    gsap.ticker.lagSmoothing(0);

    if (isCoarsePointer) {
      window.__lenis = null;
      return;
    }

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
      {!isCoarsePointer && <Cursor active={isLoaded} />}

      {!isLoaded && (
        <Awakening onComplete={() => setIsLoaded(true)} />
      )}

      <main>
        {isMobile ? (
          <MobileLayout />
        ) : (
          <SiteCanvas />
        )}
        <TerminalSection />
      </main>
    </>
  );
}
