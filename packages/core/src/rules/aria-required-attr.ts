import type { Rule, RuleContext, Violation } from '../types.js';

const ROLE_REQUIRED_ATTRS: Record<string, string[]> = {
  checkbox:         ['aria-checked'],
  combobox:         ['aria-expanded'],
  listbox:          [],
  option:           ['aria-selected'],
  progressbar:      ['aria-valuenow', 'aria-valuemin', 'aria-valuemax'],
  radio:            ['aria-checked'],
  scrollbar:        ['aria-valuenow', 'aria-valuemin', 'aria-valuemax', 'aria-controls'],
  slider:           ['aria-valuenow', 'aria-valuemin', 'aria-valuemax'],
  spinbutton:       ['aria-valuenow'],
  switch:           ['aria-checked'],
  tab:              [],
  treeitem:         [],
  menuitemcheckbox: ['aria-checked'],
  menuitemradio:    ['aria-checked'],
};

export const ariaRequiredAttr: Rule = {
  id: 'aria-required-attr',
  wcagCriterionId: '4.1.2',
  name: 'ARIA roles must have required attributes',
  description: 'Elements with ARIA roles must include all required ARIA attributes for that role.',
  disabilityTypes: ['visual'],

  check(context: RuleContext): Violation[] {
    const violations: Violation[] = [];
    const elements = context.querySelectorAll('[role]');

    for (const el of elements) {
      const role = el.getAttribute('role')?.toLowerCase() ?? '';
      const required = ROLE_REQUIRED_ATTRS[role];
      if (!required) continue;

      for (const attr of required) {
        if (!el.hasAttribute(attr)) {
          violations.push({
            ruleId: 'aria-required-attr',
            severity: 'error',
            element: el.outerHTML?.slice(0, 120),
            message: `Element with role="${role}" is missing required attribute: ${attr}.`,
            suggestion: `Add ${attr}="..." to the element with role="${role}".`,
            wcagCriterion: context.getCriterion('4.1.2'),
            laws: context.getApplicableLaws('4.1.2'),
            regions: context.getApplicableRegions('4.1.2'),
            file: context.file,
          });
        }
      }
    }

    return violations;
  },
};
