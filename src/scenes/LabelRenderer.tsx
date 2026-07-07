// ============================================================================
// 部位ラベルの描画 (drei Html)
// 表示中かつラベルモード条件を満たす部位にのみ名称ラベルを出す。
// ============================================================================
import { Html } from '@react-three/drei';
import { anatomyParts } from '../data/anatomyParts';
import { labelAnchorOf } from '../utils/geometry';
import { useAnatomyStore } from '../store/useAnatomyStore';

export function LabelRenderer() {
  const labelMode = useAnatomyStore((s) => s.labelMode);
  const layerVisibility = useAnatomyStore((s) => s.layerVisibility);
  const partVisibility = useAnatomyStore((s) => s.partVisibility);
  const displayMode = useAnatomyStore((s) => s.displayMode);
  const selectedId = useAnatomyStore((s) => s.selectedPartId);
  const selectPart = useAnatomyStore((s) => s.selectPart);

  if (labelMode === 'none') return null;

  const isolateActive = displayMode === 'isolate' && selectedId !== null;

  const visibleParts = anatomyParts.filter((p) => {
    if (!layerVisibility[p.category] || !partVisibility[p.id]) return false;
    if (isolateActive && p.id !== selectedId) return false;
    if (labelMode === 'major' && !p.isMajorPart) return false;
    return true;
  });

  return (
    <>
      {visibleParts.map((p) => {
        const anchor = labelAnchorOf(p);
        const isSel = p.id === selectedId;
        return (
          <Html
            key={p.id}
            position={anchor}
            center
            zIndexRange={[20, 0]}
            style={{ pointerEvents: 'auto' }}
          >
            <button
              className={`label-tag${isSel ? ' is-selected' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                selectPart(p.id, true);
              }}
            >
              {p.nameJa}
            </button>
          </Html>
        );
      })}
    </>
  );
}
