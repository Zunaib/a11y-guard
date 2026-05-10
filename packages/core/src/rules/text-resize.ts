import type { Rule, RuleContext, Violation } from '../types.js';

export const textResize: Rule = {
  id: 'text-resize',
  wcagCriterionId: '1.4.4',
  name: 'Text must be resizable up to 200% without loss of content',
  description: 'Text must be resizable up to 200% without assistive technology and without loss of content or functionality.',
  disabilityTypes: ['visual'],

  check(context: RuleContext): Violation[] {
    const violations: Violation[] = [];

    // Detect fixed pixel font sizes on body/main content containers
    const textContainers = context.querySelectorAll('body, main, article, p, div');
    for (const el of textContainers) {
      const style = el.getAttribute('style') ?? '';
      const fontSizeMatch = /font-size\s*:\s*(\d+(?:\.\d+)?)\s*(px)/.exec(style);
      if (fontSizeMatch && fontSizeMatch[2] === 'px') {
        const size = parseFloat(fontSizeMatch[1]!);
        // Fixed px font sizes resist browser zoom-based text scaling
        if (size > 0) {
          violations.push({
            ruleId: 'text-resize',
            severity: 'info',
            element: el.outerHTML?.slice(0, 120),
            message: `Font size set to ${size}px via inline style. Fixed pixel sizes may not respect user text-size preferences.`,
            suggestion: 'Use relative units (rem, em) instead of px for font sizes to honor user browser text-size settings.',
            wcagCriterion: context.getCriterion('1.4.4'),
            laws: context.getApplicableLaws('1.4.4'),
            regions: context.getApplicableRegions('1.4.4'),
            file: context.file,
          });
        }
      }
    }

    return violations;
  },
};
