// ============================================================================
// 実写骨格モデル(overview-skeleton.glb / BodyParts3D由来, CC BY-SA)の描画。
//  - 右半身+体幹のみのモデルを X ミラーして全身化
//  - 実行時にバウンディングボックスから中心・スケールを算出してフレームに合わせる
//  - 各メッシュをアプリの部位ID(anatomyParts)に対応づけ、既存の
//    選択/ハイライト/レイヤー/ラベルの仕組みにそのまま結線する
// ============================================================================
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';
import { useAnatomyStore } from '../store/useAnatomyStore';
import { matchPartId, MIRROR_GROUP_NAMES, SKELETON_URL, DRACO_PATH } from '../data/skeletonMap';

useGLTF.preload(SKELETON_URL, DRACO_PATH);

const TARGET_HEIGHT = 1.8; // プリミティブ版と同じ全高に合わせる
const FEET_Y = -0.9; // 足元の目標Y(中心が原点付近に来る)

interface Processed {
  root: THREE.Group;
  meshesByPart: Map<string, THREE.Mesh[]>;
  looseMeshes: THREE.Mesh[];
  fit: { position: [number, number, number]; scale: number; rotationY: number };
  anchors: Record<string, [number, number, number]>;
}

function isMeshObj(o: THREE.Object3D): o is THREE.Mesh {
  return (o as THREE.Mesh).isMesh === true;
}

/** GLBシーンを複製し、ミラー・部位タグ付け・正規化・アンカー算出を行う。 */
function process(scene: THREE.Object3D): Processed {
  const root = scene.clone(true) as THREE.Group;

  // 右側グループを複製しXミラーして左側を生成
  const mirror = new THREE.Group();
  mirror.name = 'MirrorLeft';
  for (const gname of MIRROR_GROUP_NAMES) {
    const g = root.getObjectByName(gname);
    if (g) {
      const c = g.clone(true);
      c.traverse((o) => {
        o.userData.__mirror = true;
      });
      mirror.add(c);
    }
  }
  mirror.scale.x = -1;
  root.add(mirror);

  const meshesByPart = new Map<string, THREE.Mesh[]>();
  const looseMeshes: THREE.Mesh[] = [];

  root.traverse((obj) => {
    if (!isMeshObj(obj)) return;
    const mesh = obj;
    // マテリアルを複製(部位ごとに発光/半透明を独立制御)
    mesh.material = Array.isArray(mesh.material)
      ? mesh.material.map((m) => m.clone())
      : mesh.material.clone();

    const matched = matchPartId(mesh.name || '');
    if (!matched) {
      looseMeshes.push(mesh);
      return;
    }
    const isMirror = obj.userData.__mirror === true;
    const partId = matched.paired ? `${matched.base}_${isMirror ? 'l' : 'r'}` : matched.base;
    mesh.userData.partId = partId;
    if (!meshesByPart.has(partId)) meshesByPart.set(partId, []);
    meshesByPart.get(partId)!.push(mesh);
  });

  // 正規化(全体のバウンディングボックス → スケール・位置)
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);
  const scale = size.y > 0 ? TARGET_HEIGHT / size.y : 1;
  const fit = {
    scale,
    position: [
      -center.x * scale,
      -box.min.y * scale + FEET_Y,
      -center.z * scale,
    ] as [number, number, number],
    rotationY: 0, // モデルは +Z を向く(右側が-x であることから判定)
  };

  // 部位アンカー(ラベル/フォーカス位置)をワールド座標で算出
  const anchors: Record<string, [number, number, number]> = {};
  const tmp = new THREE.Box3();
  const c = new THREE.Vector3();
  for (const [partId, meshes] of meshesByPart) {
    tmp.makeEmpty();
    for (const mesh of meshes) tmp.expandByObject(mesh);
    if (tmp.isEmpty()) continue;
    tmp.getCenter(c);
    anchors[partId] = [
      fit.position[0] + c.x * scale,
      fit.position[1] + c.y * scale + 0.02,
      fit.position[2] + c.z * scale,
    ];
  }

  return { root, meshesByPart, looseMeshes, fit, anchors };
}

const SELECT_EMISSIVE = new THREE.Color('#ffcc33');
const HOVER_EMISSIVE = new THREE.Color('#7fd4ff');
const NO_EMISSIVE = new THREE.Color('#000000');

interface AppearanceState {
  layerOn: boolean;
  partVisibility: Record<string, boolean>;
  selectedId: string | null;
  hoveredId: string | null;
  displayMode: string;
}

function applyAppearance(p: Processed, s: AppearanceState) {
  const isolate = s.displayMode === 'isolate' && s.selectedId != null;

  const setMesh = (mesh: THREE.Mesh, visible: boolean, selected: boolean, hovered: boolean, dim: boolean) => {
    mesh.visible = visible;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const mat of mats) {
      const m = mat as THREE.MeshStandardMaterial;
      if (m.emissive) {
        if (selected) {
          m.emissive.copy(SELECT_EMISSIVE);
          m.emissiveIntensity = 0.55;
        } else if (hovered) {
          m.emissive.copy(HOVER_EMISSIVE);
          m.emissiveIntensity = 0.3;
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
  };

  for (const [partId, meshes] of p.meshesByPart) {
    const base = s.layerOn && !!s.partVisibility[partId];
    const visible = base && (!isolate || partId === s.selectedId);
    const selected = partId === s.selectedId;
    const hovered = partId === s.hoveredId;
    const dim = s.displayMode === 'dim' && s.selectedId != null && !selected;
    for (const mesh of meshes) setMesh(mesh, visible, selected, hovered, dim);
  }
  // 部位に未対応のメッシュはレイヤーのON/OFFのみ従う
  for (const mesh of p.looseMeshes) mesh.visible = s.layerOn && !isolate;
}

export function SkeletonModel() {
  const { scene } = useGLTF(SKELETON_URL, DRACO_PATH);
  const processed = useMemo(() => process(scene), [scene]);

  const setPartAnchors = useAnatomyStore((s) => s.setPartAnchors);
  const setModelFit = useAnatomyStore((s) => s.setModelFit);
  const selectPart = useAnatomyStore((s) => s.selectPart);
  const setHovered = useAnatomyStore((s) => s.setHovered);

  const layerOn = useAnatomyStore((s) => s.layerVisibility.skeleton);
  const partVisibility = useAnatomyStore((s) => s.partVisibility);
  const selectedId = useAnatomyStore((s) => s.selectedPartId);
  const hoveredId = useAnatomyStore((s) => s.hoveredPartId);
  const displayMode = useAnatomyStore((s) => s.displayMode);

  // 読み込み完了時にアンカーと共有変換を store へ登録
  useEffect(() => {
    setPartAnchors(processed.anchors);
    setModelFit(processed.fit);
  }, [processed, setPartAnchors, setModelFit]);

  // 表示状態を反映
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
      rotation={[0, processed.fit.rotationY, 0]}
      onClick={handleClick}
      onPointerOver={handleOver}
      onPointerOut={handleOut}
    >
      <primitive object={processed.root} />
    </group>
  );
}
