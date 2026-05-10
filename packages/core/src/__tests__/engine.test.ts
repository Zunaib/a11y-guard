import { describe, it, expect } from 'vitest';
import { runAudit } from '../engine.js';

const FULL_DOC_PASS = `<html lang="en"><head><title>Test</title></head><body><main><p>Hello</p></main></body></html>`;

describe('runAudit', () => {
  it('returns violations for img without alt', () => {
    const result = runAudit({
      html: `<html lang="en"><head><title>T</title></head><body><main><img src="x.png"></main></body></html>`,
    });
    const ruleIds = [...result.violations, ...result.warnings].map((v) => v.ruleId);
    expect(ruleIds).toContain('missing-alt-text');
  });

  it('returns a violation for html missing lang', () => {
    const result = runAudit({
      html: `<html><head><title>T</title></head><body><main><p>Hi</p></main></body></html>`,
    });
    const ruleIds = result.violations.map((v) => v.ruleId);
    expect(ruleIds).toContain('html-has-lang');
  });

  it('returns no violations for valid full-page HTML', () => {
    const result = runAudit({ html: FULL_DOC_PASS });
    expect(result.violations).toHaveLength(0);
  });

  it('skips html-has-lang when isComponentFile:true', () => {
    const result = runAudit({
      html: `<html><head></head><body><div><p>Hi</p></div></body></html>`,
      isComponentFile: true,
    });
    const ruleIds = result.violations.map((v) => v.ruleId);
    expect(ruleIds).not.toContain('html-has-lang');
  });

  it('skips page-title when isComponentFile:true', () => {
    const result = runAudit({
      html: `<html lang="en"><head></head><body><div><p>Hi</p></div></body></html>`,
      isComponentFile: true,
    });
    const ruleIds = result.violations.map((v) => v.ruleId);
    expect(ruleIds).not.toContain('page-title');
  });

  it('skips landmark-regions when isComponentFile:true', () => {
    const result = runAudit({
      html: `<html lang="en"><head><title>T</title></head><body><p>Hi</p></body></html>`,
      isComponentFile: true,
    });
    const allIds = [...result.violations, ...result.warnings].map((v) => v.ruleId);
    expect(allIds).not.toContain('landmark-regions');
  });

  it('runs html-has-lang when isComponentFile:false', () => {
    const result = runAudit({
      html: `<html><head><title>T</title></head><body><main><p>Hi</p></main></body></html>`,
      isComponentFile: false,
    });
    const ruleIds = result.violations.map((v) => v.ruleId);
    expect(ruleIds).toContain('html-has-lang');
  });

  it('US-only config suppresses EU-only violations', () => {
    const result = runAudit({
      html: `<html><head><title>T</title></head><body><main><p>hi</p></main></body></html>`,
      regions: ['US'],
    });
    for (const v of result.violations) {
      expect(v.regions.some((r) => r === 'US')).toBe(true);
    }
  });

  it('disabling missing-alt-text via rules:off suppresses that rule', () => {
    const result = runAudit({
      html: `<html lang="en"><head><title>T</title></head><body><main><img src="x.png"></main></body></html>`,
      rules: { 'missing-alt-text': 'off' },
    });
    const ruleIds = [...result.violations, ...result.warnings].map((v) => v.ruleId);
    expect(ruleIds).not.toContain('missing-alt-text');
  });

  it('severity override changes violation severity from error to warning', () => {
    const result = runAudit({
      html: `<html><head><title>T</title></head><body><main><p>Hi</p></main></body></html>`,
      rules: { 'html-has-lang': 'warning' },
    });
    const all = [...result.violations, ...result.warnings];
    const overridden = all.find((v) => v.ruleId === 'html-has-lang');
    expect(overridden).toBeDefined();
    expect(overridden!.severity).toBe('warning');
    const inViolations = result.violations.find((v) => v.ruleId === 'html-has-lang');
    expect(inViolations).toBeUndefined();
  });

  it('returned audit result has violations, warnings and passed counts', () => {
    const result = runAudit({ html: FULL_DOC_PASS });
    expect(result).toHaveProperty('violations');
    expect(result).toHaveProperty('warnings');
    expect(result).toHaveProperty('passed');
    expect(typeof result.passed).toBe('number');
  });

  it('compliance summary includes byRegion, byLaw, byDisabilityType', () => {
    const result = runAudit({ html: FULL_DOC_PASS });
    expect(result.summary).toHaveProperty('byRegion');
    expect(result.summary).toHaveProperty('byLaw');
    expect(result.summary).toHaveProperty('byDisabilityType');
  });
});
