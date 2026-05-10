import { jsxImgAlt } from './rules/jsx-img-alt.js';
import { jsxLabelAssociation } from './rules/jsx-label-association.js';
import { jsxHtmlHasLang } from './rules/jsx-html-has-lang.js';
import { jsxInteractiveRole } from './rules/jsx-interactive-role.js';
import { jsxLinkText } from './rules/jsx-link-text.js';

const rules = {
  'jsx-img-alt': jsxImgAlt,
  'jsx-label-association': jsxLabelAssociation,
  'jsx-html-has-lang': jsxHtmlHasLang,
  'jsx-interactive-role': jsxInteractiveRole,
  'jsx-link-text': jsxLinkText,
};

const recommendedRules: Record<string, 'error' | 'warn' | 'off'> = {
  '@a11y-guard/jsx-img-alt': 'error',
  '@a11y-guard/jsx-label-association': 'error',
  '@a11y-guard/jsx-html-has-lang': 'error',
  '@a11y-guard/jsx-interactive-role': 'error',
  '@a11y-guard/jsx-link-text': 'warn',
};

const plugin = {
  meta: {
    name: '@a11y-guard/eslint-plugin',
    version: '1.0.0',
  },
  rules,
  configs: {
    recommended: {
      plugins: ['@a11y-guard'],
      rules: recommendedRules,
    },
  },
};

export default plugin;
export { rules };
