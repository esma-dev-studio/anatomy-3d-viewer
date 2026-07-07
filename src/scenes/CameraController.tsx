// ============================================================================
// カメラ制御 — OrbitControls + プリセット視点 / フォーカス / ズームの補間移動。
// store の cameraCommand(nonce付き)を監視し、目標へ滑らかに移動する。
// ============================================================================
import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useAnatomyStore } from '../store/useAnatomyStore';
import {
  presetView,
  focusView,
  DEFAULT_VIEW,
  MODEL_CENTER,
} from '../utils/cameraFocus';

type Vec3 = [number, number, number];

export function CameraController() {
  // OrbitControls インスタンス(three-stdlib)。型の依存を避けるため any で保持する。
  // 使用するのは controls.target(Vector3) と controls.update() のみ。
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const controlsRef = useRef<any>(null);
  const camera = useThree((s) => s.camera);
  const invalidate = useThree((s) => s.invalidate);
  const cameraCommand = useAnatomyStore((s) => s.cameraCommand);

  const goalPos = useRef(new THREE.Vector3(...DEFAULT_VIEW.position));
  const goalTarget = useRef(new THREE.Vector3(...DEFAULT_VIEW.target));
  const animating = useRef(false);

  useEffect(() => {
    if (!cameraCommand) return;
    const cmd = cameraCommand.cmd;
    const controls = controlsRef.current;
    const curTarget: Vec3 = controls
      ? [controls.target.x, controls.target.y, controls.target.z]
      : [...MODEL_CENTER];
    const curPos: Vec3 = [camera.position.x, camera.position.y, camera.position.z];

    let view: { position: Vec3; target: Vec3 };
    switch (cmd.type) {
      case 'preset':
        view = presetView(cmd.preset);
        break;
      case 'reset':
        view = DEFAULT_VIEW;
        break;
      case 'focus':
        view = focusView(cmd.target, curPos, cmd.distance ?? 1.15);
        break;
      case 'zoom': {
        const t = new THREE.Vector3(...curTarget);
        const p = new THREE.Vector3(...curPos);
        const dir = p.clone().sub(t).multiplyScalar(cmd.factor);
        // ズーム距離の下限・上限
        const len = THREE.MathUtils.clamp(dir.length(), 0.4, 8);
        dir.setLength(len);
        const np = t.clone().add(dir);
        view = { position: [np.x, np.y, np.z], target: curTarget };
        break;
      }
      default:
        return;
    }
    goalPos.current.set(...view.position);
    goalTarget.current.set(...view.target);
    animating.current = true;
    invalidate(); // demand モードでアニメーションを開始
  }, [cameraCommand, camera, invalidate]);

  useFrame(() => {
    if (!animating.current) return;
    const controls = controlsRef.current;
    if (!controls) return;
    camera.position.lerp(goalPos.current, 0.16);
    controls.target.lerp(goalTarget.current, 0.16);
    controls.update();
    if (
      camera.position.distanceTo(goalPos.current) < 0.008 &&
      controls.target.distanceTo(goalTarget.current) < 0.008
    ) {
      camera.position.copy(goalPos.current);
      controls.target.copy(goalTarget.current);
      controls.update();
      animating.current = false;
    } else {
      invalidate(); // 次フレームを要求して補間を継続
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.08}
      minDistance={0.4}
      maxDistance={8}
      target={MODEL_CENTER}
    />
  );
}
