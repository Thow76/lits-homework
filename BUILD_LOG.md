# Build log — Literacies Plus homework page

> **Reporting rule for every run (Andrew's request, 2026-10-29):** write the log and the notification in plain English for a tutor, not a developer. Explain every technical term the first time it appears, say what has been done, what has not, and give step-by-step click-by-click instructions for anything Andrew has to do himself. Never say "enable Pages" or "allow the host" without saying what that means and where to click.

## Where things stand, in plain English (updated 2026-10-29)

**What is finished.** The whole homework web page has been written and tested. That means: the home screen with the unit score and progress bar; the five Shopping sections (currently empty placeholders); all thirteen activity types (match, which word, understanding, word order, spell it, person/place/thing, conversation order, audio true/false, listen and choose, missing word, capital letters, yes/no); the scoring with three lives and "Show answer"; sections that lock until their release date; "Start again" with an "Are you sure?" step; Arabic labels under the English words when the phone is set to Arabic; working offline after the first visit; and the "Add to Home Screen" icon. An automatic test drives the page in a pretend phone browser and checks 52 things. All 52 pass.

**The page is live.** Andrew switched on GitHub Pages on 2026-10-29 at about 20:00 and opened the page on his phone. Every push to `main` now republishes the site within a minute or two. Address: https://thow76.github.io/lits-homework/ (test unit: add `?unit=dummy`).

**The three things only Andrew can do**

1. ~~Switch on GitHub Pages~~ **Done 2026-10-29.** (Steps kept for reference.)
   - Go to https://github.com/Thow76/lits-homework and sign in.
   - Click the **Settings** tab (the cog, far right of the row that starts Code · Issues · Pull requests).
   - In the left-hand menu click **Pages**.
   - Under "Build and deployment", in the **Source** dropdown choose **Deploy from a branch**.
   - Under **Branch** choose **main** in the first dropdown and **/ (root)** in the second, then click **Save**.
   - Wait two or three minutes, then open https://thow76.github.io/lits-homework/ on your phone. You should see the home screen with the five locked Shopping sections. To see the test unit with every activity type, open https://thow76.github.io/lits-homework/?unit=dummy instead.

2. **Let this automated task see the live page (optional).** This task runs on a computer in the cloud that, for safety, is only allowed to talk to a short list of websites. The finished page's address, thow76.github.io, is not on that list, so the task cannot open the live page to check it. You can either:
   - **Do nothing and check it yourself on a phone** using the list under "Only testable on a real phone" below. The automatic checks already pass on exactly the files Pages will publish, so this is enough. **Recommended.**
   - Or, in Claude Code on the web (https://claude.ai/code), open the settings for the environment this scheduled task runs in, find the network access setting, and add `thow76.github.io` to the allowed websites (or choose full internet access). Then the next run will test the live page automatically. GitHub's guide to these settings: https://code.claude.com/docs/en/claude-code-on-the-web

3. ~~Give me the GoatCounter code.~~ **Done 2026-10-29.** The code is `lits-homework-counter`; Andrew's stats page is https://lits-homework-counter.goatcounter.com. The page sends only three anonymous events (opened, section finished, unit finished); nothing identifies a learner.

**After that, the only remaining work is content.** The Shopping unit has five empty sections with release dates set to 2099. You need to supply the real questions, pictures and audio and the real opening dates. The format is described in `units/README.md`; an automated task can produce the unit file from it.


Repo: Thow76/lits-homework · Pages: https://thow76.github.io/lits-homework/ · Test unit: add `?unit=dummy`

## Stage status

| Stage | Status | Notes |
|-------|--------|-------|
| 1. Scaffold and first deploy | **Done** (code) / Pages **not enabled yet** | Pushed to `main`. No "pages build and deployment" workflow run appeared in the 80 s after the push, which means GitHub Pages is not switched on for the repo. Also, the task's network policy blocks `thow76.github.io`, so the live URL cannot be fetched from the build environment even once Pages is on. See "Andrew" below. |
| 2. Engine | **Done** | Scoring, lives, Show answer, best scores, home, finished, Start again, date locking, three counter events. Tested headless at 390px (52 checks pass). |
| 3. Activity types | **Done** | All 13 types, `js/icons.js`, `units/README.md`, dummy unit covering every type. Tested headless. |
| 4. End-to-end on the live Pages URL | **Pages is live (2026-10-29 20:03); automated live check still blocked** | Pages is on and deploying from `main`. `thow76.github.io` is still blocked by this task's network policy, so the live check must be done by Andrew on a phone (list below) unless the domain is allowed. Local suite re-run on the same commit: 52/52 pass. `BASE=https://thow76.github.io/lits-homework/ node test/e2e.mjs` runs the same checks against the live site once both are fixed. |

## Run 2 — 2026-10-29

Nothing new to build: Stages 1–3 are complete and Stage 4 needs the live site.

### Checked
- GitHub Actions on the repo: zero workflow runs, so GitHub Pages has still not been enabled (enabling it creates a "pages build and deployment" run within a minute of the next push).
- `https://thow76.github.io/lits-homework/` from this environment: the proxy refuses the connection (403 CONNECT) and the hostname does not resolve. The host is outside the task's allowed network domains.
- Local end-to-end suite (`node test/e2e.mjs`, headless Chromium 390×844) on commit `ca1a96b`: 52 passed, 0 failed. This covers every Stage 4 item that can be tested without the live URL: all activity types, Show answer, Start again, best score across a reload, locked/open by date, Arabic labels with browser language `ar`, offline reload after first load, manifest validity, console errors.

### Still needed from Andrew before Stage 4 can finish
1. ~~Enable GitHub Pages~~ — done by Andrew 2026-10-29 20:03.
2. Allow `thow76.github.io` in this task's environment network settings (Claude Code → the environment this task runs in → network policy / allowed domains). Without it the live check can only be done by Andrew on a phone.
3. ~~GoatCounter site code~~ — done 2026-10-29.

If item 2 cannot be done, Stage 4 can be closed by Andrew running the phone punch list below against the live URL; the automated checks already pass locally on the identical files Pages will serve.

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
1. ~~GitHub Pages is not enabled~~ — enabled by Andrew 2026-10-29.
2. **Network policy for this task**: the environment could not reach `thow76.github.io` (blocked by the session's network settings), so Stage 4 (live end-to-end) cannot run until that host is allowed for the task's environment. Everything else was tested locally.
3. ~~GoatCounter site code~~ — done 2026-10-29 (`lits-homework-counter`).
4. Real Shopping content: images, MP3s and `unit.json` per `units/README.md`, plus the real `release` dates. Andrew plans to rename the sections later: when renaming, keep each section's `id` unchanged and change only `title`, so learners' saved best scores (keyed by id) are kept.

### Left to do
- Stage 4 on the live URL (blocked on items 1–2 above). Next run: retry fetching the Pages URL; if reachable, run `BASE=https://thow76.github.io/lits-homework/ node test/e2e.mjs`, fix anything small, write the punch list.

### Only testable on a real phone (punch list for Andrew)
- Arabic phone: labels in the browser and when launched from the home-screen icon.
- Browser auto-translate offered: learning content should stay in English.
- Largest phone text size: layout scrolls, nothing cut off or overlapping (word-order tiles especially).
- Add to Home Screen gives the book icon and opens full screen.
- Audio autoplay on Listen-first activities (True/False, Listen and choose) — phones often block it; the Listen button always works.
- Time a learner on each section.
