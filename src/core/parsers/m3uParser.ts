import { M3uItemData, M3uMetadata, OrderedItem, ParsedDocument } from '../../types';
import { detectLineEnding, generateId } from '../utils';

export function formatDuration(seconds?: number): string | undefined {
  if (seconds === undefined || isNaN(seconds) || seconds < 0) return undefined;
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function parseM3u(content: string, fileName = 'playlist.m3u'): ParsedDocument {
  const lineEnding = detectLineEnding(content);
  const lines = content.split(/\r?\n/);

  let headerTag = '#EXTM3U';
  const globalDirectives: string[] = [];
  const items: OrderedItem<M3uItemData>[] = [];

  let isHeaderParsed = false;
  let currentDirectives: string[] = [];
  let itemIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    if (!line) {
      // Empty line - if we have pending directives, preserve them or skip
      continue;
    }

    if (!isHeaderParsed && line.startsWith('#EXTM3U')) {
      headerTag = line;
      isHeaderParsed = true;
      continue;
    }

    // Directives or comments
    if (line.startsWith('#')) {
      currentDirectives.push(rawLine);
      continue;
    }

    // Non-directive line is assumed to be the media URI / file path
    const uri = line;
    
    // Parse directives accumulated for this item
    let title = '';
    let duration: number | undefined = undefined;
    let tvgId: string | undefined = undefined;
    let tvgName: string | undefined = undefined;
    let tvgLogo: string | undefined = undefined;
    let groupTitle: string | undefined = undefined;

    for (const dir of currentDirectives) {
      if (dir.startsWith('#EXTINF:')) {
        // Syntax: #EXTINF:<duration> [attributes],<title>
        const rest = dir.substring(8);
        const commaIdx = rest.indexOf(',');

        let infoPart = rest;
        if (commaIdx !== -1) {
          infoPart = rest.substring(0, commaIdx).trim();
          title = rest.substring(commaIdx + 1).trim();
        }

        const durMatch = infoPart.match(/^(-?\d+(\.\d+)?)/);
        if (durMatch) {
          duration = parseFloat(durMatch[1]);
        }

        // Parse attributes like tvg-name="..." tvg-id="..." group-title="..."
        const tvgNameMatch = infoPart.match(/tvg-name="([^"]*)"/i);
        if (tvgNameMatch) tvgName = tvgNameMatch[1];

        const tvgIdMatch = infoPart.match(/tvg-id="([^"]*)"/i);
        if (tvgIdMatch) tvgId = tvgIdMatch[1];

        const tvgLogoMatch = infoPart.match(/tvg-logo="([^"]*)"/i);
        if (tvgLogoMatch) tvgLogo = tvgLogoMatch[1];

        const groupMatch = infoPart.match(/group-title="([^"]*)"/i);
        if (groupMatch) groupTitle = groupMatch[1];
      } else if (dir.startsWith('#EXTGRP:')) {
        groupTitle = dir.substring(8).trim();
      }
    }

    // Fallback title from filename if title empty
    if (!title) {
      const parts = uri.split(/[/\\]/);
      title = parts[parts.length - 1] || uri;
    }

    // Sublabel formatting
    const durationStr = formatDuration(duration);
    const sublabelParts: string[] = [];
    if (groupTitle) sublabelParts.push(`[${groupTitle}]`);
    if (durationStr) sublabelParts.push(durationStr);
    sublabelParts.push(uri);

    items.push({
      id: generateId(),
      originalIndex: itemIndex++,
      label: title,
      sublabel: sublabelParts.join(' • '),
      data: {
        title,
        duration,
        uri,
        groupTitle,
        tvgId,
        tvgName,
        tvgLogo,
        rawDirectives: [...currentDirectives],
      },
    });

    currentDirectives = [];
  }

  // Any dangling directives at the end or top with no URI
  if (currentDirectives.length > 0 && items.length === 0) {
    globalDirectives.push(...currentDirectives);
  }

  const m3uMeta: M3uMetadata = {
    headerTag,
    globalDirectives,
  };

  return {
    id: generateId(),
    fileName,
    format: 'm3u',
    items,
    originalContent: content,
    lineEnding,
    m3uMeta,
  };
}
