import { parseDocument } from 'htmlparser2';
import { selectAll as cssSelectAll, selectOne as cssSelectOne } from 'css-select';
import { getOuterHTML, getText } from 'domutils';
import type { AnyNode, Element as HP2Element } from 'domhandler';
import type { A11yGuardConfig, AuditResult, ComplianceSummary, A11yElement, DisabilityType, Law, Region, Rule, RuleContext, Severity, Violation } from './types.js';
import { ALL_RULES } from './rules/index.js';
import { getCriterion, getApplicableLaws, getApplicableRegions, filterCriteriaByConfig } from './compliance/matrix.js';

export interface EngineOptions extends A11yGuardConfig {
  html: string;
  file?: string;
  /**
   * When true the source is a React component file (.tsx/.jsx).
   * Document-level rules that only apply to full HTML pages are skipped.
   */
  isComponentFile?: boolean;
}

/** Rule IDs that only make sense at the full-document level and must not fire on component files. */
const DOCUMENT_ONLY_RULE_IDS = new Set([
  'html-has-lang',
  'page-title',
  'language-parts',
  'consistent-navigation',
  'timeout-adjustable',
  'landmark-regions',  // standalone components don't need a <main> wrapper
]);

function isElement(node: AnyNode): node is HP2Element {
  const t = (node as HP2Element).type;
  return t === 'tag' || t === 'script' || t === 'style';
}

class WrappedElement implements A11yElement {
  readonly tagName: string;
  readonly outerHTML: string;

  constructor(private readonly el: HP2Element) {
    this.tagName = el.name.toUpperCase();
    this.outerHTML = getOuterHTML(el).slice(0, 500);
  }

  getAttribute(name: string): string | null {
    const val = this.el.attribs[name];
    return val !== undefined ? val : null;
  }

  hasAttribute(name: string): boolean {
    return name in this.el.attribs;
  }

  get textContent(): string {
    return getText(this.el);
  }

  get parentElement(): WrappedElement | null {
    const p = this.el.parent;
    return p && isElement(p as AnyNode) ? new WrappedElement(p as HP2Element) : null;
  }

  get attributes(): Array<{ name: string; value: string }> {
    return Object.entries(this.el.attribs).map(([name, value]) => ({ name, value }));
  }

  querySelector(selector: string): WrappedElement | null {
    const found = cssSelectOne(selector, this.el.children ?? []);
    return found && isElement(found) ? new WrappedElement(found) : null;
  }

  querySelectorAll(selector: string): WrappedElement[] {
    return cssSelectAll(selector, this.el.children ?? [])
      .filter(isElement)
      .map((el) => new WrappedElement(el as HP2Element));
  }
}

function buildContext(
  doc: ReturnType<typeof parseDocument>,
  config: A11yGuardConfig,
  file?: string,
): RuleContext {
  const roots = doc.children;

  return {
    querySelectorAll(selector) {
      return cssSelectAll(selector, roots)
        .filter(isElement)
        .map((el) => new WrappedElement(el as HP2Element));
    },
    querySelector(selector) {
      const found = cssSelectOne(selector, roots);
      return found && isElement(found) ? new WrappedElement(found as HP2Element) : null;
    },
    getCriterion: (id) => getCriterion(id),
    getApplicableLaws: (criterionId) => getApplicableLaws(criterionId, {
      regions: config.regions,
      laws: config.laws,
    }),
    getApplicableRegions: (criterionId) => getApplicableRegions(criterionId, {
      regions: config.regions,
      laws: config.laws,
    }),
    options: config,
    file,
  };
}

