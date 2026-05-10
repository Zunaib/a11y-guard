import type { Region, Law, WcagLevel, WcagVersion } from '../types.js';

export const REGION_LAW_MAP: Record<Region, Law[]> = {
  US: ['ADA', 'Section508'],
  EU: ['EAA', 'EN301549'],
  UK: ['EqualityAct', 'PSBAR'],
  CA: ['AODA', 'ACA'],
  AU: ['DDA'],
  NZ: [],
  JP: ['JIS'],
  BR: ['LBI'],
  IL: ['IS5568'],
  IN: [],
  DE: ['BITV20'],
  FR: ['RGAA'],
  ES: ['EAA'],
  NL: ['EAA'],
  SE: ['EAA'],
  NO: [],
  DK: ['EAA'],
  FI: ['EAA'],
};

export const LAW_WCAG_REQUIREMENT: Record<Law, {
  version: WcagVersion;
  level: WcagLevel;
  notes: string;
}> = {
  ADA:         { version: '2.1', level: 'AA', notes: 'Title II explicit (2024); Title III de facto via courts' },
  Section508:  { version: '2.0', level: 'AA', notes: 'Federal agencies and vendors; WCAG 2.0 still referenced' },
  EAA:         { version: '2.1', level: 'AA', notes: 'Mandatory June 28 2025; private + public sector in EU' },
  EN301549:    { version: '2.1', level: 'AA', notes: 'Technical spec behind EAA; also covers non-web ICT' },
  EqualityAct: { version: '2.1', level: 'AA', notes: 'UK civil rights law; no explicit WCAG ref but AA is standard' },
  PSBAR:       { version: '2.1', level: 'AA', notes: 'UK public sector bodies; explicit WCAG 2.1 AA requirement' },
  AODA:        { version: '2.0', level: 'AA', notes: 'Ontario; 50+ employees; WCAG 2.0 AA' },
  ACA:         { version: '2.1', level: 'AA', notes: 'Federal Canada; adopts EN 301 549:2021 / WCAG 2.1 AA' },
  DDA:         { version: '2.1', level: 'AA', notes: 'Australia; complaint-based enforcement' },
  BITV20:      { version: '2.1', level: 'AA', notes: 'Germany; federal + public sector' },
  RGAA:        { version: '2.1', level: 'AA', notes: 'France; public sector; national interpretation of WCAG' },
  JIS:         { version: '2.1', level: 'AA', notes: 'Japan; public sector + recommended private' },
  LBI:         { version: '2.1', level: 'AA', notes: 'Brazil; all digital services' },
  IS5568:      { version: '2.1', level: 'AA', notes: 'Israel; public + private sector' },
};

export const LAW_REGION_MAP: Record<Law, Region[]> = {
  ADA:         ['US'],
  Section508:  ['US'],
  EAA:         ['EU', 'ES', 'NL', 'SE', 'DK', 'FI'],
  EN301549:    ['EU', 'ES', 'NL', 'SE', 'DK', 'FI'],
  EqualityAct: ['UK'],
  PSBAR:       ['UK'],
  AODA:        ['CA'],
  ACA:         ['CA'],
  DDA:         ['AU'],
  BITV20:      ['DE'],
  RGAA:        ['FR'],
  JIS:         ['JP'],
  LBI:         ['BR'],
  IS5568:      ['IL'],
};

export function getRegionsForLaw(law: Law): Region[] {
  return LAW_REGION_MAP[law] ?? [];
}

export function getLawsForRegion(region: Region): Law[] {
  return REGION_LAW_MAP[region] ?? [];
}
