import type { Rule, RuleContext, Violation } from '../types.js';

export const labelInName: Rule = {
  id: 'label-in-name',
  wcagCriterionId: '2.5.3',
  name: 'Accessible name must contain visible label text',
  description: "The accessible name of a UI component must contain the text that is visually presented as its label, enabling voice control users to activate it by its visual name.",
  disabilityTypes: ['motor'],

  check(context: RuleContext): Violation[] {
    const violations: Violation[] = [];
    const interactive = context.querySelectorAll('button, a, [role="button"], [role="link"], input[type="submit"], input[type="button"]');

    for (const el of interactive) {
      const ariaLabel = el.getAttribute('aria-label')?.trim().toLowerCase();
      const visibleText = el.textContent?.trim().toLowerCase() ?? '';

      if (!ariaLabel || !visibleText) continue;

      if (!ariaLabel.includes(visibleText) && visibleText.length > 0) {
        violations.push({
          ruleId: 'label-in-name',
          severity: 'warning',
          element: el.outerHTML?.slice(0, 120),
          message: `aria-label "${ariaLabel}" does not contain visible text "${visibleText}".`,
          suggestion: 'The aria-label should include the visible text so voice control users can activate it by saying the visible label.',
          wcagCriterion: context.getCriterion('2.5.3'),
          laws: context.getApplicableLaws('2.5.3'),
          regions: context.getApplicableRegions('2.5.3'),
          file: context.file,
        });
      }
    }

    return violations;
  },
};
