import { describe, it, expect } from 'vitest';
import { runAudit } from '../engine.js';

function findViolations(html: string, ruleId: string) {
  const result = runAudit({ html, isComponentFile: true });
  return [...result.violations, ...result.warnings].filter((v) => v.ruleId === ruleId);
}

function fullDoc(body: string, lang = 'en', title = 'Test'): string {
  return `<html lang="${lang}"><head><title>${title}</title></head><body>${body}</body></html>`;
}

describe('missing-alt-text', () => {
  it('fires error for img with no alt', () => {
    const result = runAudit({ html: fullDoc('<img src="x.png">'), isComponentFile: true });
    const v = [...result.violations, ...result.warnings].filter((v) => v.ruleId === 'missing-alt-text');
    expect(v.length).toBeGreaterThan(0);
    expect(v[0]!.severity).toBe('error');
  });

  it('fires warning for img with empty alt and no role=presentation', () => {
    const result = runAudit({ html: fullDoc('<img src="x.png" alt="">'), isComponentFile: true });
    const v = [...result.violations, ...result.warnings].filter((v) => v.ruleId === 'missing-alt-text');
    expect(v.length).toBeGreaterThan(0);
    expect(v[0]!.severity).toBe('warning');
  });

  it('passes for img with descriptive alt', () => {
    const v = findViolations(fullDoc('<img src="x.png" alt="A cat sitting on a mat">'), 'missing-alt-text');
    expect(v).toHaveLength(0);
  });

  it('passes for img with aria-hidden=true', () => {
    const v = findViolations(fullDoc('<img src="x.png" aria-hidden="true">'), 'missing-alt-text');
    expect(v).toHaveLength(0);
  });

  it('passes for img with role=presentation', () => {
    const v = findViolations(fullDoc('<img src="x.png" role="presentation">'), 'missing-alt-text');
    expect(v).toHaveLength(0);
  });
});

describe('label-association', () => {
  it('fires error for input with no label', () => {
    const v = findViolations(fullDoc('<input type="text">'), 'label-association');
    expect(v.length).toBeGreaterThan(0);
    expect(v[0]!.severity).toBe('error');
  });

  it('passes for input with aria-label', () => {
    const v = findViolations(fullDoc('<input type="text" aria-label="Email">'), 'label-association');
    expect(v).toHaveLength(0);
  });

  it('passes for input with associated label[for]', () => {
    const v = findViolations(fullDoc('<label for="em">Email</label><input type="text" id="em">'), 'label-association');
    expect(v).toHaveLength(0);
  });

  it('passes for hidden input', () => {
    const v = findViolations(fullDoc('<input type="hidden" name="token">'), 'label-association');
    expect(v).toHaveLength(0);
  });

  it('passes for input with aria-labelledby', () => {
    const v = findViolations(fullDoc('<span id="lbl">Email</span><input type="text" aria-labelledby="lbl">'), 'label-association');
    expect(v).toHaveLength(0);
  });
});

describe('html-has-lang', () => {
  it('fires for html without lang attribute', () => {
    const result = runAudit({ html: '<html><head><title>T</title></head><body><main><p>Hi</p></main></body></html>' });
    const v = result.violations.filter((v) => v.ruleId === 'html-has-lang');
    expect(v.length).toBeGreaterThan(0);
  });

  it('fires for html with empty lang', () => {
    const result = runAudit({ html: '<html lang=""><head><title>T</title></head><body><main><p>Hi</p></main></body></html>' });
    const v = result.violations.filter((v) => v.ruleId === 'html-has-lang');
    expect(v.length).toBeGreaterThan(0);
  });

  it('passes for html with lang="en"', () => {
    const result = runAudit({ html: fullDoc('<main><p>Hi</p></main>') });
    const v = result.violations.filter((v) => v.ruleId === 'html-has-lang');
    expect(v).toHaveLength(0);
  });
});

