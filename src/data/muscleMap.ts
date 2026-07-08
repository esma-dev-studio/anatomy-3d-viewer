// ============================================================================
// 実写筋肉GLB(muscles.glb / BodyParts3D由来・上肢+下肢の筋を抽出)のメッシュ名を
// アプリの筋部位IDに対応づけるマッパー + 筋部位の定義。
// すべて右半身のメッシュ(左は実行時にXミラーで生成)。判定はグループ名+筋名。
// 座標は骨格モデルと完全一致するため、骨格と同じ変換で正確に重なる。
// ============================================================================
import type { Region } from '../types/anatomy';

/**
 * 筋メッシュ(名前 + 親グループ名)を筋部位ベースIDへ対応づける。
 * グループ: "Muscles"(脚) / "Arm - muscles" / "Forearm - muscles" /
 *           "Hand and wrist - muscles" / "Pectoral girdle - muscles"
 */
export function matchMusclePartId(name: string, group: string): string | null {
  const n = name.toLowerCase();
  const g = (group || '').toLowerCase();

  // --- 上肢・肩(グループで判定) ---
  if (g.includes('hand and wrist')) return 'm_hand';
  if (g.includes('forearm')) return 'm_forearm';
  if (g.includes('arm - muscles')) {
    if (/triceps|anconeus/.test(n)) return 'm_triceps';
    if (/biceps/.test(n)) return 'm_biceps';
    return 'm_brachialis'; // brachialis, coracobrachialis
  }
  if (g.includes('pectoral girdle')) {
    if (/deltoid/.test(n)) return 'm_deltoid';
    if (/pectoralis/.test(n)) return 'm_pectoralis';
    if (/trapezius/.test(n)) return 'm_trapezius';
    if (/latissimus/.test(n)) return 'm_latissimus';
    // 回旋筋腱板・前鋸筋・菱形筋・肩甲挙筋・大円筋・鎖骨下筋 など
    return 'm_shoulder';
  }

  // --- 下肢(グループ "Muscles"): 筋名で判定 ---
  if (/gluteus maximus/.test(n)) return 'm_glutemax';
  if (/gluteus medius|gluteus minimus|tensor fasciae|piriformis|gemellus|obturator|quadratus femoris|iliacus|psoas|coccygeus/.test(n))
    return 'm_hip';
  if (/quadriceps|rectus femoris|vastus|articularis genus/.test(n)) return 'm_quadriceps';
  if (/biceps femoris|semitendinosus|semimembranosus/.test(n)) return 'm_hamstrings';
  if (/adductor (longus|brevis|magnus)|pectineus|gracilis|sartorius|pes anserinus/.test(n))
    return 'm_adductors';
  if (/gastrocnemius|soleus|plantaris|calcaneal tendon|popliteus/.test(n)) return 'm_calf';
  // すね(前脛骨筋・腓骨筋・長趾筋など。足内在筋より先に判定)
  if (/tibialis|fibularis|extensor digitorum longus|extensor hallucis longus|flexor digitorum longus|flexor hallucis longus|infrapatellar/.test(n))
    return 'm_shin';
  // 足内在筋
  if (/of foot|toes|hallucis|digitorum brevis|digiti minimi|interossei|lumbrical|plantae|plantar|abductor/.test(n))
    return 'm_foot';

  return null;
}

export interface MuscleDef {
  base: string;
  nameJa: string;
  nameEn: string;
  subcategory: string;
  region: Region;
  description: string;
  function: string;
  isMajorPart?: boolean;
}

