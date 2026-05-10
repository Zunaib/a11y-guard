import type { Rule, RuleContext, Violation } from '../types.js';

export const pageTitle: Rule = {
  id: 'page-title',
  wcagCriterionId: '2.4.2',
  name: 'Page must have a descriptive title',
  description: 'Web pages must have titles that describe topic or purpose, helping users orient themselves.',
  disabilityTypes: ['visual', 'cognitive'],

  check(context: RuleContext): Violation[] {
    const violations: Violation[] = [];
    const titleEl = context.querySelector('title');

    if (!titleEl) {
      violations.push({
        ruleId: 'page-title',
        severity: 'error',
        element: '<head>',
        message: 'Page is missing a <title> element.',
        suggestion: 'Add a <title> element inside <head> that describes the page topic or purpose.',
        wcagCriterion: context.getCriterion('2.4.2'),
        laws: context.getApplicableLaws('2.4.2'),
        regions: context.getApplicableRegions('2.4.2'),
        file: context.file,
      });
    } else {
      const text = titleEl.textContent?.trim() ?? '';
      if (!text) {
        violations.push({
          ruleId: 'page-title',
          severity: 'error',
          element: '<title></title>',
          message: 'Page <title> is empty.',
          suggestion: 'Provide a descriptive title that summarizes the page content.',
          wcagCriterion: context.getCriterion('2.4.2'),
          laws: context.getApplicableLaws('2.4.2'),
          regions: context.getApplicableRegions('2.4.2'),
          file: context.file,
        });
      }
    }

    return violations;
  },
};