function shouldRunRule(
  rule: Rule,
  config: A11yGuardConfig,
  isComponentFile?: boolean,
): boolean {
  if (config.rules?.[rule.id] === 'off') return false;

  // Skip document-level rules when scanning component files
  if (isComponentFile && DOCUMENT_ONLY_RULE_IDS.has(rule.id)) return false;

  if (config.disabilityTypes && config.disabilityTypes.length > 0) {
    if (!rule.disabilityTypes.some((dt) => config.disabilityTypes!.includes(dt))) return false;
  }

  const applicableCriteria = filterCriteriaByConfig({
    regions: config.regions,
    laws: config.laws,
    disabilityTypes: config.disabilityTypes,
    level: config.level,
    wcagVersion: config.wcagVersion,
  });

  return applicableCriteria.some((c) => c.id === rule.wcagCriterionId);
}

function applySeverityOverride(violation: Violation, config: A11yGuardConfig): Violation {
  const override = config.rules?.[violation.ruleId];
  if (override && override !== 'off') {
    return { ...violation, severity: override as Severity };
  }
  return violation;
}

function buildComplianceSummary(allViolations: Violation[]): ComplianceSummary {
  const allRegions: Region[] = ['US', 'EU', 'UK', 'CA', 'AU', 'NZ', 'JP', 'BR', 'IL', 'IN', 'DE', 'FR', 'ES', 'NL', 'SE', 'NO', 'DK', 'FI'];
  const allLaws: Law[] = ['ADA', 'Section508', 'EAA', 'EN301549', 'EqualityAct', 'PSBAR', 'AODA', 'ACA', 'DDA', 'BITV20', 'RGAA', 'JIS', 'LBI', 'IS5568'];
  const allDisabilityTypes: DisabilityType[] = ['visual', 'auditory', 'motor', 'cognitive', 'seizure', 'speech', 'language'];

  const byRegion = {} as ComplianceSummary['byRegion'];
  for (const region of allRegions) {
    const count = allViolations.filter((v) => v.severity === 'error' && v.regions.includes(region)).length;
    byRegion[region] = { compliant: count === 0, violations: count };
  }

  const byLaw = {} as ComplianceSummary['byLaw'];
  for (const law of allLaws) {
    const count = allViolations.filter((v) => v.severity === 'error' && v.laws.includes(law)).length;
    byLaw[law] = { compliant: count === 0, violations: count };
  }

  const byDisabilityType = {} as ComplianceSummary['byDisabilityType'];
  for (const dt of allDisabilityTypes) {
    const count = allViolations.filter(
      (v) => v.severity === 'error' && v.wcagCriterion.disabilityTypes.includes(dt)
    ).length;
    byDisabilityType[dt] = { compliant: count === 0, violations: count };
  }

  return { byRegion, byLaw, byDisabilityType };
}

export function runAudit(options: EngineOptions): AuditResult {
  const config: A11yGuardConfig = {
    level: options.level ?? 'AA',
    wcagVersion: options.wcagVersion ?? '2.1',
    regions: options.regions,
    laws: options.laws,
    disabilityTypes: options.disabilityTypes,
    failOn: options.failOn ?? 'error',
    reporter: options.reporter ?? 'pretty',
    rules: options.rules,
  };

  const doc = parseDocument(options.html, { decodeEntities: true });
  const context = buildContext(doc, config, options.file);
  const activeRules = ALL_RULES.filter((rule) => shouldRunRule(rule, config, options.isComponentFile));

  const allViolations: Violation[] = [];
  for (const rule of activeRules) {
    try {
      const ruleViolations = rule.check(context).map((v) => applySeverityOverride(v, config));
      allViolations.push(...ruleViolations);
    } catch {
      // Individual rule failures don't abort the whole audit
    }
  }

  const violations = allViolations.filter((v) => v.severity === 'error');
  const warnings = allViolations.filter((v) => v.severity === 'warning' || v.severity === 'info');
  const rulesWithViolations = new Set(allViolations.map((v) => v.ruleId)).size;
  const passed = activeRules.length - rulesWithViolations;

  return {
    violations,
    warnings,
    passed,
    summary: buildComplianceSummary(violations),
  };
}
