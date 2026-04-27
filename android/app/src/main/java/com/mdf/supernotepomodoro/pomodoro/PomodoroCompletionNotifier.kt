package com.mdf.supernotepomodoro.pomodoro

import android.content.Context
import android.os.Handler
import android.os.Looper
import android.widget.Toast

object PomodoroCompletionNotifier {
    fun onAlarm(context: Context) {
        val snapshot = PomodoroTimerStore.completeFromAlarm(context)
        if (snapshot.status != PomodoroTimerStore.STATUS_COMPLETED) {
            return
        }

        Handler(Looper.getMainLooper()).post {
            Toast.makeText(
                context,
                "Pomodoro ended",
                Toast.LENGTH_LONG,
            ).show()
        }
    }
}
