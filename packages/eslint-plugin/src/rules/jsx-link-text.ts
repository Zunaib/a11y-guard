import type { Rule } from 'eslint';
import type { JSXElement, JSXText, Literal } from 'estree-jsx';

const AMBIGUOUS_TEXTS = new Set([
  'click here', 'click', 'here', 'read more', 'more', 'link',
  'this link', 'learn more', 'details', 'info', 'information',
  'see more', 'view', 'go', 'continue', 'next',
]);

function getJsxElementText(node: JSXElement): string {
  const texts: string[] = [];
  for (const child of node.children) {
    if (child.type === 'JSXText') {
      texts.push((child as JSXText).value.trim());
    } else if (child.type === 'JSXExpressionContainer') {
      const expr = (child as { expression: { type: string; value?: unknown } }).expression;
      if (expr?.type === 'Literal') texts.push(String(expr.value ?? ''));
    }
  }
  return texts.join(' ').trim().toLowerCase();
}

export const jsxLinkText: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce descriptive link text in JSX',
      recommended: true,
      url: 'https://www.w3.org/WAI/WCAG21/Understanding/link-purpose-in-context.html',
    },
    schema: [],
    messages: {
      noText:
        '<a> element has no accessible text. ' +
        'Violates WCAG 2.4.4 (Level A). Add text content or aria-label.',
      ambiguousText:
        '<a> element has ambiguous text "{{text}}". ' +
        'Violates WCAG 2.4.4 (Level A). Use descriptive link text instead of "{{text}}".',
    },
  },

  create(context) {
    function hasAriaAttr(node: Rule.NodeTypes['JSXOpeningElement']): boolean {
      return node.attributes.some(
        (a) =>
          a.type === 'JSXAttribute' &&
          a.name.type === 'JSXIdentifier' &&
          (a.name.name === 'aria-label' || a.name.name === 'aria-labelledby')
      );
    }

    return {
      JSXElement(node) {
        const opening = (node as unknown as JSXElement).openingElement;
        if (opening.name.type !== 'JSXIdentifier' || opening.name.name !== 'a') return;
        if (hasAriaAttr(opening as unknown as Rule.NodeTypes['JSXOpeningElement'])) return;

        const text = getJsxElementText(node as unknown as JSXElement);

        if (!text) {
          context.report({ node: opening as unknown as Rule.Node, messageId: 'noText' });
        } else if (AMBIGUOUS_TEXTS.has(text)) {
          context.report({
            node: opening as unknown as Rule.Node,
            messageId: 'ambiguousText',
            data: { text },
          });
        }
      },
    };
  },
};
