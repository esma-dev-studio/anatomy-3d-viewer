// ============================================================================
// 表示・選択状態の一元管理 (Zustand)
// 3D描画側とUI側はこの store のみを介して連携する(責務の分離)。
// ============================================================================
import { create } from 'zustand';
import { anatomyParts, partsById } from '../data/anatomyParts';
import { CATEGORIES } from '../data/categories';
import { focusPointOf, partRadius } from '../utils/geometry';
import type {
  Category,
  CategoryFilter,
  CameraCommand,
  DisplayMode,
  LabelMode,
  RegionFilter,
  ViewPreset,
} from '../types/anatomy';

type Bool = Record<string, boolean>;

const initialLayerVisibility: Record<Category, boolean> = {
  skin: CATEGORIES.skin.defaultVisible,
  skeleton: CATEGORIES.skeleton.defaultVisible,
  muscle: CATEGORIES.muscle.defaultVisible,
  organ: CATEGORIES.organ.defaultVisible,
};

const initialPartVisibility: Bool = Object.fromEntries(
  anatomyParts.map((p) => [p.id, p.visible]),
);

export interface AnatomyState {
  // --- 表示状態 ---
  layerVisibility: Record<Category, boolean>;
  partVisibility: Bool;
  // --- 選択・ホバー ---
  selectedPartId: string | null;
  hoveredPartId: string | null;
  // --- フィルタ・検索 ---
  categoryFilter: CategoryFilter;
  regionFilter: RegionFilter;
  searchQuery: string;
  // --- 表示オプション ---
  labelMode: LabelMode;
  displayMode: DisplayMode;
  // --- カメラ命令(nonce で再発火) ---
  cameraCommand: { cmd: CameraCommand; nonce: number } | null;
  // --- 実写モデル(骨格・筋肉)の部位アンカー(ラベル/フォーカス位置。読み込み後に設定) ---
  partAnchors: Record<string, [number, number, number]>;
  skeletonReady: boolean;
  // 実写モデルを既定フレームへ整列させる共有変換(骨格が算出し筋肉も同じ変換を使う)
  modelFit: { scale: number; position: [number, number, number]; rotationY: number } | null;

  // --- アクション ---
  toggleLayer: (cat: Category) => void;
  setLayerVisible: (cat: Category, v: boolean) => void;
  togglePart: (id: string) => void;
  setPartVisible: (id: string, v: boolean) => void;
  setCategoryPartsVisible: (cat: Category, v: boolean) => void;
  selectPart: (id: string | null, focus?: boolean) => void;
  setHovered: (id: string | null) => void;
  setCategoryFilter: (f: CategoryFilter) => void;
  setRegionFilter: (f: RegionFilter) => void;
  setSearchQuery: (q: string) => void;
  setLabelMode: (m: LabelMode) => void;
  setDisplayMode: (m: DisplayMode) => void;
  // カメラ
  setView: (preset: ViewPreset) => void;
  focusPart: (id: string) => void;
  resetView: () => void;
  zoomBy: (factor: number) => void;
  resetAll: () => void;
  // 実写骨格
  setPartAnchors: (anchors: Record<string, [number, number, number]>) => void;
  setModelFit: (fit: { scale: number; position: [number, number, number]; rotationY: number }) => void;
}

let cameraNonce = 0;
function nextCamera(cmd: CameraCommand) {
  cameraNonce += 1;
  return { cmd, nonce: cameraNonce };
}

/** 選択中の部位が非表示になったら選択を解除する(詳細パネルに隠れた部位が残らないように) */
function keepSelection(
  id: string | null,
  layerVisibility: Record<Category, boolean>,
  partVisibility: Bool,
): string | null {
  if (!id) return null;
  const part = partsById[id];
  if (!part) return id;
  return layerVisibility[part.category] && !!partVisibility[id] ? id : null;
}

