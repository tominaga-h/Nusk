/**
 * グローバル Toast 通知 composable
 *
 * useState でシングルトン管理し、どのコンポーネントからでも
 * showToast(message) を呼ぶだけで通知を表示できる。
 * 一定時間後に自動消去される。
 */
export function useToast() {
  /** 表示中のメッセージ */
  const message = useState<string>('toast-message', () => '')
  /** Toast の表示フラグ */
  const visible = useState<boolean>('toast-visible', () => false)
  /** 自動消去用タイマー */
  const timer = ref<ReturnType<typeof setTimeout> | null>(null)

  /**
   * Toast 通知を表示する
   * @param msg - 表示するメッセージ
   * @param duration - 自動消去までのミリ秒（デフォルト 3000ms）
   */
  function showToast(msg: string, duration = 3000) {
    if (timer.value) clearTimeout(timer.value)
    message.value = msg
    visible.value = true
    timer.value = setTimeout(() => {
      visible.value = false
      message.value = ''
      timer.value = null
    }, duration)
  }

  return { message: readonly(message), visible: readonly(visible), showToast }
}
