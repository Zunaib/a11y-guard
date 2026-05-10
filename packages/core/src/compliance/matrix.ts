import type { WcagCriterion, Law, Region, DisabilityType, WcagLevel, WcagVersion } from '../types.js';
import { LAW_REGION_MAP } from './regions.js';
import { getDisabilityTypesForCriterion } from './disability-types.js';

interface CriterionDef {
  id: string;
  name: string;
  level: WcagLevel;
  wcagVersion: WcagVersion;
  laws: Law[];
}

const ALL_LAWS: Law[] = [
  'ADA', 'Section508', 'EAA', 'EN301549', 'EqualityAct', 'PSBAR',
  'AODA', 'ACA', 'DDA', 'BITV20', 'RGAA', 'JIS', 'LBI', 'IS5568',
];

// Laws that require WCAG 2.1 AA (which covers WCAG 2.0 AA as a subset)
const WCAG_21_LAWS: Law[] = [
  'ADA', 'EAA', 'EN301549', 'EqualityAct', 'PSBAR', 'ACA',
  'DDA', 'BITV20', 'RGAA', 'JIS', 'LBI', 'IS5568',
];

// Laws that require WCAG 2.0 AA or above
const WCAG_20_LAWS: Law[] = [...ALL_LAWS]; // all laws require at least WCAG 2.0 AA

