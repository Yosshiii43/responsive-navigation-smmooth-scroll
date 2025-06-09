/*************************************************************************
 * main.js  –  var.1.2 〈初心者向けコメント付き〉
 *
 * 目的
 * -------------------------------------------------------------
 *   1. 画面幅が 1024px 以上（PC）では横並びナビを常時表示。
 *   2. 1023px 以下（SP/タブレット）ではハンバーガーで開閉。
 *   3. SP 幅で開いた状態のまま PC 幅にすると自動でリセット。
 *   4. ハンバーガーを開いたまま PC → SP 幅に戻ったら
 *      もう一度ハンバーガーを「閉じた状態」に戻す。
 *   5. 固定ヘッダーでもズレのないアンカー（#リンク）スクロール。
 *   6. Safari の “逆スクロール” 問題を回避。
 *************************************************************************/

/* ============================
   0. ブラウザ判定 & スクロール復元無効化
   ============================ */

// 「ユーザーエージェント」に 'Safari' だけが含まれるかチェック。
// Chrome for iOS などは `chrome` が入るので除外できる。
const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

// ページ再読み込み時に、ブラウザが「前のスクロール位置」を
// 勝手に再現しないようにする（リロード時のガタつき防止）。
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

/* ============================
   1. DOM が読み込まれてから実行
   ============================ */
document.addEventListener('DOMContentLoaded', () => {
  /* ------------------------------------------
     1-A. 要素とメディアクエリの取得
  ------------------------------------------ */
  const mqPC      = window.matchMedia('(min-width: 1024px)'); // 1024px 以上を「PC」幅と定義
  const hamburger = document.getElementById('js-hamburger');  // 3 本線（≒ボタン）
  const nav       = document.getElementById('global-nav');    // 対象ナビゲーション
  const body      = document.body;                            // 背景スクロールを止める用
  if (!nav) return;   // nav 要素が存在しないなら以降の処理は不要

  /* ------------------------------------------
     1-B. ナビ表示を「完全に閉じる」関数
           （SP 幅のデフォルト状態に戻す）
  ------------------------------------------ */
  const closeMobileMenu = () => {
    hamburger?.classList.remove('is-open');        // アイコンの線を元に戻す
    hamburger?.setAttribute('aria-expanded', 'false');
    nav.classList.remove('is-open');               // ナビ本体を隠す
    body.classList.remove('is-scrollLock');        // 背景スクロール解放
    nav.setAttribute('aria-hidden', 'true');       // スクリーンリーダーから隠す
    nav.setAttribute('inert', '');                 // フォーカスを当てられないように
  };

  /* ------------------------------------------
     1-C. ナビを「PC 用デフォルト表示」にする関数
  ------------------------------------------ */
  const openDesktopNav = () => {
    // ハンバーガーは閉じたまま（PC では単なる飾りボタン）
    hamburger?.classList.remove('is-open');
    hamburger?.setAttribute('aria-expanded', 'false');
    body.classList.remove('is-scrollLock');        // 念のため解除
    nav.classList.remove('is-open');               // .is-open を外すだけで表示
    nav.removeAttribute('aria-hidden');            // スクリーンリーダー OK
    nav.removeAttribute('inert');                  // キーボード操作 OK
  };

  /* ------------------------------------------
     2. ハンバーガーボタンで開閉する関数
  ------------------------------------------ */
  const toggleMenu = () => {
    // classList.toggle() は追加/削除を 1 行で
    const isOpen = nav.classList.toggle('is-open');

    // WAI-ARIA：開閉状態を読み上げソフトに伝える
    hamburger?.setAttribute('aria-expanded', isOpen);
    nav.setAttribute('aria-hidden', !isOpen);

    // 背景スクロールを止める（iOS などで body が背面スクロールすると UX が悪い）
    body.classList.toggle('is-scrollLock', isOpen);

    // inert 属性でフォーカス制御（ポータル / ダイアログの考え方と同じ）
    if (isOpen) {
      nav.removeAttribute('inert');
    } else {
      const focused = document.activeElement;
      if (nav.contains(focused)) focused.blur();   // ナビ内にフォーカスが残る場合は外す
      nav.setAttribute('inert', '');
    }
  };

  // クリックで開閉
  hamburger?.addEventListener('click', toggleMenu);

  /* ============================
     3. スムーススクロール（Safari 対応）
     ============================ */

  // Safari は scroll-behavior: smooth がギクシャクするので
  // requestAnimationFrame を使った手動アニメを用意
  const smoothScrollTo = (targetY, duration = 600) => {
    const startY   = window.pageYOffset;           // 今のスクロール量
    const distance = targetY - startY;             // 目的地までの距離
    const startT   = performance.now();            // アニメ開始時刻
    const easeOutQuad = t => t * (2 - t);          // イージング関数

    const step = now => {
      const time  = Math.min(1, (now - startT) / duration);
      const eased = easeOutQuad(time);
      window.scrollTo(0, startY + distance * eased);
      if (time < 1) requestAnimationFrame(step);   // 終点に着くまで再帰
    };
    requestAnimationFrame(step);
  };

  // 「#target 要素」へスクロールする共通処理
  const scrollToTarget = target => {
    const rect   = target.getBoundingClientRect(); // ビューポート基準の位置
    const scrollY = window.pageYOffset;
    // CSS 変数 --header-h に固定ヘッダーの高さを入れておく
    const scrollPadding = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue('--header-h')
    ) || 0;
    const offsetY = scrollY + rect.top - scrollPadding;

    // Safari だけ手動アニメ、ほかはネイティブ smooth
    if (isSafari) {
      smoothScrollTo(offsetY);
    } else {
      window.scrollTo({ top: offsetY, behavior: 'smooth' });
    }
  };

  /* ============================
     4. アンカーリンク（#xxx）クリック
     ============================ */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    // 共通で呼ぶ関数を定義
    const handleAnchor = e => {
      const href = link.getAttribute('href');      // 例: "#section2"
      if (!href || href === '#') return;           // 「#」のみはトップに飛ばす場合
      const target = document.querySelector(href); // 対象要素取得
      if (!target) return;                         // 存在しなければ何もしない

      e.preventDefault();                          // 本来のジャンプを止める
      history.pushState(null, '', href);           // URL のハッシュだけ書き換え

      // SP でナビが開いていたら閉じてからスクロール
      if (nav.classList.contains('is-open')) toggleMenu();

      // レイアウト確定後にスクロール（requestAnimationFrame で 1 フレーム先へ）
      requestAnimationFrame(() => scrollToTarget(target));
    };

    /* ----------- イベント登録（初心者向けに展開） ----------- */
    link.addEventListener('mousedown', e => {      // マウス左クリック
      if (e.button === 0) handleAnchor(e);
    });

    link.addEventListener('keydown', e => {        // キーボード Enter
      if (e.key === 'Enter') handleAnchor(e);
    });
  });

  /* ============================
     5. ページ読込直後、URL に # があればスクロール
     ============================ */
  if (location.hash) {
    const target = document.querySelector(location.hash);
    if (target) requestAnimationFrame(() => scrollToTarget(target));
  }

  /* ============================
     6. 画面幅が変わったときのリセット
     ============================ */
  mqPC.addEventListener('change', e => {
    if (e.matches) {            // 例:  900px → 1100px（SP → PC）
      openDesktopNav();
    } else {                    // 例: 1100px → 900px（PC → SP）
      closeMobileMenu();
    }
  });

  // ページ初期表示時の状態を決定
  if (mqPC.matches) {           // 読み込んだ瞬間 PC 幅だった？
    openDesktopNav();
  } else {
    closeMobileMenu();
  }
});