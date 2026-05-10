import type { Rule, RuleContext, Violation } from '../types.js';

const INTERACTIVE_ROLES = new Set([
  'button', 'link', 'menuitem', 'menuitemcheckbox', 'menuitemradio',
  'option', 'tab', 'treeitem', 'gridcell', 'checkbox', 'radio', 'slider',
  'spinbutton', 'switch', 'textbox', 'combobox', 'listbox', 'searchbox',
]);

export const keyboardAccessible: Rule = {
  id: 'keyboard-accessible',
  wcagCriterionId: '2.1.1',
  name: 'All interactive functionality must be keyboard accessible',
  description: 'Interactive elements must be operable with a keyboard alone, without requiring a mouse.',
  disabilityTypes: ['motor'],

  check(context: RuleContext): Violation[] {
    const violations: Violation[] = [];

    // Detect non-interactive elements used interactively (click handlers without keyboard support)
    const clickableNonInteractive = context.querySelectorAll('[onclick]');
    for (const el of clickableNonInteractive) {
      const tag = el.tagName.toLowerCase();
      const role = el.getAttribute('role')?.toLowerCase();
      const tabindex = el.getAttribute('tabindex');

      if (tag === 'a' || tag === 'button' || tag === 'input' || tag === 'select' || tag === 'textarea') continue;
      if (role && INTERACTIVE_ROLES.has(role)) continue;
      if (tabindex !== null && parseInt(tabindex, 10) >= 0) continue;

      violations.push({
        ruleId: 'keyboard-accessible',
        severity: 'error',
        element: el.outerHTML?.slice(0, 120),
        message: `<${tag}> with onclick handler is not keyboard accessible (no tabindex or interactive role).`,
        suggestion: 'Use a <button> element, or add role="button" tabindex="0" and a keydown handler.',
        wcagCriterion: context.getCriterion('2.1.1'),
        laws: context.getApplicableLaws('2.1.1'),
        regions: context.getApplicableRegions('2.1.1'),
        file: context.file,
      });
    }

    // Detect positive tabindex (breaks natural tab order)
    const posTabindex = context.querySelectorAll('[tabindex]');
    for (const el of posTabindex) {
      const val = parseInt(el.getAttribute('tabindex') ?? '0', 10);
      if (val > 0) {
        violations.push({
          ruleId: 'keyboard-accessible',
          severity: 'warning',
          element: el.outerHTML?.slice(0, 120),
          message: `tabindex="${val}" breaks the natural tab order.`,
          suggestion: 'Use tabindex="0" to include an element in tab order without disrupting sequence.',
          wcagCriterion: context.getCriterion('2.1.1'),
          laws: context.getApplicableLaws('2.1.1'),
          regions: context.getApplicableRegions('2.1.1'),
          file: context.file,
        });
      }
    }

    return violations;
  },
};
