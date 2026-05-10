import { parse } from '@babel/parser';
import type {
  Node,
  JSXElement,
  JSXFragment,
  JSXOpeningElement,
  JSXAttribute,
  JSXSpreadAttribute,
  JSXExpressionContainer,
  JSXText,
  JSXIdentifier,
  JSXMemberExpression,
  JSXNamespacedName,
  StringLiteral,
} from '@babel/types';

// Map JSX attribute names to their HTML equivalents
const JSX_TO_HTML_ATTR: Record<string, string> = {
  className: 'class',
  htmlFor: 'for',
  tabIndex: 'tabindex',
  readOnly: 'readonly',
  autoPlay: 'autoplay',
  autoFocus: 'autofocus',
  crossOrigin: 'crossorigin',
  maxLength: 'maxlength',
  minLength: 'minlength',
  noValidate: 'novalidate',
};

function getJsxTagName(
  name: JSXIdentifier | JSXMemberExpression | JSXNamespacedName,
): string {
  if (name.type === 'JSXIdentifier') return name.name;
  if (name.type === 'JSXNamespacedName') return `${name.namespace.name}:${name.name.name}`;
  // JSXMemberExpression — e.g. Foo.Bar
  return getJsxTagName(name.object) + '.' + name.property.name;
}

function isCustomComponent(tagName: string): boolean {
  // Custom components start with uppercase or contain a dot (namespaced/member)
  return /^[A-Z]/.test(tagName) || tagName.includes('.');
}

function serializeAttrValue(value: JSXAttribute['value']): string {
  if (value === null) {
    // Boolean attribute — presence alone (e.g. <input disabled />)
    return '';
  }
  if (value === undefined) {
    return '';
  }
  if (value.type === 'StringLiteral') {
    return (value as StringLiteral).value;
  }
  if (value.type === 'JSXExpressionContainer') {
    const expr = (value as JSXExpressionContainer).expression;
    if (expr.type === 'JSXEmptyExpression') return '';
    if (expr.type === 'StringLiteral') return (expr as StringLiteral).value;
    if (expr.type === 'NumericLiteral') return String((expr as { type: string; value: number }).value);
    if (expr.type === 'BooleanLiteral') return String((expr as { type: string; value: boolean }).value);
    // Dynamic expression — use placeholder so rules can detect it
    return '__dynamic__';
  }
  if (value.type === 'JSXElement' || value.type === 'JSXFragment') {
    // Unusual but possible; use placeholder
    return '__dynamic__';
  }
  return '__dynamic__';
}

function serializeAttrs(attrs: Array<JSXAttribute | JSXSpreadAttribute>): string {
  const parts: string[] = [];
  for (const attr of attrs) {
    if (attr.type === 'JSXSpreadAttribute') {
      // Spread props — we can't know what they contain statically
      continue;
    }
    // attr is JSXAttribute
    const rawName =
      attr.name.type === 'JSXIdentifier'
        ? attr.name.name
        : `${attr.name.namespace.name}:${attr.name.name.name}`;

    // Keep aria-* and data-* as-is; map known JSX names; otherwise lowercase
    let htmlName: string;
    if (rawName.startsWith('aria-') || rawName.startsWith('data-')) {
      htmlName = rawName;
    } else {
      htmlName = JSX_TO_HTML_ATTR[rawName] ?? rawName.toLowerCase();
    }

    const value = serializeAttrValue(attr.value);
    if (attr.value === null) {
      // Boolean attribute with no value
      parts.push(htmlName);
    } else {
      parts.push(`${htmlName}="${value.replace(/"/g, '&quot;')}"`);
    }
  }
  return parts.length > 0 ? ' ' + parts.join(' ') : '';
}

function isVoidElement(tag: string): boolean {
  const VOID = new Set([
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
    'link', 'meta', 'param', 'source', 'track', 'wbr',
  ]);
  return VOID.has(tag.toLowerCase());
}

function serializeChildren(
  children: JSXElement['children'],
): string {
  return children.map(serializeJsxChild).join('');
}

