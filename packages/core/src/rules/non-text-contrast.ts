import type { Rule, RuleContext, Violation } from '../types.js';

export const nonTextContrast: Rule = {
  id: 'non-text-contrast',
  wcagCriterionId: '1.4.11',
  name: 'UI components must have 3:1 contrast against adjacent colors',
  description: 'The visual presentation of UI components (buttons, form inputs, focus indicators) must have a contrast ratio of at least 3:1 against adjacent colors.',
  disabilityTypes: ['visual'],

  check(context: RuleContext): Violation[] {
    const violations: Violation[] = [];

    // Look for buttons/inputs with border-color in inline style
    const controls = context.querySelectorAll('button, input, select, textarea, [role="checkbox"], [role="radio"], [role="slider"]');
    for (const el of controls) {
      const style = el.getAttribute('style') ?? '';
      // Detect border:none or border:0 which removes the component boundary
      if (/border\s*:\s*(none|0)/.test(style) || /border-color\s*:\s*transparent/.test(style)) {
        violations.push({
          ruleId: 'non-text-contrast',
          severity: 'warning',
          element: el.outerHTML?.slice(0, 120),
          message: 'UI component may have insufficient boundary contrast (border removed via inline style).',
          suggestion: 'Ensure the component boundary or state indicator meets 3:1 contrast ratio. Do not rely solely on color to distinguish interactive elements.',
          wcagCriterion: context.getCriterion('1.4.11'),
          laws: context.getApplicableLaws('1.4.11'),
          regions: context.getApplicableRegions('1.4.11'),
          file: context.file,
        });
      }
    }

    return violations;
  },
};
