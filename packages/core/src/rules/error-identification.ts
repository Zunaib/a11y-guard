import type { Rule, RuleContext, Violation } from '../types.js';

export const errorIdentification: Rule = {
  id: 'error-identification',
  wcagCriterionId: '3.3.1',
  name: 'Input errors must be identified in text',
  description: 'If an input error is detected, the error must be identified and described to the user in text.',
  disabilityTypes: ['visual', 'cognitive'],

  check(context: RuleContext): Violation[] {
    const violations: Violation[] = [];

    // Detect aria-invalid inputs without an associated error message
    const invalidInputs = context.querySelectorAll('[aria-invalid="true"]');
    for (const input of invalidInputs) {
      const describedBy = input.getAttribute('aria-describedby');
      if (!describedBy) {
        violations.push({
          ruleId: 'error-identification',
          severity: 'error',
          element: input.outerHTML?.slice(0, 120),
          message: 'Input is marked aria-invalid="true" but has no aria-describedby referencing an error message.',
          suggestion: 'Add aria-describedby="error-id" pointing to an element that contains the error text.',
          wcagCriterion: context.getCriterion('3.3.1'),
          laws: context.getApplicableLaws('3.3.1'),
          regions: context.getApplicableRegions('3.3.1'),
          file: context.file,
        });
      }
    }

    return violations;
  },
};
