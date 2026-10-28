# Unit JSON format

This file describes every JSON shape the homework page understands, so that unit files can be
produced automatically. Everything here is read by `js/app.js` (sections, release dates, scoring)
and `js/activities.js` (activity types). Nothing else configures the page.

## Folder layout

```
units/
  index.json              lists the units and which one is current
  README.md               this file
  <unit-id>/
    unit.json             the unit
    *.jpg *.png *.svg     images, referenced by file name
    *.mp3                 audio, one small mono MP3 per sentence (~48 kbps), referenced by file name
```

Image and audio file names in a unit are relative to that unit's folder (`"image": "bread.jpg"`
means `units/<unit-id>/bread.jpg`). Keep files small: the page is for phones on poor signal.

## units/index.json

```json
{
  "current": "shopping",
  "units": [ { "id": "shopping", "title": "Shopping" } ]
}
```

- `current` — the id of the unit the page loads. Learners only ever see this unit.
- `units` — list of `{ "id", "title" }`. `id` is the folder name under `units/`.
- A unit that is not listed can still be opened for testing with `?unit=<id>` in the URL
  (for example `index.html?unit=dummy`). Never list the dummy unit.

## units/<unit-id>/unit.json

```json
{
  "id": "shopping",
  "title": "Shopping",
  "sections": [ ...section objects in the order they appear on the home screen... ]
}
```

### Section

```json
{
  "id": "vocabulary",
  "title": "Vocabulary and first practice",
  "release": "2026-11-03",
  "activities": [ ...activity objects, in order... ]
}
```

| field        | required | meaning |
|--------------|----------|---------|
| `id`         | yes      | short stable id, letters/digits/hyphens. Best scores are stored against `unitId.sectionId`, so do not rename a section once learners have used it. |
| `title`      | yes      | the class worksheet heading, shown on the home screen and in the top bar. |
| `release`    | no       | ISO date `YYYY-MM-DD`, interpreted in Europe/London. The section is **locked** (greyed, padlock, no score, cannot be opened) before that date and **open** from 00:00 on that date. Omit it for a section that is open straight away. This is the only release mechanism. |
| `activities` | yes      | list of activities (may be empty while a section is still being written). |

Locked sections do not count towards the unit total on the home screen. Open sections count
`5 × number of questions` each.

### Activity

An activity is a group of questions of one type:

```json
{ "type": "which-word", "title": "Which word?", "items": [ {...question...}, {...question...} ] }
```

