# 無料ホスティングへの公開準備

このサイトは静的ファイルだけで動作する。広告、解析、サーバーAPI、秘密情報は不要。

## GitHub Pages

1. このプロジェクトをGitHubリポジトリへ置き、Pagesの公開元をGitHub Actionsに設定する。
2. リポジトリ直下の `.github/workflows/deploy-pages.yml` を有効にする。
3. `main` へ反映すると、同梱済みデータに対するテストを通過した場合だけ公開する。データ更新時はローカルで `npm run build:data && npm run verify:sample && npm test` を完了してから反映する。
4. 公開URLは通常 `https://<GitHubユーザー名>.github.io/<リポジトリ名>/` になる。

## Cloudflare Pages

1. Cloudflare PagesでGit連携またはDirect Uploadの新規プロジェクトを作る。
2. ビルドコマンドは `npm run build:data && npm run verify:sample && npm test`、出力ディレクトリは `sites/chuo-gomi` を指定する。
3. Git連携の場合はNode.js 22を選ぶ。Direct Uploadの場合は、ローカルで同じ検証を通してから `sites/chuo-gomi` の内容をアップロードする。
4. 公開URLは通常 `https://<プロジェクト名>.pages.dev/` になる。

## 公開前の必須条件

- `workspace/approvals.md` のAP-001とAP-002を解消する。
- `noindex,nofollow` は広告なしの限定公開中に維持する。検索公開へ切り替える際は、canonical、robots、sitemap、404と本番HTTPS・ヘッダーを再監査する。
- 広告は導入しない。Stage 0の利用データと監査条件を満たしてから別途判断する。
