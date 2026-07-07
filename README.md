# Human Anatomy 3D Viewer（人体解剖 3Dビューア）

🔗 **ライブデモ**: https://esma-dev-studio.github.io/anatomy-3d-viewer/

教育・学習・理解支援を目的とした、ブラウザで動く **人体3D解剖ビューア** です。
骨格・筋肉・内臓などをレイヤーやチェックボックスで切り替えながら、部位の位置関係を
3D空間で確認できます。※ 診断・医療目的には使用できません。

## 主な機能

- 人体3Dモデルの表示（回転・ズーム・パン）
- 太陽系3Dマップのような没入表示：星空の背景 + 足元の基準グリッド（展示台/軌道面）
- 部位クリックで、その大きさに応じて滑らかにフライ・トゥ（自動フォーカス）＆発光ハイライト
- 浮遊ラベル（アンカードット付き・選択でグロー）：なし / 主要のみ / 全表示
- レイヤー切替：皮膚 / 骨格 / 筋肉 / 内臓
- 系統凡例オーバーレイ（路線図の凡例風・クリックでレイヤー連動）
- 部位単位の表示ON/OFF（チェックボックス）、名称・詳細・左右ペアの関連表示
- 表示モード：通常 / 選択強調 / 他部位半透明 / 単独表示(isolate)
- カテゴリ・エリアフィルター、部位名検索
- 視点プリセット（正面 / 背面 / 左右側面 / 上面 / 斜め）、選択部位へフォーカス、リセット
- 左右対称部位は（右）（左）で区別

## セットアップ

```bash
npm install
npm run dev
```

ブラウザで表示された URL（既定 http://127.0.0.1:5173 ）を開きます。

その他のコマンド:

```bash
npm run build      # 型チェック + 本番ビルド
npm run preview    # ビルド結果のプレビュー
npm run typecheck  # 型チェックのみ
```

## 技術スタック

Vite / React 18 / TypeScript / Three.js / React Three Fiber / drei / Zustand

## 3Dモデルについて

MVP では外部アセットに依存せず、**プリミティブ（球・カプセル・円柱・箱・トーラス）を
組み合わせたプロシージャルな人体モデル** を用いています。各部位は独立したメッシュ群
として生成され、部位単位の表示切替・クリック選択・ハイライトが可能です。

将来的に、部位ごとにメッシュが分かれた glTF/GLB モデルへ差し替える場合は、
`src/scenes/AnatomyModel.tsx` を GLTF ローダに置き換え、各 `AnatomyPart.meshId` と
モデル内メッシュ名を対応づけてください。データ構造（`AnatomyPart`）はそのまま流用できます。

## ディレクトリ構成

```
src/
  components/   UIコンポーネント（Sidebar, PartList, InfoPanel, ViewControls ほか）
  scenes/       3D描画（AnatomyScene, AnatomyModel, PartMesh, CameraController, LabelRenderer）
  store/        表示・選択状態の管理（Zustand）
  data/         部位データ・カテゴリ・エリア定義
  types/        型定義
  utils/        形状生成・カメラ制御ユーティリティ
```

## 部位の追加方法

`src/data/anatomyParts.ts` に `P({ ... })` で1部位を追加するだけです。
左右対称部位は右側（x<0）を定義して `makePair()` で包むと、左右が自動生成されます。
形状は `pieces`（球・カプセル・円柱・箱・トーラスの組み合わせ）で表現します。
