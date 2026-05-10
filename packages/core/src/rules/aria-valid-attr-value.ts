import type { Rule, RuleContext, Violation } from '../types.js';

const BOOLEAN_ARIA_ATTRS = new Set(['aria-atomic', 'aria-busy', 'aria-disabled', 'aria-grabbed', 'aria-hidden', 'aria-modal', 'aria-multiline', 'aria-multiselectable', 'aria-readonly', 'aria-required']);
const TRISTATE_ATTRS = new Set(['aria-checked', 'aria-pressed', 'aria-selected', 'aria-expanded', 'aria-haspopup']);
const VALID_ARIA_CURRENT = new Set(['page', 'step', 'location', 'date', 'time', 'true', 'false']);
const VALID_ARIA_LIVE = new Set(['assertive', 'off', 'polite']);
const VALID_ARIA_ORIENTATION = new Set(['horizontal', 'vertical', 'undefined']);

export const ariaValidAttrValue: Rule = {
  id: 'aria-valid-attr-value',
  wcagCriterionId: '4.1.2',
  name: 'ARIA attribute values must be valid',
  description: 'ARIA attributes must have values that are valid for their type (boolean, token set, IDREF, etc.).',
  disabilityTypes: ['visual'],

  check(context: RuleContext): Violation[] {
    const violations: Violation[] = [];
    const elements = context.querySelectorAll('[aria-hidden], [aria-checked], [aria-expanded], [aria-current], [aria-live], [aria-orientation]');

    for (const el of elements) {
      const check = (attr: string, validValues: Set<string>) => {
        const val = el.getAttribute(attr);
        if (val !== null && !validValues.has(val.toLowerCase())) {
          violations.push({
            ruleId: 'aria-valid-attr-value',
            severity: 'error',
            element: el.outerHTML?.slice(0, 120),
            message: `"${attr}" has invalid value "${val}". Valid values are: ${[...validValues].join(', ')}.`,
            suggestion: `Change ${attr}="${val}" to one of: ${[...validValues].join(', ')}.`,
            wcagCriterion: context.getCriterion('4.1.2'),
            laws: context.getApplicableLaws('4.1.2'),
            regions: context.getApplicableRegions('4.1.2'),
            file: context.file,
          });
        }
      };

      check('aria-hidden', new Set(['true', 'false']));
      check('aria-expanded', new Set(['true', 'false', 'undefined']));
      check('aria-checked', new Set(['true', 'false', 'mixed', 'undefined']));
      check('aria-current', VALID_ARIA_CURRENT);
      check('aria-live', VALID_ARIA_LIVE);
      check('aria-orientation', VALID_ARIA_ORIENTATION);
    }

    return violations;
  },
};
