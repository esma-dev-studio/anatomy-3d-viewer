// ============================================================================
// モデル全体の組み立て。
//  - 骨格: 実写GLB(SkeletonModel)
//  - 筋肉: 実写GLB(MuscleModel) ※骨格の共有変換で整列。初期は非表示。
//  - 内臓/皮膚: プリミティブ(PartMesh) ※概略表示。初期は非表示。
// それぞれ独立に読み込めるよう個別の Suspense で囲む。
// ============================================================================
import { Suspense } from 'react';
import { anatomyParts } from '../data/anatomyParts';
import { PartMesh } from './PartMesh';
import { SkeletonModel } from './SkeletonModel';
import { MuscleModel } from './MuscleModel';

// 実写メッシュで描画する骨格・筋肉を除いた、プリミティブ表示の部位(内臓・皮膚)
const primitiveParts = anatomyParts.filter(
  (p) => p.category !== 'skeleton' && p.category !== 'muscle',
);

export function AnatomyModel() {
  return (
    <group>
      <Suspense fallback={null}>
        <SkeletonModel />
      </Suspense>
      <Suspense fallback={null}>
        <MuscleModel />
      </Suspense>
      {primitiveParts.map((part) => (
        <PartMesh key={part.id} part={part} />
      ))}
    </group>
  );
}
