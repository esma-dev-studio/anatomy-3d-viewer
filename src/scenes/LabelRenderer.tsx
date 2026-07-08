// ============================================================================
// 部位ラベルの描画 (drei Html)
//  - 実写骨格の部位は読み込み後に算出したアンカー(skeletonAnchors)を使う
//  - 選択中の部位はラベルモードに関わらず常に表示
//  - 既定は「なし」(多数のラベルの重なりを避ける)
// ============================================================================
import { Html } from '@react-three/drei';
import { anatomyParts } from '../data/anatomyParts';
import { labelAnchorOf } from '../utils/geometry';
import { useAnatomyStore } from '../store/useAnatomyStore';
import type { AnatomyPart } from '../types/anatomy';

export function LabelRenderer() {
  const labelMode = useAnatomyStore((s) => s.labelMode);
  const layerVisibility = useAnatomyStore((s) => s.layerVisibility);
  const partVisibility = useAnatomyStore((s) => s.partVisibility);
  const displayMode = useAnatomyStore((s) => s.displayMode);
  const selectedId = useAnatomyStore((s) => s.selectedPartId);
  const partAnchors = useAnatomyStore((s) => s.partAnchors);
  const selectPart = useAnatomyStore((s) => s.selectPart);

  const anchorFor = (p: AnatomyPart): [number, number, number] | null => {
    // 実写モデル(骨格・筋肉)は読み込み後に算出したアンカーを使う
    if (partAnchors[p.id]) return partAnchors[p.id];
    // プリミティブ部位(内臓・皮膚)は形状から算出。実写部位で未登録なら非表示。
    return p.pieces.length > 0 ? labelAnchorOf(p) : null;
  };

  const isolateActive = displayMode === 'isolate' && selectedId !== null;

  const visibleParts = anatomyParts.filter((p) => {
    if (!layerVisibility[p.category] || !partVisibility[p.id]) return false;
    if (isolateActive && p.id !== selectedId) return false;
    if (!anchorFor(p)) return false;
    if (p.id === selectedId) return true; // 選択部位は常に表示
    if (labelMode === 'none') return false;
    if (labelMode === 'major' && !p.isMajorPart) return false;
    return true;
  });

  return (
    <>
      {visibleParts.map((p) => {
        const anchor = anchorFor(p)!;
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
