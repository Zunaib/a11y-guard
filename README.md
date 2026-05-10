# a11y-guard

> **Region-aware accessibility compliance linter for frontend developers.**
> Know exactly which law you're breaking, in which country, and how to fix it.

[![npm version](https://img.shields.io/npm/v/a11y-guard)](https://www.npmjs.com/package/a11y-guard)
[![license](https://img.shields.io/npm/l/a11y-guard)](LICENSE)
[![WCAG 2.1 AA](https://img.shields.io/badge/WCAG-2.1%20AA-blue)](https://www.w3.org/WAI/WCAG21/Understanding/)

---

## Why a11y-guard?

96.3% of the top one million websites fail basic WCAG 2 compliance. Existing tools like axe-core and Lighthouse tell you *what* is broken — but not *which law* you're violating or *which region* that law applies to.

**a11y-guard** maps every violation to the exact law (ADA, EAA, Section 508, AODA, DDA…) and the regions that law covers — so your legal and engineering teams speak the same language.

| Feature | a11y-guard | axe-core | Lighthouse | eslint-plugin-jsx-a11y |
|---|:---:|:---:|:---:|:---:|
| Region-aware (US vs EU vs CA) | ✅ | ❌ | ❌ | ❌ |
| Law-specific output (ADA, EAA…) | ✅ | ❌ | ❌ | ❌ |
| Disability-type filtering | ✅ | ❌ | ❌ | ❌ |
| HTML report output | ✅ | ❌ | ✅ | ❌ |
| Static JSX/TSX analysis | ✅ | ❌ | ❌ | ✅ |
| Vite / Webpack plugin | ✅ | ❌ | ❌ | ❌ |
| SARIF output (GitHub Advanced Security) | ✅ | ❌ | ❌ | ❌ |
| WCAG 2.0 / 2.1 / 2.2 selection | ✅ | Partial | 2.1 only | ❌ |

---

## Installation

```bash
npm install --save-dev a11y-guard @a11y-guard/cli
# or
pnpm add --save-dev a11y-guard @a11y-guard/cli
```

---

## Quick Start

```bash
# Initialize config + inject scripts into package.json
npx a11y-guard init

# Scan for US and EU compliance
npx a11y-guard scan --region US EU

# Generate an HTML report
npx a11y-guard scan --region US EU --reporter html --output a11y-report.html

# CI mode — exits with code 1 on errors
npx a11y-guard scan --region US EU --reporter github-actions --fail-on error
```

---

## Configuration

```typescript
// a11y-guard.config.ts
import { defineConfig } from 'a11y-guard';

export default defineConfig({
  // Target by region, law, or disability type — mix and match
  regions: ['US', 'EU', 'CA'],
  // laws: ['ADA', 'Section508', 'EAA', 'AODA'],
  // disabilityTypes: ['visual', 'motor', 'cognitive'],

  level: 'AA',         // 'A' | 'AA' | 'AAA'
  failOn: 'error',     // 'error' | 'warning' | 'any'

  include: ['src/**/*.html', 'public/**/*.html'],
  exclude: ['node_modules/**'],

  reporter: 'pretty',  // 'pretty' | 'json' | 'sarif' | 'github-actions' | 'html'

  rules: {
    'missing-alt-text': 'error',
    'color-contrast':   'error',
    'focus-visible':    'warning',
  },
});
```

---

## CLI Reference

```bash
# Scan files
a11y-guard scan [patterns...] [options]

Options:
  -r, --region <regions...>         Target regions (US, EU, UK, CA, AU, NZ, JP…)
  -l, --law <laws...>               Target laws (ADA, EAA, Section508, AODA, DDA…)
  -d, --disability-type <types...>  Target disability types (visual, motor, cognitive…)
  --level <level>                   WCAG level: A | AA | AAA  (default: AA)
  --reporter <format>               pretty | json | sarif | github-actions | html
  -o, --output <file>               Write output to file (auto-set for --reporter html)
  --fail-on <severity>              error | warning | any  (default: error)

# Show global compliance matrix
a11y-guard matrix [--region US EU CA]

# Initialize config and inject package.json scripts
a11y-guard init [--no-scripts]
```

---

## package.json Scripts

Running `a11y-guard init` automatically adds these to your `package.json`:

```json
{
  "scripts": {
    "a11y":      "a11y-guard scan --region US EU --level AA",
    "a11y:html": "a11y-guard scan --region US EU --reporter html --output a11y-report.html",
    "a11y:ci":   "a11y-guard scan --region US EU --reporter github-actions --fail-on error"
  }
}
```

---

## ESLint Plugin

```bash
npm install --save-dev @a11y-guard/eslint-plugin
```

```js
// eslint.config.js
import a11yGuard from '@a11y-guard/eslint-plugin';

export default [
  {
    plugins: { '@a11y-guard': a11yGuard },
    rules: {
      '@a11y-guard/jsx-img-alt':          'error',
      '@a11y-guard/jsx-label-association': 'error',
      '@a11y-guard/jsx-html-has-lang':     'error',
      '@a11y-guard/jsx-interactive-role':  'error',
      '@a11y-guard/jsx-link-text':         'warn',
    },
  },
];
```

---

## Vite Plugin

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import { a11yGuard } from '@a11y-guard/vite-plugin';

export default defineConfig({
  plugins: [
    a11yGuard({
      regions: ['US', 'EU'],
      failOnError: true,
      reporter: 'pretty',
    }),
  ],
});
```

---

## Global Compliance Coverage

| Region | Law | WCAG Required |
|---|---|---|
| 🇺🇸 USA | ADA + Section 508 | WCAG 2.1 AA / 2.0 AA |
| 🇪🇺 EU | EAA / EN 301 549 | WCAG 2.1 AA *(enforced June 2025)* |
| 🇬🇧 UK | Equality Act + PSBAR | WCAG 2.1 AA |
| 🇨🇦 Canada | AODA + ACA | WCAG 2.0–2.1 AA |
| 🇦🇺 Australia | DDA 1992 | WCAG 2.1 AA |
| 🇩🇪 Germany | BITV 2.0 | WCAG 2.1 AA |
| 🇫🇷 France | RGAA | WCAG 2.1 AA |
| 🇧🇷 Brazil | LBI 13.146 | WCAG 2.1 AA |
| 🇯🇵 Japan | JIS X 8341-3 | WCAG 2.1 AA |
| 🇮🇱 Israel | IS 5568 | WCAG 2.1 AA |

---

## Rule Coverage (36 rules)

### Visual
`missing-alt-text` · `color-contrast` · `non-text-contrast` · `text-resize` · `images-of-text` · `focus-visible` · `target-size`

### Auditory
`video-captions` · `audio-description` · `live-captions` · `audio-control`

### Motor / Keyboard
`keyboard-accessible` · `keyboard-trap` · `focus-order` · `label-in-name` · `pointer-gestures` · `skip-links`

### Cognitive
`page-title` · `link-purpose` · `error-identification` · `error-suggestion` · `label-association` · `language-attr` · `language-parts` · `consistent-navigation` · `on-input` · `timeout-adjustable`

### Seizure / Vestibular
`no-flashing` · `animation-from-interactions`

### Structural / Semantic
`heading-order` · `landmark-regions` · `aria-required-attr` · `aria-valid-attr` · `aria-valid-attr-value` · `duplicate-id` · `html-has-lang` · `list-structure` · `table-headers`

---

## CI/CD — GitHub Actions

```yaml
- name: Accessibility audit
  run: npx a11y-guard scan --region US EU --reporter github-actions --fail-on error
```

Or generate a SARIF file for GitHub Advanced Security:

```yaml
- name: Accessibility audit (SARIF)
  run: npx a11y-guard scan --reporter sarif --output results.sarif

- name: Upload SARIF
  uses: github/codeql-action/upload-sarif@v3
  with:
    sarif_file: results.sarif
```

---

## License

MIT © a11y-guard contributors