| field     | required | meaning |
|-----------|----------|---------|
| `type`    | yes      | one of the types below. |
| `items`   | yes      | list of questions. Each item is one scored question worth 5 / 3 / 1 / 0. |
| `title`   | no       | header shown above each question (defaults to the type's English label). |
| `story`   | no       | a short text shown in a box above every question of this activity (used by `understanding` and `yes-no`). |
| `shuffle` | no       | set `false` to show options in the order written (default: options are shuffled). |
| `bank`    | no       | `missing-word` only: a word bank shared by all items that do not give their own `options`. |
| `categories` | no    | `sort` only: the category names, default `["Person", "Place", "Thing"]`. |

Any question may carry `"audio": "file.mp3"` (adds a Listen button) and most may carry
`"image": "file.jpg"` (shown above the question). Options are shown one per row, full width.

Scoring is the same for every type: right first time 5, second try 3, third try 1. Every wrong
answer lights one of three X marks. After the third wrong answer only "Show answer" is offered;
using it scores 0 and reveals the answer so the learner can move on. With two- or three-option
questions a wrong option is greyed out after "Try again", so the third wrong answer cannot happen
there — the learner always reaches the right answer.

## Activity types

### `match` — picture to word or sentence
```json
{ "image": "bread.jpg", "options": ["bread", "milk", "eggs"], "answer": "bread", "audio": "bread.mp3" }
```
`options` are words or whole sentences; `answer` must be one of them exactly. `prompt` (optional) is a line of text above the options.

### `which-word` — the right word for a picture or a gap
```json
{ "prompt": "I buy ___ at the shop.", "options": ["milk", "bus", "car"], "answer": "milk", "image": "milk.jpg" }
```
Two or more underscores in `prompt` are shown as a gap. `image` and `prompt` are both optional but give at least one.

### `understanding` — multiple choice about the story
```json
{ "question": "What does Amina buy?", "options": ["Bread and milk", "Fish", "A ticket"], "answer": "Bread and milk" }
```
Put the story text in the activity's `story` field to show it above each question.

### `yes-no` — a statement about the story, Yes and No buttons
```json
{ "statement": "Amina buys bread.", "answer": true }
```
`answer` is `true` (Yes) or `false` (No). The Yes/No buttons share one row.

### `audio-true-false` — hear a sentence, True (green) or False (red)
```json
{ "audio": "s1.mp3", "text": "The bread costs one pound.", "answer": true, "image": "price.jpg" }
```
`audio` is required and plays automatically where the phone allows it; there is always a Listen button.
`text` is the sentence (shown only when the answer is revealed). `image` (optional) gives the context the statement is true or false about.

### `listen-choose` — hear a sentence, pick it from three
```json
{ "audio": "s2.mp3", "answer": "I want two apples.", "distractors": ["I want two oranges.", "I want ten apples."] }
```
Each distractor must differ from `answer` by exactly one word. The three appear in random order.

### `missing-word` — word-bank gap fill
```json
{ "sentence": "I ___ bread every day.", "options": ["buy", "buys", "bought"], "answer": "buy" }
```
Tapping a word drops it into the gap. Use the activity-level `bank` instead of per-item `options` to share one bank.

### `find-and-fix` — spot the wrong word, then choose the right one
```json
{ "sentence": "She buy bread every day.", "wrong": "buy", "options": ["buys", "buying", "bought"], "answer": "buys" }
```
Step 1: the learner taps the wrong word (`wrong` must match one word of `sentence`; use `wrongIndex` (0-based) instead if the word appears twice). Step 2: the options appear and the learner taps the right one. Wrong taps at either step cost a life. Optional `prompt` / `prompt2` override the two instructions.

### `word-order` — tap word tiles to build the sentence
```json
{ "sentence": "I go to the shop.", "audio": "s3.mp3" }
```
Tiles come from splitting `sentence` on spaces, so the first tile keeps its capital and the last keeps its full stop. Keep sentences to about eight words. The thumbs-up button checks the sentence; only a wrong confirm costs a life. Optional `distractors`: extra word tiles that do not belong.

### `spell-it` — build a word from letter tiles
```json
{ "word": "milk", "image": "milk.jpg", "audio": "milk.mp3", "extra": "ae" }
```
Checked automatically when every slot is filled. `extra` (optional) adds distractor letters.

### `sort` — person, place or thing
```json
{ "word": "baker", "answer": "Person" }
```
One question per word; the three category buttons come from the activity's `categories` (default Person / Place / Thing). `answer` must match one category exactly.

### `conversation-order` — put the lines of a dialogue in order
```json
{ "lines": [
  { "speaker": "A", "text": "Hello, can I help you?", "audio": "c1.mp3" },
  { "speaker": "B", "text": "How much is the bread?", "audio": "c2.mp3" },
  { "speaker": "A", "text": "One pound." }
] }
```
Lines are written in the correct order and shown shuffled. The learner taps the line that comes next; a right tap moves it up into the conversation, a wrong tap costs a life. Each line with `audio` has its own small Listen button. `speaker` is optional.

### `capital-letters` — where do the capitals and full stops go?
```json
{ "sentence": "Amina lives in Aberdeen." }
```
Write the sentence correctly. The page shows it in lower case without full stops. First the learner taps every word that needs a capital (judged from the capitals in `sentence`), then the word each full stop follows. Wrong taps cost a life. Several sentences may be given in one string.

## Writing audio

One sentence per file, mono MP3 at about 48 kbps, for example:

```
ffmpeg -i in.wav -ac 1 -b:a 48k -ar 22050 out.mp3
```

## Checklist for a generated unit

- every `answer` appears in its `options` exactly (same spelling, case and punctuation)
- every `image`/`audio` file exists in the unit folder
- section `id`s are unique and never change
- `release` dates are `YYYY-MM-DD`
- run `node test/e2e.mjs` after editing the dummy unit; for a real unit, open
  `index.html?unit=<id>` and play every section once
