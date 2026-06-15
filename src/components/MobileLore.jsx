import React from 'react';
import BrutalistSlice from './BrutalistSlice';

const MANIFESTO_TEXT =
  'Curiosity has always been the starting point for everything I build. ' +
  'I enjoy exploring complex systems, understanding their inner workings, and pushing them beyond their intended limits. ' +
  'From AI agents and autonomous workflows to production applications, I turn exploration into execution. ' +
  'What you see here is the result of that process—projects, experiments, and systems brought into the real world.';
const BODY_CHUNKS = MANIFESTO_TEXT.split(' ');

const PRINCIPLES = [
  { word: 'CURIOSITY',  sub: 'ENDLESS EXPLORATION' },
  { word: 'CRAFT',     sub: 'CREATIVE BUILDING'  },
  { word: 'EXECUTION', sub: 'RELENTLESS PURSUIT'   },
];

const LORE_TIMELINE = [
  {
    year: 'Present',
    role: 'AI Builder',
    detail: 'Building AI Systems for Real-World Problems',
    stack: 'LLMs · RAG · Agents'
  },
  {
    year: '2025–2026',
    role: 'AI Developer',
    detail: 'AI Club, GCOE Jalgaon',
    stack: 'Automation · NLP · Research'
  },
  {
    year: '2025–2026',
    role: 'Technical Council',
    detail: 'Driving Technical Communities & Events',
    stack: 'Leadership · Collaboration'
  }
];

const MobileLore = () => {
  return (
    <div className="w-full bg-[#D4D3D0] flex flex-col text-[#0A0A0A]">
      {/* ── Manifesto Section ── */}
      <div className="px-6 py-12 border-t border-[#0A0A0A]/20">
        <div className="flex justify-between items-baseline mb-8">
          <span className="font-sans-brutal text-[10px] tracking-[0.35em] uppercase text-[#0A0A0A]/60 select-none">MANIFESTO</span>
          <span className="font-sans-brutal text-[10px] tracking-[0.35em] uppercase text-[#0A0A0A]/40 select-none tabular-nums">02</span>
        </div>
        
        <div className="font-sans-brutal uppercase tracking-tighter leading-[0.92] text-[clamp(2.5rem,11vw,4rem)] mb-10">
          <div>BASICALLY,</div>
          <div>I MAKE</div>
          <div>COOL PROJECTS.</div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-0 border-t border-[#0A0A0A]/20 pt-4">
            {PRINCIPLES.map(({ word, sub }, i) => (
              <div key={i} className="border-b border-[#0A0A0A]/10 py-3">
                <BrutalistSlice 
                  mainText={word} 
                  subText={sub} 
                  travel={20} 
                  as="div"
                  className="font-sans-brutal uppercase tracking-tighter leading-[1.0] text-[clamp(1.5rem,7vw,2.5rem)] text-[#0A0A0A]"
                  mainClassName="font-sans-brutal text-[#0A0A0A]" 
                />
              </div>
            ))}
          </div>
          
          <div className="pt-2">
            <p className="sr-only">{MANIFESTO_TEXT}</p>
            <p aria-hidden="true" className="font-serif text-[17px] leading-[1.6] flex flex-wrap gap-x-[0.3em] gap-y-1">
              {BODY_CHUNKS.map((chunk, idx) => (
                <span key={idx} className="inline-block text-[#0A0A0A]">{chunk}</span>
              ))}
            </p>
          </div>
        </div>
      </div>

      {/* ── Lore Section (Previously Left Block) ── */}
      <div className="bg-obsidian text-cement px-6 py-16">
        <div className="flex justify-between items-baseline mb-12">
          <span className="font-sans-brutal text-[10px] tracking-[0.35em] uppercase text-[#D4D3D0]/60 select-none">LORE</span>
          <span className="font-sans-brutal text-[10px] tracking-[0.35em] uppercase text-[#D4D3D0]/40 select-none tabular-nums">01</span>
        </div>
        
        <div className="flex flex-col gap-12">
          {LORE_TIMELINE.map((item, i) => (
            <div key={i} className="flex flex-col gap-2">
              <span className="font-sans-brutal text-[11px] tracking-[0.3em] uppercase text-electric">{item.year}</span>
              <span className="font-sans-brutal text-[26px] leading-[1.0] uppercase tracking-tight">{item.role}</span>
              <span className="font-serif italic text-[16px] text-cement/80 leading-[1.4]">{item.detail}</span>
              <span className="font-sans-brutal text-[11px] tracking-[0.22em] uppercase text-cement/45 mt-2">{item.stack}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MobileLore;
