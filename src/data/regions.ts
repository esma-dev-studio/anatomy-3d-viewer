// ============================================================================
// 体のエリア(Region)定義 — 「肩・胸・脚」などのエリア絞り込み用
// ============================================================================
import type { Region } from '../types/anatomy';

export interface RegionMeta {
  id: Region;
  nameJa: string;
  nameEn: string;
}

export const REGIONS: Record<Region, RegionMeta> = {
  head: { id: 'head', nameJa: '頭部', nameEn: 'Head' },
  neck: { id: 'neck', nameJa: '頸部', nameEn: 'Neck' },
  chest: { id: 'chest', nameJa: '胸部', nameEn: 'Chest' },
  abdomen: { id: 'abdomen', nameJa: '腹部', nameEn: 'Abdomen' },
  back: { id: 'back', nameJa: '背部', nameEn: 'Back' },
  pelvis: { id: 'pelvis', nameJa: '骨盤部', nameEn: 'Pelvis' },
  arm: { id: 'arm', nameJa: '腕', nameEn: 'Arm' },
  leg: { id: 'leg', nameJa: '脚', nameEn: 'Leg' },
};

export const REGION_LIST: RegionMeta[] = Object.values(REGIONS);

/** エリアフィルターの選択肢(全体を先頭に) */
export const REGION_FILTER_OPTIONS: { id: 'all' | Region; label: string }[] = [
  { id: 'all', label: '全身' },
  ...REGION_LIST.map((r) => ({ id: r.id, label: r.nameJa })),
];
