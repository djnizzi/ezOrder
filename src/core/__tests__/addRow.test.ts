import { describe, expect, it } from 'vitest';
import { parseDocument, serializeDocument } from '../formatManager';
import { generateId } from '../utils';
import {
  CsvItemData,
  M3uItemData,
  OrderedItem,
  TxtItemData,
  XmlItemData,
} from '../../types';

describe('Add Row Feature across all formats', () => {
  it('adds a new row to CSV with column values and serializes cleanly', () => {
    const originalCsv = 'ID,Name,Role\n1,Alice,Admin\n2,Bob,User';
    const doc = parseDocument(originalCsv, 'team.csv');

    expect(doc.items).toHaveLength(2);

    // Create a new CSV row
    const newRowFields = ['3', 'Charlie', 'Designer'];
    const newRowObj: Record<string, string> = {
      ID: '3',
      Name: 'Charlie',
      Role: 'Designer',
    };

    const newItem: OrderedItem<CsvItemData> = {
      id: generateId(),
      originalIndex: doc.items.length,
      label: 'Charlie',
      sublabel: 'Designer',
      data: {
        row: newRowObj,
        rawFields: newRowFields,
      },
    };

    const updatedItems = [...doc.items, newItem];
    const output = serializeDocument(doc, updatedItems);

    expect(output).toContain('ID,Name,Role');
    expect(output).toContain('3,Charlie,Designer');
    const lines = output.trim().split(/\r?\n/);
    expect(lines).toHaveLength(4); // header + 3 data rows
    expect(lines[3]).toBe('3,Charlie,Designer');
  });

  it('adds single and bulk rows to TXT documents', () => {
    const originalTxt = 'First line\nSecond line';
    const doc = parseDocument(originalTxt, 'notes.txt');

    const newSingleItem: OrderedItem<TxtItemData> = {
      id: generateId(),
      originalIndex: doc.items.length,
      label: 'Third line',
      data: { text: 'Third line' },
    };

    const updatedItems = [...doc.items, newSingleItem];
    const output = serializeDocument(doc, updatedItems);

    expect(output).toBe('First line\nSecond line\nThird line');
  });

  it('adds a new track to M3U with EXTINF and URI', () => {
    const originalM3u = `#EXTM3U\n#EXTINF:180,Song 1\nmusic/song1.mp3`;
    const doc = parseDocument(originalM3u, 'playlist.m3u');

    const newM3uItem: OrderedItem<M3uItemData> = {
      id: generateId(),
      originalIndex: doc.items.length,
      label: 'Song 2',
      sublabel: 'music/song2.mp3',
      data: {
        title: 'Song 2',
        duration: 240,
        uri: 'music/song2.mp3',
        rawDirectives: ['#EXTINF:240,Song 2'],
      },
    };

    const updatedItems = [...doc.items, newM3uItem];
    const output = serializeDocument(doc, updatedItems);

    expect(output).toContain('#EXTM3U');
    expect(output).toContain('#EXTINF:240,Song 2');
    expect(output).toContain('music/song2.mp3');
  });

  it('adds a new element to XML preserving parent envelope', () => {
    const originalXml = `<?xml version="1.0" encoding="UTF-8"?>
<catalog>
  <item id="1">First</item>
  <item id="2">Second</item>
</catalog>`;
    const doc = parseDocument(originalXml, 'catalog.xml');

    const newXmlItem: OrderedItem<XmlItemData> = {
      id: generateId(),
      originalIndex: doc.items.length,
      label: 'Third',
      data: {
        tagName: 'item',
        attributes: { id: '3' },
        innerContent: 'Third',
        rawXml: '<item id="3">Third</item>',
      },
    };

    const updatedItems = [...doc.items, newXmlItem];
    const output = serializeDocument(doc, updatedItems);

    expect(output).toContain('<catalog>');
    expect(output).toContain('<item id="3">Third</item>');
    expect(output).toContain('</catalog>');
  });
});
