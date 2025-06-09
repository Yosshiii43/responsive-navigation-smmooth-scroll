# responsive-navigation-smmooth-scroll

親子メニューの無いシンプルな**レスポンシブ・ナビゲーション** テンプレートです。
Safari の「逆スクロール」や `Tab` 戻り問題を解消し、固定ヘッダーでも #アンカーへスムースに移動します。

---

## Features
- ハンバーガーメニュー（`aria-expanded` 更新・`inert` 制御付き）
- 固定ヘッダーでもズレないスムーススクロール（Safari 専用 polyfill）
- 変数 2 つで *高さ* と *fixed / sticky* を切替
- タブレット幅 *768–1023 px* は **SP モード** と同じ挙動

---

## Quick Start

```bash
git clone https://github.com/Yosshiii43/responsive-navigation-smooth-scroll.git
cd responsive-navigation-smooth-scroll
```

---

## Customization

### ヘッダー高さ / モード

scss/foundation/_variables.scss

| 変数            | 役割                      | デフォルト  |
|----------------|---------------------------|-----------|
| `$header-h`    | ヘッダーの高さ              | `64px`    |
| `$header-mode` | `fixed` か `sticky` を指定 | `fixed `  |

// 例: 高さ 72px のstickyヘッダーに切り替えたい場合

```
$header-h   : 72px;
$header-mode: sticky;
```

Safari 注意：sticky + Tab で逆スクロールが起きるため、
本番では fixed 推奨（JS 側で追加対策済み）。

これらは
`scss/foundation/_base.scss`
`scss/object/layout/_header.scss`
に反映されます。

---

### ハンバーガーの線

scss/object/component/_hamburger.scss

```
.c-hamburger {
  --bar-h: 2px;   // 線の太さ
  --gap : 6px;    // 線間の隙間
}
```

---

### ブレークポイント
scss/foundation/_mq.scss

| 名称     | min-width  | 挙動                        |
|---------|------------|-----------------------------|
| tab     | 768px      | SPモード（ハンバーガーメニュー） |
| pc      | 1024px     | PCモード（ドロップダウンメニュー）|

tabをpcに合わせたい時は、
main.jsの
```
const mqPC      = window.matchMedia('(min-width: 1024px)'); // PC = 1024px↑
```
のmin-widthを768pxに変更する。

---

## Browser Support

| Chrome | Firefox | Safari | Edge | IE  |
|--------|---------|--------|------|---- |
| 95+    | 91+     | 15+    | 95+  | ❌  |

---

## LIcense

MIT © 2025  Yosshiii