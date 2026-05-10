import type { Rule, RuleContext, Violation, A11yElement } from '../types.js';

function parseHexColor(hex: string): [number, number, number] | null {
  const clean = hex.replace('#', '');
  if (clean.length === 3) {
    const r = parseInt(clean[0]! + clean[0]!, 16);
    const g = parseInt(clean[1]! + clean[1]!, 16);
    const b = parseInt(clean[2]! + clean[2]!, 16);
    return [r, g, b];
  }
  if (clean.length === 6) {
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    return [r, g, b];
  }
  return null;
}

function relativeLuminance(r: number, g: number, b: number): number {
  const toLinear = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function contrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Minimal static check — parses inline style color/background-color if both are hex
function checkElementContrast(el: A11yElement): { ratio: number; fg: string; bg: string } | null {
  const style = el.getAttribute('style') ?? '';
  const colorMatch = /(?:^|;)\s*color\s*:\s*(#[0-9a-fA-F]{3,6})/.exec(style);
  const bgMatch = /(?:^|;)\s*background-color\s*:\s*(#[0-9a-fA-F]{3,6})/.exec(style);
  if (!colorMatch?.[1] || !bgMatch?.[1]) return null;
  const fg = parseHexColor(colorMatch[1]);
  const bg = parseHexColor(bgMatch[1]);
  if (!fg || !bg) return null;
  const fgL = relativeLuminance(...fg);
  const bgL = relativeLuminance(...bg);
  return { ratio: contrastRatio(fgL, bgL), fg: colorMatch[1], bg: bgMatch[1] };
}

function isLargeText(el: A11yElement): boolean {
  const style = el.getAttribute('style') ?? '';
  const sizeMatch = /font-size\s*:\s*(\d+(?:\.\d+)?)(px|pt|em|rem)/.exec(style);
  if (sizeMatch) {
    const size = parseFloat(sizeMatch[1]!);
    const unit = sizeMatch[2];
    if (unit === 'px' && size >= 18) return true;
    if (unit === 'pt' && size >= 14) return true;
  }
  const weightMatch = /font-weight\s*:\s*(bold|[7-9]\d{2})/.exec(style);
  if (weightMatch && sizeMatch) {
    const size = parseFloat(sizeMatch[1]!);
    const unit = sizeMatch[2];
    if (unit === 'px' && size >= 14) return true;
    if (unit === 'pt' && size >= 11) return true;
  }
  return false;
}

export const colorContrast: Rule = {
  id: 'color-contrast',
  wcagCriterionId: '1.4.3',
  name: 'Text must have sufficient color contrast',
  description: 'Text must have a contrast ratio of at least 4.5:1 (3:1 for large text) against its background.',
  disabilityTypes: ['visual'],

  check(context: RuleContext): Violation[] {
    const violations: Violation[] = [];
    const textElements = context.querySelectorAll('p, span, h1, h2, h3, h4, h5, h6, a, button, label, li, td, th');

    for (const el of textElements) {
      const result = checkElementContrast(el);
      if (!result) continue;

      const large = isLargeText(el);
      const minRatio = large ? 3.0 : 4.5;

      if (result.ratio < minRatio) {
        violations.push({
          ruleId: 'color-contrast',
          severity: 'error',
          element: el.outerHTML?.slice(0, 120),
          message: `Color contrast ratio is ${result.ratio.toFixed(2)}:1 (minimum ${minRatio}:1 required${large ? ' for large text' : ''}).`,
          suggestion: `Increase contrast between foreground (${result.fg}) and background (${result.bg}). Use a contrast checker to find compliant color combinations.`,
          wcagCriterion: context.getCriterion('1.4.3'),
          laws: context.getApplicableLaws('1.4.3'),
          regions: context.getApplicableRegions('1.4.3'),
          file: context.file,
        });
      }
    }

    return violations;
  },
};
