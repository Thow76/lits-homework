/* End-to-end test in headless Chromium at 390px.
   Run:  node test/e2e.mjs                 (serves this repo locally)
         BASE=https://thow76.github.io/lits-homework/ node test/e2e.mjs   (live Pages URL)
   Uses the dummy unit (units/dummy) via ?unit=dummy. */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
let pw;
try { pw = require('playwright'); } catch (_) { pw = require('/opt/node-tools/node_modules/playwright/index.js'); }
const { chromium } = pw;

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg' };

let server, base = process.env.BASE;
if (!base) {
  server = http.createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (p.endsWith('/')) p += 'index.html';
    const f = path.join(root, p);
    if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end('nf'); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    fs.createReadStream(f).pipe(res);
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  base = `http://127.0.0.1:${server.address().port}/`;
}
if (!base.endsWith('/')) base += '/';
const URL_ = base + '?unit=dummy';

let failures = 0, passes = 0;
function check(cond, msg) { if (cond) { passes++; console.log('  ok   ' + msg); } else { failures++; console.log('  FAIL ' + msg); } }
const londonToday = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/London' }).format(new Date());
const addDays = (iso, d) => { const t = new Date(iso + 'T12:00:00Z'); t.setUTCDate(t.getUTCDate() + d); return t.toISOString().slice(0, 10); };

const browser = await chromium.launch();
const consoleErrors = [];
async function newContext(opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, ...opts });
  await ctx.addInitScript(() => {
    window.__events = [];
    window.goatcounter = { count: (o) => window.__events.push(o.path) };
  });
  return ctx;
}
function watch(page) {
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', (e) => consoleErrors.push('pageerror: ' + e.message));
}

