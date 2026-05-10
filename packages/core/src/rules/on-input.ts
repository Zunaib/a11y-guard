import type { Rule, RuleContext, Violation } from '../types.js';

export const onInput: Rule = {
  id: 'on-input',
  wcagCriterionId: '3.2.2',
  name: 'No unexpected context change on input',
  description: 'Changing the setting of a UI component must not automatically cause a context change unless the user is advised beforehand.',
  disabilityTypes: ['cognitive', 'visual'],

  check(context: RuleContext): Violation[] {
    const violations: Violation[] = [];

    // Detect <select> with onchange that likely causes page navigation
    const selects = context.querySelectorAll('select[onchange]');
    for (const select of selects) {
      const onchange = select.getAttribute('onchange') ?? '';
      if (/location|window\.|navigate|href/.test(onchange)) {
        violations.push({
          ruleId: 'on-input',
          severity: 'warning',
          element: select.outerHTML?.slice(0, 120),
          message: '<select> with onchange may cause unexpected page navigation.',
          suggestion: 'Require an explicit submit action instead of triggering navigation on change. Add a "Go" button.',
          wcagCriterion: context.getCriterion('3.2.2'),
          laws: context.getApplicableLaws('3.2.2'),
          regions: context.getApplicableRegions('3.2.2'),
          file: context.file,
        });
      }
    }

    return violations;
  },
};
