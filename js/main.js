/*************************************************************************
 * Responsive navigation + smooth scroll
 * 2025.06  |  scroll-restoration fix added
 *************************************************************************/
// ─── ① Stop browser’s automatic scroll restoration ───────────────
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

// ─── ② Navigation & smooth-scroll handler ───────────────────────
(() => {
  const hamburger = document.getElementById("js-hamburger");
  const nav       = document.getElementById("global-nav");

  if (!hamburger || !nav) return;

  /* ハンバーガー開閉 */
  const toggleMenu = () => {
    const isOpen = nav.classList.toggle("is-open"); //返り値が true = 付いた / false = 外した
    hamburger.setAttribute("aria-expanded", isOpen);
    nav.setAttribute("aria-hidden", !isOpen);
    document.body.classList.toggle("is-scrollLock", isOpen); //toggle() 2 つ目の引数は 付け外し条件。ここでは isOpen が true の時だけ付ける
  };

  hamburger.addEventListener("click", toggleMenu);

  /* in-page smooth scroll */
  //ページ中のリンク先が # で始まる <a> 要素（ページ内リンク）を全部集めて1つずつ取り出して処理する
  document.querySelectorAll("a[href^='#']").forEach(link => {
    //各リンクに「クリックされたとき」のイベントリスナーを登録。e はイベントオブジェクト。
    link.addEventListener("click", e => {
      const targetID = link.getAttribute("href");
      //スクロール先の要素を決定。 - もし # だけなら ページ最上部 (document.documentElement)。 - それ以外なら querySelectorで該当要素を探す。
      const target   = targetID === "#" ? document.documentElement
                                        : document.querySelector(targetID);
      //万一リンク先 ID が存在しなければ 何もしないで終了。
      if (!target) return;

      // <a> 本来の「即ジャンプする」動作を止める。
      e.preventDefault();

      // ① URL のハッシュを先に置き換える
      history.replaceState(null, '', targetID);

      // ② メニューが開いていれば閉じる
      if (nav.classList.contains("is-open")) toggleMenu();

      // ③ スムーススクロール（scroll-padding-top が自動補正）
      //ブラウザの組み込み API で アニメーション付きスクロール。
      target.scrollIntoView({ // scroll-padding-top が効く
        behavior: "smooth", // behavior: "smooth" で滑らかに移動。
        block: "start"
      });
    });
  });
})();

// ─── ③ Reload / back-forward 時に hash 位置を補正 ───────────────
document.addEventListener('DOMContentLoaded', () => {
  const hash = location.hash;
  if (hash) {
    const target = document.querySelector(hash);
    if (target) {
      // ❶ 一時的に scroll-behavior を auto に設定して瞬時移動
      const htmlEl = document.documentElement;
      const prevBehavior = htmlEl.style.scrollBehavior;
      htmlEl.style.scrollBehavior = 'auto';

      target.scrollIntoView({ block: 'start' }); // ← アニメなしで補正

      // ❷ 元に戻して以降のクリックは smooth
      htmlEl.style.scrollBehavior = prevBehavior;
    }
  }
});