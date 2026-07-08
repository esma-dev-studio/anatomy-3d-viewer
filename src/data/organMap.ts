// ============================================================================
// 実写内臓モデル(organs.glb / HuBMAP HRA・Visible Human 由来, CC BY 4.0)の定義。
// 各臓器は 1 つの名前付きノード(brain, heart, ...)にまとめてあり、
// 臓器同士は解剖学的な相対位置で整列済み。実行時にまとめて胴体へフィットさせる。
// ============================================================================
import type { Region, Side } from '../types/anatomy';

export interface OrganDef {
  id: string;
  nameJa: string;
  nameEn: string;
  subcategory: string;
  region: Region;
  side: Side;
  color: string;
  description: string;
  function: string;
  isMajorPart?: boolean;
}

export const ORGAN_DEFS: OrganDef[] = [
  { id: 'brain', nameJa: '脳', nameEn: 'Brain', subcategory: '神経系', region: 'head', side: 'center', color: '#e6a3b6', description: '頭蓋内にある中枢神経。大脳・小脳・脳幹からなる。', function: '思考・感覚・運動・自律機能の統合制御。', isMajorPart: true },
  { id: 'heart', nameJa: '心臓', nameEn: 'Heart', subcategory: '循環器系', region: 'chest', side: 'center', color: '#c0303a', description: '胸腔中央やや左にある筋性の臓器。', function: '全身への血液の拍出(ポンプ機能)。', isMajorPart: true },
  { id: 'lung', nameJa: '肺', nameEn: 'Lungs', subcategory: '呼吸器系', region: 'chest', side: 'center', color: '#d98c82', description: '胸腔内で心臓を挟む左右一対の臓器。', function: 'ガス交換(酸素の取り込みと二酸化炭素の排出)。', isMajorPart: true },
  { id: 'liver', nameJa: '肝臓', nameEn: 'Liver', subcategory: '消化器系', region: 'abdomen', side: 'center', color: '#8a5240', description: '右上腹部にある人体最大の内臓。', function: '代謝・解毒・胆汁の生成、栄養の貯蔵。', isMajorPart: true },
  { id: 'kidney_r', nameJa: '腎臓（右）', nameEn: 'Kidney (R)', subcategory: '泌尿器系', region: 'abdomen', side: 'right', color: '#9c5040', description: '背側腹部にあるソラマメ状の臓器。', function: '血液の濾過と尿の生成、体液の調節。', isMajorPart: true },
  { id: 'kidney_l', nameJa: '腎臓（左）', nameEn: 'Kidney (L)', subcategory: '泌尿器系', region: 'abdomen', side: 'left', color: '#9c5040', description: '背側腹部にあるソラマメ状の臓器。', function: '血液の濾過と尿の生成、体液の調節。', isMajorPart: true },
  { id: 'spleen', nameJa: '脾臓', nameEn: 'Spleen', subcategory: 'リンパ系', region: 'abdomen', side: 'left', color: '#7c4a58', description: '左上腹部にあるリンパ系の臓器。', function: '古くなった赤血球の処理、免疫機能。' },
  { id: 'pancreas', nameJa: '膵臓', nameEn: 'Pancreas', subcategory: '消化器系', region: 'abdomen', side: 'center', color: '#d7b45a', description: '胃の後方に位置する細長い臓器。', function: '消化酵素とインスリンなどのホルモン分泌。' },
  { id: 'small_intestine', nameJa: '小腸', nameEn: 'Small Intestine', subcategory: '消化器系', region: 'abdomen', side: 'center', color: '#e0a878', description: '腹部中央でとぐろを巻く長い管状の器官。', function: '栄養素の消化と吸収の主要な場。', isMajorPart: true },
  { id: 'large_intestine', nameJa: '大腸', nameEn: 'Large Intestine', subcategory: '消化器系', region: 'abdomen', side: 'center', color: '#c8895a', description: '小腸を囲む太い管。上行・横行・下行結腸などからなる。', function: '水分の吸収と便の形成。', isMajorPart: true },
  { id: 'bladder', nameJa: '膀胱', nameEn: 'Urinary Bladder', subcategory: '泌尿器系', region: 'pelvis', side: 'center', color: '#d6c96a', description: '骨盤内にある尿をためる袋状の臓器。', function: '尿の一時貯留と排出。' },
];

export const ORGAN_IDS = new Set(ORGAN_DEFS.map((d) => d.id));
export const ORGAN_COLORS: Record<string, string> = Object.fromEntries(
  ORGAN_DEFS.map((d) => [d.id, d.color]),
);

export const ORGANS_URL = `${import.meta.env.BASE_URL}models/organs.glb`;
