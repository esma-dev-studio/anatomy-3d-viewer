// ============================================================================
// 人体部位データ (MVP)
// 各部位は「メタデータ + プロシージャル形状ピース群」で構成される。
// 座標系: Y上向き、原点はほぼ骨盤中心。身長 ≒ 1.8 (足元 y≈-0.9 / 頭頂 y≈0.9)。
// 規約: モデルは正面(+Z)を向く。身体の右側は画面左(x<0)に配置し、
//       makePair() で左側(x>0)を自動生成する。
// ============================================================================
import type {
  AnatomyPart,
  Category,
  Region,
  ShapePiece,
  Side,
} from '../types/anatomy';
import { CATEGORIES } from './categories';
import { MUSCLE_DEFS } from './muscleMap';
import { linspace, makePair } from '../utils/geometry';

// --- 部位ビルダー(既定値の補完) --------------------------------------------
interface PartInput {
  id: string;
  nameJa: string;
  nameEn: string;
  category: Category;
  subcategory: string;
  region: Region;
  description: string;
  function: string;
  pieces: ShapePiece[];
  color?: string;
  isMajorPart?: boolean;
  side?: Side;
  visible?: boolean;
  labelAnchor?: [number, number, number];
  cameraFocusPoint?: [number, number, number];
  relatedParts?: string[];
}

function P(input: PartInput): AnatomyPart {
  return {
    id: input.id,
    nameJa: input.nameJa,
    nameEn: input.nameEn,
    category: input.category,
    subcategory: input.subcategory,
    region: input.region,
    description: input.description,
    function: input.function,
    side: input.side ?? 'center',
    visible: input.visible ?? true,
    meshId: input.id,
    isMajorPart: input.isMajorPart ?? false,
    color: input.color ?? CATEGORIES[input.category].color,
    pieces: input.pieces,
    labelAnchor: input.labelAnchor,
    cameraFocusPoint: input.cameraFocusPoint,
    relatedParts: input.relatedParts,
  };
}

// --- 色パレット(骨は既定のカテゴリ色を使用) --------------------------------
const MUSCLE = '#c0414f';

// ============================================================================
// 生成ピース(椎骨・肋骨・腹直筋)
// ============================================================================
const spinePieces: ShapePiece[] = linspace(0.6, -0.055, 18).map((y) => ({
  shape: 'cylinder',
  args: [0.02, 0.022, 0.03],
  position: [0, y, -0.035 + 0.018 * Math.sin((0.62 - y) * 4.2)],
}));

const ribPieces: ShapePiece[] = linspace(0, 1, 7).map((t) => {
  const y = 0.44 - t * 0.26; // 0.44 → 0.18
  const r = 0.098 + 0.052 * Math.sin(Math.PI * (0.15 + t * 0.7)); // 中段が最大幅
  return {
    shape: 'torus' as const,
    args: [r, 0.0075],
    position: [0, y, 0.0] as [number, number, number],
    rotation: [Math.PI / 2, 0, 0] as [number, number, number],
    scale: [1, 0.72, 1] as [number, number, number],
  };
});
ribPieces.push({
  shape: 'box',
  args: [0.03, 0.17, 0.02],
  position: [0, 0.33, 0.093],
}); // 胸骨

const sixPackPieces: ShapePiece[] = [];
for (const y of linspace(0.2, 0.03, 4)) {
  for (const x of [-0.035, 0.035]) {
    sixPackPieces.push({
      shape: 'box',
      args: [0.045, 0.038, 0.03],
      position: [x, y, 0.11],
    });
  }
}

// ============================================================================
// 皮膚 / 外観 (半透明シェル・単一部位)
// ============================================================================
const skinLimbsRight: ShapePiece[] = [
  { shape: 'sphere', args: [0.07], position: [-0.185, 0.5, 0], scale: [1, 1.05, 1] }, // 肩
  { shape: 'capsule', args: [0.048, 0.3], position: [-0.2, 0.33, 0.005] }, // 上腕
  { shape: 'capsule', args: [0.04, 0.26], position: [-0.232, 0.0, 0.01] }, // 前腕
  { shape: 'sphere', args: [0.05], position: [-0.245, -0.185, 0.02], scale: [0.8, 1.3, 0.5] }, // 手
  { shape: 'capsule', args: [0.078, 0.28], position: [-0.1, -0.32, 0.005] }, // 大腿
  { shape: 'capsule', args: [0.056, 0.28], position: [-0.095, -0.7, 0.005] }, // 下腿
  { shape: 'box', args: [0.08, 0.05, 0.19], position: [-0.095, -0.885, 0.06] }, // 足
];

