import type { Rule, RuleContext, Violation } from '../types.js';

export const pointerGestures: Rule = {
  id: 'pointer-gestures',
  wcagCriterionId: '2.5.1',
  name: 'Multi-point gestures must have single-pointer alternatives',
  description: 'All functionality that requires multi-point or path-based gestures must be operable with a single pointer.',
  disabilityTypes: ['motor'],

  check(context: RuleContext): Violation[] {
    const violations: Violation[] = [];

    // Detect touch gesture event handlers without single-pointer alternatives
    const gestureHandlers = context.querySelectorAll('[ontouchstart], [ontouchmove], [ongesturestart]');
    for (const el of gestureHandlers) {
      const hasClick = el.hasAttribute('onclick') || el.hasAttribute('onpointerdown');
      if (!hasClick) {
        violations.push({
          ruleId: 'pointer-gestures',
          severity: 'warning',
          element: el.outerHTML?.slice(0, 120),
          message: 'Element uses touch/gesture events without a single-pointer alternative.',
          suggestion: 'Ensure all gesture-based functionality can also be performed with a single click or tap.',
          wcagCriterion: context.getCriterion('2.5.1'),
          laws: context.getApplicableLaws('2.5.1'),
          regions: context.getApplicableRegions('2.5.1'),
          file: context.file,
        });
      }
    }

    return violations;
  },
};
