import type { Rule } from 'eslint';
import { getApplicableLaws } from '@a11y-guard/core';
import type { Region } from '@a11y-guard/core';

const SKIPPED_INPUT_TYPES = new Set(['hidden', 'submit', 'reset', 'button', 'image']);

function getJsxAttrValue(node: { type: string; value?: unknown; expression?: { type: string; value?: unknown } | null }, attrName: string): string | null {
  return null; // simplified — resolved in create()
}

export const jsxLabelAssociation: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce that form inputs have associated labels',
      recommended: true,
      url: 'https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships.html',
    },
    schema: [{
      type: 'object',
      properties: {
        regions: { type: 'array', items: { type: 'string' } },
      },
      additionalProperties: false,
    }],
    messages: {
      missingLabel:
        '<{{element}}> is missing an associated label. ' +
        'Violates WCAG 1.3.1 (Level A). ' +
        'Add htmlFor + id pairing, aria-label, or aria-labelledby. ' +
        'Required by: {{laws}}.',
    },
  },

  create(context) {
    const opts = (context.options[0] ?? {}) as { regions?: string[] };
    const regions = (opts.regions ?? []) as Region[];
    const laws = getApplicableLaws('1.3.1', { regions });
    const lawStr = laws.join(', ') || 'ADA, EAA, Section 508, AODA';

    function getAttrValue(node: Rule.NodeTypes['JSXOpeningElement'], name: string): string | null {
      const attr = node.attributes.find(
        (a) => a.type === 'JSXAttribute' && a.name.type === 'JSXIdentifier' && a.name.name === name
      );
      if (!attr || attr.type !== 'JSXAttribute') return null;
      if (attr.value?.type === 'Literal') return String(attr.value.value);
      if (attr.value?.type === 'JSXExpressionContainer') {
        const expr = (attr.value as { expression?: { type: string; value?: unknown } }).expression;
        if (expr?.type === 'Literal') return String(expr.value);
        if (expr?.type !== 'JSXEmptyExpression') return '__dynamic__';
      }
      return null;
    }

    return {
      JSXOpeningElement(node) {
        const elName = node.name.type === 'JSXIdentifier' ? node.name.name : null;
        if (!elName || !['input', 'select', 'textarea'].includes(elName)) return;

        const type = getAttrValue(node, 'type')?.toLowerCase();
        if (type && SKIPPED_INPUT_TYPES.has(type)) return;

        const ariaLabel = getAttrValue(node, 'aria-label');
        const ariaLabelledBy = getAttrValue(node, 'aria-labelledby');
        const id = getAttrValue(node, 'id');

        if (ariaLabel || ariaLabelledBy) return;

        // With dynamic id we can't verify statically; skip
        if (id === '__dynamic__') return;

        context.report({
          node,
          messageId: 'missingLabel',
          data: { element: elName, laws: lawStr },
        });
      },
    };
  },
};
