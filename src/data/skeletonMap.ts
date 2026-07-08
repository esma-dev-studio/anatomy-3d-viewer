// ============================================================================
// 実写骨格GLB(overview-skeleton.glb / BodyParts3D由来)のメッシュ名を、
// アプリの部位ID(anatomyParts)に対応づけるマッパー。
//
// モデルは右半身+体幹のみを含み(左は実行時にXミラーで生成)、名称は英語:
//   例) "Femur.r", "Thoracic vertebrae (T5)", "Rib (3rd).r", "Hip bone.r"
// ============================================================================

/** マッチ結果。paired=true の部位は左右で _r/_l に分ける。false は正中(単一)。 */
export interface SkelMatch {
  base: string; // 部位IDのベース(anatomyParts の id と対応)
  paired: boolean;
}

/**
 * メッシュ名から部位ベースIDを判定する。
 * 判定順は「足→手」「具体→総称」の順(誤マッチ防止)。
 */
export function matchPartId(rawName: string): SkelMatch | null {
  const n = rawName.toLowerCase();

  // 胸郭(肋骨・肋軟骨・胸骨) — 正中部位 ribs に集約
  if (/costal cart|sternum|manubrium|\brib\b|rib \(/.test(n)) return { base: 'ribs', paired: false };
  // 骨盤(寛骨) — 正中部位 pelvis に集約
  if (/hip bone|\bilium|ischium|\bpubis/.test(n)) return { base: 'pelvis', paired: false };

  // 上肢帯・上肢(左右)
  if (/clavicle/.test(n)) return { base: 'clavicle', paired: true };
  if (/scapula/.test(n)) return { base: 'scapula', paired: true };
  if (/humerus/.test(n)) return { base: 'humerus', paired: true };
  if (/radius/.test(n)) return { base: 'radius', paired: true };
  if (/ulna/.test(n)) return { base: 'ulna', paired: true };

  // 下肢(左右) — patella は femur/tibia より先に
  if (/patella/.test(n)) return { base: 'patella', paired: true };
  if (/femur/.test(n)) return { base: 'femur', paired: true };
  if (/tibia/.test(n)) return { base: 'tibia', paired: true };
  if (/fibula/.test(n)) return { base: 'fibula', paired: true };

  // 足の骨(手より先に判定: "finger of foot" が手にマッチしないように)
  if (
    /finger of foot|metatarsal|calcaneus|talus|navicular|cuboid|cuneiform|sesamoid bones of foot/.test(
      n,
    )
  )
    return { base: 'foot', paired: true };

  // 手の骨
  if (
    /finger|metacarpal|capitate|hamate|lunate|pisiform|scaphoid|trapezium|trapezoid|triquetrum|sesamoid_bones_of_hand|sesamoid bones of hand/.test(
      n,
    )
  )
    return { base: 'hand', paired: true };

  // 脊椎(椎骨・仙骨・尾骨) — 正中
  if (/vertebrae|atlas|axis|sacrum|coccyx/.test(n)) return { base: 'spine', paired: false };

  // 頭蓋(残りの頭部の骨・歯) — 正中に集約
  if (
    /frontal|parietal|occipital|temporal|sphenoid|ethmoid|maxilla|mandible|zygomatic|nasal|lacrimal|palatine|vomer|concha|hyoid|canine|incisor|molar|premolar|tooth/.test(
      n,
    )
  )
    return { base: 'skull', paired: false };

  return null;
}

/** GLB内でミラー(左側生成)の対象とするグループ名 */
export const MIRROR_GROUP_NAMES = ['Bones_right', 'Cartilages_right'];

/** モデルファイルのパス(Vite base を考慮して解決) */
export const SKELETON_URL = `${import.meta.env.BASE_URL}models/skeleton.glb`;

/** Draco デコーダの配置パス(CDN非依存で同梱) */
export const DRACO_PATH = `${import.meta.env.BASE_URL}draco/`;
