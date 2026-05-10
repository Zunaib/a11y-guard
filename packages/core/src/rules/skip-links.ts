import type { Rule, RuleContext, Violation } from '../types.js';

export const skipLinks: Rule = {
  id: 'skip-links',
  wcagCriterionId: '2.4.1',
  name: 'Page must provide a mechanism to skip repeated navigation',
  description: 'Pages with repeated navigation blocks must provide a skip link so keyboard users can jump directly to main content.',
  disabilityTypes: ['motor'],

  check(context: RuleContext): Violation[] {
    const violations: Violation[] = [];

    const nav = context.querySelector('nav');
    if (!nav) return violations;

    // Look for a skip link: an <a> with href starting with # appearing before main content
    const links = context.querySelectorAll('a[href^="#"]');
    const SKIP_PATTERNS = /skip|main|content|jump/i;

    const hasSkipLink = links.some((link) => {
      const text = link.textContent?.toLowerCase() ?? '';
      const href = link.getAttribute('href') ?? '';
      const ariaLabel = link.getAttribute('aria-label')?.toLowerCase() ?? '';
      return SKIP_PATTERNS.test(text) || SKIP_PATTERNS.test(href) || SKIP_PATTERNS.test(ariaLabel);
    });

    if (!hasSkipLink) {
      violations.push({
        ruleId: 'skip-links',
        severity: 'warning',
        element: '<body>',
        message: 'No skip navigation link found. Pages with navigation must provide a way to skip to main content.',
        suggestion: 'Add <a href="#main-content" class="skip-link">Skip to main content</a> as the first focusable element in <body>.',
        wcagCriterion: context.getCriterion('2.4.1'),
        laws: context.getApplicableLaws('2.4.1'),
        regions: context.getApplicableRegions('2.4.1'),
        file: context.file,
      });
    }

    return violations;
  },
};
