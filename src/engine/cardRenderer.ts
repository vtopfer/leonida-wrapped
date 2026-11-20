import { APP_CONFIG } from '../config';
import { STATION_BY_ID } from '../data/gta6Radios';
import type { ComparisonResult, Language, PeriodMatchResult } from '../types';
import { getStationArtworkDataUri } from './stationSvg';

export type CardFormat = 'stories' | 'feed' | 'blend';
export type CardTheme = 'dark' | 'paper';

export interface CardArtistHighlight {
  name: string;
  subtitle: string;
  isInGame: boolean;
}

export interface CardTrackHighlight {
  title: string;
  artist: string;
  stationName: string;
}

export interface CardHighlights {
  topArtists: CardArtistHighlight[];
  topTracks: CardTrackHighlight[];
}

export function selectCardHighlights(periodResult: PeriodMatchResult): CardHighlights {
  const topArtists: CardArtistHighlight[] = [];
  const seenArtists = new Set<string>();

  for (const matched of periodResult.allMatchedArtists) {
    if (topArtists.length >= 3) break;
    const key = matched.name.toLowerCase();
    if (seenArtists.has(key)) continue;
    seenArtists.add(key);

    const primaryStation = matched.stationIds[0]
      ? STATION_BY_ID.get(matched.stationIds[0])?.name
      : undefined;
    topArtists.push({
      name: matched.name,
      subtitle: primaryStation ?? 'GTA VI',
      isInGame: true,
    });
  }

  for (const userArtist of periodResult.topUserArtists) {
    if (topArtists.length >= 3) break;
    const key = userArtist.toLowerCase();
    if (seenArtists.has(key)) continue;
    seenArtists.add(key);
    topArtists.push({
      name: userArtist,
      subtitle: 'Vibe',
      isInGame: false,
    });
  }

  const topTracks: CardTrackHighlight[] = [];
  const seenTracks = new Set<string>();

  const pushTrack = (title: string, artist: string, stationName: string) => {
    if (topTracks.length >= 3) return;
    const key = `${artist.toLowerCase()}::${title.toLowerCase()}`;
    if (seenTracks.has(key)) return;
    seenTracks.add(key);
    topTracks.push({ title, artist, stationName });
  };

  // Priority 1: Exact user track matches
  for (const tr of periodResult.allMatchedTracks) {
    pushTrack(tr.title, tr.artist, tr.stationName);
  }

  // Priority 2: GTA VI tracks performed by user's matched artists (ordered by station rank)
  for (const stRes of periodResult.rankedStations) {
    if (topTracks.length >= 3) break;
    for (const tr of stRes.stationTracksByMatchedArtists) {
      pushTrack(tr.title, tr.artist, stRes.station.name);
      if (topTracks.length >= 3) break;
    }
  }

  // Priority 3: Discovery / signature tracks from user's top stations
  for (const stRes of periodResult.rankedStations) {
    if (topTracks.length >= 3) break;
    for (const tr of stRes.discoveryTracks) {
      pushTrack(tr.title, tr.artist, stRes.station.name);
      if (topTracks.length >= 3) break;
    }
  }

  return { topArtists, topTracks };
}

interface Palette {
  bg: string;
  surface: string;
  hudBg: string;
  border: string;
  text: string;
  muted: string;
  coral: string;
  peach: string;
  teal: string;
  purple: string;
}

const PALETTES: Record<CardTheme, Palette> = {
  dark: {
    bg: '#0D071A',
    surface: '#1A1030',
    hudBg: '#090514',
    border: '#3A265E',
    text: '#FFF5FA',
    muted: '#BFAED4',
    coral: '#FF2E93',
    peach: '#FF7B47',
    teal: '#00D4FF',
    purple: '#9340FF',
  },
  paper: {
    bg: '#FDF2F8',
    surface: '#F5E4F0',
    hudBg: '#160B2A',
    border: '#D9B8D8',
    text: '#1B0F2E',
    muted: '#664B82',
    coral: '#E11D74',
    peach: '#EA580C',
    teal: '#0284C7',
    purple: '#7E22CE',
  },
};

function loadStationArtworkImage(stationId: string): Promise<HTMLImageElement | null> {
  if (typeof Image === 'undefined') return Promise.resolve(null);
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = getStationArtworkDataUri(stationId);
  });
}

