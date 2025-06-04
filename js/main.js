/*************************************************************************
 * Responsive navigation + smooth scroll
 * 2025.06 修正版 | scroll-padding-top を JS で補正／逆スクロール回避
 ************************************************************************/

// ページ遷移時にブラウザが自動でスクロール位置を復元しないように設定
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

(() => {
  // ハンバーガーボタンとナビゲーションエリアを取得
  const hamburger = document.getElementById("js-hamburger");
  const nav = document.getElementById("global-nav");
  if (!hamburger || !nav) return;

  // ハンバーガーメニュー開閉処理
  const toggleMenu = () => {
    const isOpen = nav.classList.toggle("is-open");
    hamburger.setAttribute("aria-expanded", isOpen); // アクセシビリティ対応
    nav.setAttribute("aria-hidden", !isOpen);
    document.body.classList.toggle("is-scrollLock", isOpen); // 背景スクロール防止

    if (isOpen) {
      nav.removeAttribute("inert"); // フォーカス可能にする
    } else {
      const focused = document.activeElement;
      if (nav.contains(focused)) focused.blur(); // nav内の要素がフォーカスされていれば解除
      nav.setAttribute("inert", ""); // nav内の要素を一時的にフォーカス不可に
    }
  };

  // ハンバーガークリックイベント登録
  hamburger.addEventListener("click", toggleMenu);

  // ページ内リンクを取得（#で始まるリンク）
  document.querySelectorAll("a[href^='#']").forEach(link => {
    link.addEventListener("click", e => {
      const href = link.getAttribute("href");
      if (!href || href === "#") return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault(); // デフォルトのジャンプ動作を無効化

      // SP時にメニューが開いていれば閉じる
      if (nav.classList.contains("is-open")) {
        toggleMenu();
      }

      history.pushState(null, '', href); // URLにハッシュを付与（履歴にも残る）

      // Tabキーによる逆スクロール回避：リンクを一時的に非フォーカスに
      const allLinks = document.querySelectorAll('a');
      allLinks.forEach(a => {
        a.dataset.prevTabindex = a.getAttribute('tabindex') ?? ''; // 元のtabindexを保存
        a.setAttribute('tabindex', '-1'); // 一時的に無効化
      });

      // 描画後に位置を正確に補正してスクロール
      requestAnimationFrame(() => {
        const rect = target.getBoundingClientRect();
        const scrollY = window.pageYOffset;
        const scrollPadding = parseFloat(
          getComputedStyle(document.documentElement).getPropertyValue('--header-h')
        ) || 0;
        const offsetY = scrollY + rect.top - scrollPadding;

        window.scrollTo({ top: offsetY, behavior: 'smooth' }); // スムーススクロール

        setTimeout(() => {
          const hadTabindex = target.hasAttribute('tabindex');
          if (!hadTabindex) target.setAttribute('tabindex', '-1');
          target.focus({ preventScroll: true }); // スクロールせずにフォーカス
          if (!hadTabindex) {
            requestAnimationFrame(() => {
              target.removeAttribute('tabindex');
            });
          }

          // 全リンクの tabindex を元に戻す
          allLinks.forEach(a => {
            const prev = a.dataset.prevTabindex;
            if (prev === '') {
              a.removeAttribute('tabindex');
            } else {
              a.setAttribute('tabindex', prev);
            }
            delete a.dataset.prevTabindex;
          });
        }, 400); // スクロール完了を待つために遅延
      });
    });
  });
})();

// PC表示時は nav の aria-hidden を解除（常に表示されているため）
window.addEventListener("DOMContentLoaded", () => {
  const nav = document.getElementById("global-nav");
  if (!nav) return;

  if (window.matchMedia('(min-width: 768px)').matches) {
    nav.removeAttribute('aria-hidden');
  }
});

// ハッシュ付きURLでページを開いた時に補正スクロールを実行
window.addEventListener("DOMContentLoaded", () => {
  const hash = location.hash;
  if (!hash) return;

  const target = document.querySelector(hash);
  if (!target) return;

  requestAnimationFrame(() => {
    const rect = target.getBoundingClientRect();
    const scrollY = window.pageYOffset;
    const scrollPadding = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue('--header-h')
    ) || 0;
    const offsetY = scrollY + rect.top - scrollPadding;

    const html = document.documentElement;
    const prevScroll = html.style.scrollBehavior;
    html.style.scrollBehavior = "auto"; // 一瞬だけ自動スクロールにして補正
    window.scrollTo({ top: offsetY });
    html.style.scrollBehavior = prevScroll; // 元に戻す
  });
});
