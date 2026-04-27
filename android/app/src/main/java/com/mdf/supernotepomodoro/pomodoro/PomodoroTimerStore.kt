package com.mdf.supernotepomodoro.pomodoro

import android.content.Context
import kotlin.math.max

data class PomodoroTimerSnapshot(
    val status: String,
    val durationMs: Long,
    val remainingMs: Long,
    val endsAtMs: Long?,
    val updatedAtMs: Long,
)

object PomodoroTimerStore {
    const val STATUS_IDLE = "idle"
    const val STATUS_RUNNING = "running"
    const val STATUS_PAUSED = "paused"
    const val STATUS_COMPLETED = "completed"

    private const val PREFS_NAME = "pomodoro_timer_store"
    private const val KEY_STATUS = "status"
    private const val KEY_DURATION_MS = "duration_ms"
    private const val KEY_REMAINING_MS = "remaining_ms"
    private const val KEY_ENDS_AT_MS = "ends_at_ms"
    private const val KEY_UPDATED_AT_MS = "updated_at_ms"

    private const val DEFAULT_DURATION_MS = 25L * 60L * 1000L

    fun completeFromAlarm(context: Context): PomodoroTimerSnapshot {
        val current = readStored(context)
        if (current.status == STATUS_COMPLETED) {
            return current
        }

        if (current.status != STATUS_RUNNING) {
            return current
        }

        val completed =
            PomodoroTimerSnapshot(
                status = STATUS_COMPLETED,
                durationMs = current.durationMs,
                remainingMs = 0L,
                endsAtMs = null,
                updatedAtMs = System.currentTimeMillis(),
            )

        write(context, completed)
        PomodoroAlarmScheduler.cancel(context)
        return completed
    }

    fun read(context: Context): PomodoroTimerSnapshot {
        return normalize(context, readStored(context))
    }

    fun start(context: Context, durationMs: Long): PomodoroTimerSnapshot {
        val now = System.currentTimeMillis()
        val boundedDurationMs = durationMs.coerceAtLeast(60_000L)
        val snapshot =
            PomodoroTimerSnapshot(
                status = STATUS_RUNNING,
                durationMs = boundedDurationMs,
                remainingMs = boundedDurationMs,
                endsAtMs = now + boundedDurationMs,
                updatedAtMs = now,
            )

        write(context, snapshot)
        return snapshot
    }

    fun pause(context: Context): PomodoroTimerSnapshot {
        val current = read(context)
        if (current.status != STATUS_RUNNING || current.endsAtMs == null) {
            return current
        }

        val now = System.currentTimeMillis()
        val snapshot =
            PomodoroTimerSnapshot(
                status = STATUS_PAUSED,
                durationMs = current.durationMs,
                remainingMs = max(0L, current.endsAtMs - now),
                endsAtMs = null,
                updatedAtMs = now,
            )

        write(context, snapshot)
        return snapshot
    }

    fun resume(context: Context): PomodoroTimerSnapshot {
        val current = read(context)
        if (current.status != STATUS_PAUSED) {
            return current
        }

        val now = System.currentTimeMillis()
        val snapshot =
            PomodoroTimerSnapshot(
                status = STATUS_RUNNING,
                durationMs = current.durationMs,
                remainingMs = current.remainingMs.coerceAtLeast(1_000L),
                endsAtMs = now + current.remainingMs.coerceAtLeast(1_000L),
                updatedAtMs = now,
            )

        write(context, snapshot)
        return snapshot
    }

    fun restart(context: Context): PomodoroTimerSnapshot {
        val current = read(context)
        return start(context, current.durationMs)
    }

    fun reset(context: Context): PomodoroTimerSnapshot {
        val current = read(context)
        val now = System.currentTimeMillis()
        val snapshot =
            PomodoroTimerSnapshot(
                status = STATUS_IDLE,
                durationMs = current.durationMs,
                remainingMs = current.durationMs,
                endsAtMs = null,
                updatedAtMs = now,
            )

        write(context, snapshot)
        return snapshot
    }

    private fun normalize(context: Context, snapshot: PomodoroTimerSnapshot): PomodoroTimerSnapshot {
        if (snapshot.status != STATUS_RUNNING || snapshot.endsAtMs == null) {
            return snapshot
        }

        val now = System.currentTimeMillis()
        val remainingMs = max(0L, snapshot.endsAtMs - now)
        if (remainingMs > 0L) {
            val refreshed =
                snapshot.copy(
                    remainingMs = remainingMs,
                    updatedAtMs = now,
                )
            write(context, refreshed)
            return refreshed
        }

        val completed =
            PomodoroTimerSnapshot(
                status = STATUS_COMPLETED,
                durationMs = snapshot.durationMs,
                remainingMs = 0L,
                endsAtMs = null,
                updatedAtMs = now,
            )

        write(context, completed)
        PomodoroAlarmScheduler.cancel(context)
        return completed
    }

    private fun readStored(context: Context): PomodoroTimerSnapshot {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val durationMs = prefs.getLong(KEY_DURATION_MS, DEFAULT_DURATION_MS).coerceAtLeast(60_000L)
        val remainingMs = prefs.getLong(KEY_REMAINING_MS, durationMs).coerceAtLeast(0L)
        val endsAtMs = prefs.getLong(KEY_ENDS_AT_MS, 0L).takeIf { it > 0L }
        val updatedAtMs = prefs.getLong(KEY_UPDATED_AT_MS, System.currentTimeMillis())
        val rawStatus = prefs.getString(KEY_STATUS, STATUS_IDLE) ?: STATUS_IDLE

        return PomodoroTimerSnapshot(
            status = rawStatus,
            durationMs = durationMs,
            remainingMs = remainingMs,
            endsAtMs = endsAtMs,
            updatedAtMs = updatedAtMs,
        )
    }

    private fun write(context: Context, snapshot: PomodoroTimerSnapshot) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit()
            .putString(KEY_STATUS, snapshot.status)
            .putLong(KEY_DURATION_MS, snapshot.durationMs)
            .putLong(KEY_REMAINING_MS, snapshot.remainingMs)
            .putLong(KEY_ENDS_AT_MS, snapshot.endsAtMs ?: 0L)
            .putLong(KEY_UPDATED_AT_MS, snapshot.updatedAtMs)
            .apply()
    }
}
