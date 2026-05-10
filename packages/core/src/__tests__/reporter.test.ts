import { describe, it, expect } from 'vitest';
import { formatPretty, formatJson, formatSarif, formatGithubActions, formatHtml } from '../reporter.js';
import type { AuditResult, A11yGuardConfig } from '../types.js';
import { getCriterion } from '../compliance/matrix.js';

function makeViolation(ruleId: string, severity: 'error' | 'warning' | 'info' = 'error') {
  return {
    ruleId,
    severity,
    message: `Test violation for ${ruleId}`,
    suggestion: `Fix for ${ruleId}`,
    element: `<img>`,
    wcagCriterion: getCriterion('1.1.1'),
    laws: ['ADA' as const],
    regions: ['US' as const],
    file: 'test.html',
    line: 10,
    col: 5,
  };
}

function makeResult(overrides: Partial<AuditResult> = {}): AuditResult {
  return {
    violations: [],
    warnings: [],
    passed: 5,
    summary: {
      byRegion: {} as AuditResult['summary']['byRegion'],
      byLaw: {} as AuditResult['summary']['byLaw'],
      byDisabilityType: {} as AuditResult['summary']['byDisabilityType'],
    },
    ...overrides,
  };
}

const defaultConfig: A11yGuardConfig = {
  level: 'AA',
  wcagVersion: '2.1',
  reporter: 'pretty',
};

describe('formatPretty', () => {
  it('contains rule ID in output for a violation', () => {
    const result = makeResult({ violations: [makeViolation('missing-alt-text')] });
    const out = formatPretty(result, defaultConfig, 'test.html');
    expect(out).toContain('missing-alt-text');
  });

  it('contains WCAG criterion ID', () => {
    const result = makeResult({ violations: [makeViolation('missing-alt-text')] });
    const out = formatPretty(result, defaultConfig);
    expect(out).toContain('1.1.1');
  });

  it('contains severity label', () => {
    const result = makeResult({ violations: [makeViolation('missing-alt-text', 'error')] });
    const out = formatPretty(result, defaultConfig);
    expect(out).toContain('ERROR');
  });

  it('contains suggestion text', () => {
    const result = makeResult({ violations: [makeViolation('missing-alt-text')] });
    const out = formatPretty(result, defaultConfig);
    expect(out).toContain('Fix for missing-alt-text');
  });

  it('prints no violations message when result is clean', () => {
    const result = makeResult();
    const out = formatPretty(result, defaultConfig);
    expect(out).toContain('No accessibility violations found');
  });

  it('includes region compliance when regions are configured', () => {
    const result = makeResult();
    const config: A11yGuardConfig = { ...defaultConfig, regions: ['US'] };
    const out = formatPretty(result, config);
    expect(out).toContain('US');
  });

  it('includes law information for violations with laws', () => {
    const result = makeResult({ violations: [makeViolation('missing-alt-text')] });
    const out = formatPretty(result, defaultConfig);
    expect(out).toContain('ADA');
  });
});

describe('formatJson', () => {
  it('returns valid JSON', () => {
    const result = makeResult({ violations: [makeViolation('missing-alt-text')] });
    const out = formatJson(result, defaultConfig);
    expect(() => JSON.parse(out)).not.toThrow();
  });

  it('contains violations array in parsed JSON', () => {
    const result = makeResult({ violations: [makeViolation('missing-alt-text')] });
    const parsed = JSON.parse(formatJson(result, defaultConfig));
    expect(parsed.result.violations).toBeInstanceOf(Array);
    expect(parsed.result.violations).toHaveLength(1);
  });

  it('contains config in parsed JSON', () => {
    const result = makeResult();
    const parsed = JSON.parse(formatJson(result, defaultConfig));
    expect(parsed.config).toBeDefined();
    expect(parsed.config.level).toBe('AA');
  });

  it('empty violations returns violations array of length 0', () => {
    const result = makeResult();
    const parsed = JSON.parse(formatJson(result, defaultConfig));
    expect(parsed.result.violations).toHaveLength(0);
  });
});