const skinPieces: ShapePiece[] = [
  { shape: 'sphere', args: [0.125], position: [0, 0.79, 0], scale: [1, 1.12, 1.02] }, // 頭
  { shape: 'cylinder', args: [0.05, 0.06, 0.11], position: [0, 0.635, 0] }, // 首
  { shape: 'capsule', args: [0.155, 0.33], position: [0, 0.31, 0], scale: [1.18, 1.0, 0.72] }, // 胴
  { shape: 'sphere', args: [0.145], position: [0, -0.055, 0], scale: [1.15, 0.85, 0.78] }, // 腰
  ...skinLimbsRight,
  ...skinLimbsRight.map((p) => ({
    ...p,
    position: [-p.position[0], p.position[1], p.position[2]] as [number, number, number],
    scale: p.scale ? ([...p.scale] as [number, number, number]) : undefined,
  })),
];

const skinParts: AnatomyPart[] = [
  P({
    id: 'skin_body',
    nameJa: '皮膚 / 外観',
    nameEn: 'Skin / Body Surface',
    category: 'skin',
    subcategory: '外皮系',
    region: 'chest',
    description:
      '身体の最外層。半透明で表示され、内部の骨格・筋肉・内臓の位置関係を確認できる。',
    function: '体内の保護、体温・水分の調節、感覚受容。',
    isMajorPart: true,
    labelAnchor: [0, 0.95, 0],
    pieces: skinPieces,
  }),
];