const CRITERIA_DEFS: CriterionDef[] = [
  // Level A — WCAG 2.0
  { id: '1.1.1', name: 'Non-text Content',            level: 'A',  wcagVersion: '2.0', laws: WCAG_20_LAWS },
  { id: '1.2.1', name: 'Audio-only and Video-only (Prerecorded)', level: 'A', wcagVersion: '2.0', laws: WCAG_20_LAWS },
  { id: '1.2.2', name: 'Captions (Prerecorded)',       level: 'A',  wcagVersion: '2.0', laws: WCAG_20_LAWS },
  { id: '1.2.3', name: 'Audio Description or Media Alternative (Prerecorded)', level: 'A', wcagVersion: '2.0', laws: WCAG_20_LAWS },
  { id: '1.3.1', name: 'Info and Relationships',       level: 'A',  wcagVersion: '2.0', laws: WCAG_20_LAWS },
  { id: '1.3.2', name: 'Meaningful Sequence',          level: 'A',  wcagVersion: '2.0', laws: WCAG_20_LAWS },
  { id: '1.3.3', name: 'Sensory Characteristics',      level: 'A',  wcagVersion: '2.0', laws: WCAG_20_LAWS },
  { id: '1.4.1', name: 'Use of Color',                 level: 'A',  wcagVersion: '2.0', laws: WCAG_20_LAWS },
  { id: '1.4.2', name: 'Audio Control',                level: 'A',  wcagVersion: '2.0', laws: WCAG_20_LAWS },
  { id: '2.1.1', name: 'Keyboard',                     level: 'A',  wcagVersion: '2.0', laws: WCAG_20_LAWS },
  { id: '2.1.2', name: 'No Keyboard Trap',             level: 'A',  wcagVersion: '2.0', laws: WCAG_20_LAWS },
  { id: '2.2.1', name: 'Timing Adjustable',            level: 'A',  wcagVersion: '2.0', laws: WCAG_20_LAWS },
  { id: '2.2.2', name: 'Pause, Stop, Hide',            level: 'A',  wcagVersion: '2.0', laws: WCAG_20_LAWS },
  { id: '2.3.1', name: 'Three Flashes or Below Threshold', level: 'A', wcagVersion: '2.0', laws: WCAG_20_LAWS },
  { id: '2.4.1', name: 'Bypass Blocks',                level: 'A',  wcagVersion: '2.0', laws: WCAG_20_LAWS },
  { id: '2.4.2', name: 'Page Titled',                  level: 'A',  wcagVersion: '2.0', laws: WCAG_20_LAWS },
  { id: '2.4.3', name: 'Focus Order',                  level: 'A',  wcagVersion: '2.0', laws: WCAG_20_LAWS },
  { id: '2.4.4', name: 'Link Purpose (In Context)',    level: 'A',  wcagVersion: '2.0', laws: WCAG_20_LAWS },
  { id: '3.1.1', name: 'Language of Page',             level: 'A',  wcagVersion: '2.0', laws: WCAG_20_LAWS },
  { id: '3.2.1', name: 'On Focus',                     level: 'A',  wcagVersion: '2.0', laws: WCAG_20_LAWS },
  { id: '3.2.2', name: 'On Input',                     level: 'A',  wcagVersion: '2.0', laws: WCAG_20_LAWS },
  { id: '3.3.1', name: 'Error Identification',         level: 'A',  wcagVersion: '2.0', laws: WCAG_20_LAWS },
  { id: '3.3.2', name: 'Labels or Instructions',       level: 'A',  wcagVersion: '2.0', laws: WCAG_20_LAWS },
  { id: '4.1.1', name: 'Parsing',                      level: 'A',  wcagVersion: '2.0', laws: WCAG_20_LAWS },
  { id: '4.1.2', name: 'Name, Role, Value',            level: 'A',  wcagVersion: '2.0', laws: WCAG_20_LAWS },
  // Level AA — WCAG 2.0
  { id: '1.2.4', name: 'Captions (Live)',              level: 'AA', wcagVersion: '2.0', laws: WCAG_20_LAWS },
  { id: '1.2.5', name: 'Audio Description (Prerecorded)', level: 'AA', wcagVersion: '2.0', laws: WCAG_20_LAWS },
  { id: '1.4.3', name: 'Contrast (Minimum)',           level: 'AA', wcagVersion: '2.0', laws: WCAG_20_LAWS },
  { id: '1.4.4', name: 'Resize Text',                  level: 'AA', wcagVersion: '2.0', laws: WCAG_20_LAWS },
  { id: '1.4.5', name: 'Images of Text',               level: 'AA', wcagVersion: '2.0', laws: WCAG_20_LAWS },
  { id: '2.4.5', name: 'Multiple Ways',                level: 'AA', wcagVersion: '2.0', laws: WCAG_20_LAWS },
  { id: '2.4.6', name: 'Headings and Labels',          level: 'AA', wcagVersion: '2.0', laws: WCAG_20_LAWS },
  { id: '2.4.7', name: 'Focus Visible',                level: 'AA', wcagVersion: '2.0', laws: WCAG_20_LAWS },
  { id: '3.1.2', name: 'Language of Parts',            level: 'AA', wcagVersion: '2.0', laws: WCAG_20_LAWS },
  { id: '3.2.3', name: 'Consistent Navigation',        level: 'AA', wcagVersion: '2.0', laws: WCAG_20_LAWS },
  { id: '3.2.4', name: 'Consistent Identification',    level: 'AA', wcagVersion: '2.0', laws: WCAG_20_LAWS },
  { id: '3.3.3', name: 'Error Suggestion',             level: 'AA', wcagVersion: '2.0', laws: WCAG_20_LAWS },
  { id: '3.3.4', name: 'Error Prevention (Legal, Financial, Data)', level: 'AA', wcagVersion: '2.0', laws: WCAG_20_LAWS },
  // Level A — WCAG 2.1 additions
  { id: '2.5.1', name: 'Pointer Gestures',             level: 'A',  wcagVersion: '2.1', laws: WCAG_21_LAWS },
  { id: '2.5.2', name: 'Pointer Cancellation',         level: 'A',  wcagVersion: '2.1', laws: WCAG_21_LAWS },
  { id: '2.5.3', name: 'Label in Name',                level: 'A',  wcagVersion: '2.1', laws: WCAG_21_LAWS },
  { id: '2.5.4', name: 'Motion Actuation',             level: 'A',  wcagVersion: '2.1', laws: WCAG_21_LAWS },
  { id: '4.1.3', name: 'Status Messages',              level: 'A',  wcagVersion: '2.1', laws: WCAG_21_LAWS },
  // Level AA — WCAG 2.1 additions
  { id: '1.3.4', name: 'Orientation',                  level: 'AA', wcagVersion: '2.1', laws: WCAG_21_LAWS },
  { id: '1.3.5', name: 'Identify Input Purpose',       level: 'AA', wcagVersion: '2.1', laws: WCAG_21_LAWS },
  { id: '1.4.10', name: 'Reflow',                      level: 'AA', wcagVersion: '2.1', laws: WCAG_21_LAWS },
  { id: '1.4.11', name: 'Non-text Contrast',           level: 'AA', wcagVersion: '2.1', laws: WCAG_21_LAWS },
  { id: '1.4.12', name: 'Text Spacing',                level: 'AA', wcagVersion: '2.1', laws: WCAG_21_LAWS },
  { id: '1.4.13', name: 'Content on Hover or Focus',   level: 'AA', wcagVersion: '2.1', laws: WCAG_21_LAWS },
  { id: '2.1.4', name: 'Character Key Shortcuts',      level: 'A',  wcagVersion: '2.1', laws: WCAG_21_LAWS },
  // Level AA — WCAG 2.2 additions
  { id: '2.4.11', name: 'Focus Not Obscured (Minimum)', level: 'AA', wcagVersion: '2.2', laws: [] },
  { id: '2.4.12', name: 'Focus Not Obscured (Enhanced)', level: 'AAA', wcagVersion: '2.2', laws: [] },
  { id: '2.4.13', name: 'Focus Appearance',            level: 'AAA', wcagVersion: '2.2', laws: [] },
  { id: '2.5.7', name: 'Dragging Movements',           level: 'AA', wcagVersion: '2.2', laws: [] },
  { id: '2.5.8', name: 'Target Size (Minimum)',        level: 'AA', wcagVersion: '2.2', laws: [] },
  { id: '3.2.6', name: 'Consistent Help',              level: 'A',  wcagVersion: '2.2', laws: [] },
  { id: '3.3.7', name: 'Redundant Entry',              level: 'A',  wcagVersion: '2.2', laws: [] },
  { id: '3.3.8', name: 'Accessible Authentication (Minimum)', level: 'AA', wcagVersion: '2.2', laws: [] },
  // AAA criteria (WCAG 2.0)
  { id: '1.4.6', name: 'Contrast (Enhanced)',          level: 'AAA', wcagVersion: '2.0', laws: [] },
  { id: '2.3.3', name: 'Animation from Interactions',  level: 'AAA', wcagVersion: '2.1', laws: [] },
  { id: '1.3.6', name: 'Identify Purpose',             level: 'AAA', wcagVersion: '2.1', laws: [] },
];

