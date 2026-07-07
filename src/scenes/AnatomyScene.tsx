// ============================================================================
// 3Dシーンのルート — Canvas・宇宙的な背景(星空/基準グリッド)・ライティング・
// モデル・ラベル・カメラ制御を束ねる。
// 太陽系3Dマップのように、モデルが暗い空間に浮かぶ見せ方にする。
// ============================================================================
import { Canvas } from '@react-three/fiber';
import { Stars, Grid } from '@react-three/drei';
import { AnatomyModel } from './AnatomyModel';
import { LabelRenderer } from './LabelRenderer';
import { CameraController } from './CameraController';
import { DEFAULT_VIEW } from '../utils/cameraFocus';
import { useAnatomyStore } from '../store/useAnatomyStore';

export function AnatomyScene() {
  const selectPart = useAnatomyStore((s) => s.selectPart);

  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }}
      camera={{ position: DEFAULT_VIEW.position, fov: 42, near: 0.05, far: 100 }}
      onPointerMissed={() => selectPart(null)}
    >
      {/* 深宇宙の星空(太陽系マップ風の没入背景) */}
      <Stars radius={40} depth={30} count={1200} factor={2.2} saturation={0} fade speed={0.5} />

      {/* 展示台/軌道面を思わせる基準グリッド(空間の把握を助ける) */}
      <Grid
        position={[0, -0.92, 0]}
        args={[14, 14]}
        cellSize={0.25}
        cellThickness={0.6}
        cellColor="#1b2a44"
        sectionSize={1}
        sectionThickness={1}
        sectionColor="#31507d"
        fadeDistance={9}
        fadeStrength={1.4}
        infiniteGrid
        followCamera={false}
      />

      {/* ライティング: 教材的に立体感を出す3灯構成 */}
      <hemisphereLight intensity={0.55} color="#ffffff" groundColor="#243150" />
      <ambientLight intensity={0.28} />
      <directionalLight position={[3, 5, 4]} intensity={1.15} />
      <directionalLight position={[-4, 2, -3]} intensity={0.5} color="#bcd3ff" />

      <AnatomyModel />
      <LabelRenderer />
      <CameraController />
    </Canvas>
  );
}
