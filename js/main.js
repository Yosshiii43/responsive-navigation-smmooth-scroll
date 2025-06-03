/*************************************************************************
 * Responsive navigation + smooth scroll
 * 2025.06 修正版 | scroll-padding-top を JS で補正／逆スクロール回避
 ************************************************************************/

// ページ遷移時にブラウザが自動でスクロール位置を復元しないように設定
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

(() => {
  // ハンバーガーメニューとナビゲーションの要素を取得
  const hamburger = document.getElementById("js-hamburger");
  const nav = document.getElementById("global-nav");
  if (!hamburger || !nav) return;

  // ハンバーガークリック時にメニューを開閉する関数
  const toggleMenu = () => {
    const isOpen = nav.classList.toggle("is-open");
    hamburger.setAttribute("aria-expanded", isOpen);
    nav.setAttribute("aria-hidden", !isOpen);
    document.body.classList.toggle("is-scrollLock", isOpen);

    if (isOpen) {
      nav.removeAttribute("inert");
    } else {
      // nav 内にフォーカスがある場合は外す
      const focused = document.activeElement;
      if (nav.contains(focused)) focused.blur();
      nav.setAttribute("inert", "");
    }
  };

  // ハンバーガークリックイベント
  hamburger.addEventListener("click", toggleMenu);

  // すべてのページ内リンクに対して処理
  document.querySelectorAll("a[href^='#']").forEach(link => {
    link.addEventListener("click", e => {
      const href = link.getAttribute("href");
      if (!href || href === "#") return;

      const target = document.querySelector(href);
      if (!target) return;

      // 通常のジャンプ動作を止める
      e.preventDefault();

      // スマホ時に nav が開いていたら閉じる
      if (nav.classList.contains("is-open")) {
        toggleMenu();
      }

      // URLにハッシュを付加（履歴にも残る）
      history.pushState(null, '', href);

      // Tabキー操作によるスクロール戻りを防ぐため、全リンクを一時的に無効化
      const allLinks = document.querySelectorAll('a');
      allLinks.forEach(a => {
        a.dataset.prevTabindex = a.getAttribute('tabindex') ?? '';
        a.setAttribute('tabindex', '-1');
      });

      // 描画が終わってからスクロール処理を行う（位置ズレ防止）
      requestAnimationFrame(() => {
        const rect = target.getBoundingClientRect(); // ビューポートからの距離
        const scrollY = window.pageYOffset; // 現在のスクロール位置
        const scrollPadding = parseFloat(
          getComputedStyle(document.documentElement).getPropertyValue('--header-h')
        ) || 0;
        const offsetY = scrollY + rect.top - scrollPadding;

        // スムーススクロールで目的の位置へ移動
        window.scrollTo({ top: offsetY, behavior: 'smooth' });

        // 少し待ってからフォーカスを当て直し
        setTimeout(() => {
          const hadTabindex = target.hasAttribute('tabindex');
          if (!hadTabindex) target.setAttribute('tabindex', '-1');

          // フォーカス時にスクロールさせないようにする
          target.focus({ preventScroll: true });

          // 一時的に付けた tabindex を削除
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
        }, 400); // スクロール終了のタイミングに合わせて調整
      });
    });
  });
})();

// PC表示の場合はナビゲーションの aria-hidden を外す
window.addEventListener("DOMContentLoaded", () => {
  const nav = document.getElementById("global-nav");
  if (!nav) return;

  if (window.matchMedia('(min-width: 768px)').matches) {
    nav.removeAttribute('aria-hidden');
  }
});

// ページ読み込み時に #付きURLがある場合の処理
window.addEventListener("DOMContentLoaded", () => {
  const hash = location.hash;
  if (!hash) return;

  const target = document.querySelector(hash);
  if (!target) return;

  // 描画が安定してから補正スクロールを実行
  requestAnimationFrame(() => {
    const rect = target.getBoundingClientRect();
    const scrollY = window.pageYOffset;
    const scrollPadding = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue('--header-h')
    ) || 0;
    const offsetY = scrollY + rect.top - scrollPadding;

    // 一瞬だけ scroll-behavior を無効にしてスクロール
    const html = document.documentElement;
    const prevScroll = html.style.scrollBehavior;
    html.style.scrollBehavior = "auto";
    window.scrollTo({ top: offsetY });
    html.style.scrollBehavior = prevScroll;
  });
});