// ============================================================================
// 骨格
// ============================================================================
const boneParts: AnatomyPart[] = [
  P({
    id: 'skull',
    nameJa: '頭蓋骨',
    nameEn: 'Skull',
    category: 'skeleton',
    subcategory: '頭蓋',
    region: 'head',
    description: '脳を収める頭部の骨。脳頭蓋と顔面頭蓋からなる。',
    function: '脳・感覚器の保護、咀嚼や表情の土台。',
    isMajorPart: true,
    labelAnchor: [0, 0.93, 0],
    pieces: [
      { shape: 'sphere', args: [0.105], position: [0, 0.81, 0], scale: [1, 1.1, 1.05] },
      { shape: 'box', args: [0.12, 0.06, 0.11], position: [0, 0.725, 0.01] },
    ],
  }),
  P({
    id: 'spine',
    nameJa: '脊椎',
    nameEn: 'Vertebral Column',
    category: 'skeleton',
    subcategory: '体幹骨',
    region: 'back',
    description: '頸椎・胸椎・腰椎などが連なる背骨。脊髄を通す。',
    function: '体幹の支持、姿勢保持、脊髄の保護。',
    isMajorPart: true,
    labelAnchor: [0, 0.5, -0.12],
    pieces: spinePieces,
  }),
  P({
    id: 'ribs',
    nameJa: '肋骨',
    nameEn: 'Ribs',
    category: 'skeleton',
    subcategory: '体幹骨',
    region: 'chest',
    description: '胸郭を形成する弓状の骨。胸骨とともに胸腔を囲む。',
    function: '心臓・肺の保護、呼吸運動の補助。',
    isMajorPart: true,
    labelAnchor: [0, 0.42, 0.14],
    pieces: ribPieces,
  }),
  P({
    id: 'pelvis',
    nameJa: '骨盤',
    nameEn: 'Pelvis',
    category: 'skeleton',
    subcategory: '体幹骨',
    region: 'pelvis',
    description: '寛骨・仙骨からなる骨の輪。上半身と下肢をつなぐ。',
    function: '内臓の支持、体重の下肢への伝達。',
    isMajorPart: true,
    labelAnchor: [0, -0.06, 0.16],
    pieces: [
      {
        shape: 'torus',
        args: [0.11, 0.03],
        position: [0, -0.06, 0],
        rotation: [Math.PI / 2, 0, 0],
        scale: [1.2, 0.7, 1],
      },
      { shape: 'box', args: [0.02, 0.13, 0.11], position: [-0.1, -0.02, -0.02], rotation: [0, 0, 0.2] },
      { shape: 'box', args: [0.02, 0.13, 0.11], position: [0.1, -0.02, -0.02], rotation: [0, 0, -0.2] },
    ],
  }),
  // --- 上肢骨 (左右) ---
  ...makePair(
    P({
      id: 'humerus',
      nameJa: '上腕骨',
      nameEn: 'Humerus',
      category: 'skeleton',
      subcategory: '上肢骨',
      region: 'arm',
      description: '肩から肘までの上腕の骨。',
      function: '上腕の支持、肩・肘関節の運動。',
      isMajorPart: true,
      pieces: [
        { shape: 'sphere', args: [0.03], position: [-0.185, 0.5, 0] },
        { shape: 'cylinder', args: [0.021, 0.025, 0.34], position: [-0.2, 0.33, 0.005] },
      ],
    }),
  ),
  ...makePair(
    P({
      id: 'radius',
      nameJa: '橈骨',
      nameEn: 'Radius',
      category: 'skeleton',
      subcategory: '上肢骨',
      region: 'arm',
      description: '前腕の親指側にある骨。',
      function: '前腕の回内・回外運動を担う。',
      pieces: [{ shape: 'cylinder', args: [0.014, 0.018, 0.28], position: [-0.225, 0.0, 0.02] }],
    }),
  ),
  ...makePair(
    P({
      id: 'ulna',
      nameJa: '尺骨',
      nameEn: 'Ulna',
      category: 'skeleton',
      subcategory: '上肢骨',
      region: 'arm',
      description: '前腕の小指側にある骨。肘頭を形成する。',
      function: '肘関節の安定、前腕の支持。',
      pieces: [{ shape: 'cylinder', args: [0.015, 0.019, 0.3], position: [-0.246, -0.005, -0.005] }],
    }),
  ),
  // --- 下肢骨 (左右) ---
  ...makePair(
    P({
      id: 'femur',
      nameJa: '大腿骨',
      nameEn: 'Femur',
      category: 'skeleton',
      subcategory: '下肢骨',
      region: 'leg',
      description: '人体で最も長く強い骨。股関節から膝まで。',
      function: '体重の支持、歩行・走行時の力の伝達。',
      isMajorPart: true,
      pieces: [
        { shape: 'sphere', args: [0.035], position: [-0.09, -0.08, 0] },
        { shape: 'cylinder', args: [0.026, 0.032, 0.4], position: [-0.1, -0.32, 0.005] },
      ],
    }),
  ),
  ...makePair(
    P({
      id: 'tibia',
      nameJa: '脛骨',
      nameEn: 'Tibia',
      category: 'skeleton',
      subcategory: '下肢骨',
      region: 'leg',
      description: '下腿の内側にある太い骨(すね)。',
      function: '体重を足へ伝える主要な支持骨。',
      pieces: [{ shape: 'cylinder', args: [0.022, 0.028, 0.34], position: [-0.088, -0.7, 0.008] }],
    }),
  ),
  ...makePair(
    P({
      id: 'fibula',
      nameJa: '腓骨',
      nameEn: 'Fibula',
      category: 'skeleton',
      subcategory: '下肢骨',
      region: 'leg',
      description: '下腿の外側にある細い骨。',
      function: '足関節の安定、筋の付着部。',
      pieces: [{ shape: 'cylinder', args: [0.012, 0.014, 0.32], position: [-0.118, -0.7, -0.004] }],
    }),
  ),
  // --- 実写骨格モデルに含まれる追加の骨(プリミティブ形状は持たず、実メッシュが描画) ---
  ...makePair(
    P({
      id: 'clavicle',
      nameJa: '鎖骨',
      nameEn: 'Clavicle',
      category: 'skeleton',
      subcategory: '上肢帯',
      region: 'chest',
      description: '胸骨と肩甲骨をつなぐS字状の骨。',
      function: '肩を体幹につなぎ、上肢の可動域を確保する。',
      pieces: [],
    }),
  ),
  ...makePair(
    P({
      id: 'scapula',
      nameJa: '肩甲骨',
      nameEn: 'Scapula',
      category: 'skeleton',
      subcategory: '上肢帯',
      region: 'back',
      description: '背側にある逆三角形の平たい骨(肩甲骨)。',
      function: '肩関節の受け皿、多くの上肢筋の付着部。',
      pieces: [],
    }),
  ),
  ...makePair(
    P({
      id: 'hand',
      nameJa: '手の骨',
      nameEn: 'Bones of the Hand',
      category: 'skeleton',
      subcategory: '上肢骨',
      region: 'arm',
      description: '手根骨・中手骨・指骨の総称。',
      function: '手の複雑で精密な運動を可能にする。',
      pieces: [],
    }),
  ),
  ...makePair(
    P({
      id: 'patella',
      nameJa: '膝蓋骨',
      nameEn: 'Patella',
      category: 'skeleton',
      subcategory: '下肢骨',
      region: 'leg',
      description: '膝の前面にある種子骨(膝の皿)。',
      function: '膝の伸展効率を高め、関節を保護する。',
      pieces: [],
    }),
  ),
  ...makePair(
    P({
      id: 'foot',
      nameJa: '足の骨',
      nameEn: 'Bones of the Foot',
      category: 'skeleton',
      subcategory: '下肢骨',
      region: 'leg',
      description: '足根骨・中足骨・趾骨の総称。',
      function: '体重を支え、歩行の踏み出しを担う。',
      pieces: [],
    }),
  ),
];