describe('page-title', () => {
  it('fires error when title element is missing', () => {
    const result = runAudit({ html: '<html lang="en"><head></head><body><main><p>Hi</p></main></body></html>' });
    const v = result.violations.filter((v) => v.ruleId === 'page-title');
    expect(v.length).toBeGreaterThan(0);
  });

  it('fires error for empty title', () => {
    const result = runAudit({ html: '<html lang="en"><head><title></title></head><body><main><p>Hi</p></main></body></html>' });
    const v = result.violations.filter((v) => v.ruleId === 'page-title');
    expect(v.length).toBeGreaterThan(0);
  });

  it('passes with proper title', () => {
    const result = runAudit({ html: fullDoc('<main><p>Hi</p></main>') });
    const v = result.violations.filter((v) => v.ruleId === 'page-title');
    expect(v).toHaveLength(0);
  });
});

describe('heading-order', () => {
  it('fires warning when h1 is followed by h3', () => {
    const v = findViolations(fullDoc('<h1>Title</h1><h3>Subsection</h3>'), 'heading-order');
    expect(v.length).toBeGreaterThan(0);
    expect(v[0]!.severity).toBe('warning');
  });

  it('passes when h1 is followed by h2', () => {
    const v = findViolations(fullDoc('<h1>Title</h1><h2>Section</h2>'), 'heading-order');
    expect(v).toHaveLength(0);
  });

  it('passes with single heading', () => {
    const v = findViolations(fullDoc('<h1>Only heading</h1>'), 'heading-order');
    expect(v).toHaveLength(0);
  });
});

describe('link-purpose', () => {
  it('fires warning for ambiguous link text "click here"', () => {
    const v = findViolations(fullDoc('<a href="/page">click here</a>'), 'link-purpose');
    expect(v.length).toBeGreaterThan(0);
    expect(v[0]!.severity).toBe('warning');
  });

  it('fires warning for link text "read more"', () => {
    const v = findViolations(fullDoc('<a href="/page">read more</a>'), 'link-purpose');
    expect(v.length).toBeGreaterThan(0);
  });

  it('passes for descriptive link text', () => {
    const v = findViolations(fullDoc('<a href="/annual-report">Read the 2024 Annual Report</a>'), 'link-purpose');
    expect(v).toHaveLength(0);
  });

  it('passes for link with aria-label overriding ambiguous text', () => {
    const v = findViolations(fullDoc('<a href="/page" aria-label="Read the full article about accessibility">click here</a>'), 'link-purpose');
    expect(v).toHaveLength(0);
  });
});

describe('landmark-regions', () => {
  it('fires warning when page has no main landmark', () => {
    const result = runAudit({ html: '<html lang="en"><head><title>T</title></head><body><p>Content</p></body></html>' });
    const v = [...result.violations, ...result.warnings].filter((v) => v.ruleId === 'landmark-regions');
    expect(v.length).toBeGreaterThan(0);
    expect(v[0]!.severity).toBe('warning');
  });

  it('passes when page has a main element', () => {
    const result = runAudit({ html: fullDoc('<main><p>Content</p></main>') });
    const v = [...result.violations, ...result.warnings].filter((v) => v.ruleId === 'landmark-regions');
    expect(v).toHaveLength(0);
  });

  it('passes when page has role="main"', () => {
    const result = runAudit({ html: fullDoc('<div role="main"><p>Content</p></div>') });
    const v = [...result.violations, ...result.warnings].filter((v) => v.ruleId === 'landmark-regions');
    expect(v).toHaveLength(0);
  });
});

