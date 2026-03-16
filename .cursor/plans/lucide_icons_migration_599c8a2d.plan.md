---
name: Lucide icons migration
overview: lucide-vue-next をインストールし、6つのファイルに散在するインラインSVGアイコンをLucideコンポーネントに置き換える。login.vue のブランドロゴ（Google/GitHub）はLucide対象外のためそのまま残す。
todos:
  - id: install
    content: apps/web に lucide-vue-next をインストール (bun add)
    status: completed
  - id: sidebar
    content: "AppSidebar.vue: Calendar, AlarmClock, LogOut に置き換え (3箇所)"
    status: completed
  - id: filterbar
    content: "TaskFilterBar.vue: SlidersHorizontal, ArrowUpFromLine, Calendar, CircleCheck に置き換え (4箇所)"
    status: completed
  - id: taskinput
    content: "TaskInput.vue: Calendar に置き換え (1箇所)"
    status: completed
  - id: taskitem
    content: "TaskItem.vue: Calendar に置き換え (1箇所)"
    status: completed
  - id: minicalendar
    content: "MiniCalendar.vue: ChevronLeft, ChevronRight に置き換え (2箇所)"
    status: completed
  - id: tasks
    content: "tasks.vue: List, Calendar に置き換え (2箇所)"
    status: completed
isProject: false
---

# Lucide Icons の導入と既存アイコンの入れ替え

## 方針

- `lucide-vue-next` をインストールし、各コンポーネントのインラインSVGをLucideアイコンコンポーネントに置き換える
- デザインに合わせて全アイコンに `:size` と `:stroke-width="1.2"` を指定する（デザインのstroke-widthが1.2-1.3のため）
- [login.vue](apps/web/pages/login.vue) の Google/GitHub ブランドロゴは Lucide の範疇外なので **変更しない**

## 1. パッケージインストール

[apps/web/package.json](apps/web/package.json) の `dependencies` に追加:

```bash
cd apps/web && bun add lucide-vue-next
```

## 2. ファイルごとの変更内容

### 2-1. [AppSidebar.vue](apps/web/components/AppSidebar.vue)

`script` に import を追加し、3箇所のインラインSVGを置き換える:

| 行 | 現在の SVG | 置き換え先 |
|---|---|---|
| L44-46 | カレンダー（「今日」メニュー） | `<Calendar :size="14" :stroke-width="1.2" />` |
| L53-58 | アラーム時計（「明日」メニュー） | `<AlarmClock :size="15" :stroke-width="1.2" />` |
| L83-85 | ログアウト | `<LogOut :size="16" :stroke-width="1.2" />` |

```typescript
import { Calendar, AlarmClock, LogOut } from 'lucide-vue-next'
```

既存の `sidebar__item-svg` クラスはLucideコンポーネントにそのまま `class` 属性で付与可能。

### 2-2. [TaskFilterBar.vue](apps/web/components/TaskFilterBar.vue)

`script` に import を追加し、4箇所のインラインSVGを置き換える:

| 行 | 現在の SVG | 置き換え先 |
|---|---|---|
| L7-9 | フィルターラベル | `<SlidersHorizontal :size="14" :stroke-width="1.2" />` |
| L15-17 | 優先度 | `<ArrowUpFromLine :size="14" :stroke-width="1.2" />` |
| L21-23 | 期限（カレンダー） | `<Calendar :size="14" :stroke-width="1.2" />` |
| L27-30 | ステータス（円+チェック） | `<CircleCheck :size="15" :stroke-width="1.2" />` |

```typescript
import { SlidersHorizontal, ArrowUpFromLine, Calendar, CircleCheck } from 'lucide-vue-next'
```

### 2-3. [TaskInput.vue](apps/web/components/TaskInput.vue)

`script` に import を追加し、1箇所のインラインSVGを置き換える:

| 行 | 現在の SVG | 置き換え先 |
|---|---|---|
| L29-31 | カレンダーボタン | `<Calendar :size="18" :stroke-width="1.3" />` |

```typescript
import { Calendar } from 'lucide-vue-next'
```

### 2-4. [TaskItem.vue](apps/web/components/TaskItem.vue)

`script` に import を追加し、1箇所のインラインSVGを置き換える:

| 行 | 現在の SVG | 置き換え先 |
|---|---|---|
| L51-60 | 日付表示のカレンダー | `<Calendar class="task-item__date-icon" :size="14" :stroke-width="1.2" />` |

```typescript
import { Calendar } from 'lucide-vue-next'
```

### 2-5. [MiniCalendar.vue](apps/web/components/MiniCalendar.vue)

`script` に import を追加し、2箇所のインラインSVGを置き換える:

| 行 | 現在の SVG | 置き換え先 |
|---|---|---|
| L91-93 | 前月ボタン（左chevron） | `<ChevronLeft :size="12" :stroke-width="1.5" />` |
| L96-98 | 次月ボタン（右chevron） | `<ChevronRight :size="12" :stroke-width="1.5" />` |

```typescript
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
```

ミニカレンダーのchevronは元が5x8pxと小さいため、size=12 / stroke-width=1.5 程度で視認性を確保する。

### 2-6. [tasks.vue](apps/web/pages/tasks.vue)

`script` に import を追加し、2箇所のインラインSVGを置き換える:

| 行 | 現在の SVG | 置き換え先 |
|---|---|---|
| L27-32 | リストビューボタン | `<List :size="16" :stroke-width="1.3" />` |
| L40-42 | 日付ビューボタン | `<Calendar :size="16" :stroke-width="1.3" />` |

```typescript
import { List, Calendar } from 'lucide-vue-next'
```

## 3. 変更対象外

- [login.vue](apps/web/pages/login.vue) - Google / GitHub のブランドSVGロゴはLucideに存在しないためそのまま維持
- CSS/SCSS - アイコンサイズはLucideの `:size` prop で制御するため、既存のSCSSの変更は基本不要。Lucideコンポーネントは `<svg>` を出力するので、既存のSVG向けスタイルがそのまま適用される

## 変更サマリー

- 新規依存: `lucide-vue-next`
- 変更ファイル数: **6ファイル**
- 置き換えアイコン数: **13箇所**
- 変更なし: login.vue（ブランドロゴ）
