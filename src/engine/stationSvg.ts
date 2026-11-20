function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const DISPLAY_FONT = "'Barlow Condensed', Impact, 'Arial Narrow', sans-serif";
const BODY_FONT = "'Plus Jakarta Sans', 'Segoe UI', Arial, sans-serif";
const MONO_FONT = "'JetBrains Mono', Consolas, monospace";

export function getStationArtworkSvg(stationId: string, uidSuffix = 'svg'): string {
  const g1 = `${stationId}-g1-${uidSuffix}`;
  const g2 = `${stationId}-g2-${uidSuffix}`;

  const wrap = (label: string, body: string) =>
    `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200" role="img" aria-label="${escapeXml(label)}">${body}</svg>`;

  switch (stationId) {
    case 'cocoteo-fm':
      return wrap(
        'Cocoteo FM',
        `<defs><linearGradient id="${g1}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FF1B8D"/><stop offset="60%" stop-color="#A63EFF"/><stop offset="100%" stop-color="#7DE2FF"/></linearGradient></defs>` +
          `<rect width="200" height="200" fill="url(#${g1})"/>` +
          `<g transform="translate(100,66)">` +
          `<ellipse cx="-26" cy="-16" rx="22" ry="15" transform="rotate(-24 -26 -16)" fill="#5C3118" stroke="#1E0E06" stroke-width="3"/>` +
          `<ellipse cx="-25" cy="-15" rx="15" ry="9" transform="rotate(-24 -25 -15)" fill="#FFF5EA"/>` +
          `<ellipse cx="26" cy="-16" rx="22" ry="15" transform="rotate(24 26 -16)" fill="#5C3118" stroke="#1E0E06" stroke-width="3"/>` +
          `<ellipse cx="25" cy="-15" rx="15" ry="9" transform="rotate(24 25 -15)" fill="#FFF5EA"/>` +
          `<ellipse cx="-24" cy="18" rx="20" ry="13" transform="rotate(18 -24 18)" fill="#5C3118" stroke="#1E0E06" stroke-width="3"/>` +
          `<ellipse cx="-23" cy="18" rx="13" ry="8" transform="rotate(18 -23 18)" fill="#FFF5EA"/>` +
          `<ellipse cx="24" cy="18" rx="20" ry="13" transform="rotate(-18 24 18)" fill="#5C3118" stroke="#1E0E06" stroke-width="3"/>` +
          `<ellipse cx="23" cy="18" rx="13" ry="8" transform="rotate(-18 23 18)" fill="#FFF5EA"/>` +
          `</g>` +
          `<text x="100" y="162" text-anchor="middle" font-family="${DISPLAY_FONT}" font-weight="800" font-size="44" fill="#FFF5FA" stroke="#591C87" stroke-width="4" paint-order="stroke">COCOTEO</text>` +
          `<rect x="132" y="168" width="42" height="20" rx="4" fill="#00D4FF" stroke="#1D0B38" stroke-width="2"/>` +
          `<text x="153" y="183" text-anchor="middle" font-family="${MONO_FONT}" font-weight="700" font-size="13" fill="#0D071A">FM</text>`
      );

    case 'dirty-south-classics':
      return wrap(
        'Dirty South Classics',
        `<rect width="200" height="200" fill="#202024"/>` +
          `<rect x="8" y="8" width="184" height="184" fill="none" stroke="#3C3C44" stroke-width="2"/>` +
          `<text x="100" y="78" text-anchor="middle" font-family="${DISPLAY_FONT}" font-weight="800" font-size="46" fill="#F4EFE6" letter-spacing="1">DIRTY</text>` +
          `<text x="100" y="122" text-anchor="middle" font-family="${DISPLAY_FONT}" font-weight="800" font-size="50" fill="#FFFFFF" letter-spacing="1">SOUTH</text>` +
          `<rect x="26" y="136" width="148" height="28" fill="#F4EFE6"/>` +
          `<text x="100" y="157" text-anchor="middle" font-family="${DISPLAY_FONT}" font-weight="800" font-size="24" fill="#141418" letter-spacing="2.5">CLASSICS</text>`
      );

    case 'emotion-983':
      return wrap(
        'Emotion 98.3',
        `<defs><linearGradient id="${g1}" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#FF7A2F"/><stop offset="55%" stop-color="#EB2525"/><stop offset="100%" stop-color="#B80C2F"/></linearGradient></defs>` +
          `<rect width="200" height="200" fill="url(#${g1})"/>` +
          `<g transform="rotate(-11 100 105)">` +
          `<path d="M66 95 C66 76 92 74 96 90 C100 74 126 76 126 95 C126 116 96 134 96 134 C96 134 66 116 66 95 Z" fill="#FF4769" stroke="#FFF5FA" stroke-width="4"/>` +
          `<text x="100" y="113" text-anchor="middle" font-family="${BODY_FONT}" font-style="italic" font-weight="800" font-size="44" fill="#FFF5FA" stroke="#7A071E" stroke-width="4" paint-order="stroke">emotion</text>` +
          `</g>` +
          `<text x="150" y="178" text-anchor="middle" font-family="${MONO_FONT}" font-weight="700" font-size="18" fill="#FFE6D6">98.3</text>`
      );

    case 'flash-fm':
      return wrap(
        'Flash FM',
        `<defs><linearGradient id="${g1}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FF1D8E"/><stop offset="50%" stop-color="#FF6B5A"/><stop offset="100%" stop-color="#FFC94A"/></linearGradient></defs>` +
          `<rect width="200" height="200" fill="url(#${g1})"/>` +
          `<text x="94" y="122" text-anchor="middle" font-family="${DISPLAY_FONT}" font-weight="800" font-size="66" fill="#FFE14D" stroke="#22082E" stroke-width="6" paint-order="stroke">FLASH</text>` +
          `<polygon points="126,38 92,102 114,102 96,158 142,88 118,88" fill="#FF1E96" stroke="#22082E" stroke-width="4"/>` +
          `<text x="140" y="152" text-anchor="middle" font-family="${DISPLAY_FONT}" font-weight="800" font-size="30" fill="#FFF5FA" stroke="#22082E" stroke-width="4" paint-order="stroke">FM</text>`
      );

    case 'gloriana-blues':
      return wrap(
        'Gloriana Blues Radio',
        `<rect width="200" height="200" fill="#F9D55C"/>` +
          `<circle cx="100" cy="100" r="76" fill="#2AB5E8" stroke="#1E1A22" stroke-width="3"/>` +
          `<text x="92" y="62" text-anchor="middle" font-family="${BODY_FONT}" font-style="italic" font-weight="700" font-size="26" fill="#FFE97D" stroke="#1E1A22" stroke-width="2.5" paint-order="stroke">Gloriana</text>` +
          `<text x="100" y="120" text-anchor="middle" font-family="${DISPLAY_FONT}" font-weight="800" font-size="62" fill="#FFFDF5" stroke="#1E1A22" stroke-width="4" paint-order="stroke">BLUES</text>` +
          `<text x="120" y="152" text-anchor="middle" font-family="${BODY_FONT}" font-style="italic" font-weight="700" font-size="24" fill="#FF7B47" stroke="#1E1A22" stroke-width="2" paint-order="stroke">Radio</text>`
      );

    case 'vice-city-fm':
      return wrap(
        'Vice City FM',
        `<defs><linearGradient id="${g1}" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1D0B4B"/><stop offset="55%" stop-color="#7B2CBF"/><stop offset="100%" stop-color="#00D4FF"/></linearGradient></defs>` +
          `<rect width="200" height="200" fill="url(#${g1})"/>` +
          `<line x1="16" y1="146" x2="184" y2="146" stroke="#FF2E93" stroke-width="3"/>` +
          `<line x1="16" y1="158" x2="184" y2="158" stroke="#00D4FF" stroke-width="2"/>` +
          `<line x1="16" y1="170" x2="184" y2="170" stroke="#9340FF" stroke-width="2"/>` +
          `<text x="100" y="88" text-anchor="middle" font-family="${DISPLAY_FONT}" font-weight="800" font-size="54" fill="#FFF5FA" stroke="#FF2E93" stroke-width="2">VICE CITY</text>` +
          `<text x="100" y="130" text-anchor="middle" font-family="${MONO_FONT}" font-weight="700" font-size="28" fill="#00D4FF">FM 95.1</text>`
      );

    case 'v-rock':
      return wrap(
        'V-Rock',
        `<rect width="200" height="200" fill="#18080D"/>` +
          `<polygon points="100,18 184,180 16,180" fill="none" stroke="#FF2E54" stroke-width="5"/>` +
          `<text x="100" y="108" text-anchor="middle" font-family="${DISPLAY_FONT}" font-weight="800" font-size="68" fill="#FF2E54">V</text>` +
          `<rect x="26" y="114" width="148" height="44" fill="#F4EFE6"/>` +
          `<text x="100" y="148" text-anchor="middle" font-family="${DISPLAY_FONT}" font-weight="800" font-size="40" fill="#18080D" letter-spacing="2">ROCK</text>`
      );

    case 'the-chamber':
      return wrap(
        'The Chamber 106.6',
        `<rect width="200" height="200" fill="#0A0A0D"/>` +
          `<rect x="10" y="10" width="180" height="180" fill="none" stroke="#D91E36" stroke-width="4"/>` +
          `<text x="100" y="54" text-anchor="middle" font-family="${MONO_FONT}" font-weight="700" font-size="18" fill="#D91E36" letter-spacing="4">THE</text>` +
          `<text x="100" y="112" text-anchor="middle" font-family="${DISPLAY_FONT}" font-weight="800" font-size="50" fill="#F4EFE6" letter-spacing="1">CHAMBER</text>` +
          `<rect x="44" y="132" width="112" height="34" fill="#D91E36"/>` +
          `<text x="100" y="156" text-anchor="middle" font-family="${MONO_FONT}" font-weight="700" font-size="22" fill="#0A0A0D">106.6</text>`
      );

    case 'vcrr':
      return wrap(
        'VCRR',
        `<defs><linearGradient id="${g1}" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#0D071A"/><stop offset="100%" stop-color="#2E1065"/></linearGradient></defs>` +
          `<rect width="200" height="200" fill="url(#${g1})"/>` +
          `<rect x="14" y="14" width="172" height="172" fill="none" stroke="#00D4FF" stroke-width="3"/>` +
          `<text x="100" y="112" text-anchor="middle" font-family="${DISPLAY_FONT}" font-weight="800" font-size="72" fill="#00D4FF" letter-spacing="3">VCRR</text>` +
          `<text x="100" y="154" text-anchor="middle" font-family="${MONO_FONT}" font-weight="700" font-size="14" fill="#FF2E93" letter-spacing="2">VICE CITY RAP</text>`
      );

    case 'stockyard-fm':
      return wrap(
        'Stockyard FM',
        `<rect width="200" height="200" fill="#14111D"/>` +
          `<rect x="0" y="0" width="200" height="24" fill="#FF2E93"/>` +
          `<rect x="0" y="176" width="200" height="24" fill="#9340FF"/>` +
          `<text x="100" y="96" text-anchor="middle" font-family="${DISPLAY_FONT}" font-weight="800" font-size="44" fill="#FFF5FA" letter-spacing="1">STOCKYARD</text>` +
          `<text x="100" y="138" text-anchor="middle" font-family="${MONO_FONT}" font-weight="700" font-size="24" fill="#00D4FF">FM // 101.3</text>`
      );

    case 'honey-fm':
      return wrap(
        'Honey FM',
        `<defs><linearGradient id="${g1}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FFB547"/><stop offset="100%" stop-color="#FF5C77"/></linearGradient></defs>` +
          `<rect width="200" height="200" fill="url(#${g1})"/>` +
          `<circle cx="100" cy="84" r="46" fill="#461220"/>` +
          `<text x="100" y="95" text-anchor="middle" font-family="${BODY_FONT}" font-style="italic" font-weight="800" font-size="34" fill="#FFE082">Honey</text>` +
          `<text x="100" y="164" text-anchor="middle" font-family="${MONO_FONT}" font-weight="700" font-size="22" fill="#461220">FM 93.7</text>`
      );

    case 'radio-la-ola':
      return wrap(
        'Radio La Ola',
        `<defs><linearGradient id="${g1}" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#00C4CC"/><stop offset="100%" stop-color="#FF7B47"/></linearGradient></defs>` +
          `<rect width="200" height="200" fill="url(#${g1})"/>` +
          `<path d="M0 135 Q50 105 100 135 T200 135 L200 200 L0 200 Z" fill="#132A4A"/>` +
          `<text x="100" y="72" text-anchor="middle" font-family="${MONO_FONT}" font-weight="700" font-size="16" fill="#FFF5FA" letter-spacing="4">RADIO</text>` +
          `<text x="100" y="122" text-anchor="middle" font-family="${DISPLAY_FONT}" font-weight="800" font-size="56" fill="#FFFDF5" stroke="#132A4A" stroke-width="4" paint-order="stroke">LA OLA</text>` +
          `<text x="100" y="176" text-anchor="middle" font-family="${MONO_FONT}" font-weight="700" font-size="16" fill="#FFD166">89.5 MHz</text>`
      );

    case 'radio-on-u':
      return wrap(
        'Radio On-U',
        `<rect width="200" height="200" fill="#141414"/>` +
          `<rect x="0" y="0" width="200" height="16" fill="#1DB954"/>` +
          `<rect x="0" y="16" width="200" height="16" fill="#FFD60A"/>` +
          `<rect x="0" y="32" width="200" height="16" fill="#EF233C"/>` +
          `<text x="100" y="114" text-anchor="middle" font-family="${DISPLAY_FONT}" font-weight="800" font-size="58" fill="#FFD60A">ON-U</text>` +
          `<text x="100" y="156" text-anchor="middle" font-family="${MONO_FONT}" font-weight="700" font-size="18" fill="#1DB954" letter-spacing="2">RADIO DUB</text>`
      );

    case 'back-country-radio':
      return wrap(
        'Back Country Radio',
        `<rect width="200" height="200" fill="#6F381B"/>` +
          `<rect x="12" y="12" width="176" height="176" fill="none" stroke="#F4D396" stroke-width="4"/>` +
          `<text x="100" y="74" text-anchor="middle" font-family="${DISPLAY_FONT}" font-weight="800" font-size="34" fill="#F4D396" letter-spacing="3">BACK</text>` +
          `<text x="100" y="122" text-anchor="middle" font-family="${DISPLAY_FONT}" font-weight="800" font-size="50" fill="#FFF7E6">COUNTRY</text>` +
          `<text x="100" y="158" text-anchor="middle" font-family="${MONO_FONT}" font-weight="700" font-size="15" fill="#FF9F68" letter-spacing="2">97.5 RADIO</text>`
      );

    case 'leonida-jazz':
      return wrap(
        'Leonida Jazz Radio',
        `<rect width="200" height="200" fill="#0B1B36"/>` +
          `<circle cx="100" cy="100" r="68" fill="none" stroke="#F4B942" stroke-width="3"/>` +
          `<text x="100" y="76" text-anchor="middle" font-family="${MONO_FONT}" font-weight="600" font-size="15" fill="#00D4FF" letter-spacing="3">LEONIDA</text>` +
          `<text x="100" y="124" text-anchor="middle" font-family="${DISPLAY_FONT}" font-weight="800" font-size="58" fill="#F4B942" letter-spacing="2">JAZZ</text>` +
          `<text x="100" y="156" text-anchor="middle" font-family="${MONO_FONT}" font-weight="600" font-size="15" fill="#FFF5FA">88.9 FM</text>`
      );

    case 'symphony-fm':
      return wrap(
        'Symphony FM',
        `<rect width="200" height="200" fill="#F4EFE6"/>` +
          `<rect x="14" y="14" width="172" height="172" fill="none" stroke="#1D1238" stroke-width="3"/>` +
          `<text x="100" y="96" text-anchor="middle" font-family="${DISPLAY_FONT}" font-weight="800" font-size="46" fill="#1D1238" letter-spacing="1">SYMPHONY</text>` +
          `<line x1="40" y1="112" x2="160" y2="112" stroke="#9340FF" stroke-width="3"/>` +
          `<text x="100" y="148" text-anchor="middle" font-family="${MONO_FONT}" font-weight="700" font-size="22" fill="#9340FF">FM 88.1</text>`
      );

    case 'worldwide-fm':
      return wrap(
        'Worldwide FM',
        `<defs><linearGradient id="${g1}" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#091E3A"/><stop offset="100%" stop-color="#2F80ED"/></linearGradient></defs>` +
          `<rect width="200" height="200" fill="url(#${g1})"/>` +
          `<circle cx="100" cy="86" r="46" fill="none" stroke="#00D4FF" stroke-width="3"/>` +
          `<ellipse cx="100" cy="86" rx="22" ry="46" fill="none" stroke="#00D4FF" stroke-width="2"/>` +
          `<line x1="54" y1="86" x2="146" y2="86" stroke="#00D4FF" stroke-width="2"/>` +
          `<text x="100" y="162" text-anchor="middle" font-family="${DISPLAY_FONT}" font-weight="800" font-size="34" fill="#FFF5FA" letter-spacing="1">WORLDWIDE FM</text>`
      );

    case 'circoloco-radio':
      return wrap(
        'CircoLoco Records Radio',
        `<rect width="200" height="200" fill="#160711"/>` +
          `<circle cx="100" cy="76" r="38" fill="#E11D48"/>` +
          `<text x="100" y="88" text-anchor="middle" font-family="${DISPLAY_FONT}" font-weight="800" font-size="34" fill="#FFF5FA">CL</text>` +
          `<text x="100" y="146" text-anchor="middle" font-family="${DISPLAY_FONT}" font-weight="800" font-size="38" fill="#FFF5FA" letter-spacing="1">CIRCOLOCO</text>` +
          `<text x="100" y="172" text-anchor="middle" font-family="${MONO_FONT}" font-weight="700" font-size="14" fill="#FF2E93">RECORDS 104.3</text>`
      );

    case 'afrobank-fm':
      return wrap(
        'AfroBank FM',
        `<defs><linearGradient id="${g1}" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1B4332"/><stop offset="50%" stop-color="#E76F51"/><stop offset="100%" stop-color="#F4A261"/></linearGradient></defs>` +
          `<rect width="200" height="200" fill="url(#${g1})"/>` +
          `<polygon points="100,26 174,100 100,174 26,100" fill="#130E1A" fill-opacity="0.82" stroke="#F4A261" stroke-width="3"/>` +
          `<text x="100" y="102" text-anchor="middle" font-family="${DISPLAY_FONT}" font-weight="800" font-size="42" fill="#FFF5FA">AFROBANK</text>` +
          `<text x="100" y="136" text-anchor="middle" font-family="${MONO_FONT}" font-weight="700" font-size="18" fill="#F4A261">FM 100.7</text>`
      );

    case 'kaleidoscope-fm':
      return wrap(
        'Kaleidoscope FM',
        `<defs>` +
          `<linearGradient id="${g1}" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#9340FF"/><stop offset="50%" stop-color="#FF2E93"/><stop offset="100%" stop-color="#FFB57A"/></linearGradient>` +
          `<linearGradient id="${g2}" x1="1" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#00D4FF"/><stop offset="100%" stop-color="#9340FF"/></linearGradient>` +
          `</defs>` +
          `<rect width="200" height="200" fill="url(#${g1})"/>` +
          `<polygon points="100,18 182,100 100,182 18,100" fill="url(#${g2})" opacity="0.65"/>` +
          `<text x="100" y="105" text-anchor="middle" font-family="${DISPLAY_FONT}" font-weight="800" font-size="34" fill="#FFF5FA" stroke="#180828" stroke-width="4" paint-order="stroke">KALEIDOSCOPE</text>` +
          `<text x="100" y="138" text-anchor="middle" font-family="${MONO_FONT}" font-weight="700" font-size="16" fill="#FFF5FA">102.1 FM</text>`
      );

    case 'the-vault-radio':
      return wrap(
        'The Vault Radio',
        `<rect width="200" height="200" fill="#090D16"/>` +
          `<circle cx="100" cy="84" r="48" fill="none" stroke="#00D4FF" stroke-width="4" stroke-dasharray="10 6"/>` +
          `<circle cx="100" cy="84" r="24" fill="none" stroke="#9340FF" stroke-width="3"/>` +
          `<text x="100" y="156" text-anchor="middle" font-family="${DISPLAY_FONT}" font-weight="800" font-size="38" fill="#00D4FF" letter-spacing="2">THE VAULT</text>` +
          `<text x="100" y="180" text-anchor="middle" font-family="${MONO_FONT}" font-weight="700" font-size="13" fill="#FF2E93">UNLOCKABLE // 107.9</text>`
      );

    case 'wktt':
      return wrap(
        'WKTT',
        `<rect width="200" height="200" fill="#18203E"/>` +
          `<rect x="0" y="0" width="200" height="32" fill="#DC2626"/>` +
          `<rect x="0" y="168" width="200" height="32" fill="#DC2626"/>` +
          `<text x="100" y="114" text-anchor="middle" font-family="${DISPLAY_FONT}" font-weight="800" font-size="68" fill="#FFFFFF" letter-spacing="3">WKTT</text>` +
          `<text x="100" y="146" text-anchor="middle" font-family="${MONO_FONT}" font-weight="700" font-size="12" fill="#93C5FD">WE KNOW THE TRUTH</text>`
      );

    case 'the-wipe':
      return wrap(
        'The Wipe',
        `<defs><linearGradient id="${g1}" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#FF2E93"/><stop offset="100%" stop-color="#9340FF"/></linearGradient></defs>` +
          `<rect width="200" height="200" fill="url(#${g1})"/>` +
          `<text x="100" y="100" text-anchor="middle" font-family="${DISPLAY_FONT}" font-weight="800" font-size="54" fill="#FFF5FA" stroke="#0D071A" stroke-width="4" paint-order="stroke">THE WIPE</text>` +
          `<text x="100" y="142" text-anchor="middle" font-family="${MONO_FONT}" font-weight="700" font-size="14" fill="#00D4FF">TALK RADIO 96.1</text>`
      );

    default: {
      const label = escapeXml(stationId.replace(/-/g, ' ').toUpperCase().slice(0, 14));
      return wrap(
        stationId,
        `<defs><linearGradient id="${g1}" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1B0E36"/><stop offset="100%" stop-color="#3B155F"/></linearGradient></defs>` +
          `<rect width="200" height="200" fill="url(#${g1})"/>` +
          `<rect x="14" y="14" width="172" height="172" fill="none" stroke="#FF7B47" stroke-width="3"/>` +
          `<circle cx="100" cy="76" r="26" fill="none" stroke="#00D4FF" stroke-width="4"/>` +
          `<circle cx="100" cy="76" r="10" fill="#FF2E93"/>` +
          `<text x="100" y="134" text-anchor="middle" font-family="${DISPLAY_FONT}" font-weight="800" font-size="30" fill="#FFF5FA">${label}</text>` +
          `<text x="100" y="164" text-anchor="middle" font-family="${MONO_FONT}" font-weight="700" font-size="12" fill="#FFB57A">LEONIDA PODCAST</text>`
      );
    }
  }
}

export function getStationArtworkDataUri(stationId: string): string {
  const svg = getStationArtworkSvg(stationId, 'canvas');
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