function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines = 3
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = word;
      if (lines.length === maxLines) break;
    }
  }
  if (current && lines.length < maxLines) {
    lines.push(current);
  }
  if (lines.length === maxLines && words.length > 0) {
    const last = lines[maxLines - 1];
    if (ctx.measureText(last).width > maxWidth) {
      lines[maxLines - 1] = `${last.slice(0, Math.max(1, last.length - 3))}...`;
    }
  }
  return lines;
}

function clipText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let clipped = text;
  while (clipped.length > 1 && ctx.measureText(`${clipped}...`).width > maxWidth) {
    clipped = clipped.slice(0, -1);
  }
  return `${clipped.trimEnd()}...`;
}

function drawFilmGrain(ctx: CanvasRenderingContext2D, width: number, height: number, isDark: boolean) {
  ctx.save();
  ctx.fillStyle = isDark ? 'rgba(255,255,255,0.025)' : 'rgba(27,15,46,0.025)';
  const step = 6;
  for (let y = 0; y < height; y += step * 2) {
    for (let x = 0; x < width; x += step * 2) {
      const hash = ((x * 73856093) ^ (y * 19349663)) & 255;
      if (hash > 170) {
        ctx.fillRect(x, y, 2, 2);
      }
    }
  }
  ctx.restore();
}

function drawHorizonBar(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, pal: Palette) {
  const grad = ctx.createLinearGradient(x, y, x + w, y);
  grad.addColorStop(0, pal.purple);
  grad.addColorStop(0.36, pal.coral);
  grad.addColorStop(0.7, pal.peach);
  grad.addColorStop(1, pal.teal);
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, w, h);
}

function drawArtworkOrFallback(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | null | undefined,
  x: number,
  y: number,
  size: number,
  fallbackColor: string
) {
  if (img) {
    ctx.drawImage(img, x, y, size, size);
  } else {
    ctx.fillStyle = fallbackColor;
    ctx.fillRect(x, y, size, size);
  }
}

