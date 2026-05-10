import type { Plugin } from 'vite';
import { runAudit, format } from '@a11y-guard/core';
import type { A11yGuardConfig, Region, Law, DisabilityType, WcagLevel } from '@a11y-guard/core';

interface A11yGuardViteOptions {
  regions?: string[];
  laws?: string[];
  disabilityTypes?: string[];
  level?: string;
  failOnError?: boolean;
  reporter?: string;
  include?: RegExp[];
  exclude?: RegExp[];
}

export function a11yGuard(options: A11yGuardViteOptions = {}): Plugin {
  const config: A11yGuardConfig = {
    regions: options.regions as Region[] | undefined,
    laws: options.laws as Law[] | undefined,
    disabilityTypes: options.disabilityTypes as DisabilityType[] | undefined,
    level: (options.level ?? 'AA') as WcagLevel,
    reporter: (options.reporter ?? 'pretty') as A11yGuardConfig['reporter'],
    failOn: options.failOnError ? 'error' : undefined,
  };

  const includePatterns = options.include ?? [/\.html$/];
  const excludePatterns = options.exclude ?? [/node_modules/];

  return {
    name: 'a11y-guard',
    enforce: 'post',

    transformIndexHtml: {
      order: 'post',
      handler(html: string, ctx: { filename?: string }) {
        const file = ctx.filename ?? 'index.html';
        if (excludePatterns.some((p) => p.test(file))) return;
        if (!includePatterns.some((p) => p.test(file))) return;

        try {
          const result = runAudit({ ...config, html, file });
          const output = format(result, config, file);

          if (result.violations.length > 0 || result.warnings.length > 0) {
            console.log(output);
          }

          if (options.failOnError && result.violations.length > 0) {
            throw new Error(
              `a11y-guard: ${result.violations.length} accessibility error(s) found in ${file}. ` +
              'Fix violations before building for production.'
            );
          }
        } catch (err) {
          if (err instanceof Error && err.message.startsWith('a11y-guard:')) throw err;
          console.warn(`a11y-guard: Failed to scan ${file}:`, err);
        }

        return html;
      },
    },

    closeBundle() {
      console.log('\na11y-guard: Build accessibility scan complete.');
    },
  };
}