/** 実写筋肉モデルから公開する筋部位(18種・左右で計36) */
export const MUSCLE_DEFS: MuscleDef[] = [
  { base: 'm_deltoid', nameJa: '三角筋', nameEn: 'Deltoid', subcategory: '肩の筋', region: 'arm', description: '肩を覆う三角形の筋。', function: '腕の外転・屈曲・伸展。', isMajorPart: true },
  { base: 'm_pectoralis', nameJa: '大胸筋', nameEn: 'Pectoralis', subcategory: '胸部の筋', region: 'chest', description: '胸の前面を覆う扇状の大きな筋(大胸筋・小胸筋)。', function: '腕を前方・内側へ動かす。', isMajorPart: true },
  { base: 'm_trapezius', nameJa: '僧帽筋', nameEn: 'Trapezius', subcategory: '背部の筋', region: 'back', description: '首から背中上部に広がる菱形の筋。', function: '肩甲骨の挙上・内転、頭頸部の支持。', isMajorPart: true },
  { base: 'm_latissimus', nameJa: '広背筋', nameEn: 'Latissimus Dorsi', subcategory: '背部の筋', region: 'back', description: '背中の下部を広く覆う筋。', function: '腕を後方・下方へ引く。', isMajorPart: true },
  { base: 'm_shoulder', nameJa: '肩甲帯の筋', nameEn: 'Shoulder Girdle Muscles', subcategory: '肩の筋', region: 'back', description: '回旋筋腱板・前鋸筋・菱形筋・大円筋・肩甲挙筋など。', function: '肩甲骨と肩関節を安定させ、細かな動きを担う。' },
  { base: 'm_biceps', nameJa: '上腕二頭筋', nameEn: 'Biceps Brachii', subcategory: '上腕の筋', region: 'arm', description: '上腕前面のいわゆる「力こぶ」の筋。', function: '肘関節の屈曲、前腕の回外。', isMajorPart: true },
  { base: 'm_triceps', nameJa: '上腕三頭筋', nameEn: 'Triceps Brachii', subcategory: '上腕の筋', region: 'arm', description: '上腕後面の3頭からなる筋。', function: '肘関節の伸展。', isMajorPart: true },
  { base: 'm_brachialis', nameJa: '上腕筋', nameEn: 'Brachialis', subcategory: '上腕の筋', region: 'arm', description: '上腕二頭筋の深部にある筋(烏口腕筋を含む)。', function: '肘関節の屈曲。' },
  { base: 'm_forearm', nameJa: '前腕の筋', nameEn: 'Forearm Muscles', subcategory: '前腕の筋', region: 'arm', description: '手首と指を動かす前腕の筋群(屈筋・伸筋・回内外筋)。', function: '手首・手指の屈曲・伸展・回内・回外。' },
  { base: 'm_hand', nameJa: '手の筋', nameEn: 'Hand Muscles', subcategory: '手の筋', region: 'arm', description: '手の中にある小さな筋(手内在筋)。', function: '指の精密で複雑な運動。' },
  { base: 'm_glutemax', nameJa: '大殿筋', nameEn: 'Gluteus Maximus', subcategory: '臀部の筋', region: 'pelvis', description: '臀部を形成する大きな筋。', function: '股関節の伸展、立位・歩行の推進。', isMajorPart: true },
  { base: 'm_hip', nameJa: '殿筋・股関節の筋', nameEn: 'Hip Muscles', subcategory: '臀部の筋', region: 'pelvis', description: '中殿筋・小殿筋・腸腰筋・深層外旋筋など。', function: '股関節の外転・屈曲・回旋、骨盤の安定。' },
  { base: 'm_quadriceps', nameJa: '大腿四頭筋', nameEn: 'Quadriceps Femoris', subcategory: '大腿の筋', region: 'leg', description: '大腿前面の4つの筋の総称。', function: '膝関節の伸展、股関節の屈曲。', isMajorPart: true },
  { base: 'm_hamstrings', nameJa: 'ハムストリング', nameEn: 'Hamstrings', subcategory: '大腿の筋', region: 'leg', description: '大腿後面の3つの筋の総称。', function: '膝関節の屈曲、股関節の伸展。', isMajorPart: true },
  { base: 'm_adductors', nameJa: '内転筋・縫工筋', nameEn: 'Adductors / Sartorius', subcategory: '大腿の筋', region: 'leg', description: '大腿内側の内転筋群と縫工筋。', function: '脚を内側へ閉じる、股関節の屈曲・回旋。' },
  { base: 'm_calf', nameJa: '下腿三頭筋', nameEn: 'Calf (Triceps Surae)', subcategory: '下腿の筋', region: 'leg', description: 'ふくらはぎを形成する腓腹筋・ヒラメ筋など。', function: '足関節の底屈、歩行・跳躍の推進。', isMajorPart: true },
  { base: 'm_shin', nameJa: '下腿前面・深部の筋', nameEn: 'Shin & Deep Leg Muscles', subcategory: '下腿の筋', region: 'leg', description: '前脛骨筋・腓骨筋・長趾筋など。', function: '足関節の背屈・内外反、足趾の運動。' },
  { base: 'm_foot', nameJa: '足の筋', nameEn: 'Foot Muscles', subcategory: '足の筋', region: 'leg', description: '足の中にある小さな筋(足内在筋)。', function: '足のアーチ維持と足趾の運動。' },
];

/** 筋肉モデルのパス */
export const MUSCLES_URL = `${import.meta.env.BASE_URL}models/muscles.glb`;
