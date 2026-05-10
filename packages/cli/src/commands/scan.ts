import { readFileSync, writeFileSync } from 'fs';
import { extname } from 'path';
import { glob } from 'glob';
import type { Command } from 'commander';
import { runAudit, format, formatHtml, parseJsx } from '@a11y-guard/core';
import type { A11yGuardConfig, AuditResult, Region, Law, DisabilityType, WcagLevel } from '@a11y-guard/core';

/** Only true JSX/TSX files are treated as React component files. Plain .js/.ts are skipped. */
const JSX_EXTENSIONS = new Set(['.tsx', '.jsx']);

/**
 * Rules that only make sense at the app/document level.
 * These are checked once across the entire app during structural analysis,
 * not on individual component files.
 */
const APP_STRUCTURE_RULES = new Set([
  'html-has-lang',
  'page-title',
  'landmark-regions',
  'consistent-navigation',
  'timeout-adjustable',
]);

/**
 * Returns true if the file path looks like an app root/layout entry point:
 * Next.js app/layout.tsx, Next.js pages/_app.tsx, CRA src/App.tsx,
 * Vite src/main.tsx, or src/index.tsx.
 */
function isAppRootFile(filePath: string): boolean {
  return (
    /[/\\](app|pages)[/\\](layout|_app)\.(tsx|jsx)$/i.test(filePath) ||
    /[/\\]src[/\\](App|main|index)\.(tsx|jsx)$/i.test(filePath)
  );
}

/** Extract the content between <body> and </body> from a parsed HTML string. */
function extractBody(html: string): string {
  const m = html.match(/<body>([\s\S]*?)<\/body>/i);
  return m?.[1] ?? '';
}

interface ScanOptions {
  region?: string[];
  law?: string[];
  disabilityType?: string[];
  level?: string;
  reporter?: string;
  failOn?: string;
  output?: string;
  config?: string;
}

