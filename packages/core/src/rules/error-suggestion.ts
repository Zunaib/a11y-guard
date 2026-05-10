import type { Rule, RuleContext, Violation } from '../types.js';

export const errorSuggestion: Rule = {
  id: 'error-suggestion',
  wcagCriterionId: '3.3.3',
  name: 'Form validation errors must provide suggestions for correction',
  description: 'When a form error is identified and suggestions for correction are known, the suggestions must be provided to the user.',
  disabilityTypes: ['cognitive'],

  check(context: RuleContext): Violation[] {
    const violations: Violation[] = [];

    const invalidInputs = context.querySelectorAll('[aria-invalid="true"]');
    for (const input of invalidInputs) {
      const describedBy = input.getAttribute('aria-describedby');
      if (describedBy) {
        const errorEl = context.querySelector(`#${describedBy}`);
        const errorText = errorEl?.textContent?.trim() ?? '';
        // Simple heuristic: error text should be meaningful
        if (errorEl && errorText.length < 10) {
          violations.push({
            ruleId: 'error-suggestion',
            severity: 'warning',
            element: input.outerHTML?.slice(0, 120),
            message: `Error message "${errorText}" may be too brief to provide useful guidance.`,
            suggestion: 'Provide specific error messages that explain what went wrong and how to fix it (e.g. "Email must include @ symbol").',
            wcagCriterion: context.getCriterion('3.3.3'),
            laws: context.getApplicableLaws('3.3.3'),
            regions: context.getApplicableRegions('3.3.3'),
            file: context.file,
          });
        }
      }
    }

    return violations;
  },
};
