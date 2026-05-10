# @a11y-guard/core

The rule engine and compliance database that powers a11y-guard. Audits HTML strings against 36 WCAG rules and maps every violation to the exact law and jurisdiction that requires it.

## Install

```bash
npm install @a11y-guard/core
# or
pnpm add @a11y-guard/core
```

## Quick start

```ts
import { runAudit, format } from '@a11y-guard/core';

const result = runAudit({
  html: '<img src="logo.png">',
  regions: ['US', 'EU'],
  level: 'AA',
});

console.log(result.violations);
// [{ ruleId: 'missing-alt-text', severity: 'error', laws: ['ADA', 'EAA'], regions: ['US', 'EU'], ... }]

// Pretty-print to stdout
process.stdout.write(format(result, { regions: ['US', 'EU'] }, 'index.html'));
```

## API

### `runAudit(options)`

```ts
import { runAudit } from '@a11y-guard/core';

const result = runAudit({
  html: string,            // HTML string to audit (required)
  file?: string,           // filename shown in violation output
  isComponentFile?: boolean, // true for .tsx/.jsx — skips document-level rules
  regions?: Region[],      // filter rules to these jurisdictions
  laws?: Law[],            // filter rules to these laws
  disabilityTypes?: DisabilityType[],
  level?: 'A' | 'AA' | 'AAA',        // default 'AA'
  wcagVersion?: '2.0' | '2.1' | '2.2', // default '2.1'
  rules?: Record<string, 'error' | 'warning' | 'info' | 'off'>, // per-rule overrides
});
```

Returns an `AuditResult`:

```ts
interface AuditResult {
  violations: Violation[];   // severity === 'error'
  warnings: Violation[];     // severity === 'warning' | 'info'
  passed: number;            // rules that ran with no findings
  summary: ComplianceSummary;
}

interface Violation {
  ruleId: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  suggestion: string;
  element?: string;          // outerHTML snippet
  file?: string;
  line?: number;
  col?: number;
  laws: Law[];               // laws that require this criterion
  regions: Region[];         // jurisdictions affected
  wcagCriterion: WcagCriterion;
}
```

### `format(result, config, file)`

Returns a formatted string. Uses the `reporter` field in config:

| `reporter` | Output |
|---|---|
| `'pretty'` (default) | Human-readable terminal output |
| `'json'` | Full JSON object |
| `'sarif'` | SARIF 2.1 (GitHub Code Scanning) |
| `'github-actions'` | `::error` / `::warning` annotations |

### `formatHtml(results, config)`

Generates a self-contained dark-theme HTML report aggregating multiple files:

```ts
import { formatHtml } from '@a11y-guard/core';
import { writeFileSync } from 'fs';

const report = formatHtml(
  [{ result, file: 'src/App.tsx' }, { result: result2, file: 'index.html' }],
  { regions: ['US', 'EU'] }
);
writeFileSync('a11y-report.html', report);
```

### `parseJsx(source, filename?)`

Converts JSX/TSX source to an HTML string suitable for `runAudit`. Used internally by the CLI for `.tsx`/`.jsx` files.

```ts
import { parseJsx, runAudit } from '@a11y-guard/core';
import { readFileSync } from 'fs';

const source = readFileSync('src/Button.tsx', 'utf-8');
const html = parseJsx(source, 'src/Button.tsx');
const result = runAudit({ html, isComponentFile: true, regions: ['US'] });
```

### `defineConfig(config)`

Type-safe helper for config files:

```ts
// a11y-guard.config.ts
import { defineConfig } from '@a11y-guard/core';

export default defineConfig({
  regions: ['US', 'EU'],
  level: 'AA',
  failOn: 'error',
  rules: {
    'color-contrast': 'error',
    'focus-visible': 'warning',
  },
});
```

## Regions

| Code | Jurisdiction | Primary law(s) |
|---|---|---|
| `US` | United States | ADA, Section 508 |
| `EU` | European Union | EAA, EN 301 549 |
| `UK` | United Kingdom | Equality Act, PSBAR |
| `CA` | Canada | AODA, ACA |
| `AU` | Australia | DDA |
| `DE` | Germany | BITV 2.0 |
| `FR` | France | RGAA |
| `BR` | Brazil | LBI 13.146 |
| `JP` | Japan | JIS X 8341-3 |
| `NZ` `IL` `IN` `ES` `NL` `SE` `NO` `DK` `FI` | — | EN 301 549 / regional |

## Rules

36 rules across six categories:

**Visual** — `missing-alt-text`, `color-contrast`, `non-text-contrast`, `text-resize`, `images-of-text`, `focus-visible`, `target-size`

**Auditory** — `video-captions`, `audio-description`, `live-captions`, `audio-control`

**Motor** — `keyboard-accessible`, `keyboard-trap`, `focus-order`, `label-in-name`, `pointer-gestures`, `skip-links`

**Cognitive** — `page-title`, `link-purpose`, `error-identification`, `error-suggestion`, `label-association`, `language-parts`, `on-input`, `consistent-navigation`, `timeout-adjustable`

**Seizure** — `animation-from-interactions`

**Structural** — `heading-order`, `landmark-regions`, `aria-required-attr`, `aria-valid-attr`, `aria-valid-attr-value`, `duplicate-id`, `html-has-lang`, `list-structure`, `table-headers`

## License

MIT — see [LICENSE](../../LICENSE) in the root of the repository.
