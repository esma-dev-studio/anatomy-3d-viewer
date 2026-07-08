// ============================================================================
// 実写筋肉モデル(muscles.glb / BodyParts3D由来・上肢+下肢の筋)の描画。
//  - 全メッシュが右半身 → X ミラーで全身化
//  - 骨格モデルと座標が完全一致するため、骨格が算出した共有変換(modelFit)を
//    そのまま使うと骨に正確に重なる
//  - 材質は解剖学的な赤で統一(法線マップは軽量化のため除去済み)
// ============================================================================
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';
import { useAnatomyStore } from '../store/useAnatomyStore';
import { matchMusclePartId, MUSCLES_URL } from '../data/muscleMap';
import { DRACO_PATH } from '../data/skeletonMap';

useGLTF.preload(MUSCLES_URL, DRACO_PATH);

const MUSCLE_COLOR = new THREE.Color('#b23a48');
const SELECT_EMISSIVE = new THREE.Color('#ffcc33');
const HOVER_EMISSIVE = new THREE.Color('#7fd4ff');
const NO_EMISSIVE = new THREE.Color('#000000');

type Fit = { scale: number; position: [number, number, number]; rotationY: number };

interface Processed {
  root: THREE.Group;
  meshesByPart: Map<string, THREE.Mesh[]>;
  looseMeshes: THREE.Mesh[];
  anchors: Record<string, [number, number, number]>;
}

function isMeshObj(o: THREE.Object3D): o is THREE.Mesh {
  return (o as THREE.Mesh).isMesh === true;
}

/** メッシュから祖先すべての名前を連結(グループ名も筋名も拾える) */
function ancestryText(mesh: THREE.Object3D): string {
  const names: string[] = [];
  let n: THREE.Object3D | null = mesh;
  while (n) {
    if (n.name) names.push(n.name);
    n = n.parent;
  }
  return names.join(' | ');
}

function process(scene: THREE.Object3D, fit: Fit): Processed {
  const root = scene.clone(true) as THREE.Group;

  // 全グループを複製しXミラーして左半身を生成
  const mirror = new THREE.Group();
  mirror.name = 'MirrorLeft';
  for (const child of [...root.children]) {
    const c = child.clone(true);
    c.traverse((o) => {
      o.userData.__mirror = true;
    });
    mirror.add(c);
  }
  mirror.scale.x = -1;
  root.add(mirror);

  const meshesByPart = new Map<string, THREE.Mesh[]>();
  const looseMeshes: THREE.Mesh[] = [];

  root.traverse((obj) => {
    if (!isMeshObj(obj)) return;
    const mesh = obj;
    // 材質を解剖学的な赤に統一(部位ごとに複製して発光を独立制御)
    mesh.material = new THREE.MeshStandardMaterial({
      color: MUSCLE_COLOR.clone(),
      roughness: 0.55,
      metalness: 0.02,
    });

    const base = matchMusclePartId(ancestryText(mesh));
    if (!base) {
      looseMeshes.push(mesh);
      return;
    }
    const isMirror = obj.userData.__mirror === true;
    const partId = `${base}_${isMirror ? 'l' : 'r'}`;
    mesh.userData.partId = partId;
    if (!meshesByPart.has(partId)) meshesByPart.set(partId, []);
    meshesByPart.get(partId)!.push(mesh);
  });

  // アンカー(骨格と同じ fit で世界座標に変換)
  root.updateMatrixWorld(true);
  const anchors: Record<string, [number, number, number]> = {};
  const box = new THREE.Box3();
  const c = new THREE.Vector3();
  for (const [partId, meshes] of meshesByPart) {
    box.makeEmpty();
    for (const mesh of meshes) box.expandByObject(mesh);
    if (box.isEmpty()) continue;
    box.getCenter(c);
    anchors[partId] = [
      fit.position[0] + c.x * fit.scale,
      fit.position[1] + c.y * fit.scale + 0.02,
      fit.position[2] + c.z * fit.scale,
    ];
  }

  return { root, meshesByPart, looseMeshes, anchors };
}

