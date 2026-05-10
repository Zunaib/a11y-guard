import { parseDocument } from 'htmlparser2';
import { DomHandler, type ChildNode, type AnyNode, type Element as HP2Element, type ParentNode, type Document } from 'domhandler';
import { selectAll as cssSelectAll, selectOne as cssSelectOne } from 'css-select';
import { getOuterHTML, getInnerHTML, getText } from 'domutils';

export type DomNode = AnyNode;
export type DomElement = HP2Element;
export type DomDocument = Document;

export function parseHtml(html: string): DomDocument {
  const handler = new DomHandler();
  const parser = parseDocument(html, { decodeEntities: true });
  return parser as unknown as DomDocument;
}

function isElement(node: DomNode): node is DomElement {
  return (node as DomElement).type === 'tag' || (node as DomElement).type === 'script' || (node as DomElement).type === 'style';
}

export class WrappedElement {
  readonly tagName: string;
  readonly outerHTML: string;

  constructor(private readonly el: DomElement) {
    this.tagName = el.name.toUpperCase();
    this.outerHTML = getOuterHTML(el);
  }

  getAttribute(name: string): string | null {
    const val = this.el.attribs[name];
    return val !== undefined ? val : null;
  }

  hasAttribute(name: string): boolean {
    return name in this.el.attribs;
  }

  get textContent(): string {
    return getText(this.el);
  }

  get attributes(): Array<{ name: string; value: string }> {
    return Object.entries(this.el.attribs).map(([name, value]) => ({ name, value }));
  }

  get parentElement(): WrappedElement | null {
    const p = this.el.parent;
    if (!p || !isElement(p as DomNode)) return null;
    return new WrappedElement(p as DomElement);
  }

  querySelector(selector: string): WrappedElement | null {
    const found = cssSelectOne(selector, this.el.children ?? []);
    return found && isElement(found) ? new WrappedElement(found) : null;
  }

  querySelectorAll(selector: string): WrappedElement[] {
    return cssSelectAll(selector, this.el.children ?? [])
      .filter(isElement)
      .map((el) => new WrappedElement(el as DomElement));
  }

  // Allow rules to use raw el for nested querying
  get _raw(): DomElement {
    return this.el;
  }
}

export class WrappedDocument {
  constructor(private readonly doc: DomDocument) {}

  querySelector(selector: string): WrappedElement | null {
    const found = cssSelectOne(selector, (this.doc as unknown as { children: AnyNode[] }).children ?? []);
    return found && isElement(found) ? new WrappedElement(found) : null;
  }

  querySelectorAll(selector: string): WrappedElement[] {
    return cssSelectAll(selector, (this.doc as unknown as { children: AnyNode[] }).children ?? [])
      .filter(isElement)
      .map((el) => new WrappedElement(el as DomElement));
  }
}
