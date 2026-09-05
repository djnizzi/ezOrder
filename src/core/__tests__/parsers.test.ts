import { describe, expect, it } from 'vitest';
import { parseCsv } from '../parsers/csvParser';
import { parseM3u } from '../parsers/m3uParser';
import { parseTxt } from '../parsers/txtParser';
import { parseXml } from '../parsers/xmlParser';
import { serializeCsv } from '../serializers/csvSerializer';
import { serializeM3u } from '../serializers/m3uSerializer';
import { serializeTxt } from '../serializers/txtSerializer';
import { serializeXml } from '../serializers/xmlSerializer';

describe('TXT Parser and Serializer', () => {
  it('parses plain text into ordered items and serializes back', () => {
    const raw = 'Alpha\nBeta\nGamma\nDelta';
    const doc = parseTxt(raw, 'test.txt');

    expect(doc.items).toHaveLength(4);
    expect(doc.items[0].label).toBe('Alpha');
    expect(doc.items[3].label).toBe('Delta');

    // Reorder: reverse items
    const reordered = [...doc.items].reverse();
    const output = serializeTxt(reordered as any, doc.lineEnding);

    expect(output).toBe('Delta\nGamma\nBeta\nAlpha');
  });

  it('detects CRLF line endings', () => {
    const raw = 'Line 1\r\nLine 2\r\nLine 3';
    const doc = parseTxt(raw, 'crlf.txt');
    expect(doc.lineEnding).toBe('\r\n');

    const output = serializeTxt(doc.items as any, doc.lineEnding);
    expect(output).toBe(raw);
  });
});

describe('CSV Parser and Serializer', () => {
  it('parses CSV with headers and reorders rows preserving columns', () => {
    const raw = 'ID,Name,Role\n1,Alice,Admin\n2,Bob,User\n3,Charlie,Guest';
    const doc = parseCsv(raw, 'users.csv');

    expect(doc.csvMeta?.headers).toEqual(['ID', 'Name', 'Role']);
    expect(doc.items).toHaveLength(3);
    expect(doc.items[0].label).toBe('Alice'); // Smart detected label from "Name" column

    // Reorder: swap first and third
    const reordered = [doc.items[2], doc.items[1], doc.items[0]];
    const output = serializeCsv(reordered as any, doc.csvMeta, doc.lineEnding);

    expect(output).toContain('ID,Name,Role');
    expect(output).toContain('3,Charlie,Guest');
    // Charlie should come before Alice in output
    const charlieIdx = output.indexOf('Charlie');
    const aliceIdx = output.indexOf('Alice');
    expect(charlieIdx).toBeLessThan(aliceIdx);
  });

  it('handles custom semicolon delimiter and quotes', () => {
    const raw = 'Item;Price;Description\n"Widget A";10.5;"High, quality"\n"Widget B";20.0;"Standard"';
    const doc = parseCsv(raw, 'semicolon.csv');

    expect(doc.csvMeta?.delimiter).toBe(';');
    expect(doc.items).toHaveLength(2);
    expect(doc.items[0].label).toBe('Widget A');

    const output = serializeCsv(doc.items as any, doc.csvMeta, doc.lineEnding);
    expect(output).toContain('Widget A;10.5;High, quality');
  });
});

describe('M3U Parser and Serializer', () => {
  it('preserves EXTINF and directives bound to track paths when reordering', () => {
    const raw = `#EXTM3U
#EXTINF:180,Artist 1 - Track 1
tracks/track1.mp3
#EXTINF:240 tvg-id="ch2" group-title="Rock",Artist 2 - Track 2
tracks/track2.mp3
#EXTINF:200,Artist 3 - Track 3
tracks/track3.mp3`;

    const doc = parseM3u(raw, 'playlist.m3u');
    expect(doc.items).toHaveLength(3);
    expect(doc.items[0].label).toBe('Artist 1 - Track 1');
    expect((doc.items[1].data as any).groupTitle).toBe('Rock');
    expect((doc.items[1].data as any).tvgId).toBe('ch2');

    // Move track 2 to the first position
    const reordered = [doc.items[1], doc.items[0], doc.items[2]];
    const output = serializeM3u(reordered as any, doc.m3uMeta, doc.lineEnding);

    // Track 2 and its directives must precede Track 1
    const track2DirIdx = output.indexOf('Artist 2 - Track 2');
    const track1DirIdx = output.indexOf('Artist 1 - Track 1');
    expect(track2DirIdx).toBeLessThan(track1DirIdx);

    const track2UriIdx = output.indexOf('tracks/track2.mp3');
    const track1UriIdx = output.indexOf('tracks/track1.mp3');
    expect(track2UriIdx).toBeLessThan(track1UriIdx);
  });
});

describe('XML Parser and Serializer', () => {
  it('detects repeated tags and reorders nodes cleanly', () => {
    const raw = `<?xml version="1.0" encoding="UTF-8"?>
<catalog title="Store Inventory">
  <category name="Electronics">
    <product id="p1" price="99">Keyboard</product>
    <product id="p2" price="49">Mouse</product>
    <product id="p3" price="199">Monitor</product>
  </category>
</catalog>`;

    const doc = parseXml(raw, 'store.xml');
    expect(doc.xmlMeta?.itemTag).toBe('product');
    expect(doc.items).toHaveLength(3);
    expect(doc.items[0].label).toBe('Keyboard');
    expect(doc.items[1].label).toBe('Mouse');
    expect(doc.items[2].label).toBe('Monitor');

    // Reorder: Move Monitor (p3) to first
    const reordered = [doc.items[2], doc.items[0], doc.items[1]];
    const output = serializeXml(reordered as any, doc.xmlMeta, doc.originalContent, doc.lineEnding);

    expect(output).toContain('<catalog title="Store Inventory">');
    expect(output).toContain('<?xml version="1.0" encoding="UTF-8"?>');

    const monitorIdx = output.indexOf('Monitor');
    const keyboardIdx = output.indexOf('Keyboard');
    const mouseIdx = output.indexOf('Mouse');

    expect(monitorIdx).toBeLessThan(keyboardIdx);
    expect(keyboardIdx).toBeLessThan(mouseIdx);
  });
});
