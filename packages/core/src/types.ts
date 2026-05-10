export type WcagLevel = 'A' | 'AA' | 'AAA';
export type WcagVersion = '2.0' | '2.1' | '2.2';
export type Severity = 'error' | 'warning' | 'info';

export type Region =
  | 'US' | 'EU' | 'UK' | 'CA' | 'AU' | 'NZ'
  | 'JP' | 'BR' | 'IL' | 'IN' | 'DE' | 'FR'
  | 'ES' | 'NL' | 'SE' | 'NO' | 'DK' | 'FI';

export type Law =
  | 'ADA'
  | 'Section508'
  | 'EAA'
  | 'EN301549'
  | 'EqualityAct'
  | 'PSBAR'
  | 'AODA'
  | 'ACA'
  | 'DDA'
  | 'BITV20'
  | 'RGAA'
  | 'JIS'
  | 'LBI'
  | 'IS5568';

export type DisabilityType =
  | 'visual'
  | 'auditory'
  | 'motor'
  | 'cognitive'
  | 'seizure'
  | 'speech'
  | 'language';

export interface WcagCriterion {
  id: string;
  name: string;
  level: WcagLevel;
  wcagVersion: WcagVersion;
  disabilityTypes: DisabilityType[];
  laws: Law[];
  regions: Region[];
  url: string;
}

export interface Violation {
  ruleId: string;
  wcagCriterion: WcagCriterion;
  severity: Severity;
  message: string;
  suggestion: string;
  element?: string;
  file?: string;
  line?: number;
  col?: number;
  laws: Law[];
  regions: Region[];
}

export interface AuditResult {
  violations: Violation[];
  warnings: Violation[];
  passed: number;
  summary: ComplianceSummary;
}

export interface ComplianceSummary {
  byRegion: Record<Region, { compliant: boolean; violations: number }>;
  byLaw: Record<Law, { compliant: boolean; violations: number }>;
  byDisabilityType: Record<DisabilityType, { compliant: boolean; violations: number }>;
}

export interface A11yElement {
  tagName: string;
  outerHTML: string;
  textContent: string;
  getAttribute(name: string): string | null;
  hasAttribute(name: string): boolean;
  querySelector(selector: string): A11yElement | null;
  querySelectorAll(selector: string): A11yElement[];
  attributes: Array<{ name: string; value: string }>;
  parentElement: A11yElement | null;
}

export interface RuleContext {
  querySelectorAll(selector: string): A11yElement[];
  querySelector(selector: string): A11yElement | null;
  getCriterion(id: string): WcagCriterion;
  getApplicableLaws(criterionId: string): Law[];
  getApplicableRegions(criterionId: string): Region[];
  options: A11yGuardConfig;
  file?: string;
}

export interface Rule {
  id: string;
  wcagCriterionId: string;
  name: string;
  description: string;
  disabilityTypes: DisabilityType[];
  check(context: RuleContext): Violation[];
}

export interface A11yGuardConfig {
  regions?: Region[];
  laws?: Law[];
  disabilityTypes?: DisabilityType[];
  level?: WcagLevel;
  wcagVersion?: WcagVersion;
  failOn?: 'error' | 'warning' | 'any';
  include?: string[];
  exclude?: string[];
  reporter?: 'pretty' | 'json' | 'sarif' | 'github-actions' | 'html';
  rules?: Record<string, Severity | 'off'>;
}
