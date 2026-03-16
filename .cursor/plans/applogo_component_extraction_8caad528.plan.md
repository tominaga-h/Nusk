---
name: AppLogo component extraction
overview: login.vue と AppSidebar.vue で重複している「アイコン + Nusk テキスト」のセットを `AppLogo.vue` コンポーネントとして切り出し、両方のファイルで使い回す。
todos:
  - id: create-component
    content: AppLogo.vue コンポーネントを新規作成 (size prop 対応、BEM + SCSS)
    status: completed
  - id: update-login
    content: login.vue のタイトル部分を AppLogo に置き換え、不要スタイル削除
    status: completed
  - id: update-sidebar
    content: AppSidebar.vue のロゴ部分を AppLogo に置き換え、不要スタイル削除
    status: completed
isProject: false
---

# AppLogo コンポーネントの切り出し

## 現状

- [login.vue](apps/web/pages/login.vue) (L29-32): `<h1>` 内に `<img>` + "Nusk" テキスト。アイコン 40x40px、フォントサイズ `xl`
- [AppSidebar.vue](apps/web/components/AppSidebar.vue) (L16-19): `<div>` 内に `<img>` + `<h1>` "Nusk" テキスト。アイコン 40x40px、フォントサイズ `lg`

## 方針

`size` prop (`'md' | 'lg'`) でサイズを切り替えられるコンポーネントを作成する。

- `md` (デフォルト): サイドバー用。フォントサイズ `lg`、アイコン 40px
- `lg`: ログイン画面用。フォントサイズ `xl`、アイコン 40px

## 作成するファイル

**`apps/web/components/AppLogo.vue`** - 新規コンポーネント

```vue
<script setup lang="ts">
withDefaults(defineProps<{ size?: 'md' | 'lg' }>(), { size: 'md' })
</script>

<template>
  <div class="app-logo" :class="`app-logo--${size}`">
    <img class="app-logo__icon" src="/img/icon.png" alt="Nusk" />
    <span class="app-logo__text">Nusk</span>
  </div>
</template>
```

- BEM 規約に従い `.app-logo` ブロックを使用
- スタイルは SCSS でネスト記法
- `$font-family-logo` 等の既存変数を再利用

## 変更するファイル

- **[login.vue](apps/web/pages/login.vue)**: `<h1>` の中身を `<AppLogo size="lg" />` に置き換え、不要になった `&__icon` スタイルを削除
- **[AppSidebar.vue](apps/web/components/AppSidebar.vue)**: `sidebar__logo` 内の `<img>` + `<h1>` を `<AppLogo />` に置き換え、不要になった `&__logo-icon` / `&__logo-text` スタイルを削除
