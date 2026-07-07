// ============================================================================
// 表示モード切替 — 通常 / 選択強調 / 他半透明 / 単独表示(isolate)
// ============================================================================
import { useAnatomyStore } from '../store/useAnatomyStore';
import type { DisplayMode } from '../types/anatomy';

const OPTIONS: { id: DisplayMode; label: string; hint: string }[] = [
  { id: 'normal', label: '通常', hint: '通常表示' },
  { id: 'emphasize', label: '強調', hint: '選択部位を強調' },
  { id: 'dim', label: '半透明', hint: '他部位を半透明化' },
  { id: 'isolate', label: '単独', hint: '選択部位のみ表示' },
];

export function DisplayModeToggle() {
  const displayMode = useAnatomyStore((s) => s.displayMode);
  const setDisplayMode = useAnatomyStore((s) => s.setDisplayMode);
  const selectedId = useAnatomyStore((s) => s.selectedPartId);

  return (
    <div>
      <div className="segmented">
        {OPTIONS.map((o) => (
          <button
            key={o.id}
            className={`segmented__btn${displayMode === o.id ? ' is-active' : ''}`}
            onClick={() => setDisplayMode(o.id)}
            title={o.hint}
          >
            {o.label}
          </button>
        ))}
      </div>
      {displayMode !== 'normal' && !selectedId && (
        <p className="hint-inline">部位を選択すると効果が現れます。</p>
      )}
    </div>
  );
}
