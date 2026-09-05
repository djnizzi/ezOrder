import { LineEnding, OrderedItem, XmlItemData, XmlMetadata } from '../../types';

export interface XmlSerializerOptions {
  lineEnding?: LineEnding;
  indent?: string;
}

export function formatXmlString(xml: string, indent = '  ', newline = '\n'): string {
  let formatted = '';
  let pad = 0;
  // Normalize whitespace between tags
  const cleanXml = xml.replace(/>\s*</g, '><').trim();

  // Split into tokens (tags vs text)
  const tokens = cleanXml.match(/(<[^>]+>|[^<]+)/g) || [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i].trim();
    if (!token) continue;

    // Check tag type
    if (token.startsWith('<?') || token.startsWith('<!')) {
      // Declaration or comment/doctype
      formatted += token + newline;
    } else if (token.startsWith('</')) {
      // Closing tag
      pad = Math.max(0, pad - 1);
      formatted += indent.repeat(pad) + token + newline;
    } else if (token.startsWith('<') && token.endsWith('/>')) {
      // Self-closing tag
      formatted += indent.repeat(pad) + token + newline;
    } else if (token.startsWith('<')) {
      // Opening tag - check if next token is text and followed immediately by closing tag for inline presentation
      const next1 = tokens[i + 1]?.trim();
      const next2 = tokens[i + 2]?.trim();
      const tagNameMatch = token.match(/^<([a-zA-Z0-9_\-:]+)/);
      const tagName = tagNameMatch ? tagNameMatch[1] : '';

      if (next1 && !next1.startsWith('<') && next2 === `</${tagName}>`) {
        formatted += indent.repeat(pad) + token + next1 + next2 + newline;
        i += 2; // skip text and closing tag
      } else {
        formatted += indent.repeat(pad) + token + newline;
        pad++;
      }
    } else {
      // Text node
      formatted += indent.repeat(pad) + token + newline;
    }
  }

  return formatted.trim();
}

export function serializeXml(
  items: OrderedItem<XmlItemData>[],
  meta?: XmlMetadata,
  originalContent?: string,
  defaultLineEnding: LineEnding = '\n',
  options: XmlSerializerOptions = {}
): string {
  const newline = options.lineEnding || defaultLineEnding;
  const indent = options.indent || '  ';
  const targetTag = meta?.itemTag || 'item';

  if (!originalContent) {
    // Construct fresh document from items
    const rootTag = meta?.rootTag || 'root';
    const lines: string[] = [];
    if (meta?.declaration) lines.push(meta.declaration);
    lines.push(`<${rootTag}>`);
    for (const item of items) {
      lines.push(`${indent}${item.data.rawXml}`);
    }
    lines.push(`</${rootTag}>`);
    return lines.join(newline);
  }

  // Parse original content
  const parser = new DOMParser();
  const doc = parser.parseFromString(originalContent, 'text/xml');

  const existingElements = Array.from(doc.getElementsByTagName(targetTag));
  if (existingElements.length === 0) {
    // If not found, return formatted original
    return originalContent;
  }

  // Find parent and insertion marker
  const firstElem = existingElements[0];
  const parent = firstElem.parentNode;
  if (!parent) {
    return originalContent;
  }

  // Placeholder comment node to mark position
  const placeholder = doc.createComment('ezorder-reorder-anchor');
  parent.insertBefore(placeholder, firstElem);

  // Remove existing matching elements
  for (const el of existingElements) {
    if (el.parentNode === parent) {
      el.parentNode.removeChild(el);
    }
  }

  // Parse each item rawXml and insert back into parent at placeholder
  for (const item of items) {
    try {
      const itemDoc = parser.parseFromString(item.data.rawXml, 'text/xml');
      const imported = doc.importNode(itemDoc.documentElement, true);
      parent.insertBefore(imported, placeholder);
    } catch {
      // Fallback: create element with tag
      const fallbackEl = doc.createElement(item.data.tagName);
      fallbackEl.textContent = item.data.innerContent;
      parent.insertBefore(fallbackEl, placeholder);
    }
  }

  // Remove placeholder
  parent.removeChild(placeholder);

  // Serialize to string
  const serializer = new XMLSerializer();
  let serialized = serializer.serializeToString(doc);

  // Ensure XML declaration is preserved if originally present
  if (meta?.declaration && !serialized.startsWith('<?xml')) {
    serialized = meta.declaration + newline + serialized;
  }

  return formatXmlString(serialized, indent, newline);
}
