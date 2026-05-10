import { program } from 'commander';
import { registerScanCommand } from './commands/scan.js';
import { registerMatrixCommand } from './commands/matrix.js';
import { registerInitCommand } from './commands/init.js';

program
  .name('a11y-guard')
  .description('Accessibility compliance linter — region-aware, law-specific, shift-left')
  .version('1.0.0');

registerScanCommand(program);
registerMatrixCommand(program);
registerInitCommand(program);

program.parse();
