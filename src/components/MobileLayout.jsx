import React from 'react';
import {
  TAGLINE_LINES,
  LORE_TIMELINE,
  PRINCIPLES,
  MANIFESTO_TEXT,
  PROJECTS
} from '../data/content.js';
import { POWERS_DATA } from './Powers.jsx';
import { ARTIFACTS } from '../data/artifacts.js';

export default function MobileLayout() {
  return (
    <div className="w-full flex flex-col bg-[#D4D3D0] text-[#0A0A0A] font-sans-brutal selection:bg-[#3B82F6] selection:text-white pb-10">
      {/* 1. Hero Section */}
      <section className="min-h-[85vh] flex flex-col px-6 py-8">
        <header className="flex flex-col items-start gap-2 text-[11px] tracking-[0.35em] uppercase text-[#0A0A0A]/60">
          <span className="text-base text-[#0A0A0A]">Vedant Meshram</span>
          <a 
            href="https://mail.google.com/mail/?view=cm&fs=1&to=meshramvedant7@gmail.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-base text-[#0A0A0A]" 
            style={{ textDecoration: 'none' }}
          >
            Get in touch ↗
          </a>
        </header>
        
        <div className="flex-1 flex flex-col items-start justify-end uppercase tracking-tighter leading-[0.97] text-[clamp(2.5rem,13vw,5rem)] pb-6">
          {TAGLINE_LINES.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      </section>

      {/* 2. Manifesto Section */}
      <section className="px-6 py-12 border-t border-[#0A0A0A]/20">
        <div className="flex justify-between items-baseline mb-10">
          <span className="text-[10px] tracking-[0.35em] uppercase text-[#0A0A0A]/60">MANIFESTO</span>
          <span className="text-[10px] tracking-[0.35em] uppercase text-[#0A0A0A]/40">02</span>
        </div>
        
        <div className="uppercase tracking-tighter leading-[0.92] text-[clamp(2.5rem,12vw,4.5rem)] mb-10">
          <div>BASICALLY,</div>
          <div>I MAKE</div>
          <div>COOL PROJECTS.</div>
        </div>

        <div className="flex flex-col gap-8">
          <div className="flex flex-col border-t border-[#0A0A0A]/20">
            {PRINCIPLES.map(({ word, sub }, i) => (
              <div key={i} className="border-b border-[#0A0A0A]/10 py-4 flex flex-col">
                <span className="uppercase tracking-tighter leading-[1.0] text-[clamp(1.8rem,8vw,3rem)]">{word}</span>
                <span className="font-serif italic text-[#0A0A0A]/60 text-sm mt-1">{sub}</span>
              </div>
            ))}
          </div>
          
          <p className="font-serif text-[18px] leading-[1.6]">
            {MANIFESTO_TEXT}
          </p>
        </div>
      </section>

      {/* 3. Lore Timeline Section */}
      <section className="bg-[#0A0A0A] text-[#D4D3D0] px-6 py-16">
        <div className="flex justify-between items-baseline mb-12">
          <span className="text-[10px] tracking-[0.35em] uppercase text-[#D4D3D0]/60">LORE</span>
          <span className="text-[10px] tracking-[0.35em] uppercase text-[#D4D3D0]/40">01</span>
        </div>
        
        <div className="flex flex-col gap-12">
          {LORE_TIMELINE.map((item, i) => (
            <div key={i} className="flex flex-col gap-2">
              <span className="text-[11px] tracking-[0.3em] uppercase text-[#FF4D00]">{item.year}</span>
              <span className="text-[26px] leading-[1.0] uppercase tracking-tight">{item.role}</span>
              <span className="font-serif italic text-[17px] text-[#D4D3D0]/80 leading-[1.4]">{item.detail}</span>
              <span className="text-[11px] tracking-[0.22em] uppercase text-[#D4D3D0]/45 mt-2">{item.stack}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Projects (Quests) Section */}
      <section className="px-6 py-16 bg-[#D4D3D0]">
        <div className="flex justify-between items-baseline mb-12">
          <span className="text-[10px] tracking-[0.35em] uppercase text-[#0A0A0A]/60">PROJECTS</span>
          <span className="text-[10px] tracking-[0.35em] uppercase text-[#0A0A0A]/40">03</span>
        </div>
        
        <div className="flex flex-col gap-16">
          {PROJECTS.map((proj, i) => (
            <div key={i} className="flex flex-col border-b border-[#0A0A0A]/10 pb-10 last:border-0 last:pb-0">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[12px] tracking-[0.2em] text-[#FF4D00]">{proj.year}</span>
                <span className="text-[10px] tracking-[0.3em] text-[#0A0A0A]/50">#{proj.num}</span>
              </div>
              <h3 className="text-[clamp(1.8rem,9vw,3.5rem)] leading-[0.95] tracking-tight uppercase mb-3">{proj.title}</h3>
              <div className="flex flex-col gap-2 mb-4">
                 <span className="text-[11px] tracking-[0.15em] text-[#0A0A0A]/70 uppercase">{proj.role}</span>
                 <span className="text-[10px] tracking-[0.15em] text-[#0A0A0A]/50 uppercase">{proj.stack}</span>
              </div>
              <p className="font-serif text-[16px] leading-[1.5] text-[#0A0A0A]/80 mb-3">{proj.description}</p>
              <p className="font-serif italic text-[15px] leading-[1.5] text-[#3B82F6]">{proj.outcome}</p>
              {proj.link && (
                <a href={proj.link} target="_blank" rel="noopener noreferrer" className="mt-5 text-[12px] font-bold tracking-[0.2em] uppercase underline underline-offset-4 decoration-[#0A0A0A]/30 w-fit">Visit Project ↗</a>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 5. Powers Section */}
      <section className="px-6 py-16 bg-[#0A0A0A] text-[#D4D3D0]">
        <div className="flex justify-between items-baseline mb-12">
          <span className="text-[10px] tracking-[0.35em] uppercase text-[#D4D3D0]/60">POWERS</span>
          <span className="text-[10px] tracking-[0.35em] uppercase text-[#D4D3D0]/40">04</span>
        </div>

        <div className="flex flex-col gap-10">
          {POWERS_DATA.map((power, i) => (
            <div key={i} className="flex flex-col border-b border-[#D4D3D0]/10 pb-10 last:border-0 last:pb-0">
              <span className="text-[10px] tracking-[0.4em] uppercase mb-2" style={{ color: power.accent }}>{power.id}</span>
              <h3 className="text-[clamp(2rem,10vw,3rem)] leading-[0.9] tracking-tight uppercase mb-4">{power.title}</h3>
              <p className="font-serif text-[16px] leading-[1.5] text-[#D4D3D0]/70 mb-5">{power.statement}</p>
              <div className="flex flex-wrap gap-x-4 gap-y-3">
                {power.techs.map((tech, j) => (
                  <span key={j} className="text-[11px] tracking-[0.2em] uppercase text-[#D4D3D0]/90">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Artifacts Section */}
      <section className="px-6 py-16 bg-[#D4D3D0]">
        <div className="flex justify-between items-baseline mb-12">
          <span className="text-[10px] tracking-[0.35em] uppercase text-[#0A0A0A]/60">ARTIFACTS</span>
          <span className="text-[10px] tracking-[0.35em] uppercase text-[#0A0A0A]/40">05</span>
        </div>

        <div className="flex flex-col gap-8">
          {ARTIFACTS.map((item, i) => (
            <div key={i} className="flex flex-col border border-[#0A0A0A]/10 p-6 bg-[#0A0A0A]/[0.02]">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[12px] tracking-[0.2em] text-[#FF4D00]">{item.year}</span>
                <span className="text-[10px] tracking-[0.3em] text-[#0A0A0A]/50">#{item.id}</span>
              </div>
              <h4 className="text-[1.5rem] leading-[1.05] font-black uppercase tracking-tight mb-2">{item.title}</h4>
              <span className="font-serif italic text-[15px] text-[#0A0A0A]/70 mb-5">{item.domain}</span>
              <div className="flex flex-wrap gap-2">
                {item.annotations.map((note, j) => (
                  <span key={j} className="text-[9px] tracking-[0.15em] uppercase text-[#3B82F6] border border-[#3B82F6]/40 px-2 py-1 rounded-full">
                    {note}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
