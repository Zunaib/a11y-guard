import type { Rule, RuleContext, Violation } from '../types.js';

export const listStructure: Rule = {
  id: 'list-structure',
  wcagCriterionId: '1.3.1',
  name: 'List items must be contained in list elements',
  description: '<li> elements must be direct children of <ul>, <ol>, or <menu> to maintain correct semantic structure.',
  disabilityTypes: ['visual', 'cognitive'],

  check(context: RuleContext): Violation[] {
    const violations: Violation[] = [];
    const listItems = context.querySelectorAll('li');

    for (const li of listItems) {
      const parent = li.parentElement;
      const tag = parent?.tagName?.toLowerCase();
      if (tag !== 'ul' && tag !== 'ol' && tag !== 'menu') {
        violations.push({
          ruleId: 'list-structure',
          severity: 'error',
          element: li.outerHTML?.slice(0, 120),
          message: `<li> is not a child of <ul>, <ol>, or <menu> (found inside <${tag ?? 'unknown'}>).`,
          suggestion: 'Wrap <li> elements in a <ul> or <ol> element.',
          wcagCriterion: context.getCriterion('1.3.1'),
          laws: context.getApplicableLaws('1.3.1'),
          regions: context.getApplicableRegions('1.3.1'),
          file: context.file,
        });
      }
    }

    return violations;
  },
};
