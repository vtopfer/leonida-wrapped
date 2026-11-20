import { ImageResponse } from 'workers-og';
import { STATION_BY_INDEX } from '../../src/data/gta6Radios';
import { decodeSharedProfile } from '../../src/engine/share';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function onRequestGet(context: { request: Request }): Promise<Response> {
  const url = new URL(context.request.url);
  const token = url.searchParams.get('r') ?? '';
  const payload = token ? decodeSharedProfile(token) : null;

  if (!payload || payload.r.length === 0) {
    const fallbackHtml = `
      <div style="display: flex; flex-direction: column; justify-content: space-between; width: 1200px; height: 630px; background: linear-gradient(135deg, #0d071a 0%, #1a0b2e 100%); padding: 56px 64px; color: #f4efe6; font-family: sans-serif; border-top: 8px solid #ff2e93;">
        <div style="display: flex; flex-direction: column;">
          <div style="display: flex; font-size: 20px; letter-spacing: 3px; color: #2cd9c5; font-weight: 700; margin-bottom: 18px;">
            LEONIDA AIRWAVES • VICE CITY TO PORT GELLHORN
          </div>
          <div style="display: flex; font-size: 74px; font-weight: 800; color: #ffffff; line-height: 1.05;">
            LEONIDA WRAPPED
          </div>
          <div style="display: flex; font-size: 56px; font-weight: 800; color: #ff2e93; line-height: 1.1; margin-top: 6px;">
            GTA VI RADIO MATCH
          </div>
          <div style="display: flex; font-size: 26px; color: #c4b5d8; margin-top: 28px;">
            Descubra qual rádio oficial de GTA VI combina mais com o seu gosto musical.
          </div>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.14); padding-top: 24px;">
          <div style="display: flex; font-size: 20px; color: #2cd9c5; font-weight: 700;">
            Last.fm • Spotify • YouTube Music • Modo Rápido
          </div>
          <div style="display: flex; font-size: 20px; color: #ff2e93; font-weight: 700;">
            leonida-wrapped.pages.dev
          </div>
        </div>
      </div>
    `;
    return new ImageResponse(fallbackHtml, {
      width: 1200,
      height: 630,
      headers: { 'Cache-Control': 'public, max-age=86400' },
    });
  }

  const [topIdx, topPct] = payload.r[0];
  const topStation = STATION_BY_INDEX.get(topIdx);
  const accent = topStation?.accentColor ?? '#FF5C77';
  const stationName = escapeHtml(topStation?.name ?? 'Flash FM');
  const frequency = escapeHtml(topStation?.frequency ?? '98.7 MHz');
  const hosts = escapeHtml(topStation?.hosts ?? '');
  const personaTitle = escapeHtml(topStation?.persona.pt.title ?? 'Sintonia Oficial');
  const userName = escapeHtml(payload.n || 'Amigo');

  const artistChips = payload.a
    .slice(0, 5)
    .map(
      (artist) =>
        `<div style="display: flex; border: 1px solid rgba(44,217,197,0.45); background: rgba(44,217,197,0.12); color: #f4efe6; padding: 8px 16px; font-size: 20px; font-weight: 600; margin-right: 12px; margin-bottom: 10px;">${escapeHtml(artist)}</div>`
    )
    .join('');

  const runnerUps = payload.r
    .slice(1, 4)
    .map(([idx, pct], i) => {
      const st = STATION_BY_INDEX.get(idx);
      if (!st) return '';
      return `
        <div style="display: flex; justify-content: space-between; align-items: center; border: 1px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.04); padding: 12px 18px; margin-bottom: 12px;">
          <div style="display: flex; align-items: center;">
            <div style="display: flex; font-size: 18px; color: #9c8bb4; margin-right: 14px; font-weight: 700;">0${i + 2}</div>
            <div style="display: flex; font-size: 22px; color: #f4efe6; font-weight: 700;">${escapeHtml(st.name)}</div>
          </div>
          <div style="display: flex; font-size: 22px; color: ${st.accentColor}; font-weight: 800;">${pct}%</div>
        </div>
      `;
    })
    .join('');

  const html = `
    <div style="display: flex; flex-direction: column; justify-content: space-between; width: 1200px; height: 630px; background: linear-gradient(135deg, #0d071a 0%, #1a0b2e 100%); padding: 48px 58px; color: #f4efe6; font-family: sans-serif; border-top: 10px solid ${accent};">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; font-size: 20px; letter-spacing: 3px; color: #2cd9c5; font-weight: 700;">
          LEONIDA WRAPPED • GTA VI RADIO MATCH
        </div>
        <div style="display: flex; border: 1px solid ${accent}; background: rgba(255,255,255,0.06); padding: 8px 18px; font-size: 20px; color: #ffffff; font-weight: 700;">
          SINTONIA DE ${userName.toUpperCase()}
        </div>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: stretch; margin-top: 20px;">
        <div style="display: flex; flex-direction: column; justify-content: center; width: 690px; padding-right: 32px;">
          <div style="display: flex; align-items: center; margin-bottom: 10px;">
            <div style="display: flex; border: 1px solid ${accent}; color: ${accent}; padding: 4px 12px; font-size: 18px; font-weight: 700; margin-right: 14px;">
              ${frequency}
            </div>
            <div style="display: flex; font-size: 20px; color: #2cd9c5; font-weight: 700;">
              ${personaTitle}
            </div>
          </div>

          <div style="display: flex; font-size: 64px; font-weight: 800; color: #ffffff; line-height: 1.05;">
            ${stationName}
          </div>

          <div style="display: flex; align-items: baseline; margin-top: 14px;">
            <div style="display: flex; font-size: 72px; font-weight: 800; color: ${accent}; line-height: 1;">
              ${topPct}%
            </div>
            <div style="display: flex; font-size: 24px; color: #c4b5d8; margin-left: 16px; font-weight: 600;">
              de match musical
            </div>
          </div>

          ${
            hosts
              ? `<div style="display: flex; font-size: 20px; color: #a796bf; margin-top: 14px;">Apresentação: ${hosts}</div>`
              : ''
          }
        </div>

        <div style="display: flex; flex-direction: column; justify-content: center; width: 390px;">
          <div style="display: flex; font-size: 16px; letter-spacing: 2px; color: #9c8bb4; font-weight: 700; margin-bottom: 12px;">
            OUTRAS RÁDIOS NO RADAR
          </div>
          ${runnerUps}
        </div>
      </div>

      <div style="display: flex; flex-direction: column;">
        ${
          artistChips
            ? `<div style="display: flex; flex-wrap: wrap; margin-bottom: 14px;">${artistChips}</div>`
            : ''
        }
        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.14); padding-top: 18px;">
          <div style="display: flex; font-size: 20px; color: #c4b5d8;">
            Compare seu gosto musical e entre no Modo Carona
          </div>
          <div style="display: flex; font-size: 22px; color: ${accent}; font-weight: 800;">
            leonida-wrapped.pages.dev
          </div>
        </div>
      </div>
    </div>
  `;

  return new ImageResponse(html, {
    width: 1200,
    height: 630,
    headers: {
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