// ============================================================================
// 筋肉(実写筋肉モデル muscles.glb に対応。プリミティブ形状は持たない)
// ============================================================================
const muscleParts: AnatomyPart[] = MUSCLE_DEFS.flatMap((d) =>
  makePair(
    P({
      id: d.base,
      nameJa: d.nameJa,
      nameEn: d.nameEn,
      category: 'muscle',
      subcategory: d.subcategory,
      region: d.region,
      description: d.description,
      function: d.function,
      isMajorPart: d.isMajorPart,
      color: MUSCLE,
      pieces: [],
    }),
  ),
);

// ============================================================================
// 内臓
// ============================================================================
const organParts: AnatomyPart[] = [
  P({
    id: 'brain',
    nameJa: '脳',
    nameEn: 'Brain',
    category: 'organ',
    subcategory: '神経系',
    region: 'head',
    description: '頭蓋内にある中枢神経。大脳・小脳・脳幹からなる。',
    function: '思考・感覚・運動・自律機能の統合制御。',
    isMajorPart: true,
    color: '#e59ab0',
    labelAnchor: [0, 0.92, 0],
    pieces: [{ shape: 'sphere', args: [0.082], position: [0, 0.83, 0.0], scale: [1.0, 0.9, 1.05] }],
  }),
  P({
    id: 'heart',
    nameJa: '心臓',
    nameEn: 'Heart',
    category: 'organ',
    subcategory: '循環器系',
    region: 'chest',
    description: '胸腔中央やや左にある筋性の臓器。',
    function: '全身への血液の拍出(ポンプ機能)。',
    isMajorPart: true,
    color: '#b8323a',
    labelAnchor: [0.02, 0.44, 0.1],
    pieces: [{ shape: 'sphere', args: [0.05], position: [0.02, 0.35, 0.045], scale: [1.0, 1.2, 0.9] }],
  }),
  ...makePair(
    P({
      id: 'lung',
      nameJa: '肺',
      nameEn: 'Lung',
      category: 'organ',
      subcategory: '呼吸器系',
      region: 'chest',
      description: '胸腔内で心臓を挟む左右一対の臓器。',
      function: 'ガス交換(酸素の取り込みと二酸化炭素の排出)。',
      isMajorPart: true,
      color: '#d98c82',
      pieces: [{ shape: 'sphere', args: [0.072], position: [-0.062, 0.37, 0.01], scale: [0.85, 1.35, 0.72] }],
    }),
  ),
  P({
    id: 'liver',
    nameJa: '肝臓',
    nameEn: 'Liver',
    category: 'organ',
    subcategory: '消化器系',
    region: 'abdomen',
    description: '右上腹部にある人体最大の内臓。',
    function: '代謝・解毒・胆汁の生成、栄養の貯蔵。',
    isMajorPart: true,
    color: '#7c4a3c',
    labelAnchor: [-0.05, 0.24, 0.12],
    pieces: [{ shape: 'sphere', args: [0.07], position: [-0.055, 0.17, 0.05], scale: [1.5, 0.75, 0.8] }],
  }),
  P({
    id: 'stomach',
    nameJa: '胃',
    nameEn: 'Stomach',
    category: 'organ',
    subcategory: '消化器系',
    region: 'abdomen',
    description: '左上腹部にある袋状の消化器官。',
    function: '食物の一時貯留と胃液による消化。',
    isMajorPart: true,
    color: '#cf9a5a',
    labelAnchor: [0.06, 0.26, 0.1],
    pieces: [{ shape: 'sphere', args: [0.05], position: [0.06, 0.19, 0.04], scale: [1.15, 1.05, 0.75] }],
  }),
  P({
    id: 'pancreas',
    nameJa: '膵臓',
    nameEn: 'Pancreas',
    category: 'organ',
    subcategory: '消化器系',
    region: 'abdomen',
    description: '胃の後方に位置する細長い臓器。',
    function: '消化酵素とインスリンなどのホルモン分泌。',
    color: '#d7b45a',
    labelAnchor: [0, 0.135, 0.08],
    pieces: [{ shape: 'capsule', args: [0.016, 0.09], position: [0.0, 0.135, 0.0], rotation: [0, 0, 0.35] }],
  }),
  ...makePair(
    P({
      id: 'kidney',
      nameJa: '腎臓',
      nameEn: 'Kidney',
      category: 'organ',
      subcategory: '泌尿器系',
      region: 'abdomen',
      description: '背側腹部にある左右一対のソラマメ状の臓器。',
      function: '血液の濾過と尿の生成、体液バランスの調節。',
      isMajorPart: true,
      color: '#9c5040',
      pieces: [{ shape: 'sphere', args: [0.028], position: [-0.06, 0.11, -0.055], scale: [0.85, 1.35, 0.72] }],
    }),
  ),
  P({
    id: 'small_intestine',
    nameJa: '小腸',
    nameEn: 'Small Intestine',
    category: 'organ',
    subcategory: '消化器系',
    region: 'abdomen',
    description: '腹部中央でとぐろを巻く長い管状の器官。',
    function: '栄養素の消化と吸収の主要な場。',
    isMajorPart: true,
    color: '#e0a878',
    labelAnchor: [0, 0.02, 0.13],
    pieces: [
      { shape: 'sphere', args: [0.085], position: [0, 0.0, 0.03], scale: [1.05, 0.85, 0.6] },
      { shape: 'torus', args: [0.05, 0.018], position: [0, 0.02, 0.05] },
      { shape: 'torus', args: [0.04, 0.016], position: [0.01, -0.035, 0.05] },
    ],
  }),
  P({
    id: 'large_intestine',
    nameJa: '大腸',
    nameEn: 'Large Intestine',
    category: 'organ',
    subcategory: '消化器系',
    region: 'abdomen',
    description: '小腸を囲む太い管。上行・横行・下行結腸などからなる。',
    function: '水分の吸収と便の形成。',
    isMajorPart: true,
    color: '#c07a4a',
    labelAnchor: [0, 0.15, 0.13],
    pieces: [
      { shape: 'capsule', args: [0.024, 0.18], position: [-0.085, 0.02, 0.045] }, // 上行結腸
      { shape: 'capsule', args: [0.024, 0.18], position: [0.085, 0.02, 0.045] }, // 下行結腸
      { shape: 'capsule', args: [0.024, 0.15], position: [0, 0.13, 0.045], rotation: [0, 0, Math.PI / 2] }, // 横行結腸
    ],
  }),
  P({
    id: 'bladder',
    nameJa: '膀胱',
    nameEn: 'Urinary Bladder',
    category: 'organ',
    subcategory: '泌尿器系',
    region: 'pelvis',
    description: '骨盤内にある尿をためる袋状の臓器。',
    function: '尿の一時貯留と排出。',
    color: '#cabf5e',
    labelAnchor: [0, -0.1, 0.1],
    pieces: [{ shape: 'sphere', args: [0.035], position: [0, -0.12, 0.05], scale: [1.0, 0.9, 0.9] }],
  }),
];

// ============================================================================
// エクスポート
// ============================================================================
export const anatomyParts: AnatomyPart[] = [
  ...skinParts,
  ...boneParts,
  ...muscleParts,
  ...organParts,
];

export const partsById: Record<string, AnatomyPart> = Object.fromEntries(
  anatomyParts.map((p) => [p.id, p]),
);

export const partIds: string[] = anatomyParts.map((p) => p.id);
