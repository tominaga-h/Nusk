/**
 * Nuxt用APIクライアント composable
 *
 * Nuxtが提供する$fetch（ofetch）をcreateApiClientに注入し、
 * SSR/CSR両対応のAPIクライアントインスタンスを返す。
 * コンポーネントや他のcomposableからAPI呼び出しを行う際のエントリーポイント。
 */
import { createApiClient } from '@nusk/shared'

/** Nuxtの$fetchを使ったAPIクライアントを生成して返す */
export const useApi = () => createApiClient($fetch)
