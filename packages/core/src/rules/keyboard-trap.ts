import type { Rule, RuleContext, Violation } from '../types.js';

export const keyboardTrap: Rule = {
  id: 'keyboard-trap',
  wcagCriterionId: '2.1.2',
  name: 'Keyboard focus must not be trapped in components',
  description: 'Users must always be able to move focus away from any component using standard keyboard navigation (Tab/Shift+Tab or arrow keys).',
  disabilityTypes: ['motor'],

  check(context: RuleContext): Violation[] {
    const violations: Violation[] = [];

    // Detect dialog/modal elements without proper focus management indicators
    const dialogs = context.querySelectorAll('[role="dialog"], [role="alertdialog"], dialog');
    for (const dialog of dialogs) {
      const hasClose = dialog.querySelector(
        '[aria-label*="close" i], [aria-label*="dismiss" i], button[class*="close" i], [data-dismiss]'
      );
      if (!hasClose) {
        violations.push({
          ruleId: 'keyboard-trap',
          severity: 'warning',
          element: dialog.outerHTML?.slice(0, 120),
          message: 'Dialog/modal has no identifiable close mechanism. Ensure keyboard users can exit with Escape key.',
          suggestion: 'Add a close button and handle the Escape key to dismiss the dialog. Manage focus return to the triggering element on close.',
          wcagCriterion: context.getCriterion('2.1.2'),
          laws: context.getApplicableLaws('2.1.2'),
          regions: context.getApplicableRegions('2.1.2'),
          file: context.file,
        });
      }
    }

    return violations;
  },
};
