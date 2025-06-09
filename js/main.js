/*************************************************************************
 * main.js  –  var.1.2
 * ハンバーガーメニュー制御 + スムーススクロール + 幅切替リセット
 *************************************************************************/

const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

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
     3. Safari 対策付きスムーススクロール
  ───────────────────────────────────── */
  const smoothScrollTo = (targetY, duration = 600) => {
    const startY   = window.pageYOffset;
    const distance = targetY - startY;
    const startT   = performance.now();
    const easeOutQuad = t => t * (2 - t);

    const step = now => {
      const time  = Math.min(1, (now - startT) / duration);
      const eased = easeOutQuad(time);
      window.scrollTo(0, startY + distance * eased);
      if (time < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const scrollToTarget = target => {
    const rect   = target.getBoundingClientRect();
    const scrollY = window.pageYOffset;
    const scrollPadding = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue('--header-h')
    ) || 0;
    const offsetY = scrollY + rect.top - scrollPadding;

    if (isSafari) {
      smoothScrollTo(offsetY);
    } else {
      window.scrollTo({ top: offsetY, behavior: 'smooth' });
    }
  };

  /* ─────────────────────────────────────
     4. アンカーリンククリック
  ───────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    const handleAnchor = e => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      history.pushState(null, '', href);

      if (nav.classList.contains('is-open')) toggleMenu();
      requestAnimationFrame(() => scrollToTarget(target));
    };

    // 初学者向けにわかりやすい書き方に変更
    link.addEventListener('mousedown', e => {
      if (e.button === 0) handleAnchor(e);
    });

    link.addEventListener('keydown', e => {
      if (e.key === 'Enter') handleAnchor(e);
    });
  });

  /* ─────────────────────────────────────
     5. 初期読み込み時にハッシュがある場合
  ───────────────────────────────────── */
  if (location.hash) {
    const target = document.querySelector(location.hash);
    if (target) requestAnimationFrame(() => scrollToTarget(target));
  }

  /* ─────────────────────────────────────
     6. PC ⇔ SP 幅切り替え時のリセット
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