import { OrderedItem, ParsedDocument, XmlItemData, XmlMetadata } from '../../types';
import { detectLineEnding, generateId } from '../utils';

export interface XmlParserOptions {
  itemTag?: string;
}

export function parseXml(content: string, fileName = 'document.xml', options: XmlParserOptions = {}): ParsedDocument {
  const lineEnding = detectLineEnding(content);

  // Extract XML declaration if present
  const declMatch = content.match(/^<\?xml[^>]*\?>/i);
  const declaration = declMatch ? declMatch[0] : undefined;

  // Use DOMParser
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, 'text/xml');

  // Check for parse error
  const parserError = doc.querySelector('parsererror');
  if (parserError) {
    throw new Error(`XML Parse Error: ${parserError.textContent || 'Malformed XML'}`);
  }

  const root = doc.documentElement;
  if (!root) {
    throw new Error('XML has no root element');
  }

  // Find candidate repeated tags
  const tagCounts = new Map<string, number>();
  const allElements = Array.from(root.querySelectorAll('*'));

  for (const el of allElements) {
    const tagName = el.tagName;
    tagCounts.set(tagName, (tagCounts.get(tagName) || 0) + 1);
  }

  const availableItemTags: { tag: string; count: number }[] = Array.from(tagCounts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);

  let targetTag = options.itemTag;
  if (!targetTag) {
    // Pick the most common tag with count >= 2, or first direct child tag
    const repeated = availableItemTags.find((t) => t.count > 1);
    if (repeated) {
      targetTag = repeated.tag;
    } else if (root.children.length > 0) {
      targetTag = root.children[0].tagName;
    } else {
      targetTag = root.tagName;
    }
  }

  // Extract matching elements
  const matchingElements = Array.from(doc.getElementsByTagName(targetTag));
  const serializer = new XMLSerializer();

  const items: OrderedItem<XmlItemData>[] = matchingElements.map((el, idx) => {
    const rawXml = serializer.serializeToString(el);
    const attributes: Record<string, string> = {};
    for (let i = 0; i < el.attributes.length; i++) {
      const attr = el.attributes[i];
      attributes[attr.name] = attr.value;
    }

    // Determine smart label
    let label = '';
    const textContent = el.textContent?.trim().replace(/\s+/g, ' ');
    const titleChild = el.querySelector('title') || el.querySelector('name') || el.querySelector('label');

    if (attributes.name || attributes.title || attributes.label) {
      label = attributes.name || attributes.title || attributes.label;
    } else if (titleChild && titleChild.textContent?.trim()) {
      label = titleChild.textContent.trim();
    } else if (textContent && el.children.length === 0) {
      // Leaf element with text content
      label = textContent.length > 80 ? textContent.substring(0, 77) + '...' : textContent;
    } else if (attributes.id) {
      label = `${attributes.id}${textContent ? ` - ${textContent.substring(0, 40)}` : ''}`;
    } else if (textContent) {
      label = textContent.length > 80 ? textContent.substring(0, 77) + '...' : textContent;
    } else {
      label = `<${targetTag}> #${idx + 1}`;
    }

    // Determine sublabel
    const sublabelParts: string[] = [];
    for (const [k, v] of Object.entries(attributes)) {
      if (v && v !== label && sublabelParts.length < 3) {
        sublabelParts.push(`${k}="${v}"`);
      }
    }
    const sublabel = sublabelParts.length > 0 ? sublabelParts.join(' ') : undefined;

    return {
      id: generateId(),
      originalIndex: idx,
      label,
      sublabel,
      data: {
        tagName: el.tagName,
        attributes,
        innerContent: el.innerHTML || el.textContent || '',
        rawXml,
      },
    };
  });

  const rootAttrs: Record<string, string> = {};
  for (let i = 0; i < root.attributes.length; i++) {
    const attr = root.attributes[i];
    rootAttrs[attr.name] = attr.value;
  }

  const xmlMeta: XmlMetadata = {
    declaration,
    rootTag: root.tagName,
    rootAttributes: rootAttrs,
    itemTag: targetTag,
    availableItemTags,
    beforeItemsXml: '',
    afterItemsXml: '',
  };

  return {
    id: generateId(),
    fileName,
    format: 'xml',
    items,
    originalContent: content,
    lineEnding,
    xmlMeta,
  };
}
