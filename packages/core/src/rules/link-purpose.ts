import type { Rule, RuleContext, Violation } from '../types.js';

const AMBIGUOUS_TEXTS = new Set([
  'click here', 'click', 'here', 'read more', 'more', 'link', 'this link',
  'learn more', 'details', 'info', 'information', 'see more', 'view',
  'go', 'continue', 'next', 'start', 'get started',
]);

export const linkPurpose: Rule = {
  id: 'link-purpose',
  wcagCriterionId: '2.4.4',
  name: 'Link text must describe the destination or purpose',
  description: 'Link text (including aria-label) must be meaningful out of context to help users navigate without reading surrounding content.',
  disabilityTypes: ['visual', 'cognitive'],

  check(context: RuleContext): Violation[] {
    const violations: Violation[] = [];
    const links = context.querySelectorAll('a[href]');

    for (const link of links) {
      const ariaLabel = link.getAttribute('aria-label')?.trim();
      const ariaLabelledBy = link.getAttribute('aria-labelledby')?.trim();
      const text = (ariaLabel ?? link.textContent?.trim() ?? '').toLowerCase();

      if (ariaLabelledBy) continue;
      if (!text) {
        violations.push({
          ruleId: 'link-purpose',
          severity: 'error',
          element: link.outerHTML?.slice(0, 120),
          message: 'Link has no accessible text.',
          suggestion: 'Add descriptive text content or an aria-label attribute to the link.',
          wcagCriterion: context.getCriterion('2.4.4'),
          laws: context.getApplicableLaws('2.4.4'),
          regions: context.getApplicableRegions('2.4.4'),
          file: context.file,
        });
      } else if (AMBIGUOUS_TEXTS.has(text)) {
        violations.push({
          ruleId: 'link-purpose',
          severity: 'warning',
          element: link.outerHTML?.slice(0, 120),
          message: `Link text "${text}" is ambiguous and does not describe the destination.`,
          suggestion: 'Use descriptive link text like "Read the annual report" instead of "Read more".',
          wcagCriterion: context.getCriterion('2.4.4'),
          laws: context.getApplicableLaws('2.4.4'),
          regions: context.getApplicableRegions('2.4.4'),
          file: context.file,
        });
      }
    }

    return violations;
  },
};
