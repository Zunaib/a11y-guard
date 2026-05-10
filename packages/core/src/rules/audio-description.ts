import type { Rule, RuleContext, Violation } from '../types.js';

export const audioDescription: Rule = {
  id: 'audio-description',
  wcagCriterionId: '1.2.5',
  name: 'Prerecorded video must have audio descriptions',
  description: 'Prerecorded video content must provide audio description of all visual information that is not in the audio track.',
  disabilityTypes: ['visual', 'auditory'],

  check(context: RuleContext): Violation[] {
    const violations: Violation[] = [];
    const videos = context.querySelectorAll('video');

    for (const video of videos) {
      const hasDescription = video.querySelector('track[kind="descriptions"]');
      const muted = video.hasAttribute('muted');
      const autoplay = video.hasAttribute('autoplay');

      // Only flag videos that have audio (not purely decorative muted autoplay videos)
      if (!muted && !hasDescription) {
        violations.push({
          ruleId: 'audio-description',
          severity: 'warning',
          element: video.outerHTML?.slice(0, 120),
          message: '<video> element has no audio description track.',
          suggestion: 'Add <track kind="descriptions" src="descriptions.vtt" srclang="en" label="Audio Descriptions"> if the video contains visual information not conveyed by the soundtrack.',
          wcagCriterion: context.getCriterion('1.2.5'),
          laws: context.getApplicableLaws('1.2.5'),
          regions: context.getApplicableRegions('1.2.5'),
          file: context.file,
        });
      }
    }

    return violations;
  },
};
