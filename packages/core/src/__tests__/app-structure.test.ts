import { describe, it, expect } from 'vitest';
import { runAudit } from '../engine.js';

describe('app-level structural analysis', () => {
  it('combined HTML with no <main> triggers landmark-regions warning', () => {
    const html = `<html lang="en"><head><title>App</title></head><body><p>Content without main</p></body></html>`;
    const result = runAudit({ html, isComponentFile: false });
    const all = [...result.violations, ...result.warnings];
    expect(all.some((v) => v.ruleId === 'landmark-regions')).toBe(true);
  });

  it('combined HTML with <html lang="en"> does not trigger html-has-lang', () => {
    const html = `<html lang="en"><head><title>App</title></head><body><main><p>Content</p></main></body></html>`;
    const result = runAudit({ html, isComponentFile: false });
    const all = [...result.violations, ...result.warnings];
    expect(all.some((v) => v.ruleId === 'html-has-lang')).toBe(false);
  });

  it('combined HTML missing lang triggers html-has-lang', () => {
    const html = `<html><head><title>App</title></head><body><main><p>Content</p></main></body></html>`;
    const result = runAudit({ html, isComponentFile: false });
    expect(result.violations.some((v) => v.ruleId === 'html-has-lang')).toBe(true);
  });

  it('combined HTML with <title> in head does not trigger page-title', () => {
    const html = `<html lang="en"><head><title>My App</title></head><body><main><p>Content</p></main></body></html>`;
    const result = runAudit({ html, isComponentFile: false });
    const all = [...result.violations, ...result.warnings];
    expect(all.some((v) => v.ruleId === 'page-title')).toBe(false);
  });

  it('combined HTML missing title triggers page-title', () => {
    const html = `<html lang="en"><head></head><body><main><p>Content</p></main></body></html>`;
    const result = runAudit({ html, isComponentFile: false });
    expect(result.violations.some((v) => v.ruleId === 'page-title')).toBe(true);
  });

  it('isComponentFile:false runs all document-level rules', () => {
    const html = `<html><head></head><body><p>Minimal</p></body></html>`;
    const result = runAudit({ html, isComponentFile: false });
    const allRuleIds = new Set([...result.violations, ...result.warnings].map((v) => v.ruleId));
    expect(allRuleIds.has('html-has-lang')).toBe(true);
    expect(allRuleIds.has('page-title')).toBe(true);
    expect(allRuleIds.has('landmark-regions')).toBe(true);
  });

  it('isComponentFile:true skips all document-level rules', () => {
    const html = `<html><head></head><body><p>Component</p></body></html>`;
    const result = runAudit({ html, isComponentFile: true });
    const allRuleIds = new Set([...result.violations, ...result.warnings].map((v) => v.ruleId));
    expect(allRuleIds.has('html-has-lang')).toBe(false);
    expect(allRuleIds.has('page-title')).toBe(false);
    expect(allRuleIds.has('landmark-regions')).toBe(false);
  });

  it('component-level rules still run when isComponentFile:true', () => {
    const html = `<html lang="en"><head><title>T</title></head><body><img src="x.png"></body></html>`;
    const result = runAudit({ html, isComponentFile: true });
    const allRuleIds = new Set([...result.violations, ...result.warnings].map((v) => v.ruleId));
    expect(allRuleIds.has('missing-alt-text')).toBe(true);
  });

  it('full valid document returns zero violations', () => {
    const html = `<html lang="en"><head><title>Test App</title></head><body><main><h1>Welcome</h1><p>Content</p></main></body></html>`;
    const result = runAudit({ html, isComponentFile: false });
    expect(result.violations).toHaveLength(0);
  });

  it('audit result passed count is non-negative', () => {
    const html = `<html lang="en"><head><title>T</title></head><body><main><p>Hi</p></main></body></html>`;
    const result = runAudit({ html, isComponentFile: false });
    expect(result.passed).toBeGreaterThanOrEqual(0);
  });
});
