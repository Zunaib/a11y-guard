import type { Rule, RuleContext, Violation, A11yElement } from '../types.js';

export const focusOrder: Rule = {
  id: 'focus-order',
  wcagCriterionId: '2.4.3',
  name: 'Focus order must be logical and meaningful',
  description: 'If a page can be navigated sequentially, the focus order must preserve meaning and operability.',
  disabilityTypes: ['motor', 'visual'],

  check(context: RuleContext): Violation[] {
    const violations: Violation[] = [];

    // Detect elements with tabindex > 0 which can create confusing tab order
    const elements = context.querySelectorAll('[tabindex]');
    const positiveTabindex: Array<{ el: A11yElement; val: number }> = [];

    for (const el of elements) {
      const val = parseInt(el.getAttribute('tabindex') ?? '0', 10);
      if (val > 0) {
        positiveTabindex.push({ el, val });
      }
    }

    if (positiveTabindex.length > 1) {
      for (const { el, val } of positiveTabindex) {
        violations.push({
          ruleId: 'focus-order',
          severity: 'warning',
          element: el.outerHTML?.slice(0, 120),
          message: `tabindex="${val}" may create a focus order that doesn't match the visual layout.`,
          suggestion: 'Remove positive tabindex values and reorder elements in the DOM to match the intended focus sequence. Use tabindex="0" to include elements in natural order.',
          wcagCriterion: context.getCriterion('2.4.3'),
          laws: context.getApplicableLaws('2.4.3'),
          regions: context.getApplicableRegions('2.4.3'),
          file: context.file,
        });
      }
    }

    return violations;
  },
};
