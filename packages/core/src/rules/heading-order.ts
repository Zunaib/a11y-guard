import type { Rule, RuleContext, Violation } from '../types.js';

export const headingOrder: Rule = {
  id: 'heading-order',
  wcagCriterionId: '1.3.1',
  name: 'Heading levels must not be skipped',
  description: 'Heading hierarchy must not skip levels (e.g. h1 → h3 without h2), as this breaks document structure for screen reader users.',
  disabilityTypes: ['visual', 'cognitive'],

  check(context: RuleContext): Violation[] {
    const violations: Violation[] = [];
    const headings = context.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let prevLevel = 0;

    for (const heading of headings) {
      const level = parseInt(heading.tagName[1]!, 10);
      if (prevLevel > 0 && level > prevLevel + 1) {
        violations.push({
          ruleId: 'heading-order',
          severity: 'warning',
          element: heading.outerHTML?.slice(0, 120),
          message: `Heading level skipped: h${prevLevel} followed by h${level}.`,
          suggestion: `Use h${prevLevel + 1} instead of h${level} here, or restructure the document outline.`,
          wcagCriterion: context.getCriterion('1.3.1'),
          laws: context.getApplicableLaws('1.3.1'),
          regions: context.getApplicableRegions('1.3.1'),
          file: context.file,
        });
      }
      prevLevel = level;
    }

    return violations;
  },
};
