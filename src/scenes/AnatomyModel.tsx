// ============================================================================
// モデル全体の組み立て。
//  - 骨格: 実写GLB(SkeletonModel)
//  - 筋肉: 実写GLB(MuscleModel) ※骨格の共有変換で整列。初期は表示。
//  - 内臓: 実写GLB(OrganModel) ※独自にフィット。初期は非表示。
//  - 皮膚・胃: プリミティブ(PartMesh) ※概略表示。初期は非表示。
// それぞれ独立に読み込めるよう個別の Suspense で囲む。
// ============================================================================
import { Suspense } from 'react';
import { anatomyParts } from '../data/anatomyParts';
import { ORGAN_IDS } from '../data/organMap';
import { PartMesh } from './PartMesh';
import { SkeletonModel } from './SkeletonModel';
import { MuscleModel } from './MuscleModel';
import { OrganModel } from './OrganModel';

// 実写メッシュで描く骨格・筋肉・内臓を除いた、プリミティブ表示の部位(皮膚・胃)
const primitiveParts = anatomyParts.filter(
  (p) =>
    p.category !== 'skeleton' &&
    p.category !== 'muscle' &&
    !ORGAN_IDS.has(p.id),
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
      <Suspense fallback={null}>
        <OrganModel />
      </Suspense>
      {primitiveParts.map((part) => (
        <PartMesh key={part.id} part={part} />
      ))}
    </group>
  );
}
