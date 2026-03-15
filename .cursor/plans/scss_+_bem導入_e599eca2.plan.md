---
name: SCSS + BEM導入
overview: "`sass` パッケージを追加し、3つの Vue ファイルの CSS を SCSS (BEM記法ネスト) に書き換え、クラス名を BEM 設計に統一する。"
todos:
  - id: install-sass
    content: "`apps/web` に `sass` を devDependency として追加"
    status: completed
  - id: refactor-index
    content: "`index.vue` の template クラス名を BEM に変更し、style を SCSS (BEM ネスト) に書き換え"
    status: completed
  - id: refactor-login
    content: "`login.vue` の template クラス名を BEM に変更し、style を SCSS (BEM ネスト) に書き換え"
    status: completed
  - id: refactor-confirm
    content: "`confirm.vue` の template クラス名を BEM に変更し、style を SCSS (BEM ネスト) に書き換え"
    status: completed
isProject: false
---

# SCSS導入 + BEM クラス名再設計

## 1. sass パッケージのインストール

`apps/web` に devDependency として追加:

```bash
cd apps/web && bun add -d sass
```

## 2. BEM クラス名の設計

各ページごとに1つの Block を定義し、その中の要素を `__element`、バリエーションを `--modifier` で表現する。ルール通り SCSS ネスト (`&__`, `&--`) で記述する。

---

### [apps/web/pages/index.vue](apps/web/pages/index.vue) - Block: `home`

**クラス名マッピング:**

- `.home-container` -> `.home`
- `.home-card` -> `.home__card`
- `h1` (暗黙) -> `.home__title`
- `.subtitle` -> `.home__subtitle`
- `.divider` -> `.home__divider`
- `.user-info` -> (削除、v-if の div は BEM 的にはブロック直下のラッパー不要。class は残して `.home__user-info` にする)
- `.status` -> `.home__status`
- `.user-detail` -> `.home__user-detail`
- `.avatar` -> `.home__avatar`
- `.name` -> `.home__name`
- `.email` -> `.home__email`
- `.provider` -> `.home__provider`
- `.btn-logout` -> `.home__logout`
- `.not-logged-in` -> `.home__guest`
- `.btn-login` -> `.home__login`

**SCSS構造 (概要):**

```scss
.home {
  // container styles

  &__card { ... }
  &__title { ... }
  &__subtitle { ... }
  &__divider { ... }
  &__status { ... }
  &__user-info { ... }
  &__user-detail { ... }
  &__avatar { ... }
  &__name { ... }
  &__email { ... }
  &__provider { ... }
  &__logout {
    // base styles
    &:hover { ... }
  }
  &__guest { ... }
  &__login {
    // base styles
    &:hover { ... }
  }
}
```

---

### [apps/web/pages/login.vue](apps/web/pages/login.vue) - Block: `login`

**クラス名マッピング:**

- `.login-container` -> `.login`
- `.login-card` -> `.login__card`
- `h1` (暗黙) -> `.login__title`
- `.subtitle` -> `.login__subtitle`
- `.divider` -> `.login__divider`
- `.buttons` -> `.login__actions`
- `.btn` + `.btn-google` -> `.login__btn` + `.login__btn--google`
- `.btn` + `.btn-github` -> `.login__btn` + `.login__btn--github`
- `.error` -> `.login__error`

**SCSS構造 (概要):**

```scss
.login {
  // container styles

  &__card { ... }
  &__title { ... }
  &__subtitle { ... }
  &__divider { ... }
  &__actions { ... }
  &__btn {
    // base button styles
    &:disabled { ... }

    &--google {
      // google styles
      &:hover:not(:disabled) { ... }
    }

    &--github {
      // github styles
      &:hover:not(:disabled) { ... }
    }
  }
  &__error { ... }
}
```

---

### [apps/web/pages/confirm.vue](apps/web/pages/confirm.vue) - Block: `confirm`

**クラス名マッピング:**

- `.confirm-container` -> `.confirm`
- `.confirm-card` -> `.confirm__card`
- `.loading` -> `.confirm__loading`
- `.spinner` -> `.confirm__spinner`
- `.error-state` -> `.confirm__error-state`
- `.error` -> `.confirm__error`
- `.back-link` -> `.confirm__back`

**SCSS構造 (概要):**

```scss
.confirm {
  // container styles

  &__card { ... }
  &__loading { ... }
  &__spinner { ... }
  &__error-state { ... }
  &__error { ... }
  &__back { ... }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

---

## 3. 各ファイルの変更方針

- **template**: クラス名を BEM に置き換え、`h1` にも明示的なクラスを付与
- **style**: `<style scoped>` -> `<style lang="scss" scoped>` に変更し、BEM ネスト構造で書き直す
- **script**: 変更なし
- ファイル構成順序: script -> template -> style (現状維持、既にこの順)
