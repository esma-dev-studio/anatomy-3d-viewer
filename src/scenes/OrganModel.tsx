// ============================================================================
// 実写内臓モデル(organs.glb / HuBMAP HRA・Visible Human 由来, CC BY 4.0)の描画。
//  - 各臓器は名前付きノード(brain, heart, ...)にまとまり、相互に整列済み
//  - 別ソースのため骨格の共有変換は使わず、バウンディングボックスから
//    胴体〜頭部の範囲にフィットさせる(概略配置)
//  - 臓器ごとに色分けし、選択/ハイライト/レイヤー表示に対応
// ============================================================================
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';
import { useAnatomyStore } from '../store/useAnatomyStore';
import { ORGAN_IDS, ORGAN_COLORS, ORGANS_URL } from '../data/organMap';
import { DRACO_PATH } from '../data/skeletonMap';

useGLTF.preload(ORGANS_URL, DRACO_PATH);

// 内臓を収める縦方向の目標範囲(骨盤付近〜頭頂。骨格フレームに合わせる)
const Y_MIN = -0.05;
const Y_MAX = 0.88;

const SELECT_EMISSIVE = new THREE.Color('#ffcc33');
const HOVER_EMISSIVE = new THREE.Color('#7fd4ff');
const NO_EMISSIVE = new THREE.Color('#000000');

type Fit = { scale: number; position: [number, number, number] };

interface Processed {
  root: THREE.Group;
  meshesByPart: Map<string, THREE.Mesh[]>;
  fit: Fit;
  anchors: Record<string, [number, number, number]>;
}

function isMeshObj(o: THREE.Object3D): o is THREE.Mesh {
  return (o as THREE.Mesh).isMesh === true;
}

/** メッシュから祖先をたどり、臓器ID(brain/heart/...)を得る */
function organIdOf(mesh: THREE.Object3D): string | null {
  let n: THREE.Object3D | null = mesh;
  while (n) {
    if (ORGAN_IDS.has(n.name)) return n.name;
    n = n.parent;
  }
  return null;
}

function process(scene: THREE.Object3D): Processed {
  const root = scene.clone(true) as THREE.Group;

  const meshesByPart = new Map<string, THREE.Mesh[]>();
  root.traverse((obj) => {
    if (!isMeshObj(obj)) return;
    const mesh = obj;
    const organId = organIdOf(mesh);
    if (!organId) return;
    mesh.userData.partId = organId;
    mesh.material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(ORGAN_COLORS[organId] ?? '#c98a6a'),
      roughness: 0.5,
      metalness: 0.02,
    });
    if (!meshesByPart.has(organId)) meshesByPart.set(organId, []);
    meshesByPart.get(organId)!.push(mesh);
  });

  // フィット(内臓群の bbox を Y_MIN..Y_MAX に合わせ、X/Z を中心へ)
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);
  const scale = size.y > 0 ? (Y_MAX - Y_MIN) / size.y : 1;
  const fit: Fit = {
    scale,
    position: [-center.x * scale, Y_MIN - box.min.y * scale, -center.z * scale],
  };

  // アンカー
  const anchors: Record<string, [number, number, number]> = {};
  const b = new THREE.Box3();
  const c = new THREE.Vector3();
  for (const [partId, meshes] of meshesByPart) {
    b.makeEmpty();
    for (const mesh of meshes) b.expandByObject(mesh);
    if (b.isEmpty()) continue;
    b.getCenter(c);
    anchors[partId] = [
      fit.position[0] + c.x * scale,
      fit.position[1] + c.y * scale + 0.02,
      fit.position[2] + c.z * scale,
    ];
  }

  return { root, meshesByPart, fit, anchors };
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
}

export function OrganModel() {
  const { scene } = useGLTF(ORGANS_URL, DRACO_PATH);
  const processed = useMemo(() => process(scene), [scene]);

  const setPartAnchors = useAnatomyStore((s) => s.setPartAnchors);
  const selectPart = useAnatomyStore((s) => s.selectPart);
  const setHovered = useAnatomyStore((s) => s.setHovered);

  const layerOn = useAnatomyStore((s) => s.layerVisibility.organ);
  const partVisibility = useAnatomyStore((s) => s.partVisibility);
  const selectedId = useAnatomyStore((s) => s.selectedPartId);
  const hoveredId = useAnatomyStore((s) => s.hoveredPartId);
  const displayMode = useAnatomyStore((s) => s.displayMode);

  useEffect(() => {
    setPartAnchors(processed.anchors);
  }, [processed, setPartAnchors]);

  useEffect(() => {
    applyAppearance(processed, { layerOn, partVisibility, selectedId, hoveredId, displayMode });
  }, [processed, layerOn, partVisibility, selectedId, hoveredId, displayMode]);

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
      position={processed.fit.position}
      scale={processed.fit.scale}
      onClick={handleClick}
      onPointerOver={handleOver}
      onPointerOut={handleOut}
    >
      <primitive object={processed.root} />
    </group>
  );
}