/* Solve the current question correctly, using the engine's own data. */
async function solveCurrent(page) {
  const q = await page.evaluate(() => { const r = window.LITS.run; const x = r.qs[r.idx]; return { type: x.type, item: x.item, idx: r.idx, n: r.qs.length }; });
  const it = q.item;
  const tapOpt = async (text) => { await page.locator('.opt', { hasText: text }).first().click(); };
  switch (q.type) {
    case 'match': case 'which-word': case 'understanding': case 'listen-choose': case 'sort': case 'missing-word':
      await page.locator(`.opt[data-value="${it.answer}"]`).click(); break;
    case 'yes-no': await page.locator(`.opt[data-value="${it.answer ? 'yes' : 'no'}"]`).click(); break;
    case 'audio-true-false': await page.locator(`.opt[data-value="${it.answer ? 'true' : 'false'}"]`).click(); break;
    case 'word-order':
      for (const w of it.sentence.trim().split(/\s+/)) await page.locator('#wordPool .tile', { hasText: new RegExp('^' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$') }).first().click();
      await page.locator('#confirmBtn').click(); break;
    case 'spell-it':
      for (const c of it.word) await page.locator('#spellPool .tile', { hasText: new RegExp('^' + c + '$') }).first().click(); break;
    case 'conversation-order':
      for (const l of it.lines) await page.locator('#convoPool .opt', { hasText: l.text }).click(); break;
    case 'find-and-fix':
      await page.locator('.words .word', { hasText: new RegExp('^' + it.wrong + '$') }).click();
      await page.locator(`.opt[data-value="${it.answer}"]`).click(); break;
    case 'capital-letters': {
      const words = it.sentence.trim().split(/\s+/);
      for (const w of words) if (/^[A-Z]/.test(w)) await page.locator('.words .word:not(.right)', { hasText: new RegExp('^' + w.replace(/[.!?]$/, '').toLowerCase() + '$') }).click();
      for (const w of words) if (/[.!?]$/.test(w)) await page.locator('.words .word', { hasText: new RegExp('^' + w.replace(/[.!?]$/, '') + '$', 'i') }).click();
      break;
    }
    default: throw new Error('no solver for ' + q.type);
  }
  await page.locator('#feedback.right').waitFor({ timeout: 3000 });
  await page.locator('#actions .btn[data-key="next"]').click();
  return q;
}

/* Give a wrong answer to the current question (choice types only). */
async function wrongCurrent(page) {
  const q = await page.evaluate(() => { const r = window.LITS.run; const x = r.qs[r.idx]; return { type: x.type, item: x.item }; });
  const it = q.item;
  if (q.type === 'yes-no') await page.locator(`.opt[data-value="${it.answer ? 'no' : 'yes'}"]`).click();
  else await page.locator('.opt:not(:disabled):not([data-value="' + it.answer + '"])').first().click();
  await page.locator('#feedback.wrong').waitFor({ timeout: 3000 });
}

console.log('Testing ' + URL_);
{
  console.log('\n[1] Home screen, locking by date, counting note');
  const ctx = await newContext();
  const page = await ctx.newPage(); watch(page);
  // Patch release dates relative to today (Europe/London): section two yesterday, section three tomorrow.
  await page.route('**/units/dummy/unit.json', async (route) => {
    const r = await route.fetch(); const j = await r.json();
    j.sections[1].release = addDays(londonToday(), -1); j.sections[2].release = addDays(londonToday(), 1);
    await route.fulfill({ response: r, json: j });
  });
  await page.goto(URL_);
  await page.locator('.section-row').first().waitFor();
  const rows = page.locator('.section-row');
  check((await rows.count()) === 3, 'three section rows');
  check(await rows.nth(1).evaluate((e) => !e.classList.contains('locked')), 'section released yesterday is open');
  check(await rows.nth(2).evaluate((e) => e.classList.contains('locked') && e.disabled), 'section released tomorrow is locked');
  check(await rows.nth(2).locator('svg').count() === 1 && (await rows.nth(2).locator('.score').count()) === 0, 'locked row shows padlock and no score');
  const maxQ = await page.evaluate(() => window.LITS.questionsOf(window.LITS.state.unit.sections[0]).length);
  check((await page.locator('#unitTotal').textContent()).trim() === `0 / ${maxQ * 5 + 5}`, 'unit total counts open sections only: 0 / ' + (maxQ * 5 + 5));
  check((await page.locator('#countingNote').textContent()).includes('counts visits anonymously'), 'counting note shown');
  check((await page.evaluate(() => window.__events)).join(',') === 'opened', 'opened event sent once');
  // sizes
  const rowH = await rows.first().evaluate((e) => e.getBoundingClientRect().height);
  check(rowH >= 56, 'section row at least 56px tall (' + Math.round(rowH) + ')');
  const bodyFs = await page.evaluate(() => getComputedStyle(document.body).fontSize);
  check(bodyFs === '18px', 'body text 18px (' + bodyFs + ')');

  console.log('\n[2] Play every activity type correctly');
  await rows.first().click();
  await page.locator('.qcontent').waitFor();
  const qFs = await page.locator('.qbar').evaluate(() => getComputedStyle(document.querySelector('.q, .opt')).fontSize);
  check(qFs === '20px', 'question/answer text 20px (' + qFs + ')');
  const optH = await page.locator('.opt').first().evaluate((e) => e.getBoundingClientRect().height);
  check(optH >= 56, 'answer option at least 56px tall (' + Math.round(optH) + ')');
  const types = new Set();
  for (let i = 0; i < maxQ; i++) {
    const q = await solveCurrent(page); types.add(q.type);
  }
  await page.locator('.finished').waitFor();
  check(types.size === 13, 'played 13 activity types: ' + [...types].join(', '));
  check((await page.locator('#sectionScore').textContent()).trim() === `${maxQ * 5} / ${maxQ * 5}`, 'full marks ' + maxQ * 5);
  check((await page.evaluate(() => window.__events)).join(',') === 'opened,section finished', 'section finished event sent');
  check(await page.locator('#actions, .actions').locator('.btn[data-key="next"]').count() === 1, 'Next section button shown');

  console.log('\n[3] Next section, wrong answers, lives, Show answer, unit finished event');
  await page.locator('.btn[data-key="next"]').click();
  await page.locator('.qcontent').waitFor();
  await wrongCurrent(page);
  check((await page.locator('#lives svg.lit').count()) === 1, 'one X lit after one wrong answer');
  check((await page.locator('.btn[data-key="tryAgain"]').count()) === 1, 'Try again offered');
  await page.locator('.btn[data-key="tryAgain"]').click();
  await solveCurrent(page);
  await page.locator('.finished').waitFor();
  check((await page.locator('#sectionScore').textContent()).trim() === '3 / 5', 'right second time scores 3');
  check((await page.evaluate(() => window.__events)).join(',') === 'opened,section finished,section finished,unit finished', 'unit finished when every open section finished');
  await page.locator('.btn[data-key="home"]').click();
  check((await page.locator('#unitTotal').textContent()).trim() === `${maxQ * 5 + 3} / ${maxQ * 5 + 5}`, 'home total updated');
  check((await page.locator('.section-row').first().locator('svg.tick').count()) === 1, 'finished section shows tick');

  console.log('\n[4] Start again (are you sure), replay beats best, Show answer scores 0');
  await page.locator('.section-row').nth(1).click();
  await page.locator('.finished').waitFor();
  await page.locator('.btn[data-key="startAgain"]').click();
  check((await page.locator('.confirm').count()) === 1, 'Are you sure? shown');
  await page.locator('.confirm .btn[data-key="no"]').click();
  check((await page.locator('.confirm').count()) === 0, 'No keeps the finished screen');
  await page.locator('.btn[data-key="startAgain"]').click();
  await page.locator('.confirm .btn[data-key="yes"]').click();
  await page.locator('.qcontent').waitFor();
  await wrongCurrent(page);
  check(await page.locator('.opt.wrong').count() === 1, 'wrong option framed red');
  await page.locator('.btn[data-key="tryAgain"]').click();
  check(await page.locator('.opt.tried:disabled').count() === 1, 'tried option greyed out');
  await page.locator('#homeBtn').click();
  await page.locator('.section-row').first().waitFor();
  check((await page.locator('.section-row').nth(1).locator('.score').textContent()).trim() === '3 / 5', 'best score shown during a replay');
  check((await page.locator('.section-row').nth(1).locator('svg.tick').count()) === 1, 'section stays ticked during a replay');
  await page.locator('.section-row').nth(1).click();
  await page.locator('.qcontent').waitFor();
  check((await page.locator('#lives svg.lit').count()) === 0, 'progress resumes with a fresh question');
  await solveCurrent(page);
  await page.locator('.finished').waitFor();
  check((await page.locator('#sectionScore').textContent()).trim() === '5 / 5', 'replay scored 5');
  await page.locator('.btn[data-key="home"]').click();
  check((await page.locator('.section-row').nth(1).locator('.score').textContent()).trim() === '5 / 5', 'replay that beats the best updates it');

  // Show answer: replay section one, get word order wrong three times
  await page.locator('.section-row').first().click();
  await page.locator('.finished').waitFor();
  await page.locator('.btn[data-key="startAgain"]').click();
  await page.locator('.confirm .btn[data-key="yes"]').click();
  await page.locator('.qcontent').waitFor();
  let qt = '';
  while (qt !== 'word-order') {
    qt = await page.evaluate(() => { const r = window.LITS.run; return r.qs[r.idx].type; });
    if (qt !== 'word-order') await solveCurrent(page);
  }
  const sentence = await page.evaluate(() => window.LITS.run.qs[window.LITS.run.idx].item.sentence);
  const rev = sentence.trim().split(/\s+/).reverse();
  for (let i = 0; i < 3; i++) {
    if (i > 0) { // send tiles back then rebuild wrongly
      while (await page.locator('#wordLine .tile.placed').count()) await page.locator('#wordLine .tile.placed').first().click();
    }
    for (const w of rev) await page.locator('#wordPool .tile', { hasText: new RegExp('^' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$') }).first().click();
    await page.locator('#confirmBtn').click();
    await page.locator('#feedback.wrong').waitFor();
    if (i < 2) { check(await page.locator('.btn[data-key="tryAgain"]').count() === 1, 'Try again after wrong confirm ' + (i + 1)); await page.locator('.btn[data-key="tryAgain"]').click(); }
  }
  check((await page.locator('#lives svg.lit').count()) === 3, 'three X marks lit');
  check(await page.locator('.btn[data-key="tryAgain"]').count() === 0 && await page.locator('.btn[data-key="showAnswer"]').count() === 1, 'only Show answer after third wrong answer');
  await page.locator('.btn[data-key="showAnswer"]').click();
  check((await page.locator('#wordLine .tile.placed').allTextContents()).join(' ') === sentence, 'correct sentence revealed');
  await page.locator('#actions .btn[data-key="next"]').click();
  while (!(await page.locator('.finished').count())) await solveCurrent(page);
  check((await page.locator('#sectionScore').textContent()).trim() === `${maxQ * 5 - 5} / ${maxQ * 5}`, 'revealed question scored 0');
  check((await page.locator('.finished .best').textContent()).includes(`${maxQ * 5} / ${maxQ * 5}`), 'best score still shown on finished screen');
  await page.locator('.btn[data-key="next"]').click(); // next section (two)
  await page.locator('.qcontent, .finished').first().waitFor();
  await page.locator('#homeBtn').click();
  await page.locator('.section-row').first().waitFor();
  check((await page.locator('.section-row').first().locator('.score').textContent()).trim() === `${maxQ * 5} / ${maxQ * 5}`, 'replay did not lower best score');
  await page.reload(); await page.locator('.section-row').first().waitFor();
  check((await page.locator('#unitTotal').textContent()).trim() === `${maxQ * 5 + 5} / ${maxQ * 5 + 5}`, 'best scores survive a reload');
  check((await page.evaluate(() => window.__events)).join(',') === 'opened', 'reload sends only opened (no repeat section/unit events)');

  console.log('\n[5] Offline reload after first load (service worker)');
  if (base.startsWith('http://127.0.0.1')) console.log('   (local http server: service worker is allowed on 127.0.0.1)');
  await page.waitForFunction(() => navigator.serviceWorker && navigator.serviceWorker.controller, null, { timeout: 10000 }).catch(() => {});
  const hasSW = await page.evaluate(() => !!(navigator.serviceWorker && navigator.serviceWorker.controller));
  check(hasSW, 'service worker controls the page');
  await page.waitForTimeout(1500);
  await ctx.setOffline(true);
  let offlineOk = false;
  try { await page.reload({ waitUntil: 'load' }); await page.locator('.section-row').first().waitFor({ timeout: 8000 }); offlineOk = true; } catch (e) { console.log('   offline reload error: ' + e.message.split('\n')[0]); }
  check(offlineOk, 'page loads offline with sections');
  if (offlineOk) {
    await page.locator('.section-row').first().click();
    await page.locator('.finished').waitFor();
    await page.locator('.btn[data-key="startAgain"]').click();
    await page.locator('.confirm .btn[data-key="yes"]').click();
    await page.locator('.qcontent').waitFor();
    const imgOk = await page.locator('img.qimg').first().evaluate((i) => i.complete && i.naturalWidth > 0).catch(() => false);
    check(imgOk, 'unit image available offline');
  }
  await ctx.setOffline(false);
  await ctx.close();
}
{
  console.log('\n[6] Arabic interface labels (browser language ar)');
  const ctx = await newContext({ locale: 'ar' });
  const page = await ctx.newPage(); watch(page);
  await page.goto(URL_);
  await page.locator('.section-row').first().waitFor();
  check((await page.evaluate(() => document.documentElement.dir === 'rtl' && getComputedStyle(document.body).direction === 'rtl')) === true, 'interface is right-to-left');
  check((await page.locator('#countingNote').textContent()).includes('مجهول'), 'Arabic counting note shown under English');
  await page.locator('.section-row').first().click();
  await page.locator('.qcontent').waitFor();
  check((await page.locator('.qcontent').evaluate((e) => getComputedStyle(e).direction)) === 'ltr', 'learning content stays left-to-right');
  check((await page.locator('.qcontent').getAttribute('translate')) === 'no' && (await page.locator('.qcontent').getAttribute('lang')) === 'en', 'learning content marked lang=en translate=no');
  await wrongCurrent(page);
  const tryBtn = page.locator('.btn[data-key="tryAgain"]');
  check((await tryBtn.locator('.l2').textContent()) === 'حاول مرة أخرى', 'Try again shows Arabic label beside English');
  check((await tryBtn.locator('.l1').textContent()) === 'Try again', 'English word kept');
  await ctx.close();
}
{
  console.log('\n[7] Manifest');
  const ctx = await newContext();
  const page = await ctx.newPage(); watch(page);
  await page.goto(URL_);
  const m = await page.evaluate(async () => { const r = await fetch('manifest.webmanifest'); return { ok: r.ok, type: r.headers.get('content-type'), json: await r.json() }; });
  check(m.ok && m.json.name && m.json.icons && m.json.icons.length >= 2 && m.json.display === 'standalone', 'manifest valid with icons and standalone display');
  const icons = await page.evaluate(async (icons) => { const out = []; for (const i of icons) { const r = await fetch(i.src); out.push(r.ok); } return out; }, m.json.icons);
  check(icons.every(Boolean), 'all manifest icons fetch');
  await ctx.close();
}
await browser.close();
if (server) server.close();
console.log('\nConsole errors: ' + (consoleErrors.length ? '\n  ' + consoleErrors.join('\n  ') : 'none'));
check(consoleErrors.filter((e) => !/goatcounter|gc\.zgo\.at|net::ERR_INTERNET_DISCONNECTED|Failed to load resource/.test(e)).length === 0, 'no console errors (ignoring GoatCounter/offline fetches)');
console.log(`\n${passes} passed, ${failures} failed`);
process.exit(failures ? 1 : 0);
