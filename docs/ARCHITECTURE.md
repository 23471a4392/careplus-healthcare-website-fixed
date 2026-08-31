# CarePlus Architecture

Static multi-page SPA shell driven by `script.js` and `style.css`.

- UI: single `index.html` with section pages toggled via `showPage`
- Data: demo arrays in `script.js` plus large reference catalogs under `assets/data/`
- Persistence: browser LocalStorage via `assets/utils/storage.js` (demo only — not for real PHI)
- Production path: replace catalogs with authenticated APIs; never store sensitive medical data in the browser for real patients
