// ============================================================================
// モデル全体の組み立て。
//  - 骨格: 実写GLB(SkeletonModel)
//  - 筋肉/内臓/皮膚: プリミティブ(PartMesh) ※初期は非表示。概略の重ね表示用。
// 将来これらも実写メッシュに差し替える場合は、SkeletonModel と同様の
// ローダを追加し、該当カテゴリを実メッシュ側へ移せばよい。
// ============================================================================
import { anatomyParts } from '../data/anatomyParts';
import { PartMesh } from './PartMesh';
import { SkeletonModel } from './SkeletonModel';

const primitiveParts = anatomyParts.filter((p) => p.category !== 'skeleton');

export function AnatomyModel() {
  return (
    <group>
      <SkeletonModel />
      {primitiveParts.map((part) => (
        <PartMesh key={part.id} part={part} />
      ))}
    </group>
  );
}