function buildCriterion(def: CriterionDef): WcagCriterion {
  const regions: Region[] = [];
  for (const law of def.laws) {
    const lawRegions = LAW_REGION_MAP[law] ?? [];
    for (const r of lawRegions) {
      if (!regions.includes(r)) regions.push(r);
    }
  }
  return {
    id: def.id,
    name: def.name,
    level: def.level,
    wcagVersion: def.wcagVersion,
    disabilityTypes: getDisabilityTypesForCriterion(def.id),
    laws: def.laws,
    regions,
    url: `https://www.w3.org/WAI/WCAG${def.wcagVersion.replace('.', '')}/Understanding/${def.id.replace(/\./g, '-')}.html`,
  };
}

export const WCAG_CRITERIA: Map<string, WcagCriterion> = new Map(
  CRITERIA_DEFS.map((def) => [def.id, buildCriterion(def)])
);

export function getCriterion(id: string): WcagCriterion {
  const criterion = WCAG_CRITERIA.get(id);
  if (!criterion) throw new Error(`Unknown WCAG criterion: ${id}`);
  return criterion;
}

export function getApplicableLaws(criterionId: string, opts?: {
  regions?: Region[];
  laws?: Law[];
}): Law[] {
  const criterion = getCriterion(criterionId);
  let laws = criterion.laws;
  if (opts?.regions && opts.regions.length > 0) {
    laws = laws.filter((law) => {
      const lawRegions = LAW_REGION_MAP[law] ?? [];
      return lawRegions.some((r) => opts.regions!.includes(r));
    });
  }
  if (opts?.laws && opts.laws.length > 0) {
    laws = laws.filter((law) => opts.laws!.includes(law));
  }
  return laws;
}

export function getApplicableRegions(criterionId: string, opts?: {
  regions?: Region[];
  laws?: Law[];
}): Region[] {
  const applicableLaws = getApplicableLaws(criterionId, opts);
  const regions: Region[] = [];
  for (const law of applicableLaws) {
    const lawRegions = LAW_REGION_MAP[law] ?? [];
    for (const r of lawRegions) {
      if (!regions.includes(r)) regions.push(r);
    }
  }
  if (opts?.regions && opts.regions.length > 0) {
    return regions.filter((r) => opts.regions!.includes(r));
  }
  return regions;
}

export function filterCriteriaByConfig(opts: {
  regions?: Region[];
  laws?: Law[];
  disabilityTypes?: DisabilityType[];
  level?: 'A' | 'AA' | 'AAA';
  wcagVersion?: '2.0' | '2.1' | '2.2';
}): WcagCriterion[] {
  const levelOrder: Record<WcagLevel, number> = { A: 1, AA: 2, AAA: 3 };
  const versionOrder: Record<WcagVersion, number> = { '2.0': 1, '2.1': 2, '2.2': 3 };
  const maxLevel = opts.level ?? 'AA';
  const maxVersion = opts.wcagVersion ?? '2.1';

  return [...WCAG_CRITERIA.values()].filter((c) => {
    if (levelOrder[c.level] > levelOrder[maxLevel]) return false;
    if (versionOrder[c.wcagVersion] > versionOrder[maxVersion]) return false;
    if (opts.disabilityTypes && opts.disabilityTypes.length > 0) {
      if (!c.disabilityTypes.some((dt) => opts.disabilityTypes!.includes(dt))) return false;
    }
    if (opts.laws && opts.laws.length > 0) {
      if (!c.laws.some((l) => opts.laws!.includes(l))) return false;
    }
    if (opts.regions && opts.regions.length > 0) {
      if (!c.regions.some((r) => opts.regions!.includes(r))) return false;
    }
    return true;
  });
}
