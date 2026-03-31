import { palette } from '../constants';
import type { MiniBarsProps } from '../../types';

export function MiniBars({ rows = [], className, colors }: MiniBarsProps) {
  const barPalette = colors?.slices ?? palette;

  return (
    <div className={['d3-mini-bars', className].filter(Boolean).join(' ')}>
      {rows.map(([label, value, status], index) => (
        <div className="d3-mini-row" key={`${label}-${index}`}>
          <span>{label}</span>
          <div className="d3-mini-track">
            <svg viewBox="0 0 100 12" className="d3-mini-svg" aria-hidden="true">
              <rect x="0" y="0" width="100" height="12" rx="6" className="d3-mini-track-fill" />
              <rect x="0" y="0" width={Math.max(0, Math.min(100, value))} height="12" rx="6" className={`d3-mini-fill tone-${index % palette.length}`} fill={barPalette[index % barPalette.length]} />
            </svg>
          </div>
          <span>{status}</span>
        </div>
      ))}
    </div>
  );
}
