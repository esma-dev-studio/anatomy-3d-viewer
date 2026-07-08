// ============================================================================
// カテゴリ(レイヤー)定義 — 名称・系統色・既定表示
// ============================================================================
import type { Category } from '../types/anatomy';

export interface CategoryMeta {
  id: Category;
  nameJa: string;
  nameEn: string;
  /** 代表色(レイヤー凡例・スウォッチ用) */
  color: string;
  /** 初期レイヤー可視状態 */
  defaultVisible: boolean;
  /** レイヤーの並び(奥=皮膚, 手前=内臓 のイメージ) */
  order: number;
}

export const CATEGORIES: Record<Category, CategoryMeta> = {
  skin: {
    id: 'skin',
    nameJa: '皮膚 / 外観',
    nameEn: 'Skin',
    color: '#d8b89a',
    defaultVisible: false,
    order: 0,
  },
  skeleton: {
    id: 'skeleton',
    nameJa: '骨格',
    nameEn: 'Skeleton',
    color: '#e9e7e2',
    defaultVisible: true,
    order: 1,
  },
  muscle: {
    id: 'muscle',
    nameJa: '筋肉',
    nameEn: 'Muscle',
    color: '#c0414f',
    defaultVisible: false,
    order: 2,
  },
  organ: {
    id: 'organ',
    nameJa: '内臓',
    nameEn: 'Organs',
    color: '#d98c82',
    defaultVisible: false,
    order: 3,
  },
};

export const CATEGORY_LIST: CategoryMeta[] = Object.values(CATEGORIES).sort(
  (a, b) => a.order - b.order,
);

/** カテゴリフィルターの選択肢(全体 + 骨格系/筋系/内臓系) */
export const CATEGORY_FILTER_OPTIONS: { id: 'all' | Category; label: string }[] = [
  { id: 'all', label: '全体' },
  { id: 'skeleton', label: '骨格系' },
  { id: 'muscle', label: '筋系' },
  { id: 'organ', label: '内臓系' },
  { id: 'skin', label: '外観' },
];
