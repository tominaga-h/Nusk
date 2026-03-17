---
name: task-store重複import警告解消
overview: Nuxtのauto-importで発生している `DateGroupKey` / `StatusFilterValue` の重複登録警告を、型の公開経路を一本化して解消します。影響範囲を確認しつつ、将来の再発を防ぐために補足コメントも整理します。
todos:
  - id: verify-exports
    content: task-store配下の型エクスポート元を確認し重複シンボルを特定する
    status: completed
  - id: remove-duplicate-reexport
    content: index.tsの重複型再エクスポートを削除して公開経路を一本化する
    status: completed
  - id: validate-warning-gone
    content: 重複警告が消えることとlint上の問題がないことを確認する
    status: completed
isProject: false
---

# task-store 重複import警告の解消

## 現状整理
- [apps/web/nuxt.config.ts](apps/web/nuxt.config.ts) で `imports.dirs` が `~/composables/**` になっており、`task-store` 配下の全エクスポートが auto-import 収集対象。
- [apps/web/composables/task-store/index.ts](apps/web/composables/task-store/index.ts) で `DateGroupKey` / `StatusFilterValue` を `./types` から再エクスポート。
- [apps/web/composables/task-store/types.ts](apps/web/composables/task-store/types.ts) でも同名型を直接エクスポートしているため、Nuxtが重複警告を出している。

## 実施方針
- 型の公開元を [apps/web/composables/task-store/types.ts](apps/web/composables/task-store/types.ts) に統一する。
- [apps/web/composables/task-store/index.ts](apps/web/composables/task-store/index.ts) から重複の原因となる型再エクスポートを削除する（`useTaskStore` の提供責務に限定）。
- 既存の利用箇所が `types.ts` 直接参照であることを維持し、必要ならコメントで意図を明記する。

## 確認
- 警告文に出ていた `DateGroupKey` / `StatusFilterValue` の重複が消えることを確認。
- 変更ファイルに対してlint診断を確認し、副作用がないことを確認。