export function registerScanCommand(program: Command): void {
  program
    .command('scan [patterns...]')
    .description('Scan HTML files for accessibility violations')
    .option('-r, --region <regions...>', 'Target regions (US, EU, UK, CA, AU, etc.)')
    .option('-l, --law <laws...>', 'Target laws (ADA, EAA, Section508, etc.)')
    .option('-d, --disability-type <types...>', 'Target disability types (visual, motor, cognitive, etc.)')
    .option('--level <level>', 'WCAG conformance level (A, AA, AAA)', 'AA')
    .option('--reporter <format>', 'Output format (pretty, json, sarif, github-actions, html)', 'pretty')
    .option('-o, --output <file>', 'Write output to a file (required for --reporter html)')
    .option('--fail-on <severity>', 'Exit code 1 when this severity is found (error, warning, any)', 'error')
    .option('-c, --config <path>', 'Path to a11y-guard.config.ts')
    .action(async (patterns: string[], opts: ScanOptions) => {
      const filePatterns =
        patterns.length > 0
          ? patterns
          : ['src/**/*.html', 'src/**/*.tsx', 'src/**/*.jsx', 'public/**/*.html'];
      const files = (await Promise.all(filePatterns.map((p) => glob(p)))).flat();

      if (files.length === 0) {
        console.error('No files matched the provided patterns.');
        process.exit(1);
      }

      const config: A11yGuardConfig = {
        regions: opts.region as Region[] | undefined,
        laws: opts.law as Law[] | undefined,
        disabilityTypes: opts.disabilityType as DisabilityType[] | undefined,
        level: (opts.level ?? 'AA') as WcagLevel,
        reporter: (opts.reporter ?? 'pretty') as A11yGuardConfig['reporter'],
        failOn: (opts.failOn ?? 'error') as A11yGuardConfig['failOn'],
      };

      const isHtml = opts.reporter === 'html';

      if (isHtml && !opts.output) {
        opts.output = 'a11y-report.html';
        console.log(`No --output specified, writing to ${opts.output}`);
      }

      // Collect results for all files
      const allResults: Array<{ result: AuditResult; file: string }> = [];
      let totalErrors = 0;
      let totalWarnings = 0;

      // Cache parsed HTML from every JSX/TSX file for app-level structural analysis
      const componentCache: Array<{ file: string; html: string; isRoot: boolean }> = [];

      for (const file of files) {
        let source: string;
        try {
          source = readFileSync(file, 'utf-8');
        } catch {
          console.error(`Could not read file: ${file}`);
          continue;
        }

        const ext = extname(file).toLowerCase();
        const isComponentFile = JSX_EXTENSIONS.has(ext);

        const html = isComponentFile ? parseJsx(source, file) : source;

        if (isComponentFile) {
          componentCache.push({ file, html, isRoot: isAppRootFile(file) });
        }

        const result = runAudit({ ...config, html, file, isComponentFile });
        allResults.push({ result, file });
        totalErrors += result.violations.length;
        totalWarnings += result.warnings.length;

        // Stream pretty/json/sarif/github-actions to stdout per-file
        if (!isHtml) {
          const output = format(result, config, file);
          process.stdout.write(output);
        }
      }

      // ── App-level structural analysis ───────────────────────────────────────
      // Combine all component HTML into one virtual document and run document-
      // level rules to catch missing <main>, missing lang, missing <title>, etc.
      if (componentCache.length > 0) {
        // Extract body content from every component (strips the scanner wrapper).
        // Each file contributes exactly once — no duplication.
        const allBodyContent = componentCache.map(c => extractBody(c.html)).join('\n');

        // Detect whether any component explicitly renders <html lang="...">
        // (e.g. Next.js app/layout.tsx renders <html lang="en"> as a JSX element).
        // If none do, the attribute is absent in the virtual document so html-has-lang fires.
        const langMatch = allBodyContent.match(/<html[^>]*\slang="([^"]*)"/i);
        const langAttr = langMatch ? ` lang="${langMatch[1]}"` : '';

        // Detect whether any component explicitly renders <title> (e.g. layout head).
        // If none do, omit the element entirely so page-title fires.
        const titleMatch = allBodyContent.match(/<title[^>]*>([^<]+)<\/title>/i);
        const headContent = titleMatch ? `<title>${titleMatch[1]}</title>` : '';

        // Build the virtual app document from scratch so there's no duplication.
        const appHtml = `<html${langAttr}><head>${headContent}</head><body>${allBodyContent}</body></html>`;

        const appResult = runAudit({
          ...config,
          html: appHtml,
          file: 'app-structure',
          isComponentFile: false, // run ALL rules including document-level
        });

        // Filter to only the structural rules so we don't re-report component issues
        const structViolations = appResult.violations.filter(v => APP_STRUCTURE_RULES.has(v.ruleId));
        const structWarnings = appResult.warnings.filter(v => APP_STRUCTURE_RULES.has(v.ruleId));

        if (structViolations.length > 0 || structWarnings.length > 0) {
          const structResult: AuditResult = {
            violations: structViolations,
            warnings: structWarnings,
            passed: 0,
            summary: { byRegion: {}, byLaw: {}, byDisabilityType: {} } as AuditResult['summary'],
          };

          allResults.push({ result: structResult, file: 'app-structure' });
          totalErrors += structViolations.length;
          totalWarnings += structWarnings.length;

          if (!isHtml) {
            process.stdout.write(format(structResult, config, 'app-structure'));
          }
        }
      }
      // ────────────────────────────────────────────────────────────────────────

      // HTML: aggregate all files into one report
      if (isHtml && opts.output) {
        const htmlContent = formatHtml(allResults, config);
        writeFileSync(opts.output, htmlContent, 'utf-8');
        console.log(`\n✅ HTML report written to: ${opts.output}`);
        console.log(`   ${totalErrors} errors, ${totalWarnings} warnings across ${files.length} file(s)`);
      }

      // Non-HTML multi-file summary
      if (!isHtml && files.length > 1) {
        console.log(`\nTotal: ${totalErrors} errors, ${totalWarnings} warnings`);
      }

      // Write non-HTML output to file if --output specified
      if (!isHtml && opts.output) {
        const combined = allResults
          .map(({ result, file }) => format(result, config, file))
          .join('\n');
        writeFileSync(opts.output, combined, 'utf-8');
        console.log(`Output written to: ${opts.output}`);
      }

      const failOn = config.failOn ?? 'error';
      const shouldFail =
        (failOn === 'error' && totalErrors > 0) ||
        (failOn === 'warning' && (totalErrors > 0 || totalWarnings > 0)) ||
        (failOn === 'any' && (totalErrors > 0 || totalWarnings > 0));

      if (shouldFail) process.exit(1);
    });
}
