import React from 'react';

const TAGLINE_LINES = ['YOUR FRIENDLY', 'NEIGHBOURHOOD', 'AI DEVELOPER'];

const MobileHero = () => {
  return (
    <div className="w-full bg-[#D4D3D0] flex flex-col px-6 py-8" style={{ minHeight: '80vh' }}>
      <header className="flex flex-col items-start gap-3 font-sans-brutal text-[10px] tracking-[0.35em] uppercase text-[#0A0A0A]/60 shrink-0">
        <span className="text-base text-[#0A0A0A]">Vedant Meshram</span>
        <a 
          href="https://mail.google.com/mail/?view=cm&fs=1&to=meshramvedant7@gmail.com" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-base" 
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          Get in touch ↗
        </a>
      </header>
      
      <div className="flex-1 flex flex-col items-start justify-end font-sans-brutal uppercase tracking-tighter leading-[0.97] text-[clamp(2.5rem,12vw,4.5rem)] pb-8 text-[#0A0A0A]">
        {TAGLINE_LINES.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>
    </div>
  );
};

export default MobileHero;
