import type { Rule } from 'eslint';
import { getApplicableLaws } from '@a11y-guard/core';

export const jsxHtmlHasLang: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce lang attribute on <html> element',
      recommended: true,
      url: 'https://www.w3.org/WAI/WCAG21/Understanding/language-of-page.html',
    },
    schema: [],
    messages: {
      missingLang:
        '<html> element is missing lang attribute. ' +
        'Violates WCAG 3.1.1 (Level A). ' +
        'Required by: {{laws}}.',
      emptyLang:
        '<html> lang attribute is empty. ' +
        'Provide a valid BCP 47 language code (e.g. lang="en"). ' +
        'Required by: {{laws}}.',
    },
  },

  create(context) {
    const laws = getApplicableLaws('3.1.1', {});
    const lawStr = laws.join(', ') || 'ADA, EAA, Section 508, AODA';

    return {
      JSXOpeningElement(node) {
        if (node.name.type !== 'JSXIdentifier' || node.name.name !== 'html') return;

        const langAttr = node.attributes.find(
          (attr) =>
            attr.type === 'JSXAttribute' &&
            attr.name.type === 'JSXIdentifier' &&
            attr.name.name === 'lang'
        );

        if (!langAttr) {
          context.report({ node, messageId: 'missingLang', data: { laws: lawStr } });
          return;
        }

        if (
          langAttr.type === 'JSXAttribute' &&
          langAttr.value?.type === 'Literal' &&
          !String(langAttr.value.value).trim()
        ) {
          context.report({ node: langAttr, messageId: 'emptyLang', data: { laws: lawStr } });
        }
      },
    };
  },
};
