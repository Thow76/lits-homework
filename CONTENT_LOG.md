# Content log — what the daily "Build units" task has processed

This is the build task's own record, kept across runs. It says what has been turned into
learner-ready sections, where each question went, what is still missing, and what Andrew must
decide. Written in plain English for a tutor. (A "commit" is one saved snapshot of the repo;
its short code lets the next run see exactly which files it has already dealt with.)

## Last processed state

- Processed up to commit `968fb46` (the "Build Shopping Section 1" push of 2026-10-29), checked on 2026-10-31.
- Files in `content/shopping/` at that state, all accounted for:
  `notes.txt`, `dates.txt`, `audio.txt`, `shopping_worksheet_full_class.pdf`,
  pictures `basket.jpg`, `rice.jpg`, `self-checkout.jpg`, `shop-assistant.jpg`, `shopping-list.jpg`,
  audio `basket.mp3`, `rice.mp3`, `self-checkout.mp3`, `shop-assistant.mp3`, `shopping-list.mp3`.
- The next run compares `content/` against this list and this commit. Nothing new means no push and no notification.

## Run of 2026-10-31

**Nothing new in `content/` since Section 1 was built, so no new sections were built.** This run
created this log (it did not exist), re-checked the live Shopping unit and made one small fix.

### Checked
- `node test/e2e.mjs` (the automatic test of the page using the test unit): 52 passed, 0 failed.
- The real Shopping unit played through in a pretend phone browser (headless Chromium, 390 px wide)
  with every section treated as open: Section 1 ran from the first question to the Finished screen
  with 60 / 60, all five pictures and all three audio files loaded, no errors in the browser console.
  Sections 2 to 5 are empty, so there was nothing to play.
- `units/index.json` still lists only Shopping as the current unit; the test unit (dummy) is not listed. Correct.
- Audio files: all five are mono MP3 at 48 kbps as required.
- Pictures: all are 600 px wide or less.

### Fixed
- `units/shopping/shop-assistant.jpg` was 72 KB, over the "about 60 KB" limit for phones on poor
  signal. Re-saved at the same size (600 × 450) with slightly stronger compression: now 40 KB.
  Same picture, loads faster. No change to `index.html`, `css/` or `js/`.

### What is live now (Section 1, "Vocabulary and first practice", opened 2026-10-29)
Built by the "Add unit material" session with Andrew on 2026-10-29; this run confirmed it, not changed it.
- **Match** ("Match the picture to the word.", worksheet page 2): 5 questions, one per picture
  (rice, shopping list, shop assistant, self-checkout, basket), all five words offered each time.
- **Which word** ("Complete the sentence with the missing word.", page 3): 4 questions —
  "She has a ___." = shopping list; "A shop assistant helps Anita to find ___." = rice;
  "Anita has everything on her list in the ___." = basket; "She pays at the ___." = self-checkout.
  The right answers were taken from the story on worksheet page 12; notes.txt says Andrew still has to confirm them.
- **Spell it** (page 2, "Copy the words"): 3 questions — self-checkout, rice, basket, each with picture and audio.

### Still missing or not used in Section 1
- Spell it for "shopping list" and "shop assistant": not built, because the letter-tile game cannot
  show the space between two words. Pictures and audio for both are saved and ready.
  Andrew's call: leave them out, or ask for the page to be changed so two-word items work.
- `shop-assistant.mp3` and `shopping-list.mp3` are therefore not used by any question yet.
- Audio is not attached to the Match or Which word questions. The five word recordings exist, but
  hearing the word would give away the answer in both games, and Section 1 was confirmed in that
  form, so this run left it alone. Andrew can ask for Listen buttons to be added if he wants them.

### Sections 2 to 5 — nothing built, waiting for Andrew (notes.txt says "waiting for Andrew's go-ahead")
All four sections exist on the page as empty, locked placeholders (dates in 2099, so they cannot open).
Learners see them greyed with a padlock.

| Section (id, never changes) | What exists | What Andrew must supply |
|---|---|---|
| 2 Whole story (`story`) | The nine story sentences are in notes.txt. Games planned: Word order (page 4), Capital letters, Person place or thing (page 17). | Go-ahead on the games; the person/place/thing words and their answers (page 17 of the worksheet is a picture, so its text could not be read); the sentences to use for Word order; story audio if wanted; the opening date. |
| 3 Understanding the story (`understanding`) | Nothing (worksheet pages 14 to 21 are pictures; their text could not be read). | The questions with right and wrong answers, which games, the opening date. |
| 4 Conversation practice (`conversation`) | Nothing (pages 22 to 25 are pictures). | The dialogue lines in order, audio per line if wanted, which games, the opening date. |
| 5 Personalisation (`personalisation`) | Nothing (pages 26 to 30 are pictures). | The questions and answers, which games, the opening date. |

Note on the worksheet PDF: only pages 1 to 5, 9, 10 and 12 contain readable text. The other pages
are stored as pictures inside the PDF, so the build task cannot read them. Andrew should give that
content as typed text in notes.txt (via the "Add unit material" task) rather than relying on the PDF.

### Questions lacking audio or a picture they should have
- None in Section 1 beyond the two unused Spell it words listed above.
