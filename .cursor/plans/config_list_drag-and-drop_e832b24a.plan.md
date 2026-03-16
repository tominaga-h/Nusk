---
name: config list drag-and-drop
overview: config.vue のリスト管理セクションに vuedraggable を使ったドラッグ&ドロップによる並べ替え機能を追加する。
todos:
  - id: install-vuedraggable
    content: apps/web に vuedraggable@next をインストール
    status: completed
  - id: update-template
    content: config.vue のリスト管理 v-for を draggable コンポーネントで置き換え
    status: completed
  - id: update-script
    content: draggable の import と onListReorder ハンドラを追加
    status: completed
  - id: update-scss
    content: ドラッグ中の視覚フィードバック用 SCSS を追加
    status: completed
isProject: false
---

# リスト管理のドラッグ&ドロップ対応

## 現状

- [apps/web/pages/config.vue](apps/web/pages/config.vue) のリスト管理セクションには既に `GripVertical` アイコン（ドラッグハンドル）が配置されているが、実際のDnD機能は未実装
- プロジェクトにDnDライブラリは未導入

## 方針

Vue 3 向けの定番ライブラリ `vuedraggable@next`（SortableJS ラッパー）を使用する。

## 変更内容

### 1. パッケージインストール

`apps/web` に `vuedraggable@next` を追加する。

```bash
cd apps/web && bun add vuedraggable@next
```

### 2. template 修正 ([apps/web/pages/config.vue](apps/web/pages/config.vue))

リスト管理セクションの `v-for` ループ部分を `<draggable>` コンポーネントで置き換える。

現在の構造（L314-350）:

```html
<div
  v-for="(list, index) in lists"
  :key="list.id"
  class="config-list-item"
>
  ...
</div>
```

変更後:

```html
<draggable
  v-model="lists"
  item-key="id"
  handle=".config-list-item__grip"
  ghost-class="config-list-item--ghost"
  drag-class="config-list-item--drag"
  @end="onListReorder"
>
  <template #item="{ element: list, index }">
    <div class="config-list-item">
      <!-- 既存の中身はそのまま -->
    </div>
  </template>
</draggable>
```

ポイント:
- `handle` で `.config-list-item__grip`（GripVertical アイコン）をドラッグハンドルに指定
- `item-key="id"` で各アイテムを一意に識別
- `ghost-class` / `drag-class` でドラッグ中の視覚フィードバック

### 3. script 修正

- `draggable` コンポーネントを import
- `onListReorder` 関数を追加し、並べ替え後に各アイテムの `sort_order` をインデックスで更新

```typescript
import draggable from 'vuedraggable'

function onListReorder() {
  lists.value.forEach((list, i) => {
    list.sort_order = i
  })
}
```

### 4. SCSS 追加

ドラッグ中のゴースト要素とドラッグ要素のスタイルを追加:

```scss
.config-list-item {
  // 既存スタイル...

  &--ghost {
    opacity: 0.4;
    background: color('surface');
  }

  &--drag {
    box-shadow: shadow('md');
  }
}
```