export async function renderShareCardPng(options: {
  format: CardFormat;
  theme: CardTheme;
  lang: Language;
  displayName: string;
  periodResult: PeriodMatchResult;
  comparison?: ComparisonResult | null;
}): Promise<string> {
  if (typeof document !== 'undefined' && document.fonts?.ready) {
    await document.fonts.ready;
  }

  const { format, theme, lang, displayName, periodResult, comparison } = options;
  const pal = PALETTES[theme];
  const width = 1080;
  const height = format === 'stories' ? 1920 : 1350;

  const top3 = periodResult.rankedStations.slice(0, 3);
  const stationIdsToLoad = new Set<string>(top3.map((s) => s.station.id));
  if (comparison) stationIdsToLoad.add(comparison.roadtripStation.id);

  const loadedEntries = await Promise.all(
    Array.from(stationIdsToLoad).map(async (id) => [id, await loadStationArtworkImage(id)] as const)
  );
  const artworkMap = new Map<string, HTMLImageElement | null>(loadedEntries);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.fillStyle = pal.bg;
  ctx.fillRect(0, 0, width, height);

  if (theme === 'dark') {
    const topGlow = ctx.createRadialGradient(width * 0.18, 0, 20, width * 0.18, 0, width * 0.75);
    topGlow.addColorStop(0, 'rgba(147, 64, 255, 0.24)');
    topGlow.addColorStop(1, 'rgba(13, 7, 26, 0)');
    ctx.fillStyle = topGlow;
    ctx.fillRect(0, 0, width, height);

    const botGlow = ctx.createRadialGradient(width * 0.85, height, 20, width * 0.85, height, width * 0.75);
    botGlow.addColorStop(0, 'rgba(0, 212, 255, 0.16)');
    botGlow.addColorStop(1, 'rgba(13, 7, 26, 0)');
    ctx.fillStyle = botGlow;
    ctx.fillRect(0, 0, width, height);
  } else {
    const pastelTop = ctx.createRadialGradient(width * 0.2, 0, 20, width * 0.2, 0, width * 0.75);
    pastelTop.addColorStop(0, 'rgba(255, 46, 147, 0.08)');
    pastelTop.addColorStop(1, 'rgba(253, 242, 248, 0)');
    ctx.fillStyle = pastelTop;
    ctx.fillRect(0, 0, width, height);
  }

  drawFilmGrain(ctx, width, height, theme === 'dark');
  drawHorizonBar(ctx, 0, 0, width, 14, pal);

  const pad = 72;
  const innerW = width - pad * 2;
  let y = 64;

  // Header metadata row
  ctx.fillStyle = pal.muted;
  ctx.font = '600 22px "JetBrains Mono", monospace';
  ctx.fillText(`LEONIDA WRAPPED // ${displayName.toUpperCase()}`, pad, y);

  const periodLabels = {
    pt: { '1month': 'ÚLTIMO MÊS', '6month': '6 MESES', overall: 'DESDE SEMPRE' },
    en: { '1month': 'LAST 30 DAYS', '6month': '6 MONTHS', overall: 'ALL TIME' },
  };
  const rightMeta =
    format === 'blend' && comparison
      ? lang === 'pt'
        ? 'MODO CARONA'
        : 'ROADTRIP BLEND'
      : periodLabels[lang][periodResult.period];
  const rightMetaW = ctx.measureText(rightMeta).width;
  ctx.fillStyle = pal.teal;
  ctx.fillText(rightMeta, width - pad - rightMetaW, y);

  y += 22;
  ctx.strokeStyle = pal.border;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(pad, y);
  ctx.lineTo(width - pad, y);
  ctx.stroke();

  if (format === 'blend' && comparison) {
    y += 72;
    ctx.fillStyle = pal.muted;
    ctx.font = '600 26px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(
      `${comparison.myName.toUpperCase()}  ×  ${comparison.friendName.toUpperCase()}`,
      pad,
      y
    );

    y += 120;
    ctx.fillStyle = pal.coral;
    ctx.font = '800 138px "Barlow Condensed", sans-serif';
    ctx.fillText(`${comparison.compatibility}%`, pad, y);

    ctx.fillStyle = pal.text;
    ctx.font = '700 42px "Barlow Condensed", sans-serif';
    const compatSub = lang === 'pt' ? 'COMPATIBILIDADE NO SOM' : 'SONIC COMPATIBILITY';
    ctx.fillText(compatSub, pad + 250, y - 34);

    ctx.fillStyle = pal.teal;
    ctx.font = '600 25px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(comparison.verdictTitle[lang].toUpperCase(), pad + 250, y + 8);

    y += 52;
    ctx.fillStyle = pal.surface;
    ctx.fillRect(pad, y, innerW, 214);
    ctx.strokeStyle = pal.border;
    ctx.lineWidth = 2;
    ctx.strokeRect(pad, y, innerW, 214);

    const artSize = 154;
    const artX = pad + 30;
    const artY = y + 30;
    drawArtworkOrFallback(
      ctx,
      artworkMap.get(comparison.roadtripStation.id),
      artX,
      artY,
      artSize,
      comparison.roadtripStation.accentColor
    );
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.strokeRect(artX, artY, artSize, artSize);

    const infoX = artX + artSize + 32;
    ctx.fillStyle = pal.peach;
    ctx.font = '600 20px "JetBrains Mono", monospace';
    ctx.fillText(
      lang === 'pt' ? 'RÁDIO OFICIAL DA CARONA' : 'OFFICIAL ROADTRIP STATION',
      infoX,
      y + 58
    );

    ctx.fillStyle = pal.text;
    ctx.font = '800 62px "Barlow Condensed", sans-serif';
    const roadTitle = clipText(ctx, comparison.roadtripStation.name.toUpperCase(), innerW - 240);
    ctx.fillText(roadTitle, infoX, y + 124);

    ctx.fillStyle = pal.muted;
    ctx.font = '500 22px "JetBrains Mono", monospace';
    const hostLine = clipText(
      ctx,
      `${comparison.roadtripStation.frequency} • ${comparison.roadtripStation.hosts}`,
      innerW - 240
    );
    ctx.fillText(hostLine, infoX, y + 168);

    y += 264;
    ctx.fillStyle = pal.muted;
    ctx.font = '600 22px "JetBrains Mono", monospace';
    ctx.fillText(lang === 'pt' ? 'DISPUTA NO DIAL' : 'DIAL BREAKDOWN', pad, y);

    y += 22;
    for (const row of comparison.rows.slice(0, 4)) {
      y += 62;
      ctx.fillStyle = pal.text;
      ctx.font = '700 26px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(row.station.name, pad, y);

      const scoreText = `${row.myScore}% / ${row.friendScore}%`;
      const sw = ctx.measureText(scoreText).width;
      ctx.fillStyle = pal.muted;
      ctx.font = '500 21px "JetBrains Mono", monospace';
      ctx.fillText(scoreText, width - pad - sw, y);

      const barY = y + 13;
      ctx.fillStyle = pal.border;
      ctx.fillRect(pad, barY, innerW, 8);
      ctx.fillStyle = pal.coral;
      ctx.fillRect(pad, barY, (row.myScore / 100) * (innerW * 0.48), 8);
      ctx.fillStyle = pal.teal;
      ctx.fillRect(pad + innerW * 0.52, barY, (row.friendScore / 100) * (innerW * 0.48), 8);
    }

    y += 84;
    ctx.fillStyle = pal.muted;
    ctx.font = '500 23px "Plus Jakarta Sans", sans-serif';
    const verdictLines = wrapLines(ctx, comparison.verdictBody[lang], innerW, 2);
    for (const line of verdictLines) {
      ctx.fillText(line, pad, y);
      y += 32;
    }
  } else {
    // Personal Card (Stories 9:16 or Feed 4:5)
    const top = periodResult.topStation;
    const isStories = format === 'stories';
    const highlights = selectCardHighlights(periodResult);

    // 1. Enlarged In-Game GTA VI Radio HUD Block
    y += isStories ? 26 : 18;
    const hudH = isStories ? 610 : 404;
    ctx.save();
    ctx.fillStyle = pal.hudBg;
    ctx.fillRect(pad, y, innerW, hudH);

    const hudGlow = ctx.createRadialGradient(
      width / 2,
      y + hudH,
      10,
      width / 2,
      y + hudH,
      innerW * 0.65
    );
    hudGlow.addColorStop(0, 'rgba(0, 212, 255, 0.28)');
    hudGlow.addColorStop(1, 'rgba(9, 5, 20, 0)');
    ctx.fillStyle = hudGlow;
    ctx.fillRect(pad, y, innerW, hudH);

    ctx.strokeStyle = pal.border;
    ctx.lineWidth = 2;
    ctx.strokeRect(pad, y, innerW, hudH);

    ctx.fillStyle = '#BFAED4';
    ctx.font = `600 ${isStories ? 18 : 15}px "JetBrains Mono", monospace`;
    const hudLabel = 'GTA VI RADIO HUD';
    const hudLabelW = ctx.measureText(hudLabel).width;
    ctx.fillText(hudLabel, width / 2 - hudLabelW / 2, y + (isStories ? 36 : 28));

    // Enlarged 3-tile carousel inside HUD
    const centerSize = isStories ? 290 : 204;
    const sideSize = isStories ? 204 : 146;
    const centerX = width / 2 - centerSize / 2;
    const centerY = y + (isStories ? 58 : 42);
    const sideGap = isStories ? 32 : 26;
    const sideY = centerY + (centerSize - sideSize) / 2;

    const leftStation = top3[1]?.station;
    const rightStation = top3[2]?.station;

    if (leftStation) {
      const lx = centerX - sideGap - sideSize;
      ctx.globalAlpha = 0.78;
      drawArtworkOrFallback(
        ctx,
        artworkMap.get(leftStation.id),
        lx,
        sideY,
        sideSize,
        leftStation.accentColor
      );
      ctx.globalAlpha = 1;
      ctx.strokeStyle = '#4B3375';
      ctx.lineWidth = 2;
      ctx.strokeRect(lx, sideY, sideSize, sideSize);
    }

    if (rightStation) {
      const rx = centerX + centerSize + sideGap;
      ctx.globalAlpha = 0.78;
      drawArtworkOrFallback(
        ctx,
        artworkMap.get(rightStation.id),
        rx,
        sideY,
        sideSize,
        rightStation.accentColor
      );
      ctx.globalAlpha = 1;
      ctx.strokeStyle = '#4B3375';
      ctx.lineWidth = 2;
      ctx.strokeRect(rx, sideY, sideSize, sideSize);
    }

    // Center active #1 artwork with bold white frame
    ctx.shadowColor = 'rgba(255, 46, 147, 0.5)';
    ctx.shadowBlur = 28;
    drawArtworkOrFallback(
      ctx,
      artworkMap.get(top.station.id),
      centerX,
      centerY,
      centerSize,
      top.station.accentColor
    );
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = isStories ? 6 : 5;
    ctx.strokeRect(centerX, centerY, centerSize, centerSize);

    // [LB] ---- [RB] bar
    const barY = centerY + centerSize + (isStories ? 32 : 22);
    const barW = isStories ? 420 : 360;
    const barX = width / 2 - barW / 2;
    ctx.fillStyle = '#38255C';
    ctx.fillRect(barX, barY, barW, 6);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(width / 2 - 26, barY - 2, 52, 10);

    ctx.font = `700 ${isStories ? 18 : 15}px "JetBrains Mono", monospace`;
    ctx.fillStyle = '#BFAED4';
    ctx.fillText('LB', barX - 42, barY + 8);
    ctx.fillText('RB', barX + barW + 16, barY + 8);

    // Centered Station Name + Closest Track Playing + Artist
    let hudTextY = barY + (isStories ? 68 : 52);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `800 ${isStories ? 62 : 46}px "Barlow Condensed", sans-serif`;
    const stUpper = clipText(ctx, top.station.name.toUpperCase(), innerW - 60);
    const stW = ctx.measureText(stUpper).width;
    ctx.fillText(stUpper, width / 2 - stW / 2, hudTextY);

    hudTextY += isStories ? 44 : 33;
    const reasonTags = {
      pt: {
        exact: 'SUA MÚSICA NA RÁDIO',
        artist: 'ARTISTA QUE VOCÊ OUVE',
        vibe: 'FAIXA EM DESTAQUE',
      },
      en: {
        exact: 'YOUR TRACK ON AIR',
        artist: 'ARTIST YOU LISTEN TO',
        vibe: 'STATION HIGHLIGHT',
      },
    };
    const trackDisplay = top.featuredTrack.title.toUpperCase();
    ctx.fillStyle = '#00D4FF';
    ctx.font = `700 ${isStories ? 38 : 28}px "Barlow Condensed", sans-serif`;
    const clippedTitle = clipText(ctx, trackDisplay, innerW - 80);
    const trW = ctx.measureText(clippedTitle).width;
    ctx.fillText(clippedTitle, width / 2 - trW / 2, hudTextY);

    hudTextY += isStories ? 34 : 26;
    const artistReason = `${top.featuredTrack.artist.toUpperCase()}  •  ${reasonTags[lang][top.featuredTrack.matchReason]}`;
    ctx.fillStyle = '#FFB57A';
    ctx.font = `600 ${isStories ? 20 : 16}px "JetBrains Mono", monospace`;
    const clippedArt = clipText(ctx, artistReason, innerW - 80);
    const arW = ctx.measureText(clippedArt).width;
    ctx.fillText(clippedArt, width / 2 - arW / 2, hudTextY);
    ctx.restore();

    y += hudH + (isStories ? 44 : 28);

    // 2. Bolder Match % & Persona Strip
    const matchPctStr = `${top.percentage}%`;
    ctx.fillStyle = pal.coral;
    ctx.font = `800 ${isStories ? 94 : 68}px "Barlow Condensed", sans-serif`;
    ctx.fillText(matchPctStr, pad, y + (isStories ? 50 : 40));

    const bigPctW = ctx.measureText(matchPctStr).width;
    const rightInfoX = pad + bigPctW + 24;
    const rightInfoW = innerW - bigPctW - 24;

    ctx.fillStyle = pal.teal;
    ctx.font = `700 ${isStories ? 32 : 24}px "Barlow Condensed", sans-serif`;
    const personaHeader = clipText(
      ctx,
      `MATCH — ${top.station.persona[lang].title.toUpperCase()}`,
      rightInfoW
    );
    ctx.fillText(personaHeader, rightInfoX, y + (isStories ? 12 : 10));

    ctx.fillStyle = pal.muted;
    ctx.font = `500 ${isStories ? 22 : 18}px "Plus Jakarta Sans", sans-serif`;
    const tagLines = wrapLines(ctx, top.station.persona[lang].tagline, rightInfoW, isStories ? 2 : 1);
    let tagY = y + (isStories ? 44 : 38);
    for (const line of tagLines) {
      ctx.fillText(line, rightInfoX, tagY);
      tagY += isStories ? 28 : 22;
    }

    y += isStories ? 96 : 66;
    ctx.strokeStyle = pal.border;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(pad, y);
    ctx.lineTo(width - pad, y);
    ctx.stroke();

    // 3. Bigger Top 3 Stations Bars & Percentages
    y += isStories ? 38 : 28;
    ctx.fillStyle = pal.muted;
    ctx.font = `600 ${isStories ? 21 : 18}px "JetBrains Mono", monospace`;
    ctx.fillText(lang === 'pt' ? 'TOP 3 NO SEU DIAL' : 'TOP 3 ON YOUR DIAL', pad, y);

    y += isStories ? 18 : 12;
    const rowStep = isStories ? 86 : 62;
    for (let i = 0; i < top3.length; i += 1) {
      const item = top3[i];
      y += rowStep - (isStories ? 32 : 22);

      ctx.fillStyle = i === 0 ? pal.coral : i === 1 ? pal.peach : pal.teal;
      ctx.font = `700 ${isStories ? 34 : 26}px "Barlow Condensed", sans-serif`;
      ctx.fillText(`0${i + 1}`, pad, y);

      const pctText = `${item.percentage}%`;
      ctx.font = `800 ${isStories ? 50 : 38}px "Barlow Condensed", sans-serif`;
      const pw = ctx.measureText(pctText).width;
      ctx.fillStyle = i === 0 ? pal.coral : pal.text;
      ctx.fillText(pctText, width - pad - pw, y);

      ctx.fillStyle = pal.text;
      ctx.font = `700 ${isStories ? 34 : 25}px "Barlow Condensed", sans-serif`;
      const nameClip = clipText(ctx, item.station.name.toUpperCase(), innerW - 56 - pw - 20);
      ctx.fillText(nameClip, pad + 54, y);

      const barTopY = y + (isStories ? 14 : 10);
      const barThickness = isStories ? 10 : 8;
      ctx.fillStyle = pal.border;
      ctx.fillRect(pad + 54, barTopY, innerW - 54, barThickness);
      ctx.fillStyle = i === 0 ? pal.coral : i === 1 ? pal.peach : pal.teal;
      ctx.fillRect(
        pad + 54,
        barTopY,
        ((innerW - 54) * item.percentage) / 100,
        barThickness
      );

      y += isStories ? 32 : 22;
    }

    // 4. Compact Two-Column Highlights Grid (Top 3 Artists + Top 3 GTA VI Tracks)
    y += isStories ? 42 : 26;
    const colGap = 24;
    const colW = (innerW - colGap) / 2;
    const gridH = isStories ? 382 : 284;

    const drawHighlightColumn = (
      colX: number,
      title: string,
      accent: string,
      items: Array<{ main: string; sub: string }>
    ) => {
      ctx.fillStyle = pal.surface;
      ctx.fillRect(colX, y, colW, gridH);
      ctx.strokeStyle = pal.border;
      ctx.lineWidth = 2;
      ctx.strokeRect(colX, y, colW, gridH);

      ctx.fillStyle = accent;
      ctx.font = `600 ${isStories ? 18 : 16}px "JetBrains Mono", monospace`;
      ctx.fillText(clipText(ctx, title, colW - 44), colX + 24, y + (isStories ? 40 : 32));

      const itemStart = y + (isStories ? 94 : 76);
      const itemStep = isStories ? 100 : 73;

      for (let i = 0; i < 3; i += 1) {
        const entry = items[i];
        const rowY = itemStart + i * itemStep;
        if (!entry) continue;

        ctx.fillStyle = accent;
        ctx.font = `700 ${isStories ? 26 : 21}px "Barlow Condensed", sans-serif`;
        ctx.fillText(`0${i + 1}`, colX + 24, rowY);

        ctx.fillStyle = pal.text;
        ctx.font = `700 ${isStories ? 28 : 22}px "Plus Jakarta Sans", sans-serif`;
        ctx.fillText(clipText(ctx, entry.main, colW - 86), colX + 64, rowY);

        ctx.fillStyle = pal.muted;
        ctx.font = `500 ${isStories ? 18 : 15}px "JetBrains Mono", monospace`;
        ctx.fillText(clipText(ctx, entry.sub, colW - 86), colX + 64, rowY + (isStories ? 28 : 22));
      }
    };

    drawHighlightColumn(
      pad,
      lang === 'pt' ? 'TOP 3 ARTISTAS NO JOGO' : 'TOP 3 IN-GAME ARTISTS',
      pal.teal,
      highlights.topArtists.map((a) => ({
        main: a.name,
        sub: a.isInGame
          ? a.subtitle
          : lang === 'pt'
            ? 'Mesma vibe da rádio'
            : 'Matched station vibe',
      }))
    );

    drawHighlightColumn(
      pad + colW + colGap,
      lang === 'pt' ? 'TOP 3 MÚSICAS PRA VOCÊ' : 'TOP 3 TRACKS FOR YOU',
      pal.peach,
      highlights.topTracks.map((tr) => ({
        main: tr.title,
        sub: `${tr.artist} • ${tr.stationName}`,
      }))
    );

    // 5. Compact Podcast / Talk Strip (eliminates remaining gap cleanly)
    y += gridH + (isStories ? 26 : 18);
    const footY = height - 54;
    const stripH = isStories ? Math.min(130, footY - 48 - y) : Math.min(68, footY - 46 - y);

    if (stripH >= 52) {
      ctx.fillStyle = pal.surface;
      ctx.fillRect(pad, y, innerW, stripH);
      ctx.strokeStyle = pal.border;
      ctx.lineWidth = 2;
      ctx.strokeRect(pad, y, innerW, stripH);

      if (isStories) {
        ctx.fillStyle = pal.peach;
        ctx.font = '600 18px "JetBrains Mono", monospace';
        ctx.fillText(
          lang === 'pt' ? 'PODCAST / TALK EM LEONIDA' : 'IN-GAME PODCAST & TALK',
          pad + 26,
          y + 42
        );

        ctx.fillStyle = pal.text;
        ctx.font = '800 40px "Barlow Condensed", sans-serif';
        ctx.fillText(clipText(ctx, periodResult.talkShow.name.toUpperCase(), innerW * 0.56), pad + 26, y + 92);

        ctx.fillStyle = pal.teal;
        ctx.font = '600 20px "Plus Jakarta Sans", sans-serif';
        const hostsText = clipText(ctx, periodResult.talkShow.hosts, innerW * 0.36);
        const hw = ctx.measureText(hostsText).width;
        ctx.fillText(hostsText, width - pad - 26 - hw, y + 74);
      } else {
        ctx.fillStyle = pal.peach;
        ctx.font = '600 16px "JetBrains Mono", monospace';
        const podLabel = lang === 'pt' ? 'PODCAST:' : 'PODCAST:';
        ctx.fillText(podLabel, pad + 22, y + 41);
        const podLabelW = ctx.measureText(podLabel).width;

        ctx.fillStyle = pal.text;
        ctx.font = '700 22px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(
          clipText(ctx, periodResult.talkShow.name, innerW * 0.45),
          pad + 34 + podLabelW,
          y + 42
        );

        ctx.fillStyle = pal.teal;
        ctx.font = '500 16px "JetBrains Mono", monospace';
        const hostsText = clipText(ctx, periodResult.talkShow.hosts, innerW * 0.34);
        const hw = ctx.measureText(hostsText).width;
        ctx.fillText(hostsText, width - pad - 22 - hw, y + 41);
      }
    }
  }

  // Bottom Footer
  const footY = height - 54;
  ctx.strokeStyle = pal.border;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(pad, footY - 34);
  ctx.lineTo(width - pad, footY - 34);
  ctx.stroke();

  ctx.fillStyle = pal.muted;
  ctx.font = '600 21px "JetBrains Mono", monospace';
  ctx.fillText(APP_CONFIG.siteUrl, pad, footY);

  const cta = lang === 'pt' ? 'COMPARE COM A SUA RÁDIO →' : 'COMPARE YOUR DIAL →';
  const ctaW = ctx.measureText(cta).width;
  ctx.fillStyle = pal.coral;
  ctx.fillText(cta, width - pad - ctaW, footY);

  return canvas.toDataURL('image/png');
}

export function downloadPngDataUrl(dataUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
