# Build log — Literacies Plus homework page

Repo: Thow76/lits-homework · Pages: https://thow76.github.io/lits-homework/ · Test unit: add `?unit=dummy`

## Stage status

| Stage | Status | Notes |
|-------|--------|-------|
| 1. Scaffold and first deploy | **Done** (code) / Pages **not enabled yet** | Pushed to `main`. No "pages build and deployment" workflow run appeared in the 80 s after the push, which means GitHub Pages is not switched on for the repo. Also, the task's network policy blocks `thow76.github.io`, so the live URL cannot be fetched from the build environment even once Pages is on. See "Andrew" below. |
| 2. Engine | **Done** | Scoring, lives, Show answer, best scores, home, finished, Start again, date locking, three counter events. Tested headless at 390px (52 checks pass). |
| 3. Activity types | **Done** | All 13 types, `js/icons.js`, `units/README.md`, dummy unit covering every type. Tested headless. |
| 4. End-to-end on the live Pages URL | **Not started** | Needs Pages enabled and the host reachable. `BASE=https://thow76.github.io/lits-homework/ node test/e2e.mjs` runs the same 52 checks against the live site. |

## Run 1 — 2026-10-28

Built from an empty repository (no commits existed).

### Built
- `index.html`, `css/style.css` (18px body, 20px question/answer text, 56px tap targets, 12px gaps, rem units so phone text size scales), `manifest.webmanifest`, `icons/` (192/512/maskable PNGs rendered from `icons/icon.svg`), `sw.js` (shell: stale-while-revalidate; `units/**/*.json`: network first then cache; images/audio: cache first; the app also asks the worker to pre-cache every image/audio of open sections after the unit loads), `.nojekyll`.
- `strings.json` — English and Arabic blocks (`dir` per language). The page picks the first phone language that has a block and is not English, and shows its label under the English word on every button; the interface flips to RTL while all learning content stays `lang="en" translate="no" dir="ltr"`. Scores like "12 / 20" are kept LTR under RTL.
- `js/app.js` — engine. `js/activities.js` — all activity types. `js/icons.js` — inline SVGs (swap here).
- `units/index.json` (current: shopping), `units/shopping/unit.json` with the five sections, each `release` far in the future (2099), empty activities.
- `units/dummy/` — test unit covering all 13 types with tiny SVG images and 0.6 s tone MP3s (48 kbps mono). Not listed in `index.json`; load with `?unit=dummy`.
- `units/README.md` — full JSON format for another automated task to generate units from.
- `test/e2e.mjs` — Playwright test (local static server by default, or `BASE=<url>`).
- GoatCounter: one script tag in `index.html` with placeholder site code `GOATCOUNTER_CODE`; `no_onload` is set so the only events are `opened`, `section finished`, `unit finished`.

### Tested (headless Chromium, 390×844, 52 checks, all pass)
Home totals count open sections only; section released yesterday open, released tomorrow locked (padlock, no score, not tappable); counting note; `opened` sent once per load; all 13 activity types played to full marks; wrong answer lights one X and offers Try again; right second time scores 3; `section finished` once, `unit finished` once when every open section finished, nothing repeated on reload or replay; Start again asks Are you sure?, No cancels, Yes clears answers but keeps best score; section stays ticked with best score during replay; replay that beats best updates it, one that does not leaves it; three wrong confirms on word order → only Show answer → reveals sentence → scores 0; best scores survive reload; service worker controls page, offline reload shows sections and unit image; Arabic: RTL interface, Arabic labels beside English words, learning content LTR and marked `lang=en translate=no`; manifest valid and icons fetch; no console errors other than the blocked GoatCounter script.

### Decisions made (change if you disagree)
- **Confirm button word**: the thumbs-up on Word order needs a word; it says "Check" (Arabic "تحقق"). Not in the spec's vocabulary list — easy to change in `strings.json`.
- **Yes / No / Home / Finished / Check** labels were added to `strings.json` so they get Arabic too.
- **Two- and three-option questions can never reach "Show answer"**: a wrong option is greyed out after Try again, so the learner is left with the right one (scoring 3 or 1). Show answer is reachable on word order, spell it, conversation, find-and-fix, capital letters, and any question with four or more options.
- **Spell it** checks automatically when the last slot is filled (no confirm). On a wrong word the learner taps letters out and back in; the check runs again when full.
- **Conversation order**: each tap is an answer — tap the line that comes next; a wrong tap lights an X. One conversation = one question (max 5).
- **Capital letters**: two steps — tap every word needing a capital, then the word each full stop follows. Wrong taps light an X.
- **Find and fix**: tap the wrong word, then pick the right one from the options; wrong taps at either step light an X.
- **"unit finished"** fires once per phone per unit, the first time every *open* section is finished. With sections opening weekly it can fire after the first open section is finished. If you would rather it fire only when all five are open and finished, say so.
- **Mid-section progress** is saved in localStorage so a learner who leaves resumes at the next question. Best score only updates when the section is finished.
- `?unit=<id>` opens any unit folder for testing (not a release mechanism — dates still apply).

### Andrew must decide or supply
1. **GitHub Pages is not enabled** (no deployment run after the push). Enable it: repo Settings → Pages → Source "Deploy from a branch" → `main` / `/ (root)`. Then open https://thow76.github.io/lits-homework/?unit=dummy on a phone.
2. **Network policy for this task**: the environment could not reach `thow76.github.io` (blocked by the session's network settings), so Stage 4 (live end-to-end) cannot run until that host is allowed for the task's environment. Everything else was tested locally.
3. **GoatCounter site code**: replace `GOATCOUNTER_CODE` in `index.html` (one place).
4. Real Shopping content: images, MP3s and `unit.json` per `units/README.md`, plus the real `release` dates.

### Left to do
- Stage 4 on the live URL (blocked on items 1–2 above). Next run: retry fetching the Pages URL; if reachable, run `BASE=https://thow76.github.io/lits-homework/ node test/e2e.mjs`, fix anything small, write the punch list.

### Only testable on a real phone (punch list for Andrew)
- Arabic phone: labels in the browser and when launched from the home-screen icon.
- Browser auto-translate offered: learning content should stay in English.
- Largest phone text size: layout scrolls, nothing cut off or overlapping (word-order tiles especially).
- Add to Home Screen gives the book icon and opens full screen.
- Audio autoplay on Listen-first activities (True/False, Listen and choose) — phones often block it; the Listen button always works.
- Time a learner on each section.
