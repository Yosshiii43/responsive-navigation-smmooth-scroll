/*************************************************************************
 * main.js  –  var.1.3
 * ハンバーガーメニュー制御 + スムーススクロール + 幅切替リセット
 *************************************************************************/

// リロード時に勝手に元のスクロール位置へ戻らないように
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

document.addEventListener('DOMContentLoaded', () => {
  /* ─────────────────────────────────────
     0. 定数 & 要素取得
  ───────────────────────────────────── */
  const mqPC = window.matchMedia('(min-width: 1024px)');      // PC = 1024px↑

  const hamburger = document.getElementById('js-hamburger');
  const nav       = document.getElementById('global-nav');
  const body      = document.body;
  if (!nav) return;                                           // ナビが無ければ終了

  /* ─────────────────────────────────────
     1. ナビ状態を強制リセットするヘルパー
  ───────────────────────────────────── */
  const closeMobileMenu = () => {                             // SP 幅での初期状態
    hamburger?.classList.remove('is-open');
    hamburger?.setAttribute('aria-expanded', 'false');
    nav.classList.remove('is-open');
    body.classList.remove('is-scrollLock');
    nav.setAttribute('aria-hidden', 'true');
    nav.setAttribute('inert', '');
  };

  const openDesktopNav = () => {                              // PC 幅の初期状態
    hamburger?.classList.remove('is-open');
    hamburger?.setAttribute('aria-expanded', 'false');
    body.classList.remove('is-scrollLock');
    nav.classList.remove('is-open');
    nav.removeAttribute('aria-hidden');
    nav.removeAttribute('inert');
  };

  /* ─────────────────────────────────────
     2. ハンバーガー開閉
  ───────────────────────────────────── */
  const toggleMenu = () => {
    const isOpen = nav.classList.toggle('is-open');
    hamburger?.setAttribute('aria-expanded', isOpen);
    nav.setAttribute('aria-hidden', !isOpen);
    body.classList.toggle('is-scrollLock', isOpen);

    if (isOpen) {
      nav.removeAttribute('inert');
    } else {
      const focused = document.activeElement;
      if (nav.contains(focused)) focused.blur();
      nav.setAttribute('inert', '');
    }
  };

  hamburger?.addEventListener('click', toggleMenu);

/* ─────────────────────────────────────
   3. 共通スムーススクロール（prefers‐reduced-motion 対応）
───────────────────────────────────── */
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const smoothScrollTo = (targetY, duration = 350) => { //速度をここで管理
  if (reduceMotion) {
    window.scrollTo(0, targetY);
    return;
  }
  const startY  = window.pageYOffset;
  const dist    = targetY - startY;
  const startT  = performance.now();
  const easeOut = t => t * (2 - t);       // お好みで変更可

  const step = now => {
    const t = Math.min(1, (now - startT) / duration);
    window.scrollTo(0, startY + dist * easeOut(t));
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
};

const scrollToTarget = target => {
  const scrollPadding = parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue('--header-h')
  ) || 0;
  const offsetY = target.getBoundingClientRect().top + window.pageYOffset - scrollPadding;
  smoothScrollTo(offsetY);
};

  /* ─────────────────────────────────────
     4. アンカーリンク（ページ内）クリック：スムーススクロール
  ───────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href');     // "#first" 等
      e.preventDefault();                         // ★常に標準ジャンプ抑止

      if (!href || href === '#') return;          // ダミー "#" はここで終了

      const target = document.querySelector(href);
      if (!target) return;                        // 要素が無ければ終了

      history.pushState(null, '', href);          // URL の # を更新

      // ハンバーガーが開いていたら閉じる (nav がある時のみ)
      const nav = document.getElementById('global-nav');
      if (nav && nav.classList.contains('is-open')) toggleMenu();

      // 次フレームでスムーススクロール
      requestAnimationFrame(() => scrollToTarget(target));
    });
  });

  /* ─────────────────────────────────────
     5. PC ⇔ SP 幅切り替え時のリセット
  ───────────────────────────────────── */
  mqPC.addEventListener('change', e => {
    if (e.matches) {               // SP → PC
      openDesktopNav();
    } else {                       // PC → SP
      closeMobileMenu();
    }
  });

  // 画面読み込み時の初期判定
  if (mqPC.matches) {
    openDesktopNav();
  } else {
    closeMobileMenu();
  }
});