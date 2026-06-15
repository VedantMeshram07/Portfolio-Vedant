export const ARTIFACTS = [
  {
    id: '01',
    year: '2025',
    title: 'IBM SkillsBuild Pitch Night — Top 3',
    indexLabel: 'AURA',
    domain: 'Artificial Intelligence',
    watermark: 'TOP 3 FINISH',
    featured: true,
    annotations: [
      'EVENT: IBM SKILLSBUILD',
      'RANK: TOP 3',
      'PROJECT: AURA'
    ],
  },

  {
    id: '02',
    year: '2025',
    title: 'Generative AI Professional Certificate',
    indexLabel: 'GENERATIVE AI',
    domain: 'Generative AI',
    watermark: 'GENERATIVE AI',
    featured: true,
    annotations: [
      'ISSUER: OUTSKILL',
      'STATUS: COMPLETED',
      'DOMAIN: AI'
    ],
  },

  {
    id: '03',
    year: '2025',
    title: 'Co-Convenor - Technical Council',
    indexLabel: 'TECHNICAL COUNCIL',
    domain: 'Leadership & Management',
    watermark: 'LEADERSHIP',
    featured: true,
    annotations: [
      'ROLE: CO-CONVENOR',
      'DOMAIN: LEADERSHIP',
      'FOCUS: MANAGEMENT'
    ],
  }
];

export const FEATURED_ARTIFACTS = ARTIFACTS.filter((artifact) => artifact.featured);