# Content folders

The scheduled task copies Andrew's material here from the Google Drive folder **"Lits homework"** (one subfolder per unit, for example "Lits homework/Shopping") and then builds the unit under `units/`. Nothing in `content/` is shown to learners. Andrew does not need to touch this folder: he puts files in Google Drive and the task does the rest.

## What Andrew puts in a unit's Drive folder
- The worksheet (Word, PDF, Google Doc or text) with the story, vocabulary, dialogue and exercises.
- One picture per vocabulary word, named after the word (bread.jpg).
- One audio file per word or sentence, named after what it says (I-go-to-the-shop.mp3), or any names plus a text file or Google Doc called "audio" with one line per file: filename = words it says.
- A text file or Google Doc called "notes": the date each section opens (UK time), any section renames, which games go where, whether this unit is the one learners should see now, and anything else in plain English.

Files the task has processed are listed in `CONTENT_LOG.md` with their Drive modification times, so a changed file is picked up again and an unchanged one is not.
