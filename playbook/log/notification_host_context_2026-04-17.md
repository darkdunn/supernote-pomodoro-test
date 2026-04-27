# Notification Host Context

The downloaded reference implementation in `~/Downloads/pomodoro.zip` showed an important Supernote host detail: timer alarms should resolve the real host `Application` through `ActivityThread.currentApplication()` and use that context for `AlarmManager.OnAlarmListener` callbacks.

## Decision

- Use `AlarmManager.OnAlarmListener` with the host application context.
- Keep `PomodoroTimerStore.completeFromAlarm()` so alarm firing writes completion state directly.
- Do not launch a modal completion activity from the alarm path.
- Use a non-blocking toast for the visible completion signal.
- Add a timeout around `PluginManager.closePluginView()` so the UI cannot remain stuck on `Closing...` forever if the host promise hangs.

## Follow-up

Validate on hardware. Local builds can verify compilation, but the notification and close behavior depends on the Supernote plugin host lifecycle.
