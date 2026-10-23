# Riichi Trainer: notes for Claude

Riichi mahjong drills for Android (fork of riichi-trainer): efficiency
(ukeire), shanten, defence, south-4 scoring, hand explorer, replay analysis.
React 18 + TypeScript + Vite, Capacitor 6 for the APK, GitHub Actions for
builds. Repo `bogdanpetrenko13/riichi-trainer`, working branch `develop`, app
id `com.riichitrainer.app`. The owner writes in Russian; reply in Russian.
Sister project: Riichi Night (same stack and design language).

## Hard rules

- `signing/debug.keystore` is a debug key with the public `android`
  passwords, committed on purpose so every CI build installs over the last.
  Never use it for release builds.
- Commit messages end with the attribution lines the session gives you.

## Layout

| Path | What |
|---|---|
| `src/main.tsx` | Entry point |
| `src/i18n/index.tsx` | Own i18n (replaces i18next, ru + en): nested keys, `{{var}}`, `$t()` nesting, `_plural`; language in localStorage `i18nextLng` |
| `src/translations/en.js`, `ru.js` | The two languages (others were dropped); `en` is the reference, `ru` must have the same keys |
| `src/states/*` | The trainer screens (legacy JS, being ported) |
| `src/components/ui/*` | UI kit (tokens, `rt-*` classes); `legacy.js` renders the old reactstrap components |
| `src/screens/*` | Home (exercise cards, daily goal), Settings, Help, About |
| `src/progress.js` | localStorage helpers for the home screen (daily goal, last exercise, trainer summary) |
| `src/trainerMode.js`, `components/Dock.js`, `ModeSwitch.js`, `ReviewPanel.js` | Shared trainer kit: confirm/quick mode (localStorage `rt-trainer-mode`), bottom dock, mode switch, review bars; used by ukeire and defense trainers (hand sits in the page in ONE row right under the hint via `.rt-board--play`, no fixed dock; Dock is only used by Shanten) |
| `src/scripts/Explain.js` | Plain-language reason for a discard (ukeire / safety) shown in the review under "Why?" |
| `src/styles/tokens.css` | Themes in the Riichi Night palette: light (paper #f7f4ec, bamboo primary, terracotta accent), dark (charcoal-green #1c1f1d); flat cards with thin borders, system sans font; default theme `system` |
| `src/styles/trainer.css` | Trainer dock, review bars, home cards, last-round chips |
| `src/styles/legacy.css` | Layout classes the old Bootstrap markup still uses |
| `tests/*.test.ts` | Unit tests (Node test runner via `scripts/run-tests.mjs`) |

## Checks

```bash
npm test                       # unit tests
npm run build                  # tsc -b + vite build into dist/
```

Claude's container can't reach npm. Without `node_modules`, build a preview
with `scripts/preview/build.sh` (needs an esbuild binary in `ESBUILD=` and
React reachable via `NODE_PATH`) and open `.preview/index.html`.

Dependencies: CI runs `npm ci`. After a push that changes `package.json`, the
**Refresh package-lock.json** workflow runs by itself and commits the lock
file; then `git pull`. Its push does not trigger the build, so dispatch it:
`gh api -X POST repos/bogdanpetrenko13/Riichi-Trainer/actions/workflows/android-build.yml/dispatches -f ref=<branch>`.
(Workflows can be dispatched by hand only once they exist on `develop`.)

CI (`.github/workflows/android-build.yml`): unit tests, web build, debug APK
signed with the fixed key. On `develop` the APK is published as the
pre-release **dev-latest** (download via `gh api` release assets; workflow
artifacts are not reachable from the container).
