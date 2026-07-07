// ============================================================================
// 系統凡例オーバーレイ (路線図の凡例を参考)
// ビュー上に色分け凡例を常設し、クリックでレイヤーを切り替えられる。
// ============================================================================
import { useState } from 'react';
import { CATEGORY_LIST } from '../data/categories';
import { anatomyParts } from '../data/anatomyParts';
import { useAnatomyStore } from '../store/useAnatomyStore';

const totalByCategory = anatomyParts.reduce<Record<string, number>>((acc, p) => {
  acc[p.category] = (acc[p.category] ?? 0) + 1;
  return acc;
}, {});

export function Legend() {
  const [open, setOpen] = useState(true);
  const layerVisibility = useAnatomyStore((s) => s.layerVisibility);
  const toggleLayer = useAnatomyStore((s) => s.toggleLayer);

  return (
    <div className={`legend${open ? '' : ' is-collapsed'}`}>
      <button className="legend__head" onClick={() => setOpen((v) => !v)}>
        <span className="legend__title">系統</span>
        <span className="legend__chevron" aria-hidden>
          {open ? '▾' : '▸'}
        </span>
      </button>
      {open && (
        <ul className="legend__list">
          {CATEGORY_LIST.map((cat) => {
            const on = layerVisibility[cat.id];
            return (
              <li key={cat.id}>
                <button
                  className={`legend__item${on ? ' is-on' : ''}`}
                  onClick={() => toggleLayer(cat.id)}
                  title={`${cat.nameJa} を表示 / 非表示`}
                >
                  <span className="legend__dot" style={{ background: cat.color }} />
                  <span className="legend__name">{cat.nameJa}</span>
                  <span className="legend__count">{totalByCategory[cat.id] ?? 0}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
