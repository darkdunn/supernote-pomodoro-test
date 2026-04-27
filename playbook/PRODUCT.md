# Product

## Goal

Provide a lightweight focus timer for Supernote that feels native to note-taking rather than like a separate app.

## Core User Flow

1. Open a note or document.
2. Launch the `Pomodoro` plugin action.
3. Pick a preset timer.
4. Return immediately to writing.
5. Reopen the plugin later to inspect or control the timer state.

## Scope

- Single work timer
- Preset-based start flow
- Background countdown while the plugin UI is closed
- Reopenable status and controls

## Non-Goals

- Multi-step pomodoro cycles
- Break scheduling
- Sync across devices
- Cloud storage
- Rich analytics

## Current Product Caveat

Completion notification behavior is still unreliable on real hardware. The timer state itself remains the authoritative source of truth.
