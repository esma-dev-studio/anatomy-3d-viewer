// ============================================================================
// 検索ボックス — 部位名(和名/英名/分類)で部位一覧を絞り込む。
// ============================================================================
import { useAnatomyStore } from '../store/useAnatomyStore';

export function SearchBox() {
  const searchQuery = useAnatomyStore((s) => s.searchQuery);
  const setSearchQuery = useAnatomyStore((s) => s.setSearchQuery);

  return (
    <div className="search">
      <span className="search__icon" aria-hidden>
        ⌕
      </span>
      <input
        className="search__input"
        type="text"
        placeholder="部位名で検索(例: 心臓, femur)"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      {searchQuery && (
        <button className="search__clear" onClick={() => setSearchQuery('')} aria-label="クリア">
          ×
        </button>
      )}
    </div>
  );
}
