# Engineering

## Stack

- React Native Supernote plugin template
- TypeScript for the JS layer
- Kotlin for Android timer persistence and alarm scheduling

## Main Components

- `index.js` — Supernote plugin registration
- `App.tsx` — plugin UI
- `src/pomodoroNative.ts` — JS bridge to native timer code
- `android/app/src/main/java/com/mdf/supernotepomodoro/pomodoro/` — timer state, alarm scheduling, and native module
- `PluginConfig.json` — plugin identity and package metadata

## Build

```sh
npm install
npm run build:plugin
```

Primary artifact:

```text
build/outputs/supernote-pomodoro.snplg
```

## Stability Constraints

- Keep `app.json.name` and `PluginConfig.json.pluginKey` stable as `SupernotePomodoro`.
- Treat `PluginConfig.json.pluginID` as stable after first publication.
- Avoid committing generated build outputs or local environment files.

## Security and Release Hygiene

- Never commit `.env`, `.env.*`, personal API keys, or local endpoint addresses.
- The tracked `android/app/debug.keystore` is only for debug builds and must never be used for a release signing flow.
- Before making the repo public, rescan the working tree and git history for secrets.

## Known Risk Area

The hardest part of the plugin is the host lifecycle around closing the plugin view and surfacing timer completion. Changes in that area should be validated on a real Supernote device, not just in local builds.