export const useAnatomyStore = create<AnatomyState>((set, get) => ({
  layerVisibility: initialLayerVisibility,
  partVisibility: initialPartVisibility,
  selectedPartId: null,
  hoveredPartId: null,
  categoryFilter: 'all',
  regionFilter: 'all',
  searchQuery: '',
  labelMode: 'none',
  displayMode: 'normal',
  cameraCommand: null,
  partAnchors: {},
  skeletonReady: false,
  modelFit: null,

  toggleLayer: (cat) =>
    set((s) => {
      const layerVisibility = { ...s.layerVisibility, [cat]: !s.layerVisibility[cat] };
      return { layerVisibility, selectedPartId: keepSelection(s.selectedPartId, layerVisibility, s.partVisibility) };
    }),

  setLayerVisible: (cat, v) =>
    set((s) => {
      const layerVisibility = { ...s.layerVisibility, [cat]: v };
      return { layerVisibility, selectedPartId: keepSelection(s.selectedPartId, layerVisibility, s.partVisibility) };
    }),

  togglePart: (id) =>
    set((s) => {
      const partVisibility = { ...s.partVisibility, [id]: !s.partVisibility[id] };
      return { partVisibility, selectedPartId: keepSelection(s.selectedPartId, s.layerVisibility, partVisibility) };
    }),

  setPartVisible: (id, v) =>
    set((s) => {
      const partVisibility = { ...s.partVisibility, [id]: v };
      return { partVisibility, selectedPartId: keepSelection(s.selectedPartId, s.layerVisibility, partVisibility) };
    }),

  setCategoryPartsVisible: (cat, v) =>
    set((s) => {
      const next = { ...s.partVisibility };
      for (const p of anatomyParts) if (p.category === cat) next[p.id] = v;
      return { partVisibility: next, selectedPartId: keepSelection(s.selectedPartId, s.layerVisibility, next) };
    }),

  selectPart: (id, focus = false) => {
    set({ selectedPartId: id });
    if (id && focus) get().focusPart(id);
  },

  setHovered: (id) => set({ hoveredPartId: id }),
  setCategoryFilter: (f) => set({ categoryFilter: f }),
  setRegionFilter: (f) => set({ regionFilter: f }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  setLabelMode: (m) => set({ labelMode: m }),
  setDisplayMode: (m) => set({ displayMode: m }),

  setView: (preset) => set({ cameraCommand: nextCamera({ type: 'preset', preset }) }),

  focusPart: (id) => {
    const part = partsById[id];
    if (!part) return;
    // 実写骨格の部位はロード時に計算した実メッシュのアンカーを優先する。
    const anchor = get().partAnchors[id];
    const target = anchor ?? focusPointOf(part);
    // 部位の大きさに応じて寄り(フレーミング)を調整する。惑星クリックのように、
    // 小さい部位は近く、大きい部位は引いて全体が収まる距離にする。
    const r = partRadius(part);
    const distance = Math.min(2.4, Math.max(0.6, r * 3.4 + 0.35));
    set({ cameraCommand: nextCamera({ type: 'focus', target, distance }) });
  },

  resetView: () => set({ cameraCommand: nextCamera({ type: 'reset' }) }),

  zoomBy: (factor) => set({ cameraCommand: nextCamera({ type: 'zoom', factor }) }),

  resetAll: () =>
    set({
      layerVisibility: initialLayerVisibility,
      partVisibility: initialPartVisibility,
      selectedPartId: null,
      hoveredPartId: null,
      categoryFilter: 'all',
      regionFilter: 'all',
      searchQuery: '',
      labelMode: 'none',
      displayMode: 'normal',
    }),

  setPartAnchors: (anchors) =>
    set((s) => ({ partAnchors: { ...s.partAnchors, ...anchors } })),

  setModelFit: (fit) => set({ modelFit: fit, skeletonReady: true }),
}));

// ---------------------------------------------------------------------------
// 派生セレクタ (描画側で使用)
// ---------------------------------------------------------------------------

/** レイヤーと部位トグルの両方がONか(基本の表示判定) */
export function isBaseVisible(
  state: Pick<AnatomyState, 'layerVisibility' | 'partVisibility'>,
  partId: string,
): boolean {
  const part = partsById[partId];
  if (!part) return false;
  return state.layerVisibility[part.category] && !!state.partVisibility[partId];
}

/** 表示モードを加味した最終的な描画可否 */
export function isRenderVisible(state: AnatomyState, partId: string): boolean {
  if (!isBaseVisible(state, partId)) return false;
  // isolate: 選択部位のみ描画(未選択時は通常)
  if (state.displayMode === 'isolate' && state.selectedPartId) {
    return partId === state.selectedPartId;
  }
  return true;
}
