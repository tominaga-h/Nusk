/**
 * 日付関連の純粋ユーティリティ関数
 *
 * Vue/Nuxt に依存しない汎用的な日付フォーマット関数群。
 * composable やコンポーネントから import して使用する。
 */

/** Date オブジェクトを "YYYY-MM-DD" 形式の文字列に変換する */
export const toDateStr = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

/** 日付文字列（"YYYY-MM-DD"）を "M月D日" 形式にフォーマットする */
export const toJpDateLabel = (dateStr: string) => {
  const d = new Date(dateStr + 'T00:00:00')
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

/** 日付文字列（"YYYY-MM-DD"）を "M/D" 形式にフォーマットする（null の場合は空文字） */
export const formatDateShort = (date: string | null) => {
  if (!date) return ''
  const d = new Date(date + 'T00:00:00')
  return `${d.getMonth() + 1}/${d.getDate()}`
}
