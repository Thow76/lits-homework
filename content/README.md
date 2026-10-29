# Content drop folders

One folder per unit: `content/shopping/`, `content/health/`, and so on. The scheduled task reads what is in here and builds the matching unit under `units/`. Nothing in `content/` is shown to learners.

## Uploading files without any software
1. Open https://github.com/Thow76/lits-homework/tree/main/content and click into the unit's folder (or click **Add file → Create new file**, type `health/notes.txt` as the name to make a new unit folder).
2. Click **Add file → Upload files**, drag the files in, type a short note, click **Commit changes**.

## What goes in a unit folder
- **The worksheet**: `worksheet.docx`, `.pdf`, `.txt` or `.md`, with the story, vocabulary and dialogue. Several files are fine (`worksheet-week1.docx`, `worksheet-week2.docx`).
- **notes.txt** (optional): anything the worksheet does not say, in plain English. Which games in which section, section names, words to skip, "this unit is the current one".
- **Pictures**: one per vocabulary word, named after the word: `bread.jpg`, `milk.png`. Any size.
- **Audio**: one file per sentence or word, named after what it says (`I-go-to-the-shop.m4a`, `bread.mp3`), or any names plus an `audio.txt` with one line per file: `filename = the words it says`. Any format.
- **dates.txt**: one line per section, `Section title = YYYY-MM-DD`, the day the section opens for learners (UK time). Until a section has a date it stays locked.

## What the task produces
`units/<unit>/unit.json` plus shrunken pictures and small MP3s beside it, following `units/README.md`. It never invents story text, sentences or audio, and never generates speech.
