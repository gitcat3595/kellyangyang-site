# kellyangyang.com

Static site, no build step. GitHub Pages serves `main` from the repo root.

## Layout

```
/                      landing
/apps/                 index of mini-apps
/apps/<name>/          one mini-app per directory
```

**Every mini-app goes under `/apps/` (plural), one directory per app,
each a single self-contained `index.html`.**

Self-contained means: no external scripts, no fetch, assets inlined.
`iro-color` follows this fully; `todayscup` still pulls Google Fonts.

## Adding an app

1. `apps/<name>/index.html`
2. Add a card to `apps/index.html`
3. Commit and push — Pages redeploys on its own

## Note on iro-color

`apps/iro-color/index.html` is generated from a template plus a colour-data
file. Hand-edits to it survive only until the next regeneration, so put
lasting changes in the source rather than the built file.
