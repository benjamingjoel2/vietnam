// Dragon Bay Travel: progressive enhancement only. Every page works without this file.
(() => {
  const d = document, root = d.documentElement;
  root.classList.add('js');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, c = d) => c.querySelector(s);
  const $$ = (s, c = d) => [...c.querySelectorAll(s)];

  // ---- header hides on scroll down, returns on scroll up ----
  const hdr = $('.hdr');
  let lastY = scrollY, ticking = false;
  const onScroll = () => {
    const y = scrollY;
    if (hdr && !d.body.classList.contains('menu-open')) hdr.classList.toggle('is-hidden', y > 200 && y > lastY + 4);
    if (y < lastY - 4 || y < 200) hdr && hdr.classList.remove('is-hidden');
    lastY = y;
    parallax();
    ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });

  // ---- parallax: karst layers drift at their own speeds ----
  const px = reduce ? [] : $$('[data-speed]');
  function parallax() {
    if (!px.length) return;
    const vh = innerHeight;
    for (const el of px) {
      const host = el.closest('section, .cta') || el;
      const r = host.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) continue;
      const s = parseFloat(el.dataset.speed);
      el.style.transform = `translate3d(0, ${(-r.top * s).toFixed(1)}px, 0)`;
    }
  }
  parallax();

  // ---- reveal on scroll ----
  const rv = $$('.rv, .rv-img');
  if ('IntersectionObserver' in window && rv.length) {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
    rv.forEach((el) => io.observe(el));
  } else rv.forEach((el) => el.classList.add('is-in'));

  // ---- menu overlay ----
  const menu = $('#menu'), openBtn = $('[data-menu-open]');
  if (menu && openBtn) {
    const closeBtn = $('[data-menu-close]', menu);
    const focusables = () => $$('a, button', menu).filter((x) => x.offsetParent !== null);
    const open = (e) => {
      e.preventDefault();
      $$('img[data-src]', menu).forEach((im) => { im.src = im.dataset.src; im.removeAttribute('data-src'); });
      requestAnimationFrame(() => menu.classList.add('is-open'));
      menu.removeAttribute('inert');
      d.body.classList.add('menu-open');
      openBtn.setAttribute('aria-expanded', 'true');
      setTimeout(() => closeBtn && closeBtn.focus(), 50);
    };
    const close = () => {
      menu.classList.remove('is-open');
      menu.setAttribute('inert', '');
      d.body.classList.remove('menu-open');
      openBtn.setAttribute('aria-expanded', 'false');
      openBtn.focus();
    };
    openBtn.setAttribute('role', 'button');
    openBtn.setAttribute('aria-controls', 'menu');
    openBtn.setAttribute('aria-expanded', 'false');
    openBtn.addEventListener('click', open);
    closeBtn && closeBtn.addEventListener('click', close);
    menu.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
      if (e.key === 'Tab') {
        const f = focusables(); if (!f.length) return;
        if (e.shiftKey && d.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && d.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    });
    // preview image follows the hovered destination
    const prev = $$('.menu__preview img', menu);
    $$('[data-pv]', menu).forEach((a) => {
      const show = () => prev.forEach((im) => im.classList.toggle('is-on', im.dataset.pv === a.dataset.pv));
      a.addEventListener('mouseenter', show); a.addEventListener('focus', show);
    });
  }

  // ---- carousel rails ----
  $$('.rail').forEach((rail) => {
    const tr = $('.rail__track', rail), bar = $('.rail__bar i', rail);
    const [pb, nb] = $$('.rail__btns button', rail);
    if (!tr) return;
    const upd = () => {
      const max = tr.scrollWidth - tr.clientWidth;
      const p = max > 0 ? tr.scrollLeft / max : 0;
      const w = tr.clientWidth / tr.scrollWidth;
      if (bar) { bar.style.width = (w * 100).toFixed(1) + '%'; bar.style.transform = `translateX(${(p * (1 / w - 1) * 100).toFixed(1)}%)`; }
      if (pb) pb.disabled = tr.scrollLeft < 4;
      if (nb) nb.disabled = tr.scrollLeft > max - 4;
    };
    const step = () => (tr.firstElementChild ? tr.firstElementChild.getBoundingClientRect().width + 20 : 300);
    pb && pb.addEventListener('click', () => tr.scrollBy({ left: -step(), behavior: reduce ? 'auto' : 'smooth' }));
    nb && nb.addEventListener('click', () => tr.scrollBy({ left: step(), behavior: reduce ? 'auto' : 'smooth' }));
    tr.addEventListener('scroll', upd, { passive: true });
    addEventListener('resize', upd);
    upd();
  });

  // ---- expanding panels ----
  $$('.panels').forEach((wrap) => {
    const ps = $$('.panel', wrap);
    const act = (p) => ps.forEach((x) => x.classList.toggle('is-active', x === p));
    ps.forEach((p) => { p.addEventListener('mouseenter', () => act(p)); p.addEventListener('focus', () => act(p)); });
  });

  // ---- weather strip ----
  $$('[data-wx]').forEach((wx) => {
    const btns = $$('.wx__months button', wx), out = $('.wx__out', wx), table = $('table', wx);
    const data = JSON.parse(wx.dataset.wx);
    const set = (m) => {
      btns.forEach((b, i) => b.setAttribute('aria-pressed', String(i === m)));
      table.classList.add('has-month');
      $$('[data-m]', table).forEach((c) => c.classList.toggle('is-col', +c.dataset.m === m));
      out.innerHTML = data.regions.map((r) => `<li><span>${r.name}<small>${r.notes[m]}</small></span><span class="r r${r.m[m]}">${data.labels[r.m[m]]}</span></li>`).join('');
    };
    btns.forEach((b, i) => b.addEventListener('click', () => set(i)));
    set(new Date().getMonth());
  });

  // ---- which bay chooser ----
  $$('[data-bays]').forEach((box) => {
    const scores = JSON.parse(box.dataset.bays);
    const form = $('form', box), cards = $$('.bay', box), res = $('[data-bay-result]', box);
    const calc = () => {
      const picks = $$('input:checked', form).map((i) => i.value);
      if (!picks.length) { box.classList.remove('has-pick'); cards.forEach((c) => c.classList.remove('is-pick')); if (res) res.textContent = ''; return; }
      let best = null, bs = -1;
      for (const [k, s] of Object.entries(scores)) { const t = picks.reduce((a, p) => a + (s[p] || 0), 0); if (t > bs) { bs = t; best = k; } }
      box.classList.add('has-pick');
      cards.forEach((c) => c.classList.toggle('is-pick', c.dataset.bay === best));
      const card = cards.find((c) => c.dataset.bay === best);
      if (res && card) res.textContent = `${res.dataset.label}: ${$('h3', card).textContent}`;
    };
    form.addEventListener('change', calc);
    form.addEventListener('reset', () => setTimeout(calc));
  });

  // ---- cave ladder ----
  $$('[data-ladder]').forEach((box) => {
    const rungs = $$('.rung', box), daysIn = $('[name=days]', box), out = $('.range-out', box), top = $('.ladder__top b', box);
    const L = JSON.parse(box.dataset.ladder);
    const upd = () => {
      const days = +daysIn.value, fit = +($('[name=fit]:checked', box) || { value: 1 }).value, swim = ($('[name=swim]:checked', box) || { value: 'yes' }).value === 'yes';
      out.textContent = days;
      let topName = '';
      rungs.forEach((r) => {
        const rd = +r.dataset.days, rf = +r.dataset.fit, rs = r.dataset.swim === '1';
        const ok = days >= rd && fit >= rf && (swim || !rs);
        const near = !ok && (swim || !rs) && ((days >= rd && fit === rf - 1) || (fit >= rf && days >= rd - 1));
        r.classList.remove('is-reach', 'is-stretch', 'is-beyond', 'is-top');
        r.classList.add(ok ? 'is-reach' : near ? 'is-stretch' : 'is-beyond');
        $('.st', r).textContent = ok ? L.reach : near ? L.stretch : L.beyond;
        if (ok && !topName) topName = $('.nm', r).firstChild.textContent.trim();
      });
      const t = rungs.find((r) => r.classList.contains('is-reach') && $('.nm', r).firstChild.textContent.trim() === topName);
      if (t) t.classList.add('is-top');
      top.textContent = topName || L.none;
    };
    box.addEventListener('input', upd); box.addEventListener('change', upd);
    upd();
  });

  // ---- enquiry form ----
  const form = $('#enquiry');
  if (form) {
    const q = new URLSearchParams(location.search);
    const msg = $('#f-message', form);
    const pre = [['cave', 'data-pre-cave'], ['bay', 'data-pre-bay'], ['journey', 'data-pre-journey']];
    for (const [k, attr] of pre) if (q.get(k) && msg && !msg.value) msg.value = `${form.getAttribute(attr)} ${q.get(k).slice(0, 80)}\n\n`;
    const interest = q.get('interest'); if (interest) { const cb = $(`input[name="interests"][value="${CSS.escape(interest)}"]`, form); if (cb) cb.checked = true; }
    const err = $('.form__err', form), btn = $('button[type=submit]', form);
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      err.textContent = '';
      $$('[aria-invalid]', form).forEach((x) => x.removeAttribute('aria-invalid'));
      const bad = $$('[required]', form).filter((x) => (x.type === 'checkbox' ? !x.checked : !x.value.trim()));
      bad.forEach((x) => x.setAttribute('aria-invalid', 'true'));
      const em = $('#f-email', form);
      if (bad.length) { err.textContent = bad.some((x) => x.type === 'checkbox') && bad.length === 1 ? form.dataset.errConsent : form.dataset.errRequired; bad[0].focus(); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em.value.trim())) { em.setAttribute('aria-invalid', 'true'); err.textContent = form.dataset.errEmail; em.focus(); return; }
      const label = btn.textContent; btn.disabled = true; btn.textContent = form.dataset.sending;
      try {
        const body = new URLSearchParams(new FormData(form));
        const r = await fetch(form.action, { method: 'POST', body, headers: { Accept: 'application/json' } });
        const j = await r.json().catch(() => ({}));
        if (!r.ok || !j.ok) throw new Error(j.error || 'send');
        location.href = form.dataset.thanks;
      } catch (_) {
        err.textContent = form.dataset.errServer; btn.disabled = false; btn.textContent = label;
      }
    });
  }
})();
