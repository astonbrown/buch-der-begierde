# Buch der Begierde – Phase-1 Fixes (v0.6.0)

Analysebericht vom 14.10.2026 – Multi-Agenten-Analyse (Explorer | Review | Coder)

## Enthaltene Dateien (10 Prioritäts-Fixes)

### JavaScript
- `js/config.js`          – VERSION 0.6.0, STORY_TOTAL_PAGES: 7
- `js/toast.js`           – XSS-Fix: innerHTML → createElement + textContent
- `js/app-lesen.js`       – XSS-Fix: Memory-Knoten per textContent
- `js/app-archiv.js`      – XSS-Fix + tote ID-Referenzen korrigiert (archivNodeList, btnArchivExport)
- `js/db.js`              – Cookie Secure-Flag bei HTTPS
- `js/echo.js`            – Canvas: document.hidden-Check (Pause bei inaktivem Tab)
- `js/navigation.js`      – Scroll-Spy: requestAnimationFrame-Throttle

### HTML
- `lesen.html`            – Supabase CDN + Seitenanzeige „/ 7“
- `hoeren.html`           – Supabase CDN
- `schreiben.html`        – Supabase CDN

## Anwendung

1. Dateien in das bestehende Projekt-Root kopieren (Pfadstruktur beibehalten).
2. Bestehende Dateien überschreiben.
3. Optional committen:

```bash
git add js/config.js js/toast.js js/app-lesen.js js/app-archiv.js js/db.js js/echo.js js/navigation.js lesen.html hoeren.html schreiben.html
git commit -m "fix: Phase-1 Security & Performance (XSS, Supabase CDN, Version 0.6.0, Archiv-IDs, Cookie Secure, Canvas Pause, Scroll Throttle)"
```

## Noch offen (Phase 2+)
- SRI-Integrity-Hashes für CDN
- Design-System vereinheitlichen (index.html → variables.css)
- Inline-CSS aus index.html auslagern
- Supabase-Anon-Key in Umgebungsvariable auslagern
