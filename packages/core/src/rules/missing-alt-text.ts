import type { Rule, RuleContext, Violation } from '../types.js';

export const missingAltText: Rule = {
  id: 'missing-alt-text',
  wcagCriterionId: '1.1.1',
  name: 'Images must have alternative text',
  description:
    'All non-decorative images must have an alt attribute that describes the content ' +
    'or function of the image for screen reader users.',
  disabilityTypes: ['visual'],

  check(context: RuleContext): Violation[] {
    const violations: Violation[] = [];
    const images = context.querySelectorAll('img');

    for (const img of images) {
      const alt = img.getAttribute('alt');
      const role = img.getAttribute('role');
      const ariaHidden = img.getAttribute('aria-hidden');

      if (role === 'presentation' || ariaHidden === 'true') continue;

      if (alt === null) {
        violations.push({
          ruleId: 'missing-alt-text',
          severity: 'error',
          element: img.outerHTML?.slice(0, 120),
          message: 'Image is missing an alt attribute.',
          suggestion: 'Add alt="descriptive text" for informative images, or alt="" for decorative images.',
          wcagCriterion: context.getCriterion('1.1.1'),
          laws: context.getApplicableLaws('1.1.1'),
          regions: context.getApplicableRegions('1.1.1'),
          file: context.file,
        });
      } else if (alt.trim() === '' && role !== 'presentation') {
        violations.push({
          ruleId: 'missing-alt-text',
          severity: 'warning',
          element: img.outerHTML?.slice(0, 120),
          message: 'Image has an empty alt attribute but is not marked as decorative.',
          suggestion: 'If decorative, also set role="presentation". If informative, provide descriptive alt text.',
          wcagCriterion: context.getCriterion('1.1.1'),
          laws: context.getApplicableLaws('1.1.1'),
          regions: context.getApplicableRegions('1.1.1'),
          file: context.file,
        });
      }
    }

    return violations;
  },
};