function serializeJsxChild(child: JSXElement['children'][number]): string {
  switch (child.type) {
    case 'JSXElement':
      return serializeJsxElement(child as JSXElement);
    case 'JSXFragment':
      return serializeChildren((child as JSXFragment).children);
    case 'JSXText': {
      const text = (child as JSXText).value;
      // Collapse whitespace-only JSX text (newlines/spaces between elements)
      return text.replace(/\n\s*/g, ' ');
    }
    case 'JSXExpressionContainer': {
      const expr = (child as JSXExpressionContainer).expression;
      if (expr.type === 'JSXEmptyExpression') return '';
      if (expr.type === 'StringLiteral') return (expr as StringLiteral).value;
      if (expr.type === 'NumericLiteral') return String((expr as { type: string; value: number }).value);
      // Dynamic expression value — output empty string for child content
      return '';
    }
    case 'JSXSpreadChild':
      return '';
    default:
      return '';
  }
}

function serializeJsxElement(el: JSXElement): string {
  const opening = el.openingElement as JSXOpeningElement;
  const tagName = getJsxTagName(opening.name);

  if (isCustomComponent(tagName)) {
    // Pass-through wrapper — render children only
    return serializeChildren(el.children);
  }

  const attrs = serializeAttrs(opening.attributes);
  const tag = tagName.toLowerCase();

  if (opening.selfClosing || isVoidElement(tag)) {
    return `<${tag}${attrs}>`;
  }

  const inner = serializeChildren(el.children);
  return `<${tag}${attrs}>${inner}</${tag}>`;
}

function walkNode(node: Node, collector: string[]): void {
  if (!node) return;

  if (node.type === 'JSXElement') {
    collector.push(serializeJsxElement(node as JSXElement));
    return; // serializeJsxElement already recurses into children
  }

  if (node.type === 'JSXFragment') {
    const frag = node as JSXFragment;
    for (const child of frag.children) {
      walkNode(child as Node, collector);
    }
    return;
  }

  // Walk into statement/expression nodes to find JSX
  const anyNode = node as unknown as Record<string, unknown>;

  const childKeys = [
    'body', 'declarations', 'declaration', 'expression',
    'consequent', 'alternate', 'argument', 'arguments',
    'callee', 'init', 'left', 'right', 'object', 'property',
    'elements', 'properties', 'value', 'params',
    'returnType', 'typeAnnotation',
  ];

  for (const key of childKeys) {
    const child = anyNode[key];
    if (!child) continue;
    if (Array.isArray(child)) {
      for (const item of child) {
        if (item && typeof item === 'object' && 'type' in item) {
          walkNode(item as Node, collector);
        }
      }
    } else if (typeof child === 'object' && 'type' in (child as object)) {
      walkNode(child as Node, collector);
    }
  }
}

/**
 * Parse a JSX/TSX source file and convert it to an HTML string suitable
 * for a11y-guard rule evaluation.
 *
 * @param source   - Raw source code of the JSX/TSX file
 * @param filename - Optional filename (used only for error messages)
 * @returns An HTML document string, or a minimal empty-body document on parse error
 */
export function parseJsx(source: string, filename?: string): string {
  let ast;
  try {
    ast = parse(source, {
      sourceType: 'module',
      plugins: [
        'jsx',
        'typescript',
        'decorators-legacy',
        'classProperties',
        'classPrivateProperties',
        'classPrivateMethods',
        'optionalChaining',
        'nullishCoalescingOperator',
      ],
    });
  } catch (err) {
    const label = filename ?? 'unknown file';
    console.warn(`[a11y-guard] Failed to parse JSX/TSX in ${label}: ${(err as Error).message}`);
    return '<html lang="en"><head><title>Component Scan</title></head><body></body></html>';
  }

  const bodyParts: string[] = [];

  for (const statement of ast.program.body) {
    walkNode(statement as Node, bodyParts);
  }

  const bodyHtml = bodyParts.join('\n');

  return [
    '<html lang="en">',
    '<head><title>Component Scan</title></head>',
    '<body>',
    bodyHtml,
    '</body>',
    '</html>',
  ].join('\n');
}