describe('formatSarif', () => {
  it('contains $schema field', () => {
    const result = makeResult({ violations: [makeViolation('missing-alt-text')] });
    const out = formatSarif(result);
    expect(out).toContain('$schema');
  });

  it('contains version 2.1.0', () => {
    const result = makeResult({ violations: [makeViolation('missing-alt-text')] });
    const out = formatSarif(result);
    expect(out).toContain('2.1.0');
  });

  it('contains runs array', () => {
    const result = makeResult({ violations: [makeViolation('missing-alt-text')] });
    const parsed = JSON.parse(formatSarif(result));
    expect(parsed.runs).toBeInstanceOf(Array);
    expect(parsed.runs.length).toBeGreaterThan(0);
  });

  it('contains results array with violations', () => {
    const result = makeResult({ violations: [makeViolation('missing-alt-text')] });
    const parsed = JSON.parse(formatSarif(result));
    expect(parsed.runs[0].results).toBeInstanceOf(Array);
    expect(parsed.runs[0].results.length).toBeGreaterThan(0);
  });

  it('result ruleId matches violation ruleId', () => {
    const result = makeResult({ violations: [makeViolation('missing-alt-text')] });
    const parsed = JSON.parse(formatSarif(result));
    expect(parsed.runs[0].results[0].ruleId).toBe('missing-alt-text');
  });

  it('produces valid SARIF for zero violations', () => {
    const result = makeResult();
    const parsed = JSON.parse(formatSarif(result));
    expect(parsed.runs[0].results).toHaveLength(0);
  });
});

describe('formatGithubActions', () => {
  it('contains ::error annotation for error severity', () => {
    const result = makeResult({ violations: [makeViolation('missing-alt-text', 'error')] });
    const out = formatGithubActions(result);
    expect(out).toContain('::error');
  });

  it('contains ::warning annotation for warning severity', () => {
    const result = makeResult({ warnings: [makeViolation('heading-order', 'warning')] });
    const out = formatGithubActions(result);
    expect(out).toContain('::warning');
  });

  it('includes rule ID in annotation title', () => {
    const result = makeResult({ violations: [makeViolation('missing-alt-text')] });
    const out = formatGithubActions(result);
    expect(out).toContain('missing-alt-text');
  });

  it('returns empty string for zero violations', () => {
    const result = makeResult();
    const out = formatGithubActions(result);
    expect(out.trim()).toBe('');
  });
});

describe('formatHtml', () => {
  it('returns a string containing DOCTYPE html', () => {
    const result = makeResult({ violations: [makeViolation('missing-alt-text')] });
    const out = formatHtml([{ result, file: 'test.html' }], defaultConfig);
    expect(out).toContain('<!DOCTYPE html>');
  });

  it('contains dark background color in styles', () => {
    const result = makeResult();
    const out = formatHtml([{ result, file: 'test.html' }], defaultConfig);
    expect(out).toContain('#060612');
  });

  it('contains the violation rule ID in output', () => {
    const result = makeResult({ violations: [makeViolation('missing-alt-text')] });
    const out = formatHtml([{ result, file: 'test.html' }], defaultConfig);
    expect(out).toContain('missing-alt-text');
  });

  it('contains a11y-guard branding', () => {
    const result = makeResult();
    const out = formatHtml([{ result, file: 'test.html' }], defaultConfig);
    expect(out).toContain('a11y-guard');
  });

  it('shows empty state message when no violations', () => {
    const result = makeResult();
    const out = formatHtml([{ result, file: 'test.html' }], defaultConfig);
    expect(out).toContain('All clear');
  });

  it('does not show empty state when violations exist', () => {
    const result = makeResult({ violations: [makeViolation('missing-alt-text')] });
    const out = formatHtml([{ result, file: 'test.html' }], defaultConfig);
    expect(out).not.toContain('All clear');
  });

  it('aggregates violations from multiple files', () => {
    const r1 = makeResult({ violations: [makeViolation('missing-alt-text')] });
    const r2 = makeResult({ violations: [makeViolation('html-has-lang')] });
    const out = formatHtml([{ result: r1, file: 'a.html' }, { result: r2, file: 'b.html' }], defaultConfig);
    expect(out).toContain('missing-alt-text');
    expect(out).toContain('html-has-lang');
  });
});
