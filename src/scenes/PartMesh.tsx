// ============================================================================
// 1部位の描画。複数の形状ピースを1つの group にまとめ、
// クリック選択・ホバー・ハイライト・表示モードによる見た目を処理する。
// ============================================================================
import * as THREE from 'three';
import type { ThreeEvent } from '@react-three/fiber';
import type { AnatomyPart, ShapePiece } from '../types/anatomy';
import { useAnatomyStore } from '../store/useAnatomyStore';

const SELECT_EMISSIVE = '#ffcc33';
const HOVER_EMISSIVE = '#7fd4ff';

function PieceGeometry({ piece }: { piece: ShapePiece }) {
  const a = piece.args;
  switch (piece.shape) {
    case 'sphere':
      return <sphereGeometry args={[a[0], 24, 18]} />;
    case 'capsule':
      return <capsuleGeometry args={[a[0], a[1], 6, 16]} />;
    case 'cylinder':
      return <cylinderGeometry args={[a[0], a[1], a[2], 18]} />;
    case 'box':
      return <boxGeometry args={[a[0], a[1], a[2]]} />;
    case 'torus':
      return <torusGeometry args={[a[0], a[1], 12, 32, a[2] ?? Math.PI * 2]} />;
    default:
      return null;
  }
}

export function PartMesh({ part }: { part: AnatomyPart }) {
  const selectedId = useAnatomyStore((s) => s.selectedPartId);
  const hovered = useAnatomyStore((s) => s.hoveredPartId === part.id);
  const layerOn = useAnatomyStore((s) => s.layerVisibility[part.category]);
  const partOn = useAnatomyStore((s) => !!s.partVisibility[part.id]);
  const displayMode = useAnatomyStore((s) => s.displayMode);
  const selectPart = useAnatomyStore((s) => s.selectPart);
  const setHovered = useAnatomyStore((s) => s.setHovered);

  const selected = selectedId === part.id;
  const anySelected = selectedId !== null;
  const isSkin = part.category === 'skin';
  const interactive = !isSkin;

  // --- 表示可否(レイヤー × 部位トグル × isolate) ---
  const isolateActive = displayMode === 'isolate' && anySelected;
  const visible = layerOn && partOn && (!isolateActive || selected);
  if (!visible) return null;

  // --- 見た目 ---
  let opacity = isSkin ? 0.13 : 1;
  let transparent = isSkin;
  if (displayMode === 'dim' && anySelected && !selected) {
    opacity = 0.1;
    transparent = true;
  }
  const emissive = selected ? SELECT_EMISSIVE : hovered ? HOVER_EMISSIVE : '#000000';
  const emissiveIntensity = selected ? 0.85 : hovered ? 0.4 : 0;

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    if (e.delta > 5) return; // ドラッグ(回転)時は選択しない
    e.stopPropagation();
    selectPart(part.id, true); // 選択と同時に部位へフライ・トゥ
  };
  const handleOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(part.id);
    document.body.style.cursor = 'pointer';
  };
  const handleOut = () => {
    setHovered(null);
    document.body.style.cursor = 'auto';
  };

  return (
    <group name={part.meshId}>
      {part.pieces.map((piece, i) => (
        <mesh
          key={i}
          position={piece.position}
          rotation={piece.rotation}
          scale={piece.scale}
          raycast={interactive ? undefined : () => null}
          onClick={interactive ? handleClick : undefined}
          onPointerOver={interactive ? handleOver : undefined}
          onPointerOut={interactive ? handleOut : undefined}
        >
          <PieceGeometry piece={piece} />
          <meshStandardMaterial
            color={part.color}
            roughness={0.62}
            metalness={0.05}
            emissive={emissive}
            emissiveIntensity={emissiveIntensity}
            transparent={transparent}
            opacity={opacity}
            depthWrite={!transparent}
            side={isSkin ? THREE.DoubleSide : THREE.FrontSide}
          />
        </mesh>
      ))}
    </group>
  );
}
