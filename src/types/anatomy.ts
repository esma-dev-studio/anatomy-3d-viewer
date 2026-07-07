// ============================================================================
// 人体解剖ビューア 型定義
// UI状態と3Dモデル定義を共通で参照する型のみをここに集約する。
// ============================================================================

/** 大分類レイヤー */
export type Category = 'skin' | 'skeleton' | 'muscle' | 'organ';

/** 左右の別。center は正中(単一)部位 */
export type Side = 'left' | 'right' | 'center';

/** 体のエリア(絞り込み用) */
export type Region =
  | 'head'
  | 'neck'
  | 'chest'
  | 'abdomen'
  | 'back'
  | 'pelvis'
  | 'arm'
  | 'leg';

/** プロシージャル形状の種類 */
export type ShapeKind = 'sphere' | 'capsule' | 'cylinder' | 'box' | 'torus';

/**
 * 1つの形状ピース。args は shape ごとに解釈が異なる。
 *  - sphere:   [radius]
 *  - capsule:  [radius, length]
 *  - cylinder: [radiusTop, radiusBottom, height]
 *  - box:      [width, height, depth]
 *  - torus:    [radius, tube, arc?]
 */
export interface ShapePiece {
  shape: ShapeKind;
  args: number[];
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
}

/** 1部位の完全な定義(データ + 表示メタデータ) */
export interface AnatomyPart {
  id: string;
  nameJa: string;
  nameEn: string;
  category: Category;
  /** 系統内の細分類 (例: 体幹骨・上肢骨・呼吸器 など) */
  subcategory: string;
  /** 体のエリア */
  region: Region;
  description: string;
  /** 主な役割 */
  function: string;
  side: Side;
  /** 初期表示状態 */
  visible: boolean;
  /** 将来 GLB を差し替える際にメッシュと紐づけるためのID */
  meshId: string;
  /** 主要部位か(ラベル「主要のみ」やハイライトの対象) */
  isMajorPart: boolean;
  /** 系統色(未指定ならカテゴリ既定色) */
  color: string;
  /** 形状ピース群 */
  pieces: ShapePiece[];
  /** ラベルのアンカー位置(未指定なら重心 + オフセット) */
  labelAnchor?: [number, number, number];
  /** 関連部位ID */
  relatedParts?: string[];
  /** カメラフォーカス時の注視点(未指定なら重心) */
  cameraFocusPoint?: [number, number, number];
}

/** ラベル表示モード */
export type LabelMode = 'none' | 'major' | 'all';

/**
 * 表示モード
 *  - normal:    通常表示
 *  - emphasize: 選択部位を強調
 *  - dim:       他部位を半透明化
 *  - isolate:   選択部位のみ単独表示
 */
export type DisplayMode = 'normal' | 'emphasize' | 'dim' | 'isolate';

/** カテゴリフィルター(部位一覧の絞り込み) */
export type CategoryFilter = Category | 'all';

/** エリアフィルター */
export type RegionFilter = Region | 'all';

/** 視点プリセット */
export type ViewPreset = 'front' | 'back' | 'left' | 'right' | 'top' | 'iso';

/** カメラ操作コマンド(store → CameraController) */
export type CameraCommand =
  | { type: 'preset'; preset: ViewPreset }
  | { type: 'reset' }
  | { type: 'focus'; target: [number, number, number]; distance?: number }
  | { type: 'zoom'; factor: number };
