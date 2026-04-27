# Requirements

## Functional Requirements

- The plugin is available from `NOTE` and `DOC`.
- The plugin exposes a single timer, not a full pomodoro cycle manager.
- Preset durations are `5`, `10`, `15`, `20`, and `25` minutes.
- Starting a timer closes the plugin immediately and returns the user to the note.
- The timer continues while the plugin UI is closed.
- Reopening the plugin shows the authoritative timer state.
- When a timer is running, the UI supports pause, restart, and reset.
- When a timer is paused, the UI supports resume, restart, and reset.
- When a timer is completed, the UI supports restart and reset.
- Completed state remains visible until the user clears or restarts it.

## Background Scope

- Background continuation is only required after the plugin UI closes.
- Persistence through full device reboot is not a current requirement.

## Notification Expectation

- The plugin should attempt to make completion visible to the user.
- In practice, timer state restoration on reopen is the reliable fallback.
- Notification behavior should never trap the device in a blocked or non-dismissible state.

## UX Requirements

- Keep the UI simple and optimized for e-ink.
- Prefer direct actions over configuration-heavy settings.
- If the close flow fails, the UI should recover instead of leaving the close button stuck indefinitely.
