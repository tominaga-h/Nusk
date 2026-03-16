---
name: completeTask implementation
overview: "`useTaskStore` に `completeTask` 関数を追加し、`TaskItem` のチェックボックスで完了/未完了を切り替えられるようにする。"
todos:
  - id: add-complete-task-fn
    content: useTaskStore.ts に completeTask 関数を追加し、return に含める
    status: completed
  - id: enable-checkbox
    content: TaskItem.vue のチェックボックスを有効化し、complete イベントを emit する
    status: completed
  - id: wire-event
    content: tasks.vue で completeTask を取得し、@complete イベントを接続する
    status: completed
isProject: false
---

# completeTask の実装

## 概要

チェックボックスのクリックでタスクのステータスを DONE に変更する機能を実装する。既に DONE の場合は TODO に戻すトグル動作にする。

## 変更対象ファイル (3ファイル)

### 1. [useTaskStore.ts](apps/web/composables/useTaskStore.ts) -- `completeTask` 関数の追加

`scheduleTask` の下（L114付近）に `completeTask` 関数を追加する。

ロジック:
- 引数で `taskId` を受け取る
- `tasks` から対象タスクを検索
- 対象タスクの `list_id` に属するステータス一覧から、現在が DONE でなければ `category: 'DONE'` のステータスを、既に DONE なら `category: 'TODO'` のステータスを取得
- タスクの `status_id` を更新

```typescript
function completeTask(taskId: string) {
  const task = tasks.value.find(t => t.id === taskId)
  if (!task) return
  const currentStatus = statuses.value.find(s => s.id === task.status_id)
  const targetCategory = currentStatus?.category === 'DONE' ? 'TODO' : 'DONE'
  const newStatus = statuses.value.find(
    s => s.list_id === task.list_id && s.category === targetCategory,
  )
  if (newStatus) task.status_id = newStatus.id
}
```

`return` オブジェクトにも `completeTask` を追加する。

### 2. [TaskItem.vue](apps/web/components/TaskItem.vue) -- チェックボックスを有効化

- `defineEmits` に `'complete': []` イベントを追加
- チェックボックスから `disabled` を削除
- `cursor: pointer` に変更（CSS）
- `@change` で `$emit('complete')` を発火

変更箇所:
- L11-14: emits に `'complete': []` を追加
- L31-37: `<input>` から `disabled` を削除し、`@change="$emit('complete')"` を追加
- L98 (CSS): `cursor: default` を `cursor: pointer` に変更

### 3. [tasks.vue](apps/web/pages/tasks.vue) -- イベントの接続

- L4-13: `useTaskStore()` の分割代入に `completeTask` を追加
- L48-56: `<TaskItem>` に `@complete="completeTask(task.id)"` を追加
