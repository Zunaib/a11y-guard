import type { Rule, RuleContext, Violation } from '../types.js';

export const duplicateId: Rule = {
  id: 'duplicate-id',
  wcagCriterionId: '4.1.1',
  name: 'Element IDs must be unique',
  description: 'Duplicate id attributes break label associations, ARIA references, and fragment navigation.',
  disabilityTypes: ['visual', 'motor'],

  check(context: RuleContext): Violation[] {
    const violations: Violation[] = [];
    const elements = context.querySelectorAll('[id]');
    const seen = new Map<string, number>();

    for (const el of elements) {
      const id = el.getAttribute('id')!;
      seen.set(id, (seen.get(id) ?? 0) + 1);
    }

    for (const el of elements) {
      const id = el.getAttribute('id')!;
      const count = seen.get(id) ?? 0;
      if (count > 1) {
        violations.push({
          ruleId: 'duplicate-id',
          severity: 'error',
          element: el.outerHTML?.slice(0, 120),
          message: `Duplicate id="${id}" found ${count} times on the page.`,
          suggestion: 'Ensure each id value is unique within a document. Use class or data attributes for shared styling/targeting.',
          wcagCriterion: context.getCriterion('4.1.1'),
          laws: context.getApplicableLaws('4.1.1'),
          regions: context.getApplicableRegions('4.1.1'),
          file: context.file,
        });
        seen.set(id, 0); // report only once per id
      }
    }

    return violations;
  },
};
