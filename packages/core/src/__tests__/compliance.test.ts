import { describe, it, expect } from 'vitest';
import {
  getCriterion,
  getApplicableLaws,
  getApplicableRegions,
  filterCriteriaByConfig,
} from '../compliance/matrix.js';

describe('getCriterion', () => {
  it('returns criterion with correct id for 1.1.1', () => {
    const c = getCriterion('1.1.1');
    expect(c.id).toBe('1.1.1');
  });

  it('returns criterion with correct name for 1.1.1', () => {
    const c = getCriterion('1.1.1');
    expect(c.name).toBe('Non-text Content');
  });

  it('returns Level A for criterion 1.1.1', () => {
    const c = getCriterion('1.1.1');
    expect(c.level).toBe('A');
  });

  it('returns Level AA for criterion 1.4.3', () => {
    const c = getCriterion('1.4.3');
    expect(c.level).toBe('AA');
  });

  it('throws for unknown criterion', () => {
    expect(() => getCriterion('9.9.9')).toThrow();
  });

  it('returns wcagVersion for known criterion', () => {
    const c = getCriterion('1.1.1');
    expect(c.wcagVersion).toBe('2.0');
  });

  it('returns a url for the criterion', () => {
    const c = getCriterion('1.1.1');
    expect(c.url).toContain('w3.org');
  });
});

describe('getApplicableLaws', () => {
  it('returns ADA and Section508 for criterion 1.1.1 with US region', () => {
    const laws = getApplicableLaws('1.1.1', { regions: ['US'] });
    expect(laws).toContain('ADA');
    expect(laws).toContain('Section508');
  });

  it('returns EAA for criterion 1.1.1 with EU region', () => {
    const laws = getApplicableLaws('1.1.1', { regions: ['EU'] });
    expect(laws).toContain('EAA');
  });

  it('returns only ADA when filtering by laws:[ADA]', () => {
    const laws = getApplicableLaws('1.1.1', { laws: ['ADA'] });
    expect(laws).toContain('ADA');
    expect(laws).not.toContain('EAA');
  });

  it('returns all applicable laws when no filter is provided', () => {
    const laws = getApplicableLaws('1.1.1');
    expect(laws.length).toBeGreaterThan(1);
  });

  it('does not return EU laws when filtering by US region', () => {
    const laws = getApplicableLaws('1.1.1', { regions: ['US'] });
    expect(laws).not.toContain('EAA');
    expect(laws).not.toContain('EN301549');
  });
});

describe('getApplicableRegions', () => {
  it('returns US for criterion 1.1.1 with laws:[ADA]', () => {
    const regions = getApplicableRegions('1.1.1', { laws: ['ADA'] });
    expect(regions).toContain('US');
  });

  it('returns US for criterion 1.1.1 with laws:[Section508]', () => {
    const regions = getApplicableRegions('1.1.1', { laws: ['Section508'] });
    expect(regions).toContain('US');
  });

  it('does not return EU when filtering by US region', () => {
    const regions = getApplicableRegions('1.1.1', { regions: ['US'] });
    expect(regions).not.toContain('EU');
  });

  it('returns multiple regions when no filter is provided', () => {
    const regions = getApplicableRegions('1.1.1');
    expect(regions.length).toBeGreaterThan(1);
  });
});

describe('filterCriteriaByConfig', () => {
  it('with regions:[US] returns criteria that include US', () => {
    const criteria = filterCriteriaByConfig({ regions: ['US'] });
    expect(criteria.length).toBeGreaterThan(0);
    for (const c of criteria) {
      expect(c.regions).toContain('US');
    }
  });

  it('with level:A returns only Level A criteria', () => {
    const criteria = filterCriteriaByConfig({ level: 'A', wcagVersion: '2.1' });
    expect(criteria.length).toBeGreaterThan(0);
    for (const c of criteria) {
      expect(c.level).toBe('A');
    }
  });

  it('with level:AA returns Level A and AA criteria', () => {
    const criteria = filterCriteriaByConfig({ level: 'AA', wcagVersion: '2.1' });
    const levels = new Set(criteria.map((c) => c.level));
    expect(levels.has('A')).toBe(true);
    expect(levels.has('AA')).toBe(true);
    expect(levels.has('AAA')).toBe(false);
  });

  it('with wcagVersion:2.0 excludes 2.1-specific criteria', () => {
    const criteria = filterCriteriaByConfig({ wcagVersion: '2.0', level: 'AA' });
    for (const c of criteria) {
      expect(['2.0']).toContain(c.wcagVersion);
    }
  });

  it('1.1.1 is included in default AA config', () => {
    const criteria = filterCriteriaByConfig({});
    const ids = criteria.map((c) => c.id);
    expect(ids).toContain('1.1.1');
  });

  it('with disabilityTypes:[visual] returns only visual criteria', () => {
    const criteria = filterCriteriaByConfig({ disabilityTypes: ['visual'] });
    expect(criteria.length).toBeGreaterThan(0);
    for (const c of criteria) {
      expect(c.disabilityTypes).toContain('visual');
    }
  });

  it('with laws:[ADA] returns only criteria that include ADA', () => {
    const criteria = filterCriteriaByConfig({ laws: ['ADA'] });
    expect(criteria.length).toBeGreaterThan(0);
    for (const c of criteria) {
      expect(c.laws).toContain('ADA');
    }
  });
});
