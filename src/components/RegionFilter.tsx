// ============================================================================
// エリアフィルター — 「頭部・胸部・腕・脚」などのエリアで絞り込む。
// ============================================================================
import { REGION_FILTER_OPTIONS } from '../data/regions';
import { useAnatomyStore } from '../store/useAnatomyStore';
import type { RegionFilter as RegionFilterType } from '../types/anatomy';

export function RegionFilter() {
  const regionFilter = useAnatomyStore((s) => s.regionFilter);
  const setRegionFilter = useAnatomyStore((s) => s.setRegionFilter);

  return (
    <label className="field">
      <span className="field__label">エリア</span>
      <select
        className="field__select"
        value={regionFilter}
        onChange={(e) => setRegionFilter(e.target.value as RegionFilterType)}
      >
        {REGION_FILTER_OPTIONS.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
