/* Inline SVG icons for the homework page. Swap any icon by editing its string here.
   Each entry is a complete <svg> element using currentColor, 24x24 viewBox. */
(function () {
  const svg = (inner, extra) =>
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"' + (extra || '') + '>' + inner + '</svg>';

  window.ICONS = {
    // Buttons
    next: svg('<path d="M5 12h14"/><path d="M13 6l6 6-6 6"/>'),
    listen: svg('<path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16 9a4 4 0 0 1 0 6"/><path d="M18.5 6.5a8 8 0 0 1 0 11"/>'),
    tryAgain: svg('<path d="M20 12a8 8 0 1 1-2.3-5.6"/><path d="M20 4v5h-5"/>'),
    showAnswer: svg('<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'),
    startAgain: svg('<path d="M19 12H5"/><path d="M11 6l-6 6 6 6"/>'),
    confirm: svg('<path d="M7 11v9H3v-9h4z"/><path d="M7 11l4-7c1.5 0 2.5 1 2.5 2.5V10H20a2 2 0 0 1 2 2.3l-1.2 6A2 2 0 0 1 18.8 20H7"/>'),
    home: svg('<path d="M3 11l9-8 9 8"/><path d="M5 10v10h5v-6h4v6h5V10"/>'),
    // Feedback
    tick: svg('<path d="M4 12.5l5 5L20 6.5"/>'),
    cross: svg('<path d="M6 6l12 12"/><path d="M18 6L6 18"/>'),
    lock: svg('<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>'),
    // Activity headers
    understanding: svg('<circle cx="12" cy="12" r="10"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7"/><path d="M12 17h.01"/>'),
    ear: svg('<path d="M6 10a6 6 0 0 1 12 0c0 3-2 4-3 6-.7 1.4-1 4-4 4a3 3 0 0 1-3-3"/><path d="M9.5 10a2.5 2.5 0 0 1 5 0c0 1.5-1 2-1.5 3"/>'),
    missingWord: svg('<rect x="3" y="7" width="18" height="10" rx="1.5" stroke-dasharray="3 2"/><path d="M8 17v3M16 17v3"/>'),
    capitals: svg('<path d="M3 17L7.5 6l4.5 11"/><path d="M4.6 13.5h5.8"/><path d="M14.5 13.2c.5-.6 1.3-1 2.3-1 1.5 0 2.4.8 2.4 2.2V17"/><path d="M19.2 14.8c-1.2.2-3.2.1-3.9.7-.9.7-.6 2 .5 2.1 1.2.2 2.5-.3 3.4-1.2"/>'),
    wordOrder: svg('<rect x="2" y="9" width="6" height="6" rx="1"/><rect x="9" y="9" width="6" height="6" rx="1"/><rect x="16" y="9" width="6" height="6" rx="1"/>'),
    whichWord: '',
    match: svg('<rect x="3" y="4" width="8" height="7" rx="1"/><path d="M14 7h7"/><rect x="3" y="13" width="8" height="7" rx="1"/><path d="M14 16h7"/>'),
    spell: svg('<rect x="3" y="8" width="5" height="8" rx="1"/><rect x="9.5" y="8" width="5" height="8" rx="1"/><rect x="16" y="8" width="5" height="8" rx="1"/>'),
    sort: svg('<circle cx="6" cy="7" r="2.5"/><path d="M2.5 15c0-2 1.5-3.5 3.5-3.5S9.5 13 9.5 15"/><path d="M12 15l3-5 3 5h-6z"/><rect x="12.5" y="16" width="5" height="4" rx="0.5"/>'),
    conversation: svg('<path d="M4 5h11a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H9l-4 3v-3H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"/><path d="M19 10h1a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-1v3l-3-3h-3"/>'),
    yesNo: svg('<circle cx="12" cy="12" r="10"/><path d="M8 12h8"/>')
  };
})();
