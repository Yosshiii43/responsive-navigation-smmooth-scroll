/*************************************************************************
 * スムーススクロール + 逆スクロール対策・Safariスムーススクロールスピード対策版
 ************************************************************************/

const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

// スクロール復元を無効化
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.getElementById('js-hamburger');
  const nav = document.getElementById('global-nav');
  const body = document.body;

  if (!nav) return;

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

  // Safari専用スムーススクロール関数
  const smoothScrollTo = (targetY, duration = 600) => {
    const startY = window.pageYOffset;
    const distance = targetY - startY;
    const startTime = performance.now();

    const easeOutQuad = t => t * (2 - t);

    const step = currentTime => {
      const time = Math.min(1, (currentTime - startTime) / duration);
      const eased = easeOutQuad(time);
      window.scrollTo(0, startY + distance * eased);
      if (time < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  };

  const scrollToTarget = target => {
    const rect = target.getBoundingClientRect();
    const scrollY = window.pageYOffset;
    const scrollPadding = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue('--header-h')
    ) || 0;
    const offsetY = scrollY + rect.top - scrollPadding;

    if (isSafari) {
      smoothScrollTo(offsetY, 600);
    } else {
      window.scrollTo({
        top: offsetY,
        behavior: 'smooth'
      });
    }
  };

  document.querySelectorAll('a[href^="#"]').forEach(link => {
    const handleAnchor = e => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      history.pushState(null, '', href);

      if (nav.classList.contains('is-open')) {
        toggleMenu();
      }

      requestAnimationFrame(() => {
        scrollToTarget(target);
      });
    };

    link.addEventListener('mousedown', e => {
      if (e.button === 0) handleAnchor(e);
    });

    link.addEventListener('keydown', e => {
      if (e.key === 'Enter') handleAnchor(e);
    });
  });

  // 読み込み時のハッシュ補正
  const hash = location.hash;
  if (hash) {
    const target = document.querySelector(hash);
    if (target) {
      requestAnimationFrame(() => {
        scrollToTarget(target);
      });
    }
  }

  // PC幅に切り替えたときに nav を有効化
  window.matchMedia('(min-width: 768px)').addEventListener('change', e => {
    if (e.matches) {
      nav.removeAttribute('aria-hidden');
      nav.removeAttribute('inert');
    } else {
      if (!nav.classList.contains('is-open')) {
        nav.setAttribute('aria-hidden', 'true');
        nav.setAttribute('inert', '');
      }
    }
  });

  // 初期読み込み時にもPC幅なら解除
  if (window.matchMedia('(min-width: 768px)').matches) {
    nav.removeAttribute('aria-hidden');
    nav.removeAttribute('inert');
  }
});