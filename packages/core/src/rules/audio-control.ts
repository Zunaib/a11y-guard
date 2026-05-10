import type { Rule, RuleContext, Violation } from '../types.js';

export const audioControl: Rule = {
  id: 'audio-control',
  wcagCriterionId: '1.4.2',
  name: 'Auto-playing audio must have a stop/pause control',
  description: 'If any audio plays automatically for more than 3 seconds, a mechanism must exist to pause, stop, or mute it.',
  disabilityTypes: ['auditory'],

  check(context: RuleContext): Violation[] {
    const violations: Violation[] = [];

    const autoplayAudio = context.querySelectorAll('audio[autoplay], video[autoplay]');
    for (const el of autoplayAudio) {
      const hasMuted = el.hasAttribute('muted');
      const hasControls = el.hasAttribute('controls');
      if (!hasMuted && !hasControls) {
        violations.push({
          ruleId: 'audio-control',
          severity: 'error',
          element: el.outerHTML?.slice(0, 120),
          message: `<${el.tagName.toLowerCase()}> with autoplay has no user controls and is not muted.`,
          suggestion: 'Add the controls attribute or muted attribute, or provide a custom pause/stop button.',
          wcagCriterion: context.getCriterion('1.4.2'),
          laws: context.getApplicableLaws('1.4.2'),
          regions: context.getApplicableRegions('1.4.2'),
          file: context.file,
        });
      }
    }

    return violations;
  },
};
