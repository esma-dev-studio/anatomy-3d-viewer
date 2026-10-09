# このリポジトリでの作業ルール

ローカルでもクラウドセッション（Claude Code on the web）でも読まれる。クラウドでは利用者のPC側の共通ルールやメモリが読めないため、必要なものをここに置く。

## 進め方・報告
- 報告は日本語で書く（コミットメッセージは既存に合わせて英語）。報告は結論から、最初の1〜2文で「何をした・何が分かった」を述べる。
- 依頼された範囲だけ変更する。頼まれていない改善・整理はせず、気づいた点は報告で挙げる。
- 完了報告の前に `npm run typecheck` と `npm run build` を通し、確かめた事実だけを書く。確かめられなかった点は「未確認」と書く。
- 見た目の基準: フラット塗り・絵文字UI・原色は不合格。影・質感・SVGアイコンを使う。

## コマンド
- `npm run dev`（開発サーバー）/ `npm run typecheck` / `npm run build`（tsc + vite build）
- クラウドセッションでは起動時に `.claude/settings.json` のフックが `npm ci` を自動で実行する（`CLAUDE_CODE_REMOTE=true` のときだけ）。

## Git
- コミットの作者メールは noreply にする（個人メールだと GitHub が GH007 で push を拒否する）。コミット前に次を実行する。
  - `git config user.name "Kota"`
  - `git config user.email "280012992+esma-dev-studio@users.noreply.github.com"`
- クラウドセッションでは作業ブランチに push し、main への直接 push は利用者が頼んだときだけ行う。force push・ブランチ削除はしない。
- クラウドでは `gh pr create` が使えない（GraphQL が通らない）。PR は画面の「Create PR」か、`gh api repos/esma-dev-studio/anatomy-3d-viewer/pulls` の REST で作る。
- GitHub Pages（gh-pages ブランチ）への公開は、利用者が頼んだときだけ行う。

## 実装上の注意（過去に踏んだもの）
- three.js の GLTFLoader はノード名の空白を `_` に置き換える。名前でメッシュを判定するときは `_` を空白に戻し、祖先の名前も見る。
- three.js r152 以降は `setRGB` や頂点色をリニアとして扱う。sRGB の値を使うつもりなら `SRGBColorSpace` を指定するか、2.2乗して渡す。
