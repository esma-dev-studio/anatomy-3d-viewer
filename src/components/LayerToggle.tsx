// ============================================================================
// レイヤー切替 — 皮膚 / 骨格 / 筋肉 / 内臓 の表示ON/OFF(系統色つき)。
// ============================================================================
import { CATEGORY_LIST } from '../data/categories';
import { anatomyParts } from '../data/anatomyParts';
import { useAnatomyStore } from '../store/useAnatomyStore';
import type { Category } from '../types/anatomy';

const totalByCategory = anatomyParts.reduce<Record<string, number>>((acc, p) => {
  acc[p.category] = (acc[p.category] ?? 0) + 1;
  return acc;
}, {});

export function LayerToggle() {
  const layerVisibility = useAnatomyStore((s) => s.layerVisibility);
  const toggleLayer = useAnatomyStore((s) => s.toggleLayer);

  return (
    <ul className="layer-list">
      {CATEGORY_LIST.map((cat) => {
        const on = layerVisibility[cat.id as Category];
        return (
          <li key={cat.id}>
            <button
              className={`layer-row${on ? ' is-on' : ''}`}
              onClick={() => toggleLayer(cat.id)}
              aria-pressed={on}
            >
              <span className="layer-row__swatch" style={{ background: cat.color }} />
              <span className="layer-row__name">{cat.nameJa}</span>
              <span className="layer-row__count">{totalByCategory[cat.id] ?? 0}</span>
              <span className={`toggle${on ? ' is-on' : ''}`} aria-hidden>
                <span className="toggle__knob" />
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
