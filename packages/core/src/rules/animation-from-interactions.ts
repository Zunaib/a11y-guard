import type { Rule, RuleContext, Violation } from '../types.js';

export const animationFromInteractions: Rule = {
  id: 'animation-from-interactions',
  wcagCriterionId: '2.3.3',
  name: 'Motion animations must respect prefers-reduced-motion',
  description: 'Motion animations triggered by interaction should be disabled when the user has requested reduced motion.',
  disabilityTypes: ['seizure'],

  check(context: RuleContext): Violation[] {
    const violations: Violation[] = [];

    // Detect CSS transition or animation in inline styles without reduced-motion consideration
    const animated = context.querySelectorAll('[style*="transition"], [style*="animation"]');
    for (const el of animated) {
      const style = el.getAttribute('style') ?? '';
      if (/transition|animation/.test(style)) {
        violations.push({
          ruleId: 'animation-from-interactions',
          severity: 'info',
          element: el.outerHTML?.slice(0, 120),
          message: 'Element has inline animation/transition styles. Verify that prefers-reduced-motion is respected in CSS.',
          suggestion: 'Wrap animations in @media (prefers-reduced-motion: no-preference) { ... } in your stylesheet.',
          wcagCriterion: context.getCriterion('2.3.3'),
          laws: context.getApplicableLaws('2.3.3'),
          regions: context.getApplicableRegions('2.3.3'),
          file: context.file,
        });
      }
    }

    return violations;
  },
};
