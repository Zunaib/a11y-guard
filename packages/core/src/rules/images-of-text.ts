import type { Rule, RuleContext, Violation } from '../types.js';

export const imagesOfText: Rule = {
  id: 'images-of-text',
  wcagCriterionId: '1.4.5',
  name: 'Text should not be presented as images',
  description: 'If the same visual presentation can be achieved with text, images of text should not be used (except for logos and essential images).',
  disabilityTypes: ['visual'],

  check(context: RuleContext): Violation[] {
    const violations: Violation[] = [];
    const images = context.querySelectorAll('img');

    for (const img of images) {
      const alt = img.getAttribute('alt')?.toLowerCase() ?? '';
      const src = img.getAttribute('src')?.toLowerCase() ?? '';

      // Heuristic: image filenames or alt text suggesting text content
      const textIndicators = /\b(text|banner|header|title|headline|label|button|cta|btn)\b/.test(src);
      const longAlt = alt.split(' ').length > 5;

      if (textIndicators || longAlt) {
        violations.push({
          ruleId: 'images-of-text',
          severity: 'info',
          element: img.outerHTML?.slice(0, 120),
          message: 'Image may be conveying text content. Verify this is not a styled text image.',
          suggestion: 'Replace images of text with actual HTML text styled with CSS. Exceptions: logos and images where text presentation is essential.',
          wcagCriterion: context.getCriterion('1.4.5'),
          laws: context.getApplicableLaws('1.4.5'),
          regions: context.getApplicableRegions('1.4.5'),
          file: context.file,
        });
      }
    }

    return violations;
  },
};
