import { describe, it, expect } from 'vitest';
import { parseJsx } from '../jsx-scanner.js';

describe('parseJsx', () => {
  it('wraps output in html/body structure', () => {
    const html = parseJsx(`export default function A() { return <div>Hello</div>; }`);
    expect(html).toContain('<html');
    expect(html).toContain('<body>');
    expect(html).toContain('</body>');
    expect(html).toContain('</html>');
  });

  it('basic JSX element renders to HTML', () => {
    const html = parseJsx(`export default function A() { return <img src="x" />; }`);
    expect(html).toContain('<img');
    expect(html).toContain('src="x"');
  });

  it('className maps to class', () => {
    const html = parseJsx(`export default function A() { return <div className="container">Hello</div>; }`);
    expect(html).toContain('class="container"');
    expect(html).not.toContain('className');
  });

  it('htmlFor maps to for', () => {
    const html = parseJsx(`export default function A() { return <label htmlFor="email">Email</label>; }`);
    expect(html).toContain('for="email"');
    expect(html).not.toContain('htmlFor');
  });

  it('tabIndex maps to tabindex', () => {
    const html = parseJsx(`export default function A() { return <div tabIndex={0}>Click</div>; }`);
    expect(html).toContain('tabindex="0"');
    expect(html).not.toContain('tabIndex');
  });

  it('aria-label passes through unchanged', () => {
    const html = parseJsx(`export default function A() { return <button aria-label="Close dialog">X</button>; }`);
    expect(html).toContain('aria-label="Close dialog"');
  });

  it('data-testid passes through unchanged', () => {
    const html = parseJsx(`export default function A() { return <div data-testid="hero-section">Content</div>; }`);
    expect(html).toContain('data-testid="hero-section"');
  });

  it('dynamic expression value becomes __dynamic__', () => {
    const html = parseJsx(`export default function A({ label }) { return <img alt={label} />; }`);
    expect(html).toContain('alt="__dynamic__"');
  });

  it('string literal in expression keeps real value', () => {
    const html = parseJsx(`export default function A() { return <img alt={"A cat"} />; }`);
    expect(html).toContain('alt="A cat"');
  });

  it('numeric literal in expression keeps value', () => {
    const html = parseJsx(`export default function A() { return <div tabIndex={0}>X</div>; }`);
    expect(html).toContain('tabindex="0"');
  });

  it('custom uppercase components are transparent and render children', () => {
    const html = parseJsx(`export default function A() { return <Wrapper><p>Content</p></Wrapper>; }`);
    expect(html).toContain('<p>Content</p>');
    expect(html).not.toContain('<wrapper');
    expect(html).not.toContain('<Wrapper');
  });

  it('dot-notation custom components are transparent', () => {
    const html = parseJsx(`export default function A() { return <UI.Card><span>Text</span></UI.Card>; }`);
    expect(html).toContain('<span>Text</span>');
  });

  it('Fragment renders children without wrapper', () => {
    const html = parseJsx(`
      import React from 'react';
      export default function A() {
        return <>
          <h1>Title</h1>
          <p>Body</p>
        </>;
      }
    `);
    expect(html).toContain('<h1>Title</h1>');
    expect(html).toContain('<p>Body</p>');
  });

  it('self-closing br renders as void element', () => {
    const html = parseJsx(`export default function A() { return <div>Line1<br />Line2</div>; }`);
    expect(html).toContain('<br>');
    expect(html).not.toContain('</br>');
  });

  it('self-closing input renders as void element', () => {
    const html = parseJsx(`export default function A() { return <input type="text" />; }`);
    expect(html).toContain('<input');
    expect(html).not.toContain('</input>');
  });

  it('parse error on invalid syntax returns a safe empty document without throwing', () => {
    expect(() => parseJsx('this is not valid javascript @@##!!')).not.toThrow();
    const html = parseJsx('this is not valid javascript @@##!!');
    expect(html).toContain('<html');
    expect(html).toContain('<body>');
  });

  it('boolean attribute with no value serializes correctly', () => {
    const html = parseJsx(`export default function A() { return <input disabled />; }`);
    expect(html).toContain('disabled');
  });
});
