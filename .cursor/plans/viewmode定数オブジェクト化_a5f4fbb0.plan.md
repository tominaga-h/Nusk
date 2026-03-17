---
name: ViewMode定数オブジェクト化
overview: types.ts に ViewMode 定数オブジェクトと ViewModeValue 型を追加し、5ファイルの 'list'/'date' 文字列リテラルを定数参照に置き換える。
todos:
  - id: types-def
    content: "types.ts: ViewMode 定数オブジェクトと ViewModeValue 型を追加、TaskState の viewMode フィールド型を差し替え"
    status: completed
  - id: state-ref
    content: "state.ts: ViewMode/ViewModeValue インポート + useState の型と初期値を定数参照に置換"
    status: completed
  - id: nav-ref
    content: "navigation.ts: ViewMode/ViewModeValue インポート + 9箇所の文字列リテラルを定数参照に置換"
    status: completed
  - id: sidebar-ref
    content: "AppSidebar.vue: ViewMode インポート追加 + テンプレート内 6箇所を定数参照に置換"
    status: completed
  - id: tasks-ref
    content: "tasks.vue: ViewMode インポート追加 + script/template 5箇所を定数参照に置換"
    status: completed
isProject: false
---

# viewMode ユニオン型の定数オブジェクト化

## 1. [types.ts](apps/web/composables/task-store/types.ts) -- 定義追加

`StatusFilter` の直後（L30 付近）に `ViewMode` 定数オブジェクトと `ViewModeValue` 型を追加し、`TaskState` インターフェースの `viewMode` フィールドの型を差し替える。

```typescript
/** 表示モードの値型 */
export const ViewMode = {
  LIST: 'list',
  DATE: 'date',
} as const;
export type ViewModeValue = (typeof ViewMode)[keyof typeof ViewMode];
```

`TaskState` の `viewMode` フィールド（現在 L45）を変更:
- `viewMode: Ref<'list' | 'date'>` → `viewMode: Ref<ViewModeValue>`

## 2. [state.ts](apps/web/composables/task-store/state.ts) -- 2箇所

- import に `ViewMode` を追加、type import に `ViewModeValue` を追加
- L38: `useState<'list' | 'date'>(..., () => 'list')` → `useState<ViewModeValue>(..., () => ViewMode.LIST)`

## 3. [navigation.ts](apps/web/composables/task-store/navigation.ts) -- 9箇所

- import に `ViewMode` を追加、type import に `ViewModeValue` を追加
- `switchToDateView` 内 (L26-27): `viewMode.value === 'date'` → `ViewMode.DATE`、`view: 'date'` → `view: ViewMode.DATE`
- `switchToListView` 内 (L38-39): `viewMode.value === 'list'` → `ViewMode.LIST`、`view: 'list'` → `view: ViewMode.LIST`
- `syncFromRoute` 内 (L59-65):
  - `as 'list' | 'date' | undefined` → `as ViewModeValue | undefined`
  - `view === 'date'` → `view === ViewMode.DATE`
  - `viewMode.value = 'date'` → `viewMode.value = ViewMode.DATE`
  - `view === 'list'` → `view === ViewMode.LIST`
  - `viewMode.value = 'list'` → `viewMode.value = ViewMode.LIST`

## 4. [AppSidebar.vue](apps/web/components/AppSidebar.vue) -- 6箇所

- import に `ViewMode` を追加（既存の `DateGroup` import 行に追記）
- L73: `viewMode === 'list'` → `viewMode === ViewMode.LIST`
- L95, L106, L118, L130, L142 (5箇所): `viewMode === 'date'` → `viewMode === ViewMode.DATE`

## 5. [tasks.vue](apps/web/pages/tasks.vue) -- 5箇所

- import に `import { ViewMode } from '~/composables/task-store/types'` を追加
- script 内 L24-25: `viewMode.value === 'list'` → `ViewMode.LIST`、`viewMode.value === 'date'` → `ViewMode.DATE`
- template 内 L45, L78, L79: `viewMode === 'date'` → `viewMode === ViewMode.DATE`（3箇所）
