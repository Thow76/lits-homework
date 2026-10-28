/* Activity renderers. Each type: { icon, label, render(ctx) -> { retry(), reveal() } }.
   ctx gives: item, activity, root, el, svg, shuffle, t, t2, mkBtn, asset, listenButton, autoplay,
   canAnswer(), answer(ok), next(). The engine owns lives, scoring, Try again, Show answer and Next.
   All text rendered here is learning content (ctx.root is lang="en" translate="no" dir="ltr"). */
(function () {
  'use strict';

  function mark(ctx, btn, ok) {
    btn.classList.add(ok ? 'right' : 'wrong');
    let m = btn.querySelector('.opt-mark');
    if (!m) { m = ctx.el('span', 'opt-mark'); btn.appendChild(m); }
    m.innerHTML = ''; m.appendChild(ctx.svg(ok ? 'tick' : 'cross'));
  }
  function unmark(btn) {
    btn.classList.remove('wrong');
    const m = btn.querySelector('.opt-mark'); if (m) m.remove();
  }
  function addImage(ctx, parent, name) {
    if (!name) return;
    const img = ctx.el('img', 'qimg'); img.src = ctx.asset(name); img.alt = ''; parent.appendChild(img);
  }
  function addPrompt(ctx, parent, text, cls) {
    if (!text) return null;
    const p = ctx.el('p', 'q' + (cls ? ' ' + cls : ''), text); parent.appendChild(p); return p;
  }
  function addStory(ctx, parent) {
    if (ctx.activity.story) { const s = ctx.el('div', 'story'); s.textContent = ctx.activity.story; parent.appendChild(s); }
  }
  function addListen(ctx, parent, audio) {
    if (audio) parent.appendChild(ctx.listenButton(audio));
  }

  /** Generic one-tap choice. options: [{ text, value, cls, html }]. Returns handlers. */
  function choice(ctx, opts) {
    const box = ctx.el('div', 'options' + (opts.row ? ' row2' : ''));
    const buttons = [];
    let picked = null;
    opts.options.forEach((o) => {
      const b = ctx.el('button', 'opt' + (o.cls ? ' ' + o.cls : '')); b.type = 'button'; b.dataset.value = String(o.value);
      if (o.html) b.appendChild(o.html); else b.appendChild(ctx.el('span', 'opt-text', o.text));
      b.addEventListener('click', () => {
        if (b.classList.contains('reveal')) { ctx.next(); return; }
        if (!ctx.canAnswer() || b.disabled) return;
        const ok = String(o.value) === String(opts.answer);
        picked = b;
        mark(ctx, b, ok);
        if (ok) { buttons.forEach((x) => { x.disabled = true; }); if (opts.onRight) opts.onRight(b, o); }
        else if (opts.onWrong) opts.onWrong(b, o);
        ctx.answer(ok);
      });
      buttons.push(b); box.appendChild(b);
    });
    ctx.root.appendChild(box);
    return {
      retry() { if (picked) { unmark(picked); picked.classList.add('tried'); picked.disabled = true; picked = null; } },
      reveal() {
        buttons.forEach((b) => { b.disabled = true; unmark(b); b.classList.remove('tried'); });
        const right = buttons.find((b) => b.dataset.value === String(opts.answer));
        if (right) { right.disabled = false; right.classList.add('reveal'); mark(ctx, right, true); }
        if (opts.onReveal) opts.onReveal(right);
      }
    };
  }

  function wordsOf(sentence) { return String(sentence).trim().split(/\s+/); }

  const A = {};

  /* ---- Match: picture to word or sentence ---- */
  A['match'] = {
    icon: 'match', label: 'Match',
    render(ctx) {
      const it = ctx.item;
      addImage(ctx, ctx.root, it.image);
      addPrompt(ctx, ctx.root, it.prompt);
      addListen(ctx, ctx.root, it.audio);
      const options = (ctx.activity.shuffle === false ? it.options : ctx.shuffle(it.options)).map((o) => ({ text: o, value: o }));
      return choice(ctx, { options, answer: it.answer });
    }
  };

  /* ---- Which word: the right word for a picture or a gap ---- */
  A['which-word'] = {
    icon: 'whichWord', label: 'Which word',
    render(ctx) {
      const it = ctx.item;
      addImage(ctx, ctx.root, it.image);
      addPrompt(ctx, ctx.root, it.prompt ? it.prompt.replace(/_{2,}/g, '______') : null);
      addListen(ctx, ctx.root, it.audio);
      const options = (ctx.activity.shuffle === false ? it.options : ctx.shuffle(it.options)).map((o) => ({ text: o, value: o }));
      return choice(ctx, { options, answer: it.answer });
    }
  };

  /* ---- Understanding: multiple choice about the story ---- */
  A['understanding'] = {
    icon: 'understanding', label: 'Understanding',
    render(ctx) {
      const it = ctx.item;
      addStory(ctx, ctx.root);
      addImage(ctx, ctx.root, it.image);
      addPrompt(ctx, ctx.root, it.question);
      addListen(ctx, ctx.root, it.audio);
      const options = (ctx.activity.shuffle === false ? it.options : ctx.shuffle(it.options)).map((o) => ({ text: o, value: o }));
      return choice(ctx, { options, answer: it.answer });
    }
  };

  /* ---- Yes/No: a statement about the story ---- */
  A['yes-no'] = {
    icon: 'yesNo', label: 'Yes or no',
    render(ctx) {
      const it = ctx.item;
      addStory(ctx, ctx.root);
      addImage(ctx, ctx.root, it.image);
      addPrompt(ctx, ctx.root, it.statement);
      addListen(ctx, ctx.root, it.audio);
      const lab = (k) => { const s = ctx.el('span', 'opt-text', ctx.t(k)); const l2 = ctx.t2(k); if (l2) { s.appendChild(ctx.el('br')); const x = ctx.el('span', 'l2', l2); x.lang = window.LITS ? window.LITS.state.lang2 : ''; s.appendChild(x); } return s; };
      return choice(ctx, { row: true, options: [
        { html: lab('yes'), value: 'yes', cls: 'big' }, { html: lab('no'), value: 'no', cls: 'big' }
      ], answer: it.answer === true || it.answer === 'yes' ? 'yes' : 'no' });
    }
  };

  /* ---- Audio true/false ---- */
  A['audio-true-false'] = {
    icon: 'ear', label: 'True or false',
    render(ctx) {
      const it = ctx.item;
      addImage(ctx, ctx.root, it.image);
      addPrompt(ctx, ctx.root, it.prompt);
      addListen(ctx, ctx.root, it.audio);
      const lab = (k) => { const s = ctx.el('span', 'opt-text', ctx.t(k)); const l2 = ctx.t2(k); if (l2) { s.appendChild(ctx.el('br')); const x = ctx.el('span', 'l2', l2); x.lang = window.LITS ? window.LITS.state.lang2 : ''; s.appendChild(x); } return s; };
      const revealText = ctx.el('p', 'q'); revealText.hidden = true; revealText.textContent = it.text || '';
      ctx.root.appendChild(revealText);
      const h = choice(ctx, { row: true, options: [
        { html: lab('true'), value: 'true', cls: 'big green' }, { html: lab('false'), value: 'false', cls: 'big red' }
      ], answer: (it.answer === true || it.answer === 'true') ? 'true' : 'false',
        onReveal() { if (it.text) revealText.hidden = false; } });
      if (it.audio) ctx.autoplay(it.audio);
      return h;
    }
  };

  /* ---- Listen and choose: hear a sentence, pick it from three ---- */
  A['listen-choose'] = {
    icon: 'ear', label: 'Listen and choose',
    render(ctx) {
      const it = ctx.item;
      addImage(ctx, ctx.root, it.image);
      addPrompt(ctx, ctx.root, it.prompt);
      addListen(ctx, ctx.root, it.audio);
      const all = ctx.shuffle([it.answer].concat(it.distractors || it.options || []).filter((x, i, a) => a.indexOf(x) === i));
      const h = choice(ctx, { options: all.map((o) => ({ text: o, value: o })), answer: it.answer });
      if (it.audio) ctx.autoplay(it.audio);
      return h;
    }
  };

  /* ---- Missing word: word bank gap fill ---- */
  A['missing-word'] = {
    icon: 'missingWord', label: 'Missing word',
    render(ctx) {
      const it = ctx.item;
      addImage(ctx, ctx.root, it.image);
      const words = ctx.el('div', 'words');
      const parts = String(it.sentence).split(/_{2,}/);
      let gap = null;
      parts.forEach((p, i) => {
        if (p.trim()) words.appendChild(ctx.el('span', 'word plain', p.trim()));
        if (i < parts.length - 1) { gap = ctx.el('span', 'word gap', '    '); words.appendChild(gap); }
      });
      ctx.root.appendChild(words);
      addListen(ctx, ctx.root, it.audio);
      const bank = it.options || ctx.activity.bank || [];
      const options = (ctx.activity.shuffle === false ? bank : ctx.shuffle(bank)).map((o) => ({ text: o, value: o }));
      const setGap = (text, cls) => { if (!gap) return; gap.textContent = text; gap.className = 'word gap filled' + (cls ? ' ' + cls : ''); };
      const h = choice(ctx, { options, answer: it.answer,
        onRight: (b, o) => setGap(o.value, 'right'),
        onWrong: (b, o) => setGap(o.value, 'wrong'),
        onReveal: () => setGap(it.answer, 'right') });
      const retry = h.retry;
      h.retry = () => { retry(); if (gap) { gap.textContent = '    '; gap.className = 'word gap'; } };
      return h;
    }
  };

  /* ---- Find and fix: tap the wrong word, then choose the right one ---- */
  A['find-and-fix'] = {
    icon: 'missingWord', label: 'Find and fix',
    render(ctx) {
      const it = ctx.item;
      addImage(ctx, ctx.root, it.image);
      const prompt = addPrompt(ctx, ctx.root, it.prompt || 'Tap the wrong word.');
      const words = ctx.el('div', 'words');
      const list = wordsOf(it.sentence);
      const wrongIdx = typeof it.wrongIndex === 'number' ? it.wrongIndex : list.findIndex((w) => w.replace(/[.,!?]$/, '') === String(it.wrong).replace(/[.,!?]$/, ''));
      const btns = [];
      let found = false, lastWrong = null, h = null;
      const optBox = ctx.el('div');
      list.forEach((w, i) => {
        const b = ctx.el('button', 'word', w); b.type = 'button';
        b.addEventListener('click', () => {
          if (!ctx.canAnswer() || found) return;
          if (i === wrongIdx) {
            found = true; b.classList.add('wrong'); b.classList.add('found');
            if (prompt) prompt.textContent = it.prompt2 || 'Choose the right word.';
            btns.forEach((x) => { x.disabled = true; });
            const bank = ctx.activity.shuffle === false ? it.options : ctx.shuffle(it.options);
            h = choice(ctx, { options: bank.map((o) => ({ text: o, value: o })), answer: it.answer,
              onRight: (btn, o) => { b.textContent = o.value + (list[i].match(/[.,!?]$/) || [''])[0]; b.className = 'word fixed'; },
              onReveal: () => { b.textContent = it.answer + (list[i].match(/[.,!?]$/) || [''])[0]; b.className = 'word fixed'; } });
            optBox.appendChild(ctx.root.lastElementChild);
          } else {
            lastWrong = b; b.classList.add('wrong'); ctx.answer(false);
          }
        });
        btns.push(b); words.appendChild(b);
      });
      ctx.root.appendChild(words);
      addListen(ctx, ctx.root, it.audio);
      ctx.root.appendChild(optBox);
      return {
        retry() { if (h) h.retry(); if (lastWrong) { lastWrong.classList.remove('wrong'); lastWrong = null; } },
        reveal() {
          btns.forEach((x) => { x.disabled = true; x.classList.remove('wrong'); });
          const b = btns[wrongIdx];
          if (h) { h.reveal(); }
          else if (b) { b.textContent = it.answer + (list[wrongIdx].match(/[.,!?]$/) || [''])[0]; b.className = 'word fixed'; }
          if (prompt) prompt.textContent = it.sentence.replace(list[wrongIdx], it.answer + (list[wrongIdx].match(/[.,!?]$/) || [''])[0]);
        }
      };
    }
  };

  /* ---- Word order: tap tiles to build the sentence, confirm with thumbs up ---- */
  A['word-order'] = {
    icon: 'wordOrder', label: 'Word order',
    render(ctx) {
      const it = ctx.item;
      addImage(ctx, ctx.root, it.image);
      addPrompt(ctx, ctx.root, it.prompt);
      addListen(ctx, ctx.root, it.audio);
      const target = wordsOf(it.sentence);
      const n = target.length;
      const tiles = target.concat(it.distractors || []).map((w, i) => ({ id: i, text: w }));
      let pool = ctx.shuffle(tiles);
      let line = [];
      const lineBox = ctx.el('div'); lineBox.id = 'wordLine';
      const poolBox = ctx.el('div', 'pool'); poolBox.id = 'wordPool';
      ctx.root.appendChild(lineBox); ctx.root.appendChild(poolBox);
      const confirm = ctx.mkBtn('check', 'confirm', 'good', () => {
        if (!ctx.canAnswer() || line.length !== n) return;
        const ok = line.map((t) => t.text).join(' ') === target.join(' ');
        rows.forEach((r) => r.classList.add(ok ? 'right' : 'wrong'));
        confirm.disabled = true;
        ctx.answer(ok);
      });
      confirm.id = 'confirmBtn';
      confirm.disabled = true;
      ctx.root.appendChild(confirm);

      // Decide one or two rows by measuring tile widths.
      let split = n; // words on the first row
      const rows = [];
      function measure() {
        const probe = ctx.el('div', 'pool'); probe.style.visibility = 'hidden'; probe.style.position = 'absolute';
        tiles.slice(0, n).forEach((t) => probe.appendChild(ctx.el('button', 'tile', t.text)));
        ctx.root.appendChild(probe);
        const gap = 12, avail = ctx.root.clientWidth - 20;
        let total = -gap; Array.from(probe.children).forEach((c) => { total += c.offsetWidth + gap; });
        probe.remove();
        if (total > avail && n > 1) split = Math.ceil(n / 2);
      }
      measure();

      function render() {
        lineBox.innerHTML = ''; rows.length = 0;
        const rowsSpec = split >= n ? [[0, n]] : [[0, split], [split, n]];
        rowsSpec.forEach(([a, b]) => {
          const r = ctx.el('div', 'line');
          for (let i = a; i < b; i++) {
            if (line[i]) {
              const t = ctx.el('button', 'tile placed', line[i].text); t.type = 'button';
              t.addEventListener('click', () => { if (!ctx.canAnswer()) return; pool.push(line[i]); line.splice(i, 1); render(); });
              r.appendChild(t);
            } else r.appendChild(ctx.el('span', 'slot'));
          }
          rows.push(r); lineBox.appendChild(r);
        });
        poolBox.innerHTML = '';
        pool.forEach((tile, i) => {
          const t = ctx.el('button', 'tile', tile.text); t.type = 'button';
          t.addEventListener('click', () => { if (!ctx.canAnswer() || line.length >= n) return; line.push(tile); pool.splice(i, 1); render(); });
          poolBox.appendChild(t);
        });
        confirm.disabled = line.length !== n;
      }
      render();
      return {
        retry() { rows.forEach((r) => r.classList.remove('wrong')); confirm.disabled = line.length !== n; },
        reveal() {
          line = tiles.slice(0, n); pool = [];
          render();
          rows.forEach((r) => { r.classList.add('right'); });
          lineBox.querySelectorAll('button').forEach((b) => { b.disabled = true; });
          confirm.hidden = true;
        }
      };
    }
  };

  /* ---- Spell it: build a word from letter tiles (checks when complete) ---- */
  A['spell-it'] = {
    icon: 'spell', label: 'Spell it',
    render(ctx) {
      const it = ctx.item;
      addImage(ctx, ctx.root, it.image);
      addPrompt(ctx, ctx.root, it.prompt);
      addListen(ctx, ctx.root, it.audio);
      const word = String(it.word);
      const letters = word.split('').map((c, i) => ({ id: i, text: c }));
      const extra = String(it.extra || '').split('').filter(Boolean).map((c, i) => ({ id: 100 + i, text: c }));
      let pool = ctx.shuffle(letters.concat(extra));
      let line = [];
      const lineBox = ctx.el('div', 'line'); lineBox.id = 'spellLine';
      const poolBox = ctx.el('div', 'pool'); poolBox.id = 'spellPool';
      ctx.root.appendChild(lineBox); ctx.root.appendChild(poolBox);
      let wrongShown = false;
      function render() {
        lineBox.innerHTML = '';
        for (let i = 0; i < word.length; i++) {
          if (line[i]) {
            const t = ctx.el('button', 'tile letter placed', line[i].text); t.type = 'button';
            t.addEventListener('click', () => { if (!ctx.canAnswer()) return; pool.push(line[i]); line.splice(i, 1); render(); });
            lineBox.appendChild(t);
          } else lineBox.appendChild(ctx.el('span', 'slot'));
        }
        poolBox.innerHTML = '';
        pool.forEach((tile, i) => {
          const t = ctx.el('button', 'tile letter', tile.text); t.type = 'button';
          t.addEventListener('click', () => {
            if (!ctx.canAnswer() || line.length >= word.length) return;
            line.push(tile); pool.splice(i, 1); render();
            if (line.length === word.length) check();
          });
          poolBox.appendChild(t);
        });
      }
      function check() {
        const ok = line.map((t) => t.text).join('') === word;
        lineBox.classList.add(ok ? 'right' : 'wrong');
        wrongShown = !ok;
        ctx.answer(ok);
      }
      render();
      return {
        retry() { lineBox.classList.remove('wrong'); wrongShown = false; },
        reveal() {
          line = letters.slice(); pool = []; render();
          lineBox.classList.remove('wrong'); lineBox.classList.add('right');
          lineBox.querySelectorAll('button').forEach((b) => { b.disabled = true; });
        }
      };
    }
  };

  /* ---- Person / place / thing: sort each word into a category ---- */
  A['sort'] = {
    icon: 'sort', label: 'Person, place or thing',
    render(ctx) {
      const it = ctx.item;
      const cats = it.categories || ctx.activity.categories || ['Person', 'Place', 'Thing'];
      addImage(ctx, ctx.root, it.image);
      addPrompt(ctx, ctx.root, it.word || it.prompt);
      addListen(ctx, ctx.root, it.audio);
      return choice(ctx, { options: cats.map((c) => ({ text: c, value: c })), answer: it.answer });
    }
  };

  /* ---- Conversation order: tap the line that comes next ---- */
  A['conversation-order'] = {
    icon: 'conversation', label: 'Conversation',
    render(ctx) {
      const it = ctx.item;
      addImage(ctx, ctx.root, it.image);
      addPrompt(ctx, ctx.root, it.prompt || 'Tap the lines in order.');
      const lines = (it.lines || []).map((l, i) => (typeof l === 'string' ? { text: l, id: i } : Object.assign({ id: i }, l)));
      const placedBox = ctx.el('div', 'convo'); placedBox.id = 'convoPlaced';
      const poolBox = ctx.el('div', 'convo'); poolBox.id = 'convoPool';
      ctx.root.appendChild(placedBox); ctx.root.appendChild(poolBox);
      let nextIdx = 0, pool = ctx.shuffle(lines), lastWrong = null;
      function lineEl(l, placed) {
        const b = ctx.el('button', 'opt' + (placed ? ' placed' : '')); b.type = 'button'; b.dataset.id = l.id;
        if (l.speaker) b.appendChild(ctx.el('span', 'speaker', l.speaker));
        b.appendChild(ctx.el('span', 'opt-text', l.text));
        if (l.audio) b.appendChild(ctx.listenButton(l.audio, true));
        if (placed) b.disabled = false;
        return b;
      }
      function render() {
        placedBox.innerHTML = ''; poolBox.innerHTML = '';
        lines.slice(0, nextIdx).forEach((l) => placedBox.appendChild(lineEl(l, true)));
        pool.forEach((l) => {
          const b = lineEl(l, false);
          b.addEventListener('click', () => {
            if (!ctx.canAnswer()) return;
            if (l.id === nextIdx) {
              nextIdx++; pool = pool.filter((x) => x.id !== l.id); render();
              if (nextIdx === lines.length) {
                placedBox.querySelectorAll('.opt').forEach((x) => x.classList.add('right'));
                ctx.answer(true);
              }
            } else { lastWrong = b; mark(ctx, b, false); ctx.answer(false); }
          });
          poolBox.appendChild(b);
        });
      }
      render();
      return {
        retry() { if (lastWrong) { unmark(lastWrong); lastWrong = null; } },
        reveal() { nextIdx = lines.length; pool = []; render(); placedBox.querySelectorAll('.opt').forEach((x) => x.classList.add('reveal')); }
      };
    }
  };

  /* ---- Capital letters: tap the words that need a capital, then where the full stop goes ---- */
  A['capital-letters'] = {
    icon: 'capitals', label: 'Capital letters',
    render(ctx) {
      const it = ctx.item;
      addImage(ctx, ctx.root, it.image);
      const raw = wordsOf(it.sentence);
      const words = raw.map((w, i) => {
        const core = w.replace(/[.!?]+$/, '');
        return { i, show: core.toLowerCase(), cap: /^[A-Z]/.test(core), stop: /[.!?]$/.test(w), punct: (w.match(/[.!?]$/) || ['.'])[0], capDone: false, stopDone: false };
      });
      const needCaps = words.filter((w) => w.cap).length;
      const needStops = words.filter((w) => w.stop).length;
      let stage = needCaps ? 'caps' : 'stops';
      const prompt = ctx.el('p', 'q'); ctx.root.appendChild(prompt);
      const box = ctx.el('div', 'words'); ctx.root.appendChild(box);
      addListen(ctx, ctx.root, it.audio);
      let lastWrong = null;
      const btns = [];
      function text(w) { return (w.capDone ? w.show.charAt(0).toUpperCase() + w.show.slice(1) : w.show) + (w.stopDone ? w.punct : ''); }
      function setPrompt() {
        if (stage === 'caps') {
          const left = needCaps - words.filter((w) => w.capDone).length;
          prompt.textContent = it.prompt || ('Tap the ' + (left === 1 ? 'word that needs' : left + ' words that need') + ' a capital letter.');
        } else {
          prompt.textContent = it.prompt2 || (needStops === 1 ? 'Tap the last word. Where does the full stop go?' : 'Tap the words where the full stops go.');
        }
      }
      function render() {
        box.innerHTML = ''; btns.length = 0;
        words.forEach((w) => {
          const b = ctx.el('button', 'word', text(w)); b.type = 'button';
          if (w.capDone || w.stopDone) b.classList.add('right');
          b.addEventListener('click', () => {
            if (!ctx.canAnswer()) return;
            if (stage === 'caps') {
              if (w.cap && !w.capDone) { w.capDone = true; render(); if (words.every((x) => !x.cap || x.capDone)) { stage = needStops ? 'stops' : 'done'; } setPrompt(); if (stage === 'done') ctx.answer(true); }
              else { lastWrong = b; b.classList.add('wrong'); ctx.answer(false); }
            } else if (stage === 'stops') {
              if (w.stop && !w.stopDone) { w.stopDone = true; render(); if (words.every((x) => !x.stop || x.stopDone)) { stage = 'done'; ctx.answer(true); } }
              else { lastWrong = b; b.classList.add('wrong'); ctx.answer(false); }
            }
          });
          btns.push(b); box.appendChild(b);
        });
      }
      setPrompt(); render();
      return {
        retry() { if (lastWrong) { lastWrong.classList.remove('wrong'); lastWrong = null; } },
        reveal() { words.forEach((w) => { w.capDone = w.cap; w.stopDone = w.stop; }); stage = 'done'; render(); btns.forEach((b) => { b.disabled = true; }); prompt.textContent = it.sentence; }
      };
    }
  };

  window.ACTIVITIES = A;
})();
