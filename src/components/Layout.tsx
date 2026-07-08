// ============================================================================
// 全体レイアウト — 左サイドバー + 中央3Dビュー(オーバーレイUI)
// ============================================================================
import { Sidebar } from './Sidebar';
import { AnatomyScene } from '../scenes/AnatomyScene';
import { ViewControls } from './ViewControls';
import { InfoPanel } from './InfoPanel';
import { Legend } from './Legend';
import { useAnatomyStore } from '../store/useAnatomyStore';

export function Layout() {
  const skeletonReady = useAnatomyStore((s) => s.skeletonReady);

  return (
    <div className="app">
      <Sidebar />
      <main className="viewport">
        <AnatomyScene />
        <Legend />
        <ViewControls />
        <InfoPanel />
        {!skeletonReady && (
          <div className="loading-overlay">
            <div className="loading-overlay__spinner" />
            <p>3D骨格モデルを読み込み中…</p>
          </div>
        )}
      </main>
    </div>
  );
}