describe('aria-required-attr', () => {
  it('fires error for role=checkbox missing aria-checked', () => {
    const v = findViolations(fullDoc('<div role="checkbox" tabindex="0">Option</div>'), 'aria-required-attr');
    expect(v.length).toBeGreaterThan(0);
    expect(v[0]!.severity).toBe('error');
    expect(v[0]!.message).toContain('aria-checked');
  });

  it('passes for role=checkbox with aria-checked', () => {
    const v = findViolations(fullDoc('<div role="checkbox" aria-checked="false" tabindex="0">Option</div>'), 'aria-required-attr');
    expect(v).toHaveLength(0);
  });

  it('fires error for role=combobox missing aria-expanded', () => {
    const v = findViolations(fullDoc('<div role="combobox"><input></div>'), 'aria-required-attr');
    expect(v.some((v) => v.message.includes('aria-expanded'))).toBe(true);
  });

  it('passes for role=tab (no required attrs)', () => {
    const v = findViolations(fullDoc('<div role="tab">Tab 1</div>'), 'aria-required-attr');
    expect(v).toHaveLength(0);
  });
});

describe('duplicate-id', () => {
  it('fires error when two elements share the same id', () => {
    const v = findViolations(fullDoc('<div id="foo">A</div><div id="foo">B</div>'), 'duplicate-id');
    expect(v.length).toBeGreaterThan(0);
    expect(v[0]!.severity).toBe('error');
    expect(v[0]!.message).toContain('foo');
  });

  it('passes when all ids are unique', () => {
    const v = findViolations(fullDoc('<div id="foo">A</div><div id="bar">B</div>'), 'duplicate-id');
    expect(v).toHaveLength(0);
  });

  it('reports each duplicate id only once', () => {
    const v = findViolations(fullDoc('<div id="dup">A</div><div id="dup">B</div><div id="dup">C</div>'), 'duplicate-id');
    expect(v).toHaveLength(1);
  });
});

describe('skip-links', () => {
  it('fires warning when nav exists but no skip link is present', () => {
    const html = fullDoc('<nav><ul><li><a href="/home">Home</a></li></ul></nav><main><p>Content</p></main>');
    const result = runAudit({ html });
    const v = [...result.violations, ...result.warnings].filter((v) => v.ruleId === 'skip-links');
    expect(v.length).toBeGreaterThan(0);
    expect(v[0]!.severity).toBe('warning');
  });

  it('passes when skip link is present before nav', () => {
    const html = fullDoc('<a href="#main-content">Skip to main content</a><nav><ul><li><a href="/home">Home</a></li></ul></nav><main id="main-content"><p>Content</p></main>');
    const result = runAudit({ html });
    const v = [...result.violations, ...result.warnings].filter((v) => v.ruleId === 'skip-links');
    expect(v).toHaveLength(0);
  });

  it('does not fire when there is no nav element', () => {
    const html = fullDoc('<main><p>Content with no nav</p></main>');
    const result = runAudit({ html });
    const v = [...result.violations, ...result.warnings].filter((v) => v.ruleId === 'skip-links');
    expect(v).toHaveLength(0);
  });
});

describe('keyboard-accessible', () => {
  it('fires error for div with onclick but no tabindex', () => {
    const v = findViolations(fullDoc('<div onclick="doSomething()">Click me</div>'), 'keyboard-accessible');
    expect(v.length).toBeGreaterThan(0);
    expect(v[0]!.severity).toBe('error');
  });

  it('passes for button with onclick', () => {
    const v = findViolations(fullDoc('<button onclick="doSomething()">Click me</button>'), 'keyboard-accessible');
    expect(v.filter((viol) => viol.severity === 'error')).toHaveLength(0);
  });

  it('passes for div with onclick and role=button and tabindex=0', () => {
    const v = findViolations(fullDoc('<div onclick="doSomething()" role="button" tabindex="0">Click me</div>'), 'keyboard-accessible');
    expect(v.filter((viol) => viol.severity === 'error')).toHaveLength(0);
  });

  it('fires warning for positive tabindex', () => {
    const v = findViolations(fullDoc('<button tabindex="2">Submit</button>'), 'keyboard-accessible');
    expect(v.length).toBeGreaterThan(0);
    expect(v[0]!.severity).toBe('warning');
  });
});
