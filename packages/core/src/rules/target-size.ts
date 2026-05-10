import type { Rule, RuleContext, Violation } from '../types.js';

const MIN_SIZE_PX = 24;

function parsePx(value: string | null): number | null {
  if (!value) return null;
  const match = /^(\d+(?:\.\d+)?)\s*px$/.exec(value.trim());
  return match ? parseFloat(match[1]!) : null;
}

export const targetSize: Rule = {
  id: 'target-size',
  wcagCriterionId: '2.5.8',
  name: 'Touch targets must be at least 24×24 CSS pixels',
  description: 'Interactive targets should be at least 24×24 pixels in size to be reliably operable by users with motor impairments.',
  disabilityTypes: ['motor'],

  check(context: RuleContext): Violation[] {
    const violations: Violation[] = [];
    const interactive = context.querySelectorAll('button, a, input, [role="button"], [role="link"]');

    for (const el of interactive) {
      const style = el.getAttribute('style') ?? '';
      const widthMatch = /(?:^|;)\s*width\s*:\s*([^;]+)/.exec(style);
      const heightMatch = /(?:^|;)\s*height\s*:\s*([^;]+)/.exec(style);

      const w = parsePx(widthMatch?.[1] ?? null);
      const h = parsePx(heightMatch?.[1] ?? null);

      if (w !== null && w < MIN_SIZE_PX) {
        violations.push({
          ruleId: 'target-size',
          severity: 'warning',
          element: el.outerHTML?.slice(0, 120),
          message: `Touch target width is ${w}px, below the ${MIN_SIZE_PX}px minimum.`,
          suggestion: `Increase the element width to at least ${MIN_SIZE_PX}px, or increase padding to enlarge the touch area.`,
          wcagCriterion: context.getCriterion('2.5.8'),
          laws: context.getApplicableLaws('2.5.8'),
          regions: context.getApplicableRegions('2.5.8'),
          file: context.file,
        });
      }
      if (h !== null && h < MIN_SIZE_PX) {
        violations.push({
          ruleId: 'target-size',
          severity: 'warning',
          element: el.outerHTML?.slice(0, 120),
          message: `Touch target height is ${h}px, below the ${MIN_SIZE_PX}px minimum.`,
          suggestion: `Increase the element height to at least ${MIN_SIZE_PX}px, or increase padding to enlarge the touch area.`,
          wcagCriterion: context.getCriterion('2.5.8'),
          laws: context.getApplicableLaws('2.5.8'),
          regions: context.getApplicableRegions('2.5.8'),
          file: context.file,
        });
      }
    }

    return violations;
  },
};
