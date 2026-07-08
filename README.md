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

- **骨格**: 実写的な全身骨格の glTF（Draco圧縮・約1.6MB）を読み込みます
  （[src/scenes/SkeletonModel.tsx](src/scenes/SkeletonModel.tsx)）。右半身＋体幹のモデルを
  実行時にXミラーして全身化し、バウンディングボックスから中心・スケールを算出して
  フレームに整列。144個の骨メッシュを [src/data/skeletonMap.ts](src/data/skeletonMap.ts) で
  アプリの部位ID（頭蓋骨・脊椎・肋骨・骨盤・上腕骨…）へ対応づけ、選択/ハイライト/ラベル/
  単独表示/カメラフォーカスをそのまま実メッシュに適用しています。
- **筋肉**: 実写的な筋肉の glTF（`muscles.glb`・約0.8MB）を読み込みます
  （[src/scenes/MuscleModel.tsx](src/scenes/MuscleModel.tsx)）。骨格と**座標が完全一致**する
  同一ソースのモデルなので、骨格が算出した共有変換で骨に正確に重なります。160個の筋メッシュを
  [src/data/muscleMap.ts](src/data/muscleMap.ts) で18の筋部位（三角筋・大胸筋・僧帽筋・広背筋・
  上腕二頭/三頭筋・前腕/手の筋・大殿筋・大腿四頭筋・ハムストリング・下腿三頭筋…）へ対応づけ。
  ※ 腹筋・頸部の筋は現状のデータに含まれないため未対応（整合する無償素材が別途必要）。初期は非表示。
- **内臓・皮膚**: プリミティブ（球・カプセル等）による概略表示で、初期は非表示（実写化は今後）。

Draco デコーダは CDN 非依存で `public/draco/` に同梱しています。

### モデルのライセンス / 出典

骨格3Dモデルは **BodyParts3D（© ライフサイエンス統合データベースセンター DBCLS）** に由来し、
**Open3DModel（Leiden University Medical Center）** 経由で配布されているものを利用しています。
ライセンスは **Creative Commons 表示-継承（CC BY-SA）** です。本アプリで当該モデルを
再配布する場合も同ライセンス・出典表示が必要です。

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
