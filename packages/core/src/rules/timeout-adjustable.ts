import type { Rule, RuleContext, Violation } from '../types.js';

export const timeoutAdjustable: Rule = {
  id: 'timeout-adjustable',
  wcagCriterionId: '2.2.1',
  name: 'Time limits must be adjustable or disableable',
  description: 'If a session timeout exists, users must be able to turn off, adjust, or extend it (unless the timeout is essential).',
  disabilityTypes: ['cognitive', 'motor'],

  check(context: RuleContext): Violation[] {
    const violations: Violation[] = [];

    // Detect meta refresh (common session timeout mechanism)
    const metaRefresh = context.querySelectorAll('meta[http-equiv="refresh"]');
    for (const meta of metaRefresh) {
      const content = meta.getAttribute('content') ?? '';
      const seconds = parseInt(content.split(';')[0]?.trim() ?? '', 10);
      if (!isNaN(seconds) && seconds > 0) {
        violations.push({
          ruleId: 'timeout-adjustable',
          severity: 'warning',
          element: meta.outerHTML?.slice(0, 120),
          message: `<meta http-equiv="refresh"> redirects/refreshes after ${seconds} seconds without user control.`,
          suggestion: 'Avoid meta refresh for page redirects. If a session timeout is required, warn users before it expires and allow them to extend the session.',
          wcagCriterion: context.getCriterion('2.2.1'),
          laws: context.getApplicableLaws('2.2.1'),
          regions: context.getApplicableRegions('2.2.1'),
          file: context.file,
        });
      }
    }

    return violations;
  },
};
