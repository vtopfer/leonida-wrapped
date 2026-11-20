import { useId, useMemo } from 'react';
import { getStationArtworkSvg } from '../engine/stationSvg';

export const STATION_PNG_IDS = new Set([
  'afrobank-fm',
  'back-country-radio',
  'circoloco-radio',
  'cocoteo-fm',
  'dirty-south-classics',
  'emotion-983',
  'flash-fm',
  'gloriana-blues',
  'honey-fm',
  'kaleidoscope-fm',
  'leonida-jazz',
  'radio-la-ola',
  'radio-on-u',
  'stockyard-fm',
  'symphony-fm',
  'the-chamber',
  'the-vault-radio',
  'the-wipe',
  'v-rock',
  'vcrr',
  'vice-city-fm',
  'wktt',
  'worldwide-fm',
]);

interface StationArtworkProps {
  stationId: string;
  className?: string;
}

export function StationArtwork({ stationId, className = 'w-full h-full' }: StationArtworkProps) {
  const uid = useId().replace(/:/g, '');
  const hasPng = STATION_PNG_IDS.has(stationId);
  const svgMarkup = useMemo(
    () => (hasPng ? '' : getStationArtworkSvg(stationId, uid)),
    [hasPng, stationId, uid]
  );

  if (hasPng) {
    return (
      <img
        src={`/stations/${stationId}.png`}
        alt={stationId}
        loading="lazy"
        className={`${className} object-cover block`}
      />
    );
  }

  return (
    <div
      className={`${className} [&>svg]:w-full [&>svg]:h-full [&>svg]:block`}
      dangerouslySetInnerHTML={{ __html: svgMarkup }}
    />
  );
}
