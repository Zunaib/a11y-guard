# @a11y-guard/cli

Command-line tool for scanning HTML, JSX, and TSX files for accessibility violations. Maps every finding to the exact law and jurisdiction that requires it.

## Install

```bash
# Global
npm install -g @a11y-guard/cli

# Or run without installing
npx a11y-guard scan 'src/**/*.tsx' --region US EU
```

## Commands

### `scan`

Scan files for accessibility violations.

```bash
a11y-guard scan [patterns...] [options]
```

**Default patterns** (when none are provided): `src/**/*.html`, `src/**/*.tsx`, `src/**/*.jsx`, `public/**/*.html`

| Option | Description | Default |
|---|---|---|
| `-r, --region <regions...>` | Target jurisdictions | all |
| `-l, --law <laws...>` | Target specific laws | all |
| `-d, --disability-type <types...>` | Filter by disability type | all |
| `--level <level>` | WCAG conformance level: `A`, `AA`, `AAA` | `AA` |
| `--reporter <format>` | Output format: `pretty`, `json`, `sarif`, `github-actions`, `html` | `pretty` |
| `-o, --output <file>` | Write output to a file | — |
| `--fail-on <severity>` | Exit 1 when `error`, `warning`, or `any` found | `error` |
| `-c, --config <path>` | Path to `a11y-guard.config.ts` | — |

**Examples:**

```bash
# Scan all components against US + EU law
a11y-guard scan 'src/**/*.tsx' --region US EU

# Generate a shareable HTML report
a11y-guard scan 'src/**/*.tsx' --reporter html --output a11y-report.html

# CI gate — exits 1 if any error is found, annotates GitHub Actions
a11y-guard scan 'src/**/*.tsx' --reporter github-actions --fail-on error

# SARIF output for GitHub Code Scanning
a11y-guard scan --reporter sarif --output results.sarif

# Filter to visual disability rules only
a11y-guard scan --disability-type visual motor --region US
```

**Scanning behavior:**

- `.tsx` / `.jsx` files are scanned as standalone components. Document-level rules (`html-has-lang`, `page-title`, `landmark-regions`, etc.) are skipped per-file.
- After all component files are scanned, an additional **app-structure** pass combines all component output into a virtual document and checks for missing `<main>`, missing `lang`, and missing `<title>` across the entire project.
- `.html` files are scanned as full documents — all rules apply.

---

### `init`

Scaffold a config file and add audit scripts to `package.json`.

```bash
a11y-guard init [options]
```

| Option | Description |
|---|---|
| `--no-scripts` | Skip injecting scripts into `package.json` |

Creates `a11y-guard.config.ts` in the current directory and adds:

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

### `matrix`

Print the full compliance matrix: which laws apply to which regions.

```bash
a11y-guard matrix [--region US EU] [--law ADA EAA]
```

## Config file

```ts
// a11y-guard.config.ts
import { defineConfig } from '@a11y-guard/core';

export default defineConfig({
  regions: ['US', 'EU'],
  level: 'AA',
  failOn: 'error',
  reporter: 'pretty',
  rules: {
    'missing-alt-text': 'error',
    'color-contrast': 'error',
    'focus-visible': 'warning',
  },
});
```

## GitHub Actions

```yaml
- name: Accessibility audit
  run: |
    npx a11y-guard scan 'src/**/*.tsx' \
      --region US EU \
      --reporter github-actions \
      --fail-on error
```

## License

MIT — see [LICENSE](../../LICENSE) in the root of the repository.
