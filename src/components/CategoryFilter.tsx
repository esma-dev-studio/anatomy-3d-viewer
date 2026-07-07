// ============================================================================
// カテゴリフィルター — 部位一覧を系統で絞り込む(全体/骨格系/筋系/内臓系/外観)
// ============================================================================
import { CATEGORY_FILTER_OPTIONS } from '../data/categories';
import { useAnatomyStore } from '../store/useAnatomyStore';

export function CategoryFilter() {
  const categoryFilter = useAnatomyStore((s) => s.categoryFilter);
  const setCategoryFilter = useAnatomyStore((s) => s.setCategoryFilter);

  return (
    <div className="chip-row">
      {CATEGORY_FILTER_OPTIONS.map((o) => (
        <button
          key={o.id}
          className={`chip${categoryFilter === o.id ? ' is-active' : ''}`}
          onClick={() => setCategoryFilter(o.id)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
