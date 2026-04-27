package com.mdf.supernotepomodoro.pomodoro

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableMap

class PomodoroNativeModule(
    reactContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(reactContext) {
    override fun getName(): String = "PomodoroNative"

    @ReactMethod
    fun getStatus(promise: Promise) {
        promise.resolve(snapshotToMap(PomodoroTimerStore.read(reactApplicationContext)))
    }

    @ReactMethod
    fun startTimer(durationMinutes: Double, promise: Promise) {
        val durationMs = (durationMinutes * 60_000.0).toLong().coerceAtLeast(60_000L)
        val snapshot = PomodoroTimerStore.start(reactApplicationContext, durationMs)
        PomodoroAlarmScheduler.schedule(
            reactApplicationContext,
            snapshot.endsAtMs ?: System.currentTimeMillis() + durationMs,
        )
        promise.resolve(snapshotToMap(snapshot))
    }

    @ReactMethod
    fun pauseTimer(promise: Promise) {
        PomodoroAlarmScheduler.cancel(reactApplicationContext)
        promise.resolve(snapshotToMap(PomodoroTimerStore.pause(reactApplicationContext)))
    }

    @ReactMethod
    fun resumeTimer(promise: Promise) {
        val snapshot = PomodoroTimerStore.resume(reactApplicationContext)
        if (snapshot.status == PomodoroTimerStore.STATUS_RUNNING && snapshot.endsAtMs != null) {
            PomodoroAlarmScheduler.schedule(reactApplicationContext, snapshot.endsAtMs)
        }
        promise.resolve(snapshotToMap(snapshot))
    }

    @ReactMethod
    fun restartTimer(promise: Promise) {
        val snapshot = PomodoroTimerStore.restart(reactApplicationContext)
        PomodoroAlarmScheduler.schedule(
            reactApplicationContext,
            snapshot.endsAtMs ?: System.currentTimeMillis() + snapshot.durationMs,
        )
        promise.resolve(snapshotToMap(snapshot))
    }

    @ReactMethod
    fun resetTimer(promise: Promise) {
        PomodoroAlarmScheduler.cancel(reactApplicationContext)
        promise.resolve(snapshotToMap(PomodoroTimerStore.reset(reactApplicationContext)))
    }

    private fun snapshotToMap(snapshot: PomodoroTimerSnapshot): WritableMap {
        return Arguments.createMap().apply {
            putString("status", snapshot.status)
            putDouble("durationMs", snapshot.durationMs.toDouble())
            putDouble("remainingMs", snapshot.remainingMs.toDouble())
            if (snapshot.endsAtMs == null) {
                putNull("endsAtMs")
            } else {
                putDouble("endsAtMs", snapshot.endsAtMs.toDouble())
            }
            putDouble("updatedAtMs", snapshot.updatedAtMs.toDouble())
        }
    }
}
