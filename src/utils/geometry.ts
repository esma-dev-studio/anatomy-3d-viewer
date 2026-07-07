// ============================================================================
// 形状ピースの生成・変換ユーティリティ
// 左右対称部位の生成、重心計算、簡易な数列生成などを提供する。
// ============================================================================
import type { AnatomyPart, ShapePiece } from '../types/anatomy';

type Vec3 = [number, number, number];

/** X軸で反転(左右対称部位の片側を生成する) */
export function mirrorX(pieces: ShapePiece[]): ShapePiece[] {
  return pieces.map((p) => ({
    ...p,
    position: [-p.position[0], p.position[1], p.position[2]] as Vec3,
    rotation: p.rotation
      ? ([p.rotation[0], -p.rotation[1], -p.rotation[2]] as Vec3)
      : undefined,
    scale: p.scale ? ([...p.scale] as Vec3) : undefined,
  }));
}

/** 形状ピース群の重心(位置の平均) */
export function centroid(pieces: ShapePiece[]): Vec3 {
  if (pieces.length === 0) return [0, 0, 0];
  const sum = pieces.reduce<Vec3>(
    (acc, p) => [
      acc[0] + p.position[0],
      acc[1] + p.position[1],
      acc[2] + p.position[2],
    ],
    [0, 0, 0],
  );
  return [sum[0] / pieces.length, sum[1] / pieces.length, sum[2] / pieces.length];
}

/** 部位のカメラ注視点(明示指定 > 重心) */
export function focusPointOf(part: AnatomyPart): Vec3 {
  return part.cameraFocusPoint ?? centroid(part.pieces);
}

/** 部位のラベルアンカー(明示指定 > 重心を少し上げた位置) */
export function labelAnchorOf(part: AnatomyPart): Vec3 {
  if (part.labelAnchor) return part.labelAnchor;
  const c = centroid(part.pieces);
  return [c[0], c[1] + 0.02, c[2]];
}

/**
 * 右側(x<0)で定義した部位から左右ペアを生成する。
 * モデルは正面(+Z)を向くため、身体の右側は画面左(x<0)に置く規約。
 * id は _r/_l、名前には（右）（左）を付す。
 */
export function makePair(base: AnatomyPart): AnatomyPart[] {
  const right: AnatomyPart = {
    ...base,
    id: `${base.id}_r`,
    meshId: `${base.meshId}_r`,
    side: 'right',
    nameJa: `${base.nameJa}（右）`,
    nameEn: `${base.nameEn} (R)`,
    relatedParts: [...(base.relatedParts ?? []), `${base.id}_l`],
  };
  const left: AnatomyPart = {
    ...base,
    id: `${base.id}_l`,
    meshId: `${base.meshId}_l`,
    side: 'left',
    nameJa: `${base.nameJa}（左）`,
    nameEn: `${base.nameEn} (L)`,
    pieces: mirrorX(base.pieces),
    labelAnchor: base.labelAnchor
      ? [-base.labelAnchor[0], base.labelAnchor[1], base.labelAnchor[2]]
      : undefined,
    cameraFocusPoint: base.cameraFocusPoint
      ? [-base.cameraFocusPoint[0], base.cameraFocusPoint[1], base.cameraFocusPoint[2]]
      : undefined,
    relatedParts: [...(base.relatedParts ?? []), `${base.id}_r`],
  };
  return [right, left];
}

/** 等間隔の数列(椎骨・肋骨などの生成に使用) */
export function linspace(start: number, end: number, count: number): number[] {
  if (count <= 1) return [start];
  const step = (end - start) / (count - 1);
  return Array.from({ length: count }, (_, i) => start + step * i);
}

/** 1ピースのおおよその外接半径(スケール込み) */
function pieceRadius(p: ShapePiece): number {
  const s = p.scale ? Math.max(Math.abs(p.scale[0]), Math.abs(p.scale[1]), Math.abs(p.scale[2])) : 1;
  const a = p.args;
  let r: number;
  switch (p.shape) {
    case 'sphere':
      r = a[0];
      break;
    case 'capsule':
      r = a[0] + a[1] / 2;
      break;
    case 'cylinder':
      r = Math.max(a[0], a[1], a[2] / 2);
      break;
    case 'box':
      r = 0.5 * Math.hypot(a[0], a[1], a[2]);
      break;
    case 'torus':
      r = a[0] + a[1];
      break;
    default:
      r = 0.05;
  }
  return r * s;
}

/** 部位全体のおおよその外接半径(カメラのフレーミング距離算出に使用) */
export function partRadius(part: AnatomyPart): number {
  const c = centroid(part.pieces);
  let max = 0.02;
  for (const p of part.pieces) {
    const d = Math.hypot(
      p.position[0] - c[0],
      p.position[1] - c[1],
      p.position[2] - c[2],
    );
    max = Math.max(max, d + pieceRadius(p));
  }
  return max;
}
