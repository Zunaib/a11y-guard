# @a11y-guard/vite-plugin

Vite plugin that audits HTML during the build and logs (or throws) accessibility violations before your bundle reaches production.

## Install

```bash
npm install --save-dev @a11y-guard/vite-plugin
# or
pnpm add -D @a11y-guard/vite-plugin
```

## Setup

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import { a11yGuard } from '@a11y-guard/vite-plugin';

export default defineConfig({
  plugins: [
    a11yGuard({
      regions: ['US', 'EU'],
      level: 'AA',
      failOnError: true,   // throws a build error if violations are found
    }),
  ],
});
```

## Options

| Option | Type | Description | Default |
|---|---|---|---|
| `regions` | `string[]` | Jurisdictions to check against (`US`, `EU`, `UK`, `CA`, etc.) | all |
| `laws` | `string[]` | Specific laws to check (`ADA`, `EAA`, `Section508`, etc.) | all |
| `disabilityTypes` | `string[]` | `visual`, `motor`, `cognitive`, `auditory`, `seizure` | all |
| `level` | `'A' \| 'AA' \| 'AAA'` | WCAG conformance level | `'AA'` |
| `failOnError` | `boolean` | Throw a build error when violations are found | `false` |
| `reporter` | `string` | Output format: `pretty`, `json`, `sarif`, `github-actions` | `'pretty'` |
| `include` | `RegExp[]` | File patterns to scan | `[/\.html$/]` |
| `exclude` | `RegExp[]` | File patterns to skip | `[/node_modules/]` |

## Behaviour

- Runs after HTML transformation (`enforce: 'post'`) so it sees the fully processed output.
- Logs violations to the console during `vite build`.
- When `failOnError: true`, throws before the bundle is written if any `error`-severity violation is found — blocks broken deploys.
- Violations are suppressed in `vite dev` (hot-reload) by default; use the CLI for watch-mode linting.

## Example: block non-compliant production builds

```ts
a11yGuard({
  regions: ['US', 'EU'],
  failOnError: true,
  exclude: [/node_modules/, /\.test\.html$/],
})
```

## License

MIT — see [LICENSE](../../LICENSE) in the root of the repository.
