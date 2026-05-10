import type { Rule, RuleContext, Violation } from '../types.js';

const LANG_INDICATORS = /[؀-ۿऀ-ॿ一-鿿぀-ゟ゠-ヿ]/;

export const languageParts: Rule = {
  id: 'language-parts',
  wcagCriterionId: '3.1.2',
  name: 'Language changes in content must be identified',
  description: 'Passages in a language different from the page language must have a lang attribute so screen readers use the correct pronunciation.',
  disabilityTypes: ['visual', 'language'],

  check(context: RuleContext): Violation[] {
    const violations: Violation[] = [];
    const htmlEl = context.querySelector('html');
    const pageLang = htmlEl?.getAttribute('lang')?.split('-')[0]?.toLowerCase();

    if (!pageLang) return violations;

    const elements = context.querySelectorAll('[lang]');
    for (const el of elements) {
      if (el.tagName.toLowerCase() === 'html') continue;
      const lang = el.getAttribute('lang');
      if (!lang || lang.trim() === '') {
        violations.push({
          ruleId: 'language-parts',
          severity: 'warning',
          element: el.outerHTML?.slice(0, 120),
          message: 'Element has an empty lang attribute.',
          suggestion: 'Provide a valid BCP 47 language code (e.g. lang="fr" for French).',
          wcagCriterion: context.getCriterion('3.1.2'),
          laws: context.getApplicableLaws('3.1.2'),
          regions: context.getApplicableRegions('3.1.2'),
          file: context.file,
        });
      }
    }

    return violations;
  },
};
