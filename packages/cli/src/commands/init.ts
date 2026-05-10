import { writeFileSync, existsSync, readFileSync } from 'fs';
import type { Command } from 'commander';

const CONFIG_TEMPLATE = `import { defineConfig } from 'a11y-guard';

export default defineConfig({
  // Target compliance by REGION
  // regions: ['US', 'EU', 'CA'],

  // OR target compliance by LAW
  // laws: ['ADA', 'Section508', 'EAA', 'AODA'],

  // OR target compliance by DISABILITY TYPE
  // disabilityTypes: ['visual', 'motor', 'cognitive'],

  // WCAG conformance level
  level: 'AA', // 'A' | 'AA' | 'AAA'

  // What counts as a failure in CI
  failOn: 'error', // 'error' | 'warning' | 'any'

  // Files to scan
  include: ['src/**/*.html', 'public/**/*.html'],
  exclude: ['**/*.test.tsx', 'node_modules/**'],

  // Output format
  reporter: 'pretty', // 'pretty' | 'json' | 'sarif' | 'github-actions' | 'html'

  // Override rule severity
  rules: {
    'color-contrast': 'error',
    'missing-alt-text': 'error',
    'keyboard-trap': 'error',
    'focus-visible': 'warning',
  },
});
`;

const A11Y_SCRIPTS = {
  'a11y': 'a11y-guard scan --region US EU --level AA',
  'a11y:html': 'a11y-guard scan --region US EU --reporter html --output a11y-report.html',
  'a11y:ci': 'a11y-guard scan --region US EU --reporter github-actions --fail-on error',
};

function injectScripts(pkgPath: string): { added: string[]; skipped: string[] } {
  const raw = readFileSync(pkgPath, 'utf-8');
  const pkg = JSON.parse(raw) as Record<string, unknown>;

  if (!pkg['scripts'] || typeof pkg['scripts'] !== 'object') {
    pkg['scripts'] = {};
  }

  const scripts = pkg['scripts'] as Record<string, string>;
  const added: string[] = [];
  const skipped: string[] = [];

  for (const [key, value] of Object.entries(A11Y_SCRIPTS)) {
    if (scripts[key]) {
      skipped.push(key);
    } else {
      scripts[key] = value;
      added.push(key);
    }
  }

  if (added.length > 0) {
    writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8');
  }

  return { added, skipped };
}

export function registerInitCommand(program: Command): void {
  program
    .command('init')
    .description('Initialize a11y-guard config and inject scripts into package.json')
    .option('--no-scripts', 'Skip injecting scripts into package.json')
    .action((opts: { scripts: boolean }) => {
      // Write config file
      const configPath = 'a11y-guard.config.ts';
      if (existsSync(configPath)) {
        console.log(`  Config already exists: ${configPath} (skipped)`);
      } else {
        writeFileSync(configPath, CONFIG_TEMPLATE, 'utf-8');
        console.log(`\n✅ Created ${configPath}`);
      }

      // Inject scripts into package.json
      const pkgPath = 'package.json';
      if (opts.scripts && existsSync(pkgPath)) {
        const { added, skipped } = injectScripts(pkgPath);

        if (added.length > 0) {
          console.log(`\n✅ Added scripts to package.json:`);
          for (const key of added) {
            console.log(`   "scripts": { "${key}": "${A11Y_SCRIPTS[key as keyof typeof A11Y_SCRIPTS]}" }`);
          }
        }
        if (skipped.length > 0) {
          console.log(`\n  Skipped (already exist): ${skipped.map((k) => `"${k}"`).join(', ')}`);
        }
      } else if (opts.scripts) {
        console.log('\n  No package.json found — scripts not injected.');
      }

      console.log('\n📖 Next steps:');
      console.log('   pnpm a11y           → scan and print to terminal');
      console.log('   pnpm a11y:html      → generate a11y-report.html');
      console.log('   pnpm a11y:ci        → CI mode (exits 1 on errors)');
      console.log();
    });
}
