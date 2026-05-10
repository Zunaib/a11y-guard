import type { Rule, RuleContext, Violation } from '../types.js';

export const focusVisible: Rule = {
  id: 'focus-visible',
  wcagCriterionId: '2.4.7',
  name: 'Keyboard focus must be visible',
  description: 'Any keyboard-operable interface must provide a visible focus indicator so users know which element has focus.',
  disabilityTypes: ['visual', 'motor'],

  check(context: RuleContext): Violation[] {
    const violations: Violation[] = [];

    // Detect elements that suppress focus outline via inline style
    const interactive = context.querySelectorAll(
      'a, button, input, select, textarea, [tabindex], [role="button"], [role="link"]'
    );

    for (const el of interactive) {
      const style = el.getAttribute('style') ?? '';
      // Check for outline:none or outline:0 in inline styles
      if (/outline\s*:\s*(none|0)/.test(style)) {
        violations.push({
          ruleId: 'focus-visible',
          severity: 'warning',
          element: el.outerHTML?.slice(0, 120),
          message: 'Element suppresses focus outline via inline style.',
          suggestion: 'Remove outline:none. Use CSS :focus-visible to provide a custom focus indicator instead of hiding it.',
          wcagCriterion: context.getCriterion('2.4.7'),
          laws: context.getApplicableLaws('2.4.7'),
          regions: context.getApplicableRegions('2.4.7'),
          file: context.file,
        });
      }
    }

    return violations;
  },
};
