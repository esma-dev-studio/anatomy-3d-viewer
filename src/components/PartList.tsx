// ============================================================================
// 部位一覧 — カテゴリ/エリア/検索で絞り込み、系統ごとにグループ表示。
// 行クリックで選択+フォーカス、チェックボックスで表示ON/OFF。
// ============================================================================
import { useMemo } from 'react';
import { anatomyParts } from '../data/anatomyParts';
import { CATEGORY_LIST } from '../data/categories';
import { useAnatomyStore } from '../store/useAnatomyStore';
import type { AnatomyPart, Category } from '../types/anatomy';

const SIDE_LABEL: Record<string, string> = { left: '左', right: '右', center: '' };

export function PartList() {
  const categoryFilter = useAnatomyStore((s) => s.categoryFilter);
  const regionFilter = useAnatomyStore((s) => s.regionFilter);
  const searchQuery = useAnatomyStore((s) => s.searchQuery);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return anatomyParts.filter((p) => {
      if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
      if (regionFilter !== 'all' && p.region !== regionFilter) return false;
      if (q) {
        const hay = `${p.nameJa} ${p.nameEn} ${p.subcategory}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [categoryFilter, regionFilter, searchQuery]);

  const groups = useMemo(() => {
    return CATEGORY_LIST.map((cat) => ({
      cat,
      parts: filtered.filter((p) => p.category === cat.id),
    })).filter((g) => g.parts.length > 0);
  }, [filtered]);

  if (filtered.length === 0) {
    return <p className="empty">該当する部位がありません。</p>;
  }

  return (
    <div className="part-list">
      {groups.map((g) => (
        <PartGroup key={g.cat.id} category={g.cat.id} parts={g.parts} />
      ))}
    </div>
  );
}

function PartGroup({ category, parts }: { category: Category; parts: AnatomyPart[] }) {
  const setCategoryPartsVisible = useAnatomyStore((s) => s.setCategoryPartsVisible);
  const catMeta = CATEGORY_LIST.find((c) => c.id === category)!;

  return (
    <div className="part-group">
      <div className="part-group__head">
        <span className="part-group__dot" style={{ background: catMeta.color }} />
        <span className="part-group__name">{catMeta.nameJa}</span>
        <span className="part-group__count">{parts.length}</span>
        <span className="part-group__bulk">
          <button onClick={() => setCategoryPartsVisible(category, true)}>全表示</button>
          <button onClick={() => setCategoryPartsVisible(category, false)}>全非表示</button>
        </span>
      </div>
      <ul>
        {parts.map((p) => (
          <PartRow key={p.id} part={p} />
        ))}
      </ul>
    </div>
  );
}

function PartRow({ part }: { part: AnatomyPart }) {
  const visible = useAnatomyStore((s) => !!s.partVisibility[part.id]);
  const layerOn = useAnatomyStore((s) => s.layerVisibility[part.category]);
  const selected = useAnatomyStore((s) => s.selectedPartId === part.id);
  const togglePart = useAnatomyStore((s) => s.togglePart);
  const selectPart = useAnatomyStore((s) => s.selectPart);

  const side = SIDE_LABEL[part.side];

  return (
    <li
      className={`part-row${selected ? ' is-selected' : ''}${!layerOn ? ' is-layer-off' : ''}`}
      onClick={() => selectPart(part.id, true)}
    >
      <input
        type="checkbox"
        className="part-row__check"
        checked={visible}
        onClick={(e) => e.stopPropagation()}
        onChange={() => togglePart(part.id)}
        title="表示 / 非表示"
      />
      <span className="part-row__name">
        {part.nameJa}
        {side && <span className="part-row__side">{side}</span>}
      </span>
      <span className="part-row__sub">{part.subcategory}</span>
    </li>
  );
}
