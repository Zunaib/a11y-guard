import type { Rule, RuleContext, Violation } from '../types.js';

export const consistentNavigation: Rule = {
  id: 'consistent-navigation',
  wcagCriterionId: '3.2.3',
  name: 'Navigation must be consistent across pages',
  description: 'Navigational mechanisms that appear on multiple pages must occur in the same relative order each time, unless a change is initiated by the user.',
  disabilityTypes: ['cognitive'],

  check(context: RuleContext): Violation[] {
    // This rule requires multi-page analysis and is primarily a manual/runtime check.
    // For static single-file analysis, we check that nav elements have consistent landmark roles.
    const violations: Violation[] = [];
    const navElements = context.querySelectorAll('nav');
    const labeledNavs = new Set<string>();

    for (const nav of navElements) {
      const label = nav.getAttribute('aria-label') ?? nav.getAttribute('aria-labelledby');
      if (!label) {
        if (navElements.length > 1) {
          violations.push({
            ruleId: 'consistent-navigation',
            severity: 'info',
            element: nav.outerHTML?.slice(0, 120),
            message: 'Multiple <nav> elements found but this one lacks an aria-label to distinguish it.',
            suggestion: 'Add aria-label="Primary navigation" (or similar) to each <nav> element to differentiate them.',
            wcagCriterion: context.getCriterion('3.2.3'),
            laws: context.getApplicableLaws('3.2.3'),
            regions: context.getApplicableRegions('3.2.3'),
            file: context.file,
          });
        }
      } else if (labeledNavs.has(label)) {
        violations.push({
          ruleId: 'consistent-navigation',
          severity: 'warning',
          element: nav.outerHTML?.slice(0, 120),
          message: `Duplicate nav aria-label "${label}" found.`,
          suggestion: 'Each navigation landmark should have a unique aria-label.',
          wcagCriterion: context.getCriterion('3.2.3'),
          laws: context.getApplicableLaws('3.2.3'),
          regions: context.getApplicableRegions('3.2.3'),
          file: context.file,
        });
      } else if (label) {
        labeledNavs.add(label);
      }
    }

    return violations;
  },
};
