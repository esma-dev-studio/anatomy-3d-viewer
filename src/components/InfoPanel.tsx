// ============================================================================
// 選択部位の詳細パネル(右下オーバーレイ)
// 部位名 / 英名 / 分類 / 説明 / 位置 / 役割 / 関連部位 を表示。
// ============================================================================
import { partsById } from '../data/anatomyParts';
import { CATEGORIES } from '../data/categories';
import { REGIONS } from '../data/regions';
import { useAnatomyStore } from '../store/useAnatomyStore';

const SIDE_TEXT: Record<string, string> = {
  left: '左側',
  right: '右側',
  center: '正中 / 単一',
};

export function InfoPanel() {
  const selectedId = useAnatomyStore((s) => s.selectedPartId);
  const selectPart = useAnatomyStore((s) => s.selectPart);
  const focusPart = useAnatomyStore((s) => s.focusPart);
  const setDisplayMode = useAnatomyStore((s) => s.setDisplayMode);
  const displayMode = useAnatomyStore((s) => s.displayMode);

  if (!selectedId) {
    return (
      <div className="infopanel infopanel--empty">
        <p className="infopanel__hint">
          部位をクリックすると、ここに名称と解説が表示されます。
        </p>
      </div>
    );
  }

  const part = partsById[selectedId];
  if (!part) return null;

  const cat = CATEGORIES[part.category];
  const region = REGIONS[part.region];

  return (
    <div className="infopanel">
      <div className="infopanel__head">
        <div>
          <div className="infopanel__name">{part.nameJa}</div>
          <div className="infopanel__nameen">{part.nameEn}</div>
        </div>
        <button
          className="infopanel__close"
          onClick={() => selectPart(null)}
          aria-label="選択を解除"
        >
          ×
        </button>
      </div>

      <div className="infopanel__badges">
        <span className="badge" style={{ background: cat.color, color: '#10161f' }}>
          {cat.nameJa}
        </span>
        <span className="badge badge--outline">{part.subcategory}</span>
        <span className="badge badge--outline">{region.nameJa}</span>
        <span className="badge badge--outline">{SIDE_TEXT[part.side]}</span>
      </div>

      <dl className="infopanel__dl">
        <dt>説明</dt>
        <dd>{part.description}</dd>
        <dt>主な役割</dt>
        <dd>{part.function}</dd>
      </dl>

      {part.relatedParts && part.relatedParts.length > 0 && (
        <div className="infopanel__related">
          <span className="infopanel__related-label">関連:</span>
          {part.relatedParts
            .map((id) => partsById[id])
            .filter(Boolean)
            .map((rp) => (
              <button
                key={rp.id}
                className="chip chip--sm"
                onClick={() => selectPart(rp.id, true)}
              >
                {rp.nameJa}
              </button>
            ))}
        </div>
      )}

      <div className="infopanel__actions">
        <button className="btn btn--primary" onClick={() => focusPart(part.id)}>
          この部位にフォーカス
        </button>
        <button
          className={`btn${displayMode === 'isolate' ? ' is-active' : ''}`}
          onClick={() => setDisplayMode(displayMode === 'isolate' ? 'normal' : 'isolate')}
        >
          単独表示
        </button>
      </div>
    </div>
  );
}
