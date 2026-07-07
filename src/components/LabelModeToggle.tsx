// ============================================================================
// ラベル表示切替 — なし / 主要のみ / 全表示
// ============================================================================
import { useAnatomyStore } from '../store/useAnatomyStore';
import type { LabelMode } from '../types/anatomy';

const OPTIONS: { id: LabelMode; label: string }[] = [
  { id: 'none', label: 'なし' },
  { id: 'major', label: '主要のみ' },
  { id: 'all', label: '全表示' },
];

export function LabelModeToggle() {
  const labelMode = useAnatomyStore((s) => s.labelMode);
  const setLabelMode = useAnatomyStore((s) => s.setLabelMode);

  return (
    <div className="segmented">
      {OPTIONS.map((o) => (
        <button
          key={o.id}
          className={`segmented__btn${labelMode === o.id ? ' is-active' : ''}`}
          onClick={() => setLabelMode(o.id)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
