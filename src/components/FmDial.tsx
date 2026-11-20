import type { StationMatchResult } from '../types';

interface FmDialProps {
  topStations: StationMatchResult[];
  selectedStationId?: string;
  onSelectStation?: (stationId: string) => void;
}

const MIN_FREQ = 88.0;
const MAX_FREQ = 108.0;

export function FmDial({ topStations, selectedStationId, onSelectStation }: FmDialProps) {
  const top3 = topStations.slice(0, 3);
  const colors = ['var(--vice-pink)', 'var(--vice-orange)', 'var(--vice-blue)'];

  const ticks = Array.from({ length: 41 }, (_, i) => {
    const freq = 88.0 + i * 0.5;
    return {
      freq,
      pct: ((freq - MIN_FREQ) / (MAX_FREQ - MIN_FREQ)) * 100,
      major: i % 4 === 0,
    };
  });

  return (
    <div className="border border-[var(--border-hairline)] bg-[var(--surface-inset)]/90 px-3.5 pt-2.5 pb-2">
      <div className="flex items-center justify-between mb-1.5">
        <span className="font-mono-dial text-[10px] tracking-widest text-[var(--text-muted)] uppercase">
          LEONIDA TUNER // FM STEREO
        </span>
        <span className="font-mono-dial text-[11px] text-[var(--vice-pink)]">
          {top3[0]?.station.frequency}
        </span>
      </div>

      <div className="relative h-10 select-none">
        <div className="absolute inset-x-0 bottom-3.5 h-px bg-[var(--border-hairline)]" />

        {ticks.map((tick) => (
          <div
            key={tick.freq}
            style={{ left: `${tick.pct}%` }}
            className="absolute bottom-3.5 -translate-x-1/2"
          >
            <div
              className={
                tick.major
                  ? 'h-2.5 w-px bg-[var(--text-dim)]'
                  : 'h-1.5 w-px bg-[var(--border-hairline)]'
              }
            />
          </div>
        ))}

        {top3.map((item, idx) => {
          const pct = Math.max(
            2,
            Math.min(98, ((item.station.freqNum - MIN_FREQ) / (MAX_FREQ - MIN_FREQ)) * 100)
          );
          const color = colors[idx] ?? 'var(--text-main)';
          const isSelected = selectedStationId === item.station.id;

          return (
            <button
              key={item.station.id}
              type="button"
              onClick={() => onSelectStation?.(item.station.id)}
              style={{ left: `${pct}%` }}
              title={`${item.station.name} (${item.station.frequency})`}
              className="absolute bottom-1.5 -translate-x-1/2 flex flex-col items-center cursor-pointer"
            >
              <span
                style={{ backgroundColor: color }}
                className={`mb-0.5 rounded-full ${
                  idx === 0 || isSelected ? 'h-2 w-2 scale-110' : 'h-1.5 w-1.5 opacity-85'
                }`}
              />
              <span
                style={{ backgroundColor: color }}
                className={idx === 0 ? 'w-[2px] h-6' : 'w-px h-4 opacity-85'}
              />
            </button>
          );
        })}

        <div className="absolute inset-x-0 bottom-0 flex justify-between font-mono-dial text-[9px] text-[var(--text-dim)]">
          <span>88.1</span>
          <span>98.3</span>
          <span>107.9 MHz</span>
        </div>
      </div>

      <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
        {top3.map((item, idx) => (
          <span
            key={item.station.id}
            className="inline-flex items-center gap-1 font-mono-dial text-[10px] text-[var(--text-muted)]"
          >
            <span
              style={{ backgroundColor: colors[idx] }}
              className="inline-block h-1.5 w-1.5 rounded-full"
            />
            <span className="text-[var(--text-main)]">{item.station.name}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
