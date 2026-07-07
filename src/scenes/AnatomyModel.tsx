// ============================================================================
// 全部位のメッシュを組み立てる(プロシージャル・モデルローダ相当)。
// 将来 GLB に差し替える場合は、この層を GLTF ローダに置き換え、
// part.meshId とモデル内メッシュ名を対応づければよい。
// ============================================================================
import { anatomyParts } from '../data/anatomyParts';
import { PartMesh } from './PartMesh';

export function AnatomyModel() {
  return (
    <group>
      {anatomyParts.map((part) => (
        <PartMesh key={part.id} part={part} />
      ))}
    </group>
  );
}
