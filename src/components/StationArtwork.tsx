import { useId, useMemo } from 'react';
import { getStationArtworkSvg } from '../engine/stationSvg';

interface StationArtworkProps {
  stationId: string;
  className?: string;
}

export function StationArtwork({ stationId, className = 'w-full h-full' }: StationArtworkProps) {
  const uid = useId().replace(/:/g, '');
  const svgMarkup = useMemo(() => getStationArtworkSvg(stationId, uid), [stationId, uid]);

  return (
    <div
      className={`${className} [&>svg]:w-full [&>svg]:h-full [&>svg]:block`}
      dangerouslySetInnerHTML={{ __html: svgMarkup }}
    />
  );
}