interface AppearanceState {
  layerOn: boolean;
  partVisibility: Record<string, boolean>;
  selectedId: string | null;
  hoveredId: string | null;
  displayMode: string;
}

function applyAppearance(p: Processed, s: AppearanceState) {
  const isolate = s.displayMode === 'isolate' && s.selectedId != null;
  for (const [partId, meshes] of p.meshesByPart) {
    const baseVisible = s.layerOn && !!s.partVisibility[partId];
    const visible = baseVisible && (!isolate || partId === s.selectedId);
    const selected = partId === s.selectedId;
    const hovered = partId === s.hoveredId;
    const dim = s.displayMode === 'dim' && s.selectedId != null && !selected;
    for (const mesh of meshes) {
      mesh.visible = visible;
      const m = mesh.material as THREE.MeshStandardMaterial;
      if (m.emissive) {
        if (selected) {
          m.emissive.copy(SELECT_EMISSIVE);
          m.emissiveIntensity = 0.5;
        } else if (hovered) {
          m.emissive.copy(HOVER_EMISSIVE);
          m.emissiveIntensity = 0.28;
        } else {
          m.emissive.copy(NO_EMISSIVE);
          m.emissiveIntensity = 0;
        }
      }
      if (dim) {
        m.transparent = true;
        m.opacity = 0.16;
        m.depthWrite = false;
      } else if (m.transparent) {
        m.transparent = false;
        m.opacity = 1;
        m.depthWrite = true;
      }
    }
  }
  // 部位に未対応のメッシュもレイヤーのON/OFFに従わせる(取りこぼし防止)
  for (const mesh of p.looseMeshes) mesh.visible = s.layerOn && !isolate;
}

export function MuscleModel() {
  const { scene } = useGLTF(MUSCLES_URL, DRACO_PATH);
  const modelFit = useAnatomyStore((s) => s.modelFit);

  // 骨格が算出した共有変換が来るまで待つ(座標一致するため同じ変換で整列)
  const processed = useMemo(
    () => (modelFit ? process(scene, modelFit) : null),
    [scene, modelFit],
  );

  const setPartAnchors = useAnatomyStore((s) => s.setPartAnchors);
  const selectPart = useAnatomyStore((s) => s.selectPart);
  const setHovered = useAnatomyStore((s) => s.setHovered);

  const layerOn = useAnatomyStore((s) => s.layerVisibility.muscle);
  const partVisibility = useAnatomyStore((s) => s.partVisibility);
  const selectedId = useAnatomyStore((s) => s.selectedPartId);
  const hoveredId = useAnatomyStore((s) => s.hoveredPartId);
  const displayMode = useAnatomyStore((s) => s.displayMode);

  useEffect(() => {
    if (processed) setPartAnchors(processed.anchors);
  }, [processed, setPartAnchors]);

  useEffect(() => {
    if (processed)
      applyAppearance(processed, { layerOn, partVisibility, selectedId, hoveredId, displayMode });
  }, [processed, layerOn, partVisibility, selectedId, hoveredId, displayMode]);

  if (!processed || !modelFit) return null;

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    if (e.delta > 5) return;
    const partId = e.object.userData.partId as string | undefined;
    if (!partId) return;
    e.stopPropagation();
    selectPart(partId, true);
  };
  const handleOver = (e: ThreeEvent<PointerEvent>) => {
    const partId = e.object.userData.partId as string | undefined;
    if (!partId) return;
    e.stopPropagation();
    setHovered(partId);
    document.body.style.cursor = 'pointer';
  };
  const handleOut = () => {
    setHovered(null);
    document.body.style.cursor = 'auto';
  };

  return (
    <group
      position={modelFit.position}
      scale={modelFit.scale}
      rotation={[0, modelFit.rotationY, 0]}
      onClick={handleClick}
      onPointerOver={handleOver}
      onPointerOut={handleOut}
    >
      <primitive object={processed.root} />
    </group>
  );
}
