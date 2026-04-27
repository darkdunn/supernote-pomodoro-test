# Supernote Pomodoro — Agent Instructions

The playbook is the source of truth for this repository. Read it before writing code, especially:

- [playbook/README.md](playbook/README.md) — entry point and navigation
- [playbook/PRODUCT.md](playbook/PRODUCT.md) — product intent, scope, and non-goals
- [playbook/ENGINEERING.md](playbook/ENGINEERING.md) — architecture, build, packaging, and operational constraints
- [playbook/REQUIREMENTS.md](playbook/REQUIREMENTS.md) — current functional requirements and expected behavior
- [playbook/log/](playbook/log/) — durable notes, decisions, and debugging history

## Rules

- Read before writing.
- If code contradicts the playbook or requirements, flag it.
- Keep the public README forward-facing and user-oriented.
- Do not commit secrets, local endpoint addresses, personal credentials, or real signing keys.
- The tracked `android/app/debug.keystore` is debug-only template material and must never be reused for release signing.
- Keep the internal plugin key stable:
  - `app.json.name = SupernotePomodoro`
  - `PluginConfig.json.pluginKey = SupernotePomodoro`
- Record durable product or engineering decisions in `playbook/log/`.

## Build

```sh
npm install
npm run build:plugin
```

Artifact:

```text
build/outputs/supernote-pomodoro.snplg
```
