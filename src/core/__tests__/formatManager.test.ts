import { describe, expect, it } from 'vitest';
import {
  detectFormatFromContent,
  detectFormatFromFileName,
  parseDocument,
  SAMPLE_FILES,
  serializeDocument,
} from '../formatManager';

describe('formatManager', () => {
  it('detects formats from file names correctly', () => {
    expect(detectFormatFromFileName('data.csv')).toBe('csv');
    expect(detectFormatFromFileName('DATA.TSV')).toBe('csv');
    expect(detectFormatFromFileName('playlist.m3u')).toBe('m3u');
    expect(detectFormatFromFileName('iptv.m3u8')).toBe('m3u');
    expect(detectFormatFromFileName('feed.xml')).toBe('xml');
    expect(detectFormatFromFileName('notes.txt')).toBe('txt');
  });

  it('detects formats from content correctly', () => {
    expect(detectFormatFromContent('#EXTM3U\n#EXTINF:120,Title\ntrack.mp3')).toBe('m3u');
    expect(detectFormatFromContent('<?xml version="1.0"?><root></root>')).toBe('xml');
    expect(detectFormatFromContent('id,name,age\n1,Alice,30\n2,Bob,25')).toBe('csv');
    expect(detectFormatFromContent('Just a simple line of plain text')).toBe('txt');
  });

  it('parses and serializes sample CSV correctly', () => {
    const doc = parseDocument(SAMPLE_FILES.csv.content, SAMPLE_FILES.csv.name);
    expect(doc.format).toBe('csv');
    expect(doc.items.length).toBeGreaterThan(0);
    const serialized = serializeDocument(doc, doc.items);
    expect(serialized).toContain('Refactor payment gateway');
  });

  it('parses and serializes sample M3U correctly', () => {
    const doc = parseDocument(SAMPLE_FILES.m3u.content, SAMPLE_FILES.m3u.name);
    expect(doc.format).toBe('m3u');
    expect(doc.items.length).toBe(5);
    const serialized = serializeDocument(doc, doc.items);
    expect(serialized).toContain('#EXTM3U');
    expect(serialized).toContain('The Midnight - Sunset');
  });

  it('parses and serializes sample XML correctly', () => {
    const doc = parseDocument(SAMPLE_FILES.xml.content, SAMPLE_FILES.xml.name);
    expect(doc.format).toBe('xml');
    expect(doc.items.length).toBe(4);
    const serialized = serializeDocument(doc, doc.items);
    expect(serialized).toContain('<playlist title="Tech Podcast Queue">');
    expect(serialized).toContain('Building Modern Offline-First Web Apps');
  });

  it('parses and serializes sample TXT correctly', () => {
    const doc = parseDocument(SAMPLE_FILES.txt.content, SAMPLE_FILES.txt.name);
    expect(doc.format).toBe('txt');
    expect(doc.items.length).toBe(10);
    const serialized = serializeDocument(doc, doc.items);
    expect(serialized).toContain('Organic Whole Milk');
  });
});
