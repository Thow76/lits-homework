# Content folders

One folder per unit (`content/shopping/`, `content/health/`...). Andrew fills a folder by running the "Add unit material" scheduled task and attaching files in that chat; the task saves them here and pushes. The daily "Build units" task then builds `units/<unit>/` from it. Nothing in `content/` is shown to learners.

## What a unit folder holds
- The worksheet as attached (Word, PDF or text), if any.
- Pictures named after the word: `bread.jpg`.
- Audio named after the words it says: `I-go-to-the-shop.mp3`, plus `audio.txt` with one line per file: `filename = words it says`.
- `notes.txt`: section by section, the games chosen, every question with its right and wrong answers exactly as Andrew gave them, the story text and dialogue, section names, whether the unit is current, and what was skipped.
- `dates.txt`: one line per section, `Section title = YYYY-MM-DD`, the day it opens for learners (UK time). A section without a date stays locked.

Files under about 10 MB each; pictures only need to be about 600 px wide and audio one word or sentence.
