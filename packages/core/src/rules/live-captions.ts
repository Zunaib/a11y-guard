import type { Rule, RuleContext, Violation } from '../types.js';

export const liveCaptions: Rule = {
  id: 'live-captions',
  wcagCriterionId: '1.2.4',
  name: 'Live video must have real-time captions',
  description: 'Live audio-visual content must provide real-time captions synchronized with the live stream.',
  disabilityTypes: ['auditory'],

  check(context: RuleContext): Violation[] {
    const violations: Violation[] = [];

    // Check for video elements with data attributes suggesting live streams
    const liveVideos = context.querySelectorAll('video[data-live], video[data-stream], video[class*="live"]');
    for (const video of liveVideos) {
      const hasCaption = video.querySelector('track[kind="captions"]');
      if (!hasCaption) {
        violations.push({
          ruleId: 'live-captions',
          severity: 'error',
          element: video.outerHTML?.slice(0, 120),
          message: 'Live video stream appears to have no captions.',
          suggestion: 'Provide real-time captions for live video streams. Consider using WebVTT with a live caption service.',
          wcagCriterion: context.getCriterion('1.2.4'),
          laws: context.getApplicableLaws('1.2.4'),
          regions: context.getApplicableRegions('1.2.4'),
          file: context.file,
        });
      }
    }

    return violations;
  },
};
