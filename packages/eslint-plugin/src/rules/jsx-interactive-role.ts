import type { Rule } from 'eslint';

const NON_INTERACTIVE_TAGS = new Set(['div', 'span', 'p', 'section', 'article', 'header', 'footer', 'main', 'li', 'ul', 'ol']);
const INTERACTIVE_ROLES = new Set(['button', 'link', 'menuitem', 'tab', 'checkbox', 'radio', 'switch', 'option']);

export const jsxInteractiveRole: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce keyboard accessibility for interactive elements',
      recommended: true,
      url: 'https://www.w3.org/WAI/WCAG21/Understanding/keyboard.html',
    },
    schema: [],
    messages: {
      noKeyboard:
        'Non-interactive element <{{tag}}> with onClick must have a keyboard handler (onKeyDown/onKeyUp) and tabIndex. ' +
        'Violates WCAG 2.1.1 (Level A). Use <button> instead.',
      noTabIndex:
        '<{{tag}}> with role="{{role}}" must have tabIndex to be keyboard accessible. ' +
        'Violates WCAG 2.1.1 (Level A).',
    },
  },

  create(context) {
    function hasAttr(node: Rule.NodeTypes['JSXOpeningElement'], name: string): boolean {
      return node.attributes.some(
        (a) => a.type === 'JSXAttribute' && a.name.type === 'JSXIdentifier' && a.name.name === name
      );
    }

    function getAttrStringValue(node: Rule.NodeTypes['JSXOpeningElement'], name: string): string | null {
      const attr = node.attributes.find(
        (a) => a.type === 'JSXAttribute' && a.name.type === 'JSXIdentifier' && a.name.name === name
      );
      if (!attr || attr.type !== 'JSXAttribute') return null;
      if (attr.value?.type === 'Literal') return String(attr.value.value);
      return null;
    }

    return {
      JSXOpeningElement(node) {
        const elName = node.name.type === 'JSXIdentifier' ? node.name.name : null;
        if (!elName) return;

        const hasOnClick = hasAttr(node, 'onClick');
        const hasKeyHandler = hasAttr(node, 'onKeyDown') || hasAttr(node, 'onKeyUp') || hasAttr(node, 'onKeyPress');
        const hasTabIndex = hasAttr(node, 'tabIndex') || hasAttr(node, 'tabindex');
        const role = getAttrStringValue(node, 'role')?.toLowerCase();

        // Non-interactive tags with click handlers need keyboard support
        if (hasOnClick && NON_INTERACTIVE_TAGS.has(elName)) {
          if (!hasKeyHandler || !hasTabIndex) {
            context.report({
              node,
              messageId: 'noKeyboard',
              data: { tag: elName },
            });
          }
        }

        // Elements with interactive ARIA roles need tabIndex
        if (role && INTERACTIVE_ROLES.has(role) && !hasTabIndex && NON_INTERACTIVE_TAGS.has(elName)) {
          context.report({
            node,
            messageId: 'noTabIndex',
            data: { tag: elName, role },
          });
        }
      },
    };
  },
};
