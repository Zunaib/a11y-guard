import type { Rule } from 'eslint';
import { getApplicableLaws, getApplicableRegions } from '@a11y-guard/core';
import type { Law, Region } from '@a11y-guard/core';

interface PluginOptions {
  regions?: string[];
  laws?: string[];
}

export const jsxImgAlt: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce alt attribute on <img> elements in JSX',
      recommended: true,
      url: 'https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html',
    },
    schema: [{
      type: 'object',
      properties: {
        regions: { type: 'array', items: { type: 'string' } },
        laws:    { type: 'array', items: { type: 'string' } },
      },
      additionalProperties: false,
    }],
    messages: {
      missingAlt:
        'img element is missing alt text. ' +
        'Violates WCAG 1.1.1 (Level A). ' +
        'Required by: {{laws}} in regions: {{regions}}.',
      emptyAlt:
        'img element has empty alt without role="presentation". ' +
        'If decorative, add role="presentation". ' +
        'Violates WCAG 1.1.1 (Level A). Laws: {{laws}}.',
    },
  },

  create(context) {
    const opts = (context.options[0] ?? {}) as PluginOptions;
    const regions = (opts.regions ?? []) as Region[];
    const laws = getApplicableLaws('1.1.1', { regions }) as Law[];
    const applicableRegions = getApplicableRegions('1.1.1', { regions });

    const lawStr = laws.join(', ') || 'ADA, EAA, Section 508, AODA';
    const regionStr = applicableRegions.join(', ') || 'US, EU, CA, AU';

    return {
      JSXOpeningElement(node) {
        if (node.name.type !== 'JSXIdentifier' || node.name.name !== 'img') return;

        const altAttr = node.attributes.find(
          (attr) =>
            attr.type === 'JSXAttribute' &&
            attr.name.type === 'JSXIdentifier' &&
            attr.name.name === 'alt'
        );

        if (!altAttr) {
          context.report({
            node,
            messageId: 'missingAlt',
            data: { laws: lawStr, regions: regionStr },
          });
          return;
        }

        // Check for role="presentation" to determine if empty alt is intentional
        const roleAttr = node.attributes.find(
          (attr) =>
            attr.type === 'JSXAttribute' &&
            attr.name.type === 'JSXIdentifier' &&
            attr.name.name === 'role'
        );

        if (
          altAttr.type === 'JSXAttribute' &&
          altAttr.value?.type === 'Literal' &&
          altAttr.value.value === ''
        ) {
          const hasPresentation =
            roleAttr?.type === 'JSXAttribute' &&
            roleAttr.value?.type === 'Literal' &&
            (roleAttr.value.value === 'presentation' || roleAttr.value.value === 'none');

          if (!hasPresentation) {
            context.report({
              node: altAttr,
              messageId: 'emptyAlt',
              data: { laws: lawStr },
            });
          }
        }
      },
    };
  },
};
