// ============================================================================
// 視点コントロール — 上部: 視点プリセット+リセット / 下部: ズーム+表示中部位数
// ============================================================================
import { anatomyParts } from '../data/anatomyParts';
import { useAnatomyStore } from '../store/useAnatomyStore';
import type { ViewPreset } from '../types/anatomy';

const PRESETS: { id: ViewPreset; label: string }[] = [
  { id: 'front', label: '正面' },
  { id: 'back', label: '背面' },
  { id: 'right', label: '右側面' },
  { id: 'left', label: '左側面' },
  { id: 'top', label: '上面' },
  { id: 'iso', label: '斜め' },
];

export function ViewControls() {
  const setView = useAnatomyStore((s) => s.setView);
  const resetView = useAnatomyStore((s) => s.resetView);
  const zoomBy = useAnatomyStore((s) => s.zoomBy);

  const layerVisibility = useAnatomyStore((s) => s.layerVisibility);
  const partVisibility = useAnatomyStore((s) => s.partVisibility);
  const displayMode = useAnatomyStore((s) => s.displayMode);
  const selectedId = useAnatomyStore((s) => s.selectedPartId);

  const isolateActive = displayMode === 'isolate' && selectedId !== null;
  const visibleCount = anatomyParts.filter((p) => {
    if (!layerVisibility[p.category] || !partVisibility[p.id]) return false;
    if (isolateActive && p.id !== selectedId) return false;
    return true;
  }).length;

  return (
    <>
      <div className="viewbar viewbar--top">
        <div className="viewbar__group">
          {PRESETS.map((p) => (
            <button key={p.id} className="viewbtn" onClick={() => setView(p.id)}>
              {p.label}
            </button>
          ))}
        </div>
        <button className="viewbtn viewbtn--accent" onClick={resetView}>
          ⟲ リセット
        </button>
      </div>

      <div className="viewbar viewbar--bottom">
        <div className="viewbar__group">
          <button className="viewbtn" onClick={() => zoomBy(0.8)} aria-label="ズームイン">
            ＋
          </button>
          <button className="viewbtn" onClick={() => zoomBy(1.25)} aria-label="ズームアウト">
            －
          </button>
        </div>
        <div className="count-pill">
          表示中 <strong>{visibleCount}</strong> 部位
        </div>
      </div>
    </>
  );
}
