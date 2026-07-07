// ============================================================================
// カメラ制御ユーティリティ
// 視点プリセットの位置・注視点、フォーカス時の距離計算を提供する。
// ============================================================================
import type { ViewPreset } from '../types/anatomy';

type Vec3 = [number, number, number];

/** モデル全体を写す既定の視点距離 */
export const DEFAULT_DISTANCE = 2.7;

/** モデル中心(注視点の既定) */
export const MODEL_CENTER: Vec3 = [0, 0.02, 0];

/** 既定(斜め前)の視点 */
export const DEFAULT_VIEW: { position: Vec3; target: Vec3 } = {
  position: [1.7, 0.7, 2.0],
  target: MODEL_CENTER,
};

/**
 * 視点プリセットのカメラ位置と注視点を返す。
 * モデルは正面(+Z)を向く。left/right はモデル自身の左右。
 */
export function presetView(preset: ViewPreset): { position: Vec3; target: Vec3 } {
  const d = DEFAULT_DISTANCE;
  const t = MODEL_CENTER;
  switch (preset) {
    case 'front':
      return { position: [0, t[1], d], target: t };
    case 'back':
      return { position: [0, t[1], -d], target: t };
    // 身体の右側面 = 画面手前から見て x<0 側
    case 'right':
      return { position: [-d, t[1], 0], target: t };
    case 'left':
      return { position: [d, t[1], 0], target: t };
    case 'top':
      return { position: [0, d + 0.6, 0.001], target: t };
    case 'iso':
    default:
      return { position: DEFAULT_VIEW.position, target: t };
  }
}

/**
 * 部位フォーカス時のカメラ位置を計算する。
 * 現在のカメラ方向を保ちつつ、注視点(部位重心)へ一定距離まで寄せる。
 */
export function focusView(
  target: Vec3,
  currentCamPos: Vec3,
  distance = 1.15,
): { position: Vec3; target: Vec3 } {
  const dir: Vec3 = [
    currentCamPos[0] - target[0],
    currentCamPos[1] - target[1],
    currentCamPos[2] - target[2],
  ];
  let len = Math.hypot(dir[0], dir[1], dir[2]);
  if (len < 1e-4) {
    // カメラが注視点と一致している場合は正面方向にフォールバック
    dir[0] = 0;
    dir[1] = 0.2;
    dir[2] = 1;
    len = Math.hypot(dir[0], dir[1], dir[2]);
  }
  const k = distance / len;
  return {
    position: [
      target[0] + dir[0] * k,
      target[1] + dir[1] * k,
      target[2] + dir[2] * k,
    ],
    target,
  };
}
