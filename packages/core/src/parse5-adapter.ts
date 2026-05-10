import type { Adapter } from 'css-select';
import type { ChildNode, Document, Element, ParentNode, TextNode } from 'parse5/dist/tree-adapters/default.js';

type P5Node = ChildNode | Document;

function isElement(node: P5Node): node is Element {
  return (node as Element).tagName !== undefined;
}

function isParent(node: P5Node): node is ParentNode {
  return Array.isArray((node as ParentNode).childNodes);
}

export const adapter: Adapter<P5Node, Element> = {
  isTag: isElement,

  existsOne(test, elems) {
    return elems.some((el) => test(el) || (isParent(el) && adapter.existsOne(test, el.childNodes as Element[])));
  },

  getAttributeValue(elem, name) {
    const attr = elem.attrs?.find((a) => a.name === name);
    return attr?.value ?? null;
  },

  getChildren(node) {
    if (isParent(node)) return node.childNodes as Element[];
    return [];
  },

  getName(elem) {
    return elem.tagName;
  },

  getParent(node) {
    return (node as { parentNode?: Element }).parentNode ?? null;
  },

  getSiblings(node) {
    const parent = (node as { parentNode?: ParentNode }).parentNode;
    if (!parent) return [node as Element];
    return parent.childNodes as Element[];
  },

  getText(node) {
    if (!isParent(node)) return (node as TextNode).value ?? '';
    return (node.childNodes as P5Node[]).map((c) => adapter.getText(c as Element)).join('');
  },

  hasAttrib(elem, name) {
    return elem.attrs?.some((a) => a.name === name) ?? false;
  },

  removeSubsets(nodes) {
    return nodes.filter((node, i) => {
      for (let j = 0; j < nodes.length; j++) {
        if (i === j) continue;
        let current: P5Node | null = node;
        while (current) {
          if (current === nodes[j]) return false;
          current = (current as { parentNode?: P5Node }).parentNode ?? null;
        }
      }
      return true;
    });
  },

  findAll(test, nodes) {
    const results: Element[] = [];
    for (const node of nodes) {
      if (isElement(node) && test(node)) results.push(node);
      if (isParent(node)) {
        results.push(...adapter.findAll(test, node.childNodes as Element[]));
      }
    }
    return results;
  },

  findOne(test, nodes) {
    for (const node of nodes) {
      if (isElement(node) && test(node)) return node;
      if (isParent(node)) {
        const found = adapter.findOne(test, node.childNodes as Element[]);
        if (found) return found;
      }
    }
    return null;
  },
};
