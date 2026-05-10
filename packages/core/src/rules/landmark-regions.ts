import type { Rule, RuleContext, Violation } from '../types.js';

export const landmarkRegions: Rule = {
  id: 'landmark-regions',
  wcagCriterionId: '1.3.1',
  name: 'Page should use ARIA landmark regions',
  description: 'Pages should use semantic landmarks (<main>, <nav>, <header>, <footer>) so screen reader users can navigate by region.',
  disabilityTypes: ['visual', 'motor'],

  check(context: RuleContext): Violation[] {
    const violations: Violation[] = [];

    const hasMain = context.querySelector('main, [role="main"]');
    if (!hasMain) {
      violations.push({
        ruleId: 'landmark-regions',
        severity: 'warning',
        element: '<body>',
        message: 'Page has no <main> landmark region.',
        suggestion: 'Wrap primary content in a <main> element so screen reader users can navigate directly to it.',
        wcagCriterion: context.getCriterion('1.3.1'),
        laws: context.getApplicableLaws('1.3.1'),
        regions: context.getApplicableRegions('1.3.1'),
        file: context.file,
      });
    }

    return violations;
  },
};
