import type { Rule, RuleContext, Violation } from '../types.js';

export const htmlHasLang: Rule = {
  id: 'html-has-lang',
  wcagCriterionId: '3.1.1',
  name: 'HTML element must have a lang attribute',
  description: 'The <html> element must have a lang attribute identifying the primary language of the page.',
  disabilityTypes: ['visual', 'language'],

  check(context: RuleContext): Violation[] {
    const violations: Violation[] = [];
    const htmlEl = context.querySelector('html');

    if (!htmlEl) return violations;

    const lang = htmlEl.getAttribute('lang');
    if (!lang || lang.trim() === '') {
      violations.push({
        ruleId: 'html-has-lang',
        severity: 'error',
        element: '<html>',
        message: 'The <html> element is missing a lang attribute.',
        suggestion: 'Add lang="en" (or the appropriate BCP 47 language code) to the <html> element.',
        wcagCriterion: context.getCriterion('3.1.1'),
        laws: context.getApplicableLaws('3.1.1'),
        regions: context.getApplicableRegions('3.1.1'),
        file: context.file,
      });
    }

    return violations;
  },
};
