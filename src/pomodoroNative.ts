import {NativeModules} from 'react-native';

export type PomodoroTimerStatus = 'idle' | 'running' | 'paused' | 'completed';

export type PomodoroTimerState = {
  status: PomodoroTimerStatus;
  durationMs: number;
  remainingMs: number;
  endsAtMs: number | null;
  updatedAtMs: number;
};

type PomodoroNativeModule = {
  getStatus(): Promise<PomodoroTimerState>;
  startTimer(durationMinutes: number): Promise<PomodoroTimerState>;
  pauseTimer(): Promise<PomodoroTimerState>;
  resumeTimer(): Promise<PomodoroTimerState>;
  restartTimer(): Promise<PomodoroTimerState>;
  resetTimer(): Promise<PomodoroTimerState>;
};

const nativeModule = NativeModules.PomodoroNative as
  | PomodoroNativeModule
  | undefined;

function getModule(): PomodoroNativeModule {
  if (!nativeModule) {
    throw new Error(
      'PomodoroNative is unavailable. Build the Android plugin package to enable the timer bridge.',
    );
  }

  return nativeModule;
}

function normalizeState(state: PomodoroTimerState): PomodoroTimerState {
  return {
    status: state.status,
    durationMs: Number(state.durationMs ?? 0),
    remainingMs: Number(state.remainingMs ?? 0),
    endsAtMs:
      state.endsAtMs === null || state.endsAtMs === undefined
        ? null
        : Number(state.endsAtMs),
    updatedAtMs: Number(state.updatedAtMs ?? Date.now()),
  };
}

export async function getStatus(): Promise<PomodoroTimerState> {
  return normalizeState(await getModule().getStatus());
}

export async function startTimer(
  durationMinutes: number,
): Promise<PomodoroTimerState> {
  return normalizeState(await getModule().startTimer(durationMinutes));
}

export async function pauseTimer(): Promise<PomodoroTimerState> {
  return normalizeState(await getModule().pauseTimer());
}

export async function resumeTimer(): Promise<PomodoroTimerState> {
  return normalizeState(await getModule().resumeTimer());
}

export async function restartTimer(): Promise<PomodoroTimerState> {
  return normalizeState(await getModule().restartTimer());
}

export async function resetTimer(): Promise<PomodoroTimerState> {
  return normalizeState(await getModule().resetTimer());
}
