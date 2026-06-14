/* ─── artifact registry ───────────────────────────────────────────────────
   featured: true  → shown in the main journey (3–5 max)
   featured: false → accessible via OPEN ARCHIVE overlay only
   ─────────────────────────────────────────────────────────────────────── */

export const ARTIFACTS = [
  {
    id:          '01',
    year:        'JUN 2025',
    title:       'IBM AI Engineering Professional Certificate',
    indexLabel:  'IBM AI ENGINEERING',
    domain:      'Artificial Intelligence',
    watermark:   'ARTIFICIAL INTELLIGENCE',
    featured:    true,
    annotations: ['VERIFIED', 'ISSUER: IBM', 'STATUS: OBTAINED', 'DOMAIN: AI'],
  },
  {
    id:          '02',
    year:        'MAY 2025',
    title:       'Generative AI Professional Certificate',
    indexLabel:  'GENERATIVE AI',
    domain:      'Generative AI',
    watermark:   'GENERATIVE AI',
    featured:    true,
    annotations: ['VERIFIED', 'ISSUER: COURSERA', 'STATUS: OBTAINED', 'DOMAIN: AI'],
  },
  {
    id:          '03',
    year:        'OCT 2024',
    title:       'IEEE Xtreme',
    indexLabel:  'IEEE XTREME',
    domain:      'Leadership',
    watermark:   'LEADERSHIP',
    featured:    true,
    annotations: ['VERIFIED', 'ROLE: CO-CONVENOR', 'DOMAIN: LEADERSHIP'],
  },
  {
    id:          '04',
    year:        'DEC 2024',
    title:       'Backend Developer Professional Certificate',
    indexLabel:  'BACKEND ENGINEERING',
    domain:      'Backend Engineering',
    watermark:   'BACKEND ENGINEERING',
    featured:    false,
    annotations: ['VERIFIED', 'ISSUER: META', 'STATUS: OBTAINED', 'DOMAIN: SYSTEMS'],
  },
  {
    id:          '05',
    year:        'APR 2025',
    title:       'Building Autonomous AI Agents',
    indexLabel:  'AI CLUB',
    domain:      'Autonomous Systems',
    watermark:   'AUTONOMOUS SYSTEMS',
    featured:    false,
    annotations: ['VERIFIED', 'ISSUER: DEEPLEARNING.AI', 'STATUS: COMPLETED', 'DOMAIN: AI'],
  },
];

export const FEATURED_ARTIFACTS = ARTIFACTS.filter((a) => a.featured);

export const ARCHIVE_ARTIFACTS = [...ARTIFACTS].sort((a, b) => {
  const yearDiff = parseInt(a.year, 10) - parseInt(b.year, 10);
  if (yearDiff !== 0) return yearDiff;
  return a.id.localeCompare(b.id);
});
