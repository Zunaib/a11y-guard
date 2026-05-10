import type { Rule, RuleContext, Violation } from '../types.js';

const VALID_ARIA_ATTRS = new Set([
  'aria-activedescendant', 'aria-atomic', 'aria-autocomplete', 'aria-busy',
  'aria-checked', 'aria-colcount', 'aria-colindex', 'aria-colspan', 'aria-controls',
  'aria-current', 'aria-describedby', 'aria-description', 'aria-details',
  'aria-disabled', 'aria-dropeffect', 'aria-errormessage', 'aria-expanded',
  'aria-flowto', 'aria-grabbed', 'aria-haspopup', 'aria-hidden', 'aria-invalid',
  'aria-keyshortcuts', 'aria-label', 'aria-labelledby', 'aria-level', 'aria-live',
  'aria-modal', 'aria-multiline', 'aria-multiselectable', 'aria-orientation',
  'aria-owns', 'aria-placeholder', 'aria-posinset', 'aria-pressed', 'aria-readonly',
  'aria-relevant', 'aria-required', 'aria-roledescription', 'aria-rowcount',
  'aria-rowindex', 'aria-rowspan', 'aria-selected', 'aria-setsize', 'aria-sort',
  'aria-valuemax', 'aria-valuemin', 'aria-valuenow', 'aria-valuetext',
]);

export const ariaValidAttr: Rule = {
  id: 'aria-valid-attr',
  wcagCriterionId: '4.1.2',
  name: 'ARIA attributes must be valid',
  description: 'Only valid ARIA attributes should be used. Typos or invented attributes are ignored by assistive technology.',
  disabilityTypes: ['visual'],

  check(context: RuleContext): Violation[] {
    const violations: Violation[] = [];
    const elements = context.querySelectorAll('*');

    for (const el of elements) {
      for (const attr of Array.from(el.attributes ?? [])) {
        if (attr.name.startsWith('aria-') && !VALID_ARIA_ATTRS.has(attr.name)) {
          violations.push({
            ruleId: 'aria-valid-attr',
            severity: 'error',
            element: el.outerHTML?.slice(0, 120),
            message: `"${attr.name}" is not a valid ARIA attribute.`,
            suggestion: `Check for a typo. Valid ARIA attributes start with "aria-" followed by a recognized name.`,
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
