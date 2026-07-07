// ============================================================================
// 全体レイアウト — 左サイドバー + 中央3Dビュー(オーバーレイUI)
// ============================================================================
import { Sidebar } from './Sidebar';
import { AnatomyScene } from '../scenes/AnatomyScene';
import { ViewControls } from './ViewControls';
import { InfoPanel } from './InfoPanel';
import { Legend } from './Legend';

export function Layout() {
  return (
    <div className="app">
      <Sidebar />
      <main className="viewport">
        <AnatomyScene />
        <Legend />
        <ViewControls />
        <InfoPanel />
      </main>
    </div>
  );
}
