import type { Command } from 'commander';
import { REGION_LAW_MAP, LAW_WCAG_REQUIREMENT } from '@a11y-guard/core';
import type { Region } from '@a11y-guard/core';

interface MatrixOptions {
  region?: string[];
  law?: string[];
}

const REGION_FLAGS: Record<string, string> = {
  US: '🇺🇸', EU: '🇪🇺', UK: '🇬🇧', CA: '🇨🇦', AU: '🇦🇺', NZ: '🇳🇿',
  JP: '🇯🇵', BR: '🇧🇷', IL: '🇮🇱', IN: '🇮🇳', DE: '🇩🇪', FR: '🇫🇷',
  ES: '🇪🇸', NL: '🇳🇱', SE: '🇸🇪', NO: '🇳🇴', DK: '🇩🇰', FI: '🇫🇮',
};

export function registerMatrixCommand(program: Command): void {
  program
    .command('matrix')
    .description('Show the compliance matrix of regions, laws, and WCAG versions')
    .option('-r, --region <regions...>', 'Filter by region')
    .option('-l, --law <laws...>', 'Filter by law')
    .action((opts: MatrixOptions) => {
      const filterRegions = opts.region as Region[] | undefined;

      let regions = Object.keys(REGION_LAW_MAP) as Region[];
      if (filterRegions && filterRegions.length > 0) {
        regions = regions.filter((r) => filterRegions.includes(r));
      }

      console.log('\na11y-guard — Global Compliance Matrix\n');
      console.log('─'.repeat(90));
      console.log(
        'Region'.padEnd(6),
        'Flag',
        'Laws'.padEnd(30),
        'WCAG Version',
        'Level',
        'Notes'
      );
      console.log('─'.repeat(90));

      for (const region of regions) {
        const laws = REGION_LAW_MAP[region];
        if (laws.length === 0) {
          const flag = REGION_FLAGS[region] ?? '  ';
          console.log(region.padEnd(6), flag, '(Regional standard)'.padEnd(30), 'WCAG 2.1', ' AA', '  Various');
          continue;
        }

        for (let i = 0; i < laws.length; i++) {
          const law = laws[i]!;
          const req = LAW_WCAG_REQUIREMENT[law];
          const flag = i === 0 ? (REGION_FLAGS[region] ?? '  ') : '  ';
          const regionLabel = i === 0 ? region : '';
          console.log(
            regionLabel.padEnd(6),
            flag,
            law.padEnd(30),
            `WCAG ${req.version}`,
            req.level.padEnd(3),
            ` ${req.notes.slice(0, 40)}`
          );
        }
      }

      console.log('─'.repeat(90));
      console.log();
    });
}
