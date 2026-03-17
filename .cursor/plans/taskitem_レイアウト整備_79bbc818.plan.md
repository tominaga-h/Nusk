---
name: TaskItem レイアウト整備
overview: TaskItem.vue のタスク情報の並びを整えて、リスト名・ステータス・日付を常に右揃えに統一し、リスト名の前にアイコンを追加する。
todos:
  - id: fix-title-flex
    content: "__title に flex: 1, min-width: 0, truncate を追加してタイトルを可変幅にする"
    status: completed
  - id: add-list-icon
    content: LayoutList アイコンをインポートし、リスト名バッジの前にアイコンを表示する
    status: completed
  - id: update-list-name-style
    content: __list-name のスタイルを inline-flex + gap に変更してアイコンとテキストを整列させる
    status: completed
isProject: false
---

# TaskItem レイアウト整備 + リスト名アイコン追加

## 現状の問題

[TaskItem.vue](apps/web/components/TaskItem.vue) の `task-item__info` 内でタイトル(`__title`)が自然幅のため、タスク名の長さによってリスト名バッジ・ステータスバッジ・日付の水平位置がバラバラになっている。

```
[v] タスク7  [プライベート] [完了]   📅 3/15
[ ] タスク1  [仕事] [未対応]   📅 3/17（今日）
[ ] タスク4  [プライベート] [未対応]   📅 3/17（今日）
              ↑ ここがガタガタ
```

## 修正方針

### 1. タイトルを flex: 1 で可変幅にし、メタデータを右寄せ固定

- `__title` に `flex: 1; min-width: 0;` と `@include truncate;` を追加
- タイトルが長い場合は省略記号(`...`)で切り詰め、後続のバッジ・日付は常に右端に揃う

修正後のイメージ:
```
[v] タスク7...........  [プライベート] [完了]   📅 3/15
[ ] タスク1...........  [仕事]       [未対応]   📅 3/17（今日）
[ ] タスク4...........  [プライベート] [未対応]   📅 3/17（今日）
                         ↑ 右寄せで揃う
```

### 2. リスト名バッジの前にアイコンを追加

- `lucide-vue-next` から `LayoutList` アイコンをインポート
- リスト名バッジ(`__list-name`)内にアイコンとテキストを並べて表示
- バッジを `display: inline-flex; align-items: center; gap: spacing(1);` に変更

## 対象ファイル

- [apps/web/components/TaskItem.vue](apps/web/components/TaskItem.vue) - script / template / style の3箇所を修正
