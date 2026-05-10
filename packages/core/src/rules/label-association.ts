import type { Rule, RuleContext, Violation } from '../types.js';

export const labelAssociation: Rule = {
  id: 'label-association',
  wcagCriterionId: '1.3.1',
  name: 'Form inputs must have associated labels',
  description: 'All form inputs must be programmatically associated with a label via htmlFor/id pairing, aria-label, or aria-labelledby.',
  disabilityTypes: ['visual', 'cognitive'],

  check(context: RuleContext): Violation[] {
    const violations: Violation[] = [];
    const inputs = context.querySelectorAll('input, select, textarea');

    for (const input of inputs) {
      const type = input.getAttribute('type')?.toLowerCase();
      if (type === 'hidden' || type === 'submit' || type === 'reset' || type === 'button' || type === 'image') continue;

      const id = input.getAttribute('id');
      const ariaLabel = input.getAttribute('aria-label');
      const ariaLabelledBy = input.getAttribute('aria-labelledby');

      if (ariaLabel?.trim() || ariaLabelledBy?.trim()) continue;

      if (id) {
        const label = context.querySelector(`label[for="${id}"]`);
        if (label) continue;
      }

      violations.push({
        ruleId: 'label-association',
        severity: 'error',
        element: input.outerHTML?.slice(0, 120),
        message: `<${input.tagName.toLowerCase()}> has no associated label.`,
        suggestion: 'Add <label htmlFor="input-id"> or use aria-label="..." or aria-labelledby="...".',
        wcagCriterion: context.getCriterion('1.3.1'),
        laws: context.getApplicableLaws('1.3.1'),
        regions: context.getApplicableRegions('1.3.1'),
        file: context.file,
      });
    }

    return violations;
  },
};
