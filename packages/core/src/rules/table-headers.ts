import type { Rule, RuleContext, Violation } from '../types.js';

export const tableHeaders: Rule = {
  id: 'table-headers',
  wcagCriterionId: '1.3.1',
  name: 'Data tables must use <th> header cells',
  description: 'Tables used for tabular data must have header cells marked with <th> so screen readers can associate data with column/row headers.',
  disabilityTypes: ['visual'],

  check(context: RuleContext): Violation[] {
    const violations: Violation[] = [];
    const tables = context.querySelectorAll('table');

    for (const table of tables) {
      // Skip tables with role="presentation" (layout tables)
      if (table.getAttribute('role') === 'presentation' || table.getAttribute('role') === 'none') continue;

      const headers = table.querySelectorAll('th');
      if (headers.length === 0) {
        const rows = table.querySelectorAll('tr');
        if (rows.length > 1) {
          violations.push({
            ruleId: 'table-headers',
            severity: 'warning',
            element: table.outerHTML?.slice(0, 120),
            message: 'Data table has no <th> header cells.',
            suggestion: 'Mark header cells with <th scope="col"> for column headers or <th scope="row"> for row headers.',
            wcagCriterion: context.getCriterion('1.3.1'),
            laws: context.getApplicableLaws('1.3.1'),
            regions: context.getApplicableRegions('1.3.1'),
            file: context.file,
          });
        }
      }
    }

    return violations;
  },
};
