# @a11y-guard/eslint-plugin

ESLint plugin that catches accessibility violations inline in JSX/TSX as you write code. Works with ESLint 8 and ESLint 9 flat config.

## Install

```bash
npm install --save-dev @a11y-guard/eslint-plugin
# or
pnpm add -D @a11y-guard/eslint-plugin
```

## Setup

### ESLint 9 (flat config)

```js
// eslint.config.js
import a11yGuard from '@a11y-guard/eslint-plugin';

export default [
  {
    plugins: { '@a11y-guard': a11yGuard },
    rules: a11yGuard.configs.recommended.rules,
  },
];
```

### ESLint 8 (.eslintrc)

```json
{
  "plugins": ["@a11y-guard"],
  "rules": {
    "@a11y-guard/jsx-img-alt": "error",
    "@a11y-guard/jsx-label-association": "error",
    "@a11y-guard/jsx-html-has-lang": "error",
    "@a11y-guard/jsx-interactive-role": "error",
    "@a11y-guard/jsx-link-text": "warn"
  }
}
```

## Rules

| Rule | What it checks | Default |
|---|---|---|
| `jsx-img-alt` | `<img>` must have a non-empty `alt` prop | `error` |
| `jsx-label-association` | `<input>` / `<select>` / `<textarea>` must have an associated label | `error` |
| `jsx-html-has-lang` | `<html>` element must have a `lang` prop (for layout files) | `error` |
| `jsx-interactive-role` | Non-interactive elements with `onClick` must have an appropriate ARIA role | `error` |
| `jsx-link-text` | `<a>` link text must not be generic ("click here", "read more", etc.) | `warn` |

All rules target WCAG 2.1 AA criteria and are applicable under ADA, EAA, and Section 508.

## Customising rules

```js
// eslint.config.js
import a11yGuard from '@a11y-guard/eslint-plugin';

export default [
  {
    plugins: { '@a11y-guard': a11yGuard },
    rules: {
      ...a11yGuard.configs.recommended.rules,
      '@a11y-guard/jsx-link-text': 'error',   // upgrade from warn to error
      '@a11y-guard/jsx-html-has-lang': 'off',  // disable for component-only projects
    },
  },
];
```

## License

MIT — see [LICENSE](../../LICENSE) in the root of the repository.
