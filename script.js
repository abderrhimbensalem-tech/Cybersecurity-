'use strict';

document.addEventListener('DOMContentLoaded', function () {
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Helpers ---------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  var toastEl = $('#toast');
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 2000);
  }

  /* ---------- Year ---------- */
  var yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Mobile menu ---------- */
  var burger = $('#burger');
  var menu = $('#menu');
  function closeMenu() {
    if (!menu || !burger) return;
    menu.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
  }
  if (burger && menu) {
    burger.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    $all('a', menu).forEach(function (a) { a.addEventListener('click', closeMenu); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
  }

  /* ---------- Matrix rain ---------- */
  var canvas = $('#rain');
  if (canvas && canvas.getContext && !reduceMotion) {
    var ctx = canvas.getContext('2d');
    var chars = '01{}<>/;$#ABCDEF'.split('');
    var size = 16, cols = 0, drops = [];
    var resize = function () {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      cols = Math.floor(canvas.width / size);
      drops = [];
      for (var i = 0; i < cols; i++) drops.push(Math.random() * -50);
    };
    var draw = function () {
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#10122b';
      ctx.font = '14px monospace';
      for (var i = 0; i < cols; i++) {
        var ch = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(ch, i * size, drops[i] * size);
        if (drops[i] * size > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
    };
    resize();
    var rt;
    window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(resize, 150); });
    var rainTimer = setInterval(draw, 60);
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { clearInterval(rainTimer); rainTimer = null; }
      else if (!rainTimer) { rainTimer = setInterval(draw, 60); }
    });
  }

  /* ---------- Typing terminal ---------- */
  var typed = $('#typed');
  if (typed) {
    var lines = [
      '$ whoami',
      'abdulrahim // cybersecurity student',
      '$ ls skills/',
      'python  javascript  networking  web-security  crypto',
      '$ cat mission.txt',
      'Learn. Build. Protect. Share.',
      '$ status',
      'learning: continuous'
    ];
    if (reduceMotion) {
      typed.textContent = lines.join('\n');
    } else {
      var li = 0, ci = 0, done = '';
      var type = function () {
        if (li >= lines.length) return;
        var line = lines[li];
        if (ci <= line.length) {
          typed.textContent = done + line.slice(0, ci);
          ci++;
          setTimeout(type, line.charAt(0) === '$' ? 55 : 22);
        } else {
          done += line + '\n';
          li++; ci = 0;
          setTimeout(type, 320);
        }
      };
      type();
    }
  }

  /* ---------- Copy handle ---------- */
  var copyBtn = $('#copyHandle');
  var handleEl = $('#handle');
  if (copyBtn && handleEl) {
    copyBtn.addEventListener('click', function () {
      var text = handleEl.textContent.trim();
      function fallback() {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        var ok = false;
        try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
        document.body.removeChild(ta);
        toast(ok ? 'تم نسخ المعرّف' : 'تعذّر النسخ');
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { toast('تم نسخ المعرّف'); }, fallback);
      } else {
        fallback();
      }
    });
  }

  /* ---------- Counters ---------- */
  function animateCount(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    if (isNaN(target)) return;
    if (reduceMotion) { el.textContent = target; return; }
    var start = null, dur = 1200;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      el.textContent = Math.floor(p * target);
      if (p < 1) requestAnimationFrame(step); else el.textContent = target;
    }
    requestAnimationFrame(step);
  }

  /* ---------- Reveal on scroll + skill bars ---------- */
  function fillBars(root) {
    $all('.fill', root).forEach(function (f) { f.style.width = (f.getAttribute('data-w') || 0) + '%'; });
  }
  var revealEls = $all('.reveal');
  var countEls = $all('[data-count]');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('on');
        fillBars(en.target);
        io.unobserve(en.target);
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });

    var io2 = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        animateCount(en.target);
        io2.unobserve(en.target);
      });
    }, { threshold: 0.5 });
    countEls.forEach(function (el) { io2.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('on'); fillBars(el); });
    countEls.forEach(animateCount);
  }

  /* ---------- Card filters ---------- */
  var chips = $all('.chip');
  var cards = $all('#cards .card');
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var f = chip.getAttribute('data-filter');
      chips.forEach(function (c) { c.classList.toggle('active', c === chip); });
      cards.forEach(function (card) {
        var show = f === 'all' || card.getAttribute('data-cat') === f;
        card.classList.toggle('hidden', !show);
      });
    });
  });

  /* ---------- Active nav link on scroll ---------- */
  var links = menu ? $all('a', menu) : [];
  var sections = links.map(function (a) {
    var id = a.getAttribute('href');
    return id && id.charAt(0) === '#' ? $(id) : null;
  });
  function updateActive() {
    var y = window.scrollY + 120, current = -1;
    sections.forEach(function (s, i) { if (s && s.offsetTop <= y) current = i; });
    links.forEach(function (a, i) { a.classList.toggle('active', i === current); });
  }

  /* ---------- Back to top ---------- */
  var toTop = $('#toTop');
  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      updateActive();
      if (toTop) toTop.classList.toggle('show', window.scrollY > 500);
      ticking = false;
    });
  }, { passive: true });
  updateActive();
});
