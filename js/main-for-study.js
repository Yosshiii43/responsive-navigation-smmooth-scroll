/*************************************************************************
 * main-for-study.js * var.1.0
 * スムーススクロール + Safari対策 + ハンバーガーメニュー制御
 * 初学者向け詳細コメント付き：Yoshino 2025
 *************************************************************************/

// Safariかどうかを判定するための正規表現（ChromeやAndroidではないSafariのみ）
const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

// ページを戻ったときに自動的に前のスクロール位置に戻らないように設定（Safariで不具合が出やすいため）
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

// HTML全体のDOMが読み込まれたら実行
// → 画像などの読み込みは待たずにスクリプトを開始できる



document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.getElementById('js-hamburger'); // ハンバーガーメニューボタン（開閉トグル）
  const nav = document.getElementById('global-nav'); // ナビゲーションメニュー本体
  const body = document.body; // スクロールロック用に使うbody

  if (!nav) return; // navが存在しない（取得できなかった）場合は以降の処理を中止

  /**
   * ハンバーガーメニューの開閉を切り替える関数
   * - navに"is-open"クラスを付けて表示／非表示を切り替える
   * - aria属性を更新（アクセシビリティ対応）
   * - inert属性でフォーカスを制御（SP時にメニュー外にフォーカスが行かないように）
   */
  const toggleMenu = () => {
    const isOpen = nav.classList.toggle('is-open');

    hamburger?.setAttribute('aria-expanded', isOpen); // スクリーンリーダー向け：開いているかどうか
    nav.setAttribute('aria-hidden', !isOpen); // メニューが非表示かどうか
    body.classList.toggle('is-scrollLock', isOpen); // 開いている間はbodyスクロールを止める

    if (isOpen) {
      nav.removeAttribute('inert'); // メニューにフォーカス可能にする
    } else {
      const focused = document.activeElement; // 今フォーカスされている要素
      if (nav.contains(focused)) focused.blur(); // メニュー内にあればフォーカスを外す
      nav.setAttribute('inert', ''); // フォーカス対象外に（タブキーなどでも入れない）
    }
  };

  // ハンバーガーボタンがクリックされたらメニュー開閉
  hamburger?.addEventListener('click', toggleMenu);

  /**
   * Safari用：ネイティブのscrollTo({behavior:'smooth'})が速すぎるので
   * カスタムイージング関数を使ったスムーススクロール処理
   *
   * @param {number} targetY - スクロールしたい最終Y座標
   * @param {number} duration - アニメーションの時間（ms）
   */
  const smoothScrollTo = (targetY, duration = 600) => {
    const startY = window.pageYOffset; // 現在のスクロールY位置
    const distance = targetY - startY; // 移動距離
    const startTime = performance.now(); // アニメーション開始時刻

    // easing関数：最後にゆっくり止まる（イージングの一種）
    const easeOutQuad = t => t * (2 - t);

    const step = currentTime => {
      const time = Math.min(1, (currentTime - startTime) / duration); // 0〜1に正規化
      const eased = easeOutQuad(time); // easingでなめらかに
      window.scrollTo(0, startY + distance * eased); // スクロール実行
      if (time < 1) requestAnimationFrame(step); // 最後まで終わってなければ継続
    };

    requestAnimationFrame(step);
  };

  /**
   * 要素の位置を取得してスクロールする関数
   * @param {HTMLElement} target - スクロール先の要素
   */
  const scrollToTarget = target => {
    const rect = target.getBoundingClientRect(); // ビューポートからの相対位置
    const scrollY = window.pageYOffset; // 現在のスクロール量
    const scrollPadding = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue('--header-h')
    ) || 0; // ヘッダー高さ（--header-h）を取得

    const offsetY = scrollY + rect.top - scrollPadding; // スクロール先のY座標（ヘッダー分調整）

    // Safariかそれ以外かで処理分岐
    if (isSafari) {
      smoothScrollTo(offsetY, 600); // カスタムスクロール
    } else {
      window.scrollTo({ top: offsetY, behavior: 'smooth' }); // 標準スムーススクロール
    }
  };

  /**
   * a[href^="#"] のリンクをすべて対象にする
   * - SPナビのリンクを押したときにもスクロールが発生
   */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    const handleAnchor = e => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return; // hrefが空や"#"だけなら無視

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault(); // 通常のリンク動作を止める
      history.pushState(null, '', href); // URLのハッシュだけ変更（ページ遷移なし）

      if (nav.classList.contains('is-open')) {
        toggleMenu(); // メニューが開いていれば閉じる
      }

      // レイアウトが安定してからスクロールを実行
      requestAnimationFrame(() => {
        scrollToTarget(target);
      });
    };

    // 左クリックでスクロール処理を行う
    link.addEventListener('mousedown', e => {
      if (e.button === 0) handleAnchor(e);
    });

    // Enterキーでのフォーカス移動時にも対応
    link.addEventListener('keydown', e => {
      if (e.key === 'Enter') handleAnchor(e);
    });
  });

  /**
   * 読み込み時にURLにハッシュがついていたら、その位置にスクロール
   */
  const hash = location.hash;
  if (hash) {
    const target = document.querySelector(hash);
    if (target) {
      requestAnimationFrame(() => {
        scrollToTarget(target);
      });
    }
  }

  /**
   * ウィンドウ幅が768px以上になったとき、メニューを常時表示状態に切り替え
   * - SPで閉じたままになっていたメニューを有効化
   */
  window.matchMedia('(min-width: 768px)').addEventListener('change', e => {
    if (e.matches) {
      nav.removeAttribute('aria-hidden'); // 表示扱いにする
      nav.removeAttribute('inert'); // フォーカス対象にする
    } else {
      if (!nav.classList.contains('is-open')) {
        nav.setAttribute('aria-hidden', 'true'); // 非表示扱い
        nav.setAttribute('inert', ''); // フォーカス対象外
      }
    }
  });

  /**
   * 読み込み時にも、ウィンドウ幅が768px以上ならPC用メニューとして扱う
   */
  if (window.matchMedia('(min-width: 768px)').matches) {
    nav.removeAttribute('aria-hidden');
    nav.removeAttribute('inert');
  }
});
