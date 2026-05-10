import type { Rule, RuleContext, Violation } from '../types.js';

export const videoCaptions: Rule = {
  id: 'video-captions',
  wcagCriterionId: '1.2.2',
  name: 'Videos must have closed captions',
  description: 'Prerecorded video content with audio must provide synchronized captions for deaf and hard-of-hearing users.',
  disabilityTypes: ['auditory'],

  check(context: RuleContext): Violation[] {
    const violations: Violation[] = [];
    const videos = context.querySelectorAll('video');

    for (const video of videos) {
      const tracks = video.querySelectorAll('track[kind="captions"], track[kind="subtitles"]');
      if (tracks.length === 0) {
        violations.push({
          ruleId: 'video-captions',
          severity: 'error',
          element: video.outerHTML?.slice(0, 120),
          message: '<video> element has no captions track.',
          suggestion: 'Add <track kind="captions" src="captions.vtt" srclang="en" label="English"> inside the <video> element.',
          wcagCriterion: context.getCriterion('1.2.2'),
          laws: context.getApplicableLaws('1.2.2'),
          regions: context.getApplicableRegions('1.2.2'),
          file: context.file,
        });
      }
    }

    return violations;
  },
};
