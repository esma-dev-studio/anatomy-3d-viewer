// ============================================================================
// 左サイドバー — タイトルと各操作パネルを縦に並べる。
// ============================================================================
import type { ReactNode } from 'react';
import { LayerToggle } from './LayerToggle';
import { DisplayModeToggle } from './DisplayModeToggle';
import { LabelModeToggle } from './LabelModeToggle';
import { CategoryFilter } from './CategoryFilter';
import { RegionFilter } from './RegionFilter';
import { SearchBox } from './SearchBox';
import { PartList } from './PartList';
import { useAnatomyStore } from '../store/useAnatomyStore';

export function Sidebar() {
  const resetAll = useAnatomyStore((s) => s.resetAll);

  return (
    <aside className="sidebar">
      <header className="sidebar__header">
        <h1 className="sidebar__title">Human Anatomy 3D Viewer</h1>
        <p className="sidebar__subtitle">人体解剖 3Dビューア — 教育用</p>
      </header>

      <div className="sidebar__scroll">
        <Section title="レイヤー">
          <LayerToggle />
        </Section>

        <Section title="表示モード">
          <DisplayModeToggle />
        </Section>

        <Section title="ラベル表示">
          <LabelModeToggle />
        </Section>

        <Section title="絞り込み">
          <CategoryFilter />
          <RegionFilter />
          <SearchBox />
        </Section>

        <Section title="部位一覧">
          <PartList />
        </Section>
      </div>

      <footer className="sidebar__footer">
        <button className="btn btn--ghost btn--block" onClick={resetAll}>
          すべてリセット
        </button>
        <p className="sidebar__note">
          ※ 本アプリは学習・理解支援用です。診断・医療目的には使用できません。
        </p>
        <p className="sidebar__note">
          骨格・筋肉: BodyParts3D（© DBCLS）/ Open3DModel（LUMC）由来・CC&nbsp;BY-SA。
          内臓: HuBMAP HRA（Visible Human 由来）・CC&nbsp;BY&nbsp;4.0。
        </p>
      </footer>
    </aside>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="section">
      <h2 className="section__title">{title}</h2>
      <div className="section__body">{children}</div>
    </section>
  );
}
