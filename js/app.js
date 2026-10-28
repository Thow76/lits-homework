/* Literacies Plus homework — engine.
   Loads units/index.json and the current unit, shows the home screen, runs sections,
   scores questions (5 / 3 / 1 / 0), keeps best scores in localStorage, locks sections by date,
   and sends three anonymous GoatCounter events. Activity renderers live in activities.js. */
(function () {
  'use strict';

  const $app = document.getElementById('app');
  const $title = document.getElementById('title');
  const $homeBtn = document.getElementById('homeBtn');
  const $topRight = document.getElementById('topbarRight');

  const SCORES = [5, 3, 1]; // right first time, second, third
  const MAX_PER_Q = 5;
  const MAX_WRONG = 3;

  const state = {
    strings: null, lang: 'en', lang2: null,
    index: null, unit: null, unitBase: '',
    view: null
  };

  /* ---------- helpers ---------- */
  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function svg(name) {
    const s = el('span');
    s.innerHTML = (window.ICONS && window.ICONS[name]) || '';
    return s.firstElementChild || s;
  }
  function shuffle(a) {
    const r = a.slice();
    for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; }
    return r;
  }
  function t(key) { return (state.strings && state.strings.en && state.strings.en[key]) || key; }
  function t2(key) {
    if (!state.lang2) return null;
    const v = state.strings[state.lang2] && state.strings[state.lang2][key];
    return v && v !== t(key) ? v : null;
  }
  /** Interface button: icon + English word + translated word under it. */
  function mkBtn(key, iconName, cls, onClick) {
    const b = el('button', 'btn' + (cls ? ' ' + cls : ''));
    b.type = 'button';
    if (iconName) b.appendChild(svg(iconName));
    b.appendChild(el('span', 'l1', t(key)));
    const l2 = t2(key);
    if (l2) { const s = el('span', 'l2', l2); s.lang = state.lang2; b.appendChild(s); }
    if (onClick) b.addEventListener('click', onClick);
    b.dataset.key = key;
    return b;
  }
  function contentBox(tag, cls) {
    // Learning content: always English, LTR, never auto-translated.
    const c = el(tag || 'div', 'content' + (cls ? ' ' + cls : ''));
    c.setAttribute('lang', 'en'); c.setAttribute('translate', 'no'); c.dir = 'ltr';
    return c;
  }
  function todayLondon() {
    try { return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/London', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()); }
    catch (_) { return new Date().toISOString().slice(0, 10); }
  }
  function isOpen(section) { return !section.release || todayLondon() >= String(section.release).slice(0, 10); }
  function assetUrl(name) { return /^(https?:)?\//.test(name) ? name : state.unitBase + name; }

  /* ---------- storage (localStorage only; nothing leaves the phone) ---------- */
  const store = {
    key(sectionId) { return 'lits.' + state.unit.id + '.' + sectionId; },
    get(sectionId) { try { return JSON.parse(localStorage.getItem(this.key(sectionId))) || {}; } catch (_) { return {}; } },
    set(sectionId, data) { try { localStorage.setItem(this.key(sectionId), JSON.stringify(data)); } catch (_) { /* storage full or disabled */ } },
    flag(name) { try { return localStorage.getItem('lits.' + state.unit.id + '.' + name) === '1'; } catch (_) { return false; } },
    setFlag(name) { try { localStorage.setItem('lits.' + state.unit.id + '.' + name, '1'); } catch (_) { /* ignore */ } }
  };

  /* ---------- anonymous counting (GoatCounter) ---------- */
  function count(name) {
    let tries = 0;
    (function attempt() {
      if (window.goatcounter && typeof window.goatcounter.count === 'function') {
        try { window.goatcounter.count({ path: name, title: name, event: true }); } catch (_) { /* ignore */ }
      } else if (tries++ < 20) setTimeout(attempt, 500);
    })();
  }

  /* ---------- audio ---------- */
  const player = new Audio();
  let playingBtn = null;
  player.addEventListener('ended', () => { if (playingBtn) playingBtn.classList.remove('playing'); playingBtn = null; });
  function playAudio(name, btn) {
    try {
      player.pause();
      player.src = assetUrl(name);
      if (playingBtn) playingBtn.classList.remove('playing');
      playingBtn = btn || null;
      if (btn) btn.classList.add('playing');
      const p = player.play();
      if (p && p.catch) p.catch(() => { if (btn) btn.classList.remove('playing'); });
    } catch (_) { /* no audio */ }
  }
  function listenButton(name, small) {
    if (small) {
      const b = el('button', 'minilisten'); b.type = 'button'; b.setAttribute('aria-label', t('listen'));
      b.appendChild(svg('listen'));
      b.addEventListener('click', (e) => { e.stopPropagation(); playAudio(name, b); });
      return b;
    }
    return mkBtn('listen', 'listen', 'listen', function () { playAudio(name, this); });
  }

  /* ---------- questions of a section ---------- */
  function questionsOf(section) {
    const qs = [];
    (section.activities || []).forEach((act) => {
      const items = Array.isArray(act.items) ? act.items : [act];
      items.forEach((item) => qs.push({ type: act.type, activity: act, item: item }));
    });
    return qs;
  }
  function sectionMax(section) { return questionsOf(section).length * MAX_PER_Q; }
  function sectionBest(section) { const d = store.get(section.id); return d.best || 0; }
  function sectionFinished(section) { return !!store.get(section.id).finished; }

  /* ---------- top bar ---------- */
  function setTop(title, showHome, rightEl) {
    $title.textContent = title;
    $homeBtn.hidden = !showHome;
    $topRight.innerHTML = '';
    if (rightEl) $topRight.appendChild(rightEl);
  }
  $homeBtn.innerHTML = '';
  $homeBtn.appendChild(svg('home'));
  $homeBtn.addEventListener('click', () => showHome());

  /* ---------- home screen ---------- */
  function showHome() {
    state.view = 'home';
    const unit = state.unit;
    setTop(unit.title || 'Homework', false, null);
    $app.innerHTML = '';

    const open = unit.sections.filter(isOpen);
    const total = open.reduce((s, sec) => s + sectionBest(sec), 0);
    const max = open.reduce((s, sec) => s + sectionMax(sec), 0);

    const head = el('div', 'card');
    const h = contentBox('h2', 'unit-title'); h.textContent = unit.title || '';
    head.appendChild(h);
    const tot = el('p', 'total', total + ' / ' + max); tot.id = 'unitTotal';
    head.appendChild(tot);
    const bar = el('div', 'bar'); const fill = el('span'); fill.style.width = (max ? Math.round(100 * total / max) : 0) + '%'; bar.appendChild(fill);
    head.appendChild(bar);
    $app.appendChild(head);

    const list = el('ul', 'sections');
    unit.sections.forEach((sec, i) => {
      const li = el('li');
      const row = el('button', 'section-row'); row.type = 'button'; row.dataset.section = sec.id;
      row.appendChild(el('span', 'num', String(i + 1) + '.'));
      const name = contentBox('span', 'name'); name.textContent = sec.title; row.appendChild(name);
      const status = el('span', 'status');
      if (isOpen(sec)) {
        if (sectionFinished(sec)) { const tk = svg('tick'); tk.classList.add('tick'); status.appendChild(tk); }
        status.appendChild(el('span', 'score', sectionBest(sec) + ' / ' + sectionMax(sec)));
        row.addEventListener('click', () => openSection(sec));
      } else {
        row.classList.add('locked'); row.disabled = true;
        status.appendChild(svg('lock'));
        row.setAttribute('aria-label', sec.title + ' (' + t('locked') + ')');
      }
      row.appendChild(status);
      li.appendChild(row); list.appendChild(li);
    });
    $app.appendChild(list);

    const note = el('p', 'note'); note.id = 'countingNote';
    const en = el('span', 'en', t('countingNote')); en.lang = 'en'; note.appendChild(en);
    const n2 = t2('countingNote');
    if (n2) { note.appendChild(el('br')); const s = el('span', null, n2); s.lang = state.lang2; note.appendChild(s); }
    $app.appendChild(note);
    window.scrollTo(0, 0);
  }

  /* ---------- section runner ---------- */
  let run = null; // { section, qs, idx, scores[], wrong, qstate }

  function openSection(section) {
    const qs = questionsOf(section);
    const saved = store.get(section.id);
    const cur = saved.cur && Array.isArray(saved.cur.scores) && saved.cur.scores.length === qs.length ? saved.cur : null;
    run = { section, qs, idx: 0, scores: cur ? cur.scores.slice() : qs.map(() => null), wrong: 0, qstate: 'answering' };
    const firstUnanswered = run.scores.findIndex((s) => s === null);
    if (qs.length === 0 || firstUnanswered === -1) { showFinished(); return; }
    run.idx = firstUnanswered;
    showQuestion();
  }

  function saveRun() {
    const d = store.get(run.section.id);
    d.cur = { scores: run.scores };
    store.set(run.section.id, d);
  }

  function showQuestion() {
    state.view = 'question';
    const q = run.qs[run.idx];
    const def = window.ACTIVITIES && window.ACTIVITIES[q.type];
    run.wrong = 0; run.qstate = 'answering';

    const lives = el('div', 'lives'); lives.id = 'lives';
    for (let i = 0; i < MAX_WRONG; i++) lives.appendChild(svg('cross'));
    setTop(run.section.title, true, null);
    $app.innerHTML = '';

    const card = el('div', 'card');
    const qbar = el('div', 'qbar');
    qbar.appendChild(el('span', 'progress-text', (run.idx + 1) + ' / ' + run.qs.length));
    qbar.appendChild(lives);
    card.appendChild(qbar);

    if (!def) {
      card.appendChild(el('p', 'muted', 'Unknown activity type: ' + q.type));
      const skip = mkBtn('next', 'next', '', () => finishQuestion(0));
      card.appendChild(skip); $app.appendChild(card); return;
    }

    const head = contentBox('div', 'act-head');
    if (def.icon && window.ICONS[def.icon]) head.appendChild(svg(def.icon));
    head.appendChild(el('span', null, q.activity.title || def.label));
    card.appendChild(head);

    const content = contentBox('div', 'qcontent');
    card.appendChild(content);
    const actions = el('div', 'actions'); actions.id = 'actions';
    card.appendChild(actions);
    $app.appendChild(card);

    const ctx = {
      item: q.item, activity: q.activity, section: run.section, root: content,
      el, svg, shuffle, t, t2, mkBtn, asset: assetUrl, contentBox,
      listenButton, autoplay: (name) => playAudio(name),
      canAnswer: () => run.qstate === 'answering',
      answer: (ok) => onAnswer(ok),
      next: () => { if (run.qstate === 'right' || run.qstate === 'revealed') nextQuestion(); }
    };
    let handlers = {};
    try { handlers = def.render(ctx) || {}; }
    catch (err) { console.error(err); content.appendChild(el('p', 'muted', 'This question could not be shown.')); }
    run.handlers = handlers;
    run.actions = actions;
    run.lives = lives;
    window.scrollTo(0, 0);
  }

  function feedback(ok) {
    const f = el('div', 'feedback ' + (ok ? 'right' : 'wrong')); f.id = 'feedback';
    f.appendChild(svg(ok ? 'tick' : 'cross'));
    return f;
  }

  function onAnswer(ok) {
    if (run.qstate !== 'answering') return;
    const actions = run.actions; actions.innerHTML = '';
    if (ok) {
      run.qstate = 'right';
      const score = SCORES[Math.min(run.wrong, SCORES.length - 1)];
      run.pending = score;
      const f = feedback(true); f.appendChild(el('span', null, '+' + score)); actions.appendChild(f);
      actions.appendChild(mkBtn('next', 'next', '', () => nextQuestion()));
    } else {
      run.wrong++;
      run.qstate = 'wrong';
      const lit = run.lives.querySelectorAll('svg');
      for (let i = 0; i < run.wrong && i < lit.length; i++) lit[i].classList.add('lit');
      actions.appendChild(feedback(false));
      if (run.wrong < MAX_WRONG) {
        actions.appendChild(mkBtn('tryAgain', 'tryAgain', 'secondary', () => {
          run.qstate = 'answering'; actions.innerHTML = '';
          if (run.handlers.retry) run.handlers.retry();
        }));
      } else {
        actions.appendChild(mkBtn('showAnswer', 'showAnswer', 'secondary', () => {
          run.qstate = 'revealed'; run.pending = 0; actions.innerHTML = '';
          if (run.handlers.reveal) run.handlers.reveal();
          actions.appendChild(mkBtn('next', 'next', '', () => nextQuestion()));
        }));
      }
    }
    actions.scrollIntoView({ block: 'nearest' });
  }

  function nextQuestion() {
    if (run.qstate !== 'right' && run.qstate !== 'revealed') return;
    finishQuestion(run.pending || 0);
  }

  function finishQuestion(score) {
    run.scores[run.idx] = score;
    saveRun();
    const nextIdx = run.scores.findIndex((s) => s === null);
    if (nextIdx === -1) { showFinished(); return; }
    run.idx = nextIdx;
    showQuestion();
  }

  /* ---------- finished screen ---------- */
  function showFinished() {
    state.view = 'finished';
    const section = run.section;
    const total = run.scores.reduce((s, v) => s + (v || 0), 0);
    const max = sectionMax(section);
    const d = store.get(section.id);
    const firstTime = !d.finished;
    d.finished = true;
    if (!(d.best >= total)) d.best = total; // a replay only changes the stored score if it beats it
    d.cur = { scores: run.scores };
    store.set(section.id, d);
    if (firstTime && !store.flag(section.id + '.counted')) { store.setFlag(section.id + '.counted'); count('section finished'); }
    const open = state.unit.sections.filter(isOpen);
    if (open.length && open.every(sectionFinished) && !store.flag('unit.counted')) { store.setFlag('unit.counted'); count('unit finished'); }

    setTop(section.title, true, null);
    $app.innerHTML = '';
    const card = el('div', 'card finished');
    const tk = svg('tick'); tk.classList.add('bigtick'); card.appendChild(tk);
    const fin = el('p', null, t('finished')); const f2 = t2('finished');
    if (f2) { fin.appendChild(el('br')); const s = el('span', null, f2); s.lang = state.lang2; fin.appendChild(s); }
    card.appendChild(fin);
    const sc = el('p', 'score', total + ' / ' + max); sc.id = 'sectionScore'; card.appendChild(sc);
    if (d.best > total) card.appendChild(el('p', 'best', '★ ' + d.best + ' / ' + max));

    const actions = el('div', 'actions');
    const idx = state.unit.sections.indexOf(section);
    const nextSec = state.unit.sections.slice(idx + 1).find(isOpen);
    if (nextSec) actions.appendChild(mkBtn('next', 'next', '', () => openSection(nextSec)));
    else actions.appendChild(mkBtn('home', 'home', '', () => showHome()));
    const again = mkBtn('startAgain', 'startAgain', 'secondary small', () => {
      if (card.querySelector('.confirm')) return;
      const c = el('div', 'confirm');
      const p = el('p', null, t('areYouSure')); const a2 = t2('areYouSure');
      if (a2) { p.appendChild(el('br')); const s = el('span', null, a2); s.lang = state.lang2; p.appendChild(s); }
      c.appendChild(p);
      const row = el('div', 'row2');
      row.appendChild(mkBtn('yes', null, 'bad', () => {
        const dd = store.get(section.id); dd.cur = null; store.set(section.id, dd); // clears answers, keeps best
        openSection(section);
      }));
      row.appendChild(mkBtn('no', null, 'secondary', () => c.remove()));
      c.appendChild(row);
      card.appendChild(c);
      c.scrollIntoView({ block: 'nearest' });
    });
    actions.appendChild(again);
    card.appendChild(actions);
    $app.appendChild(card);
    window.scrollTo(0, 0);
  }

  /* ---------- language ---------- */
  function pickLanguage() {
    const langs = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || 'en'];
    for (const l of langs) {
      const p = String(l).toLowerCase().split('-')[0];
      if (p !== 'en' && state.strings[p]) return p;
    }
    return null;
  }

  /* ---------- offline precache of unit assets ---------- */
  function precacheUnit(unit) {
    if (!('serviceWorker' in navigator)) return;
    const urls = new Set();
    const walk = (o) => {
      if (!o || typeof o !== 'object') return;
      if (Array.isArray(o)) { o.forEach(walk); return; }
      Object.keys(o).forEach((k) => {
        const v = o[k];
        if ((k === 'image' || k === 'audio') && typeof v === 'string') urls.add(assetUrl(v));
        else walk(v);
      });
    };
    unit.sections.filter(isOpen).forEach(walk);
    if (!urls.size) return;
    navigator.serviceWorker.ready.then((reg) => {
      if (reg.active) reg.active.postMessage({ type: 'precache', urls: Array.from(urls) });
    }).catch(() => {});
  }

  /* ---------- boot ---------- */
  async function fetchJson(url) {
    const r = await fetch(url, { cache: 'no-cache' });
    if (!r.ok) throw new Error(url + ' ' + r.status);
    return r.json();
  }

  async function boot() {
    try {
      state.strings = await fetchJson('strings.json');
      state.lang2 = pickLanguage();
      const dir = state.lang2 ? (state.strings[state.lang2].dir || 'ltr') : 'ltr';
      document.documentElement.dir = dir;
      document.documentElement.lang = 'en';
      const params = new URLSearchParams(location.search);
      state.index = await fetchJson('units/index.json');
      const unitId = params.get('unit') || state.index.current || (state.index.units[0] && state.index.units[0].id);
      state.unitBase = 'units/' + unitId + '/';
      state.unit = await fetchJson(state.unitBase + 'unit.json');
      state.unit.id = state.unit.id || unitId;
      state.unit.sections = state.unit.sections || [];
      showHome();
      count('opened');
      precacheUnit(state.unit);
    } catch (err) {
      console.error(err);
      $app.innerHTML = '';
      const p = el('p', 'center', t('loadError'));
      const e2 = t2('loadError'); if (e2) { p.appendChild(el('br')); const s = el('span', null, e2); s.lang = state.lang2; p.appendChild(s); }
      $app.appendChild(p);
      $app.appendChild(mkBtn('tryAgain', 'tryAgain', '', () => location.reload()));
    }
  }

  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => {}); });
  }
  // Exposed for tests and for Andrew to inspect; no learner data here.
  window.LITS = { state, store, todayLondon, isOpen, questionsOf, sectionMax, showHome, openSection, get run() { return run; } };
  boot();
})();
