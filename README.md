# Supernote Pomodoro

Supernote Pomodoro is a small focus-timer plugin for Supernote devices. It adds a `Pomodoro` action in `NOTE` and `DOC`, lets you start a quick timer, and returns you to the page immediately so the timer can run in the background while you keep writing.

## Features

- Quick presets: `5`, `10`, `15`, `20`, `25` minutes
- One tap to start and return to the note
- Reopen the plugin to inspect running, paused, or completed state
- Pause, resume, restart, or reset an active timer
- Native Android timer bridge for background countdown persistence
- Completion callback scheduled with `AlarmManager.OnAlarmListener` instead of a static broadcast

## Status

The plugin now uses an in-process Android alarm listener for countdown completion. Timer state restoration on reopen remains the source of truth, and the completion callback should still be validated on real hardware after each native alarm change.

## Install

1. Build or download `supernote-pomodoro.snplg`.
2. Copy the package to the device `MyStyle` folder.
3. On the Supernote, open `Settings -> Apps -> Plugins -> Add Plugin`.
4. Select the package and install it.

## Build From Source

```sh
npm install
npm run build:plugin
```

The packaged plugin is written to `build/outputs/supernote-pomodoro.snplg`.

## Development Notes

- The plugin is built on the Supernote React Native plugin template.
- Native Android code is packaged into `app.npk` during `npm run build:plugin`.
- The stable internal plugin app key is `SupernotePomodoro`; changing it will break upgrades for existing installs.

## Repository Docs

Agent-specific guidance and project planning live outside this README:

- `AGENTS.md`
- `playbook/README.md`
- `playbook/PRODUCT.md`
- `playbook/ENGINEERING.md`
- `playbook/REQUIREMENTS.md`

## License

MIT
