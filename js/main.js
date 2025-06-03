/*************************************************************************
 * Responsive navigation + smooth scroll
 * 2025.06 最終版 | ページ内リンク後のTabスクロール戻り問題を修正
 ************************************************************************/

// ─── ① ブラウザの自動スクロール復元を無効に ────────────────
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

// ─── ② ナビゲーションメニューの開閉とスムーススクロール処理 ──────
(() => {
  const hamburger = document.getElementById("js-hamburger");
  const nav = document.getElementById("global-nav");
  if (!hamburger || !nav) return;

  // ▼ ハンバーガー開閉切り替え
  const toggleMenu = () => {
    const isOpen = nav.classList.toggle("is-open");
    hamburger.setAttribute("aria-expanded", isOpen);
    nav.setAttribute("aria-hidden", !isOpen);
    document.body.classList.toggle("is-scrollLock", isOpen);
    if (isOpen) {
      nav.removeAttribute("inert");
    } else {
      nav.setAttribute("inert", "");
    }
  };

  hamburger.addEventListener("click", toggleMenu);

  // ▼ ③ ページ内リンクのスムーススクロールとフォーカス処理
  document.querySelectorAll("a[href^='#']").forEach(link => {
    link.addEventListener("click", e => {
      const targetID = link.getAttribute("href");
      const target = targetID === "#" ? document.documentElement : document.querySelector(targetID);
      if (!target) return;

      e.preventDefault(); // 通常のジャンプをキャンセル
      link.blur();        // Tabキー移動先を初期化

      // URLのハッシュを更新
      history.replaceState(null, "", targetID);

      // メニューが開いていれば閉じる
      if (nav.classList.contains("is-open")) toggleMenu();

      // スクロール対象に一時的に tabindex="-1" を付与（フォーカス可能にする）
      const hadTabindex = target.hasAttribute("tabindex");
      if (!hadTabindex) {
        target.setAttribute("tabindex", "-1");
      }

      // スムーススクロール開始
      target.scrollIntoView({ behavior: "smooth", block: "start" });

      // スクロール完了後にフォーカス（preventScroll で戻りを抑制）
      setTimeout(() => {
        target.focus({ preventScroll: true });
        // tabindexを元に戻す（あれば残す）
        if (!hadTabindex) {
          target.removeAttribute("tabindex");
        }
      }, 500); // 適度に余裕を持ってフォーカスを移す
    });
  });
})();

// ─── ③ リロード・戻る進む時にハッシュ位置補正 ────────────────
document.addEventListener("DOMContentLoaded", () => {
  const hash = location.hash;
  if (hash) {
    const target = document.querySelector(hash);
    if (target) {
      const html = document.documentElement;
      const prevScroll = html.style.scrollBehavior;
      html.style.scrollBehavior = "auto"; // 一瞬で移動
      target.scrollIntoView({ block: "start" });
      html.style.scrollBehavior = prevScroll;
    }
  }
});