---
name: useTaskStore分割リファクタリング
overview: 425行の `useTaskStore.ts` を、責務ごとに5つのモジュールファイル + 1つの純粋ユーティリティに分割し、`composables/task-store/` ディレクトリに再構成する。外部APIは `useTaskStore()` composable をそのまま維持し、利用側の変更は型インポートパスの修正のみに留める。
todos:
  - id: create-date-utils
    content: "`apps/web/lib/date-utils.ts` を新規作成 -- Vue/Nuxt非依存の純粋関数 `toDateStr`, `toJpDateLabel`, `formatDateShort` を配置"
    status: completed
  - id: create-types
    content: "`apps/web/composables/task-store/types.ts` を新規作成 -- `DateGroupKey`, `DateGroup` 型を配置"
    status: completed
  - id: create-state
    content: "`apps/web/composables/task-store/state.ts` を新規作成 -- `useTaskState()` 関数で全 useState 宣言 + `selectedList`, `todayStr`, `tomorrowStr` などの基本 computed を返す"
    status: completed
  - id: create-filters
    content: "`apps/web/composables/task-store/filters.ts` を新規作成 -- `useTaskFilters(state)` で `listedTasks`, `filteredTasks`, `dateGroupedTasks`, 各種カウント computed を返す"
    status: completed
  - id: create-actions
    content: "`apps/web/composables/task-store/actions.ts` を新規作成 -- `useTaskActions(state)` で `fetchData`, `addTask`, `scheduleTask`, `completeTask`, `moveTaskToList` を返す"
    status: completed
  - id: create-navigation
    content: "`apps/web/composables/task-store/navigation.ts` を新規作成 -- `useTaskNavigation(state)` で `switchToDateView`, `switchToListView`, `switchStatusFilter`, `syncFromRoute` を返す"
    status: completed
  - id: create-index
    content: "`apps/web/composables/task-store/index.ts` を新規作成 -- `useTaskStore()` を定義し、全サブモジュールを合成して統一APIとして返す。旧 `useTaskStore.ts` を削除"
    status: completed
  - id: fix-type-imports
    content: "`TaskDateSection.vue` の `DateGroupKey` インポートパスを `~/composables/task-store/types` に修正"
    status: completed
isProject: false
---

# useTaskStore 分割リファクタリング

## 現状分析

[`useTaskStore.ts`](apps/web/composables/useTaskStore.ts) は425行で、以下の5つの責務が1ファイルに混在している:

1. **型定義** (L11-18): `DateGroupKey`, `DateGroup`
2. **純粋ユーティリティ** (L21-28): `toDateStr`, `toJpDateLabel`
3. **ステート宣言** (L35-53): 10個の `useState` + 基本 computed
4. **フィルタ・日付グルーピング** (L58-226): `filteredTasks`, `dateGroupedTasks`, 各種カウント computed
5. **APIアクション** (L236-324): `fetchData`, `addTask`, `scheduleTask`, `completeTask`, `moveTaskToList`
6. **ナビゲーション** (L334-381): `switchToDateView`, `switchToListView`, `switchStatusFilter`, `syncFromRoute`

## 分割構成

```mermaid
graph TD
    subgraph lib ["apps/web/lib/"]
        DateUtils["date-utils.ts<br/>toDateStr, toJpDateLabel,<br/>formatDateShort"]
    end

    subgraph taskStore ["apps/web/composables/task-store/"]
        Types["types.ts<br/>DateGroupKey, DateGroup"]
        State["state.ts<br/>useTaskState()"]
        Filters["filters.ts<br/>useTaskFilters(state)"]
        Actions["actions.ts<br/>useTaskActions(state)"]
        Navigation["navigation.ts<br/>useTaskNavigation(state)"]
        Index["index.ts<br/>useTaskStore() - 統合エントリ"]
    end

    Index --> State
    Index --> Filters
    Index --> Actions
    Index --> Navigation
    Filters --> Types
    Filters --> DateUtils
    Actions --> State
    Navigation --> State
    State --> Types
