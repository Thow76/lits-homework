# Instructions for the two scheduled tasks

Andrew: two Claude Code scheduled tasks, both with GitHub access to Thow76/lits-homework attached.

- **Add unit material** — schedule it weekly but start it by hand with run-now, then open the session and talk to it. It asks for the material section by section, saves what you attach into `content/<unit>/`, and pushes.
- **Build units** — runs once a day on its own. Builds anything new in `content/` into the live page and sends one notification. Silent when nothing is new.

The text of both prompts is in the chat where they were written (2026-10-29). The build prompt reads `content/` in the repo only; it does not use Google Drive.
