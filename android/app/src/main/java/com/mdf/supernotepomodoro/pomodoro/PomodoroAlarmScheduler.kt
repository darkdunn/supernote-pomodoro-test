package com.mdf.supernotepomodoro.pomodoro

import android.app.AlarmManager
import android.app.Application
import android.content.Context
import android.os.Handler
import android.os.Looper
import android.util.Log

object PomodoroAlarmScheduler {
    private const val TAG = "PomodoroAlarmScheduler"
    private var currentListener: AlarmManager.OnAlarmListener? = null

    private fun getHostApplication(): Application? {
        return try {
            val activityThread = Class.forName("android.app.ActivityThread")
            val currentApp = activityThread.getMethod("currentApplication")
            currentApp.invoke(null) as? Application
        } catch (error: Exception) {
            Log.w(TAG, "Failed to resolve host Application", error)
            null
        }
    }

    private fun resolveContext(context: Context): Context {
        return getHostApplication() ?: context.applicationContext
    }

    fun cancel(context: Context) {
        val listener = currentListener ?: return
        val realContext = resolveContext(context)
        val alarmManager = realContext.getSystemService(AlarmManager::class.java) ?: return
        alarmManager.cancel(listener)
        currentListener = null
    }

    fun schedule(context: Context, triggerAtMs: Long) {
        val realContext = resolveContext(context)
        val alarmManager = realContext.getSystemService(AlarmManager::class.java) ?: return

        cancel(realContext)

        val listener =
            AlarmManager.OnAlarmListener {
                PomodoroCompletionNotifier.onAlarm(realContext)
            }
        currentListener = listener

        alarmManager.setExact(
            AlarmManager.RTC_WAKEUP,
            triggerAtMs,
            TAG,
            listener,
            Handler(Looper.getMainLooper()),
        )
    }
}
