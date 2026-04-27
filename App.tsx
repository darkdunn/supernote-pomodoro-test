/**
 * @format
 */

import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {PluginManager} from 'sn-plugin-lib';
import {
  type PomodoroTimerState,
  getStatus,
  pauseTimer,
  resetTimer,
  restartTimer,
  resumeTimer,
  startTimer,
} from './src/pomodoroNative';

const PRESET_MINUTES = [1, 10, 15, 20, 25];
const REFRESH_INTERVAL_MS = 1000;
const CLOSE_PLUGIN_TIMEOUT_MS = 3000;

const IDLE_STATE: PomodoroTimerState = {
  status: 'idle',
  durationMs: 25 * 60 * 1000,
  remainingMs: 25 * 60 * 1000,
  endsAtMs: null,
  updatedAtMs: Date.now(),
};

function formatClock(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function formatMinutes(ms: number): string {
  return `${Math.max(1, Math.round(ms / 60000))} min`;
}

function formatEndTime(endsAtMs: number | null): string {
  if (!endsAtMs) {
    return 'No timer scheduled';
  }

  return new Date(endsAtMs).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getStatusLabel(status: PomodoroTimerState['status']): string {
  switch (status) {
    case 'running':
      return 'Running in background';
    case 'paused':
      return 'Paused';
    case 'completed':
      return 'Completed';
    default:
      return 'Ready';
  }
}

function getStatusSummary(state: PomodoroTimerState): string {
  switch (state.status) {
    case 'running':
      return `Ends at ${formatEndTime(state.endsAtMs)}`;
    case 'paused':
      return `Resume ${formatMinutes(state.remainingMs)} remaining`;
    case 'completed':
      return 'The timer is done. Restart or reset here when you are ready for another session.';
    default:
      return 'Start a timer and the plugin will close itself so you can return to your note.';
  }
}

function closePluginViewWithTimeout(): Promise<void> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error('Timed out closing the plugin view.'));
    }, CLOSE_PLUGIN_TIMEOUT_MS);

    PluginManager.closePluginView()
      .then(() => {
        resolve();
      })
      .catch(reject)
      .finally(() => {
        clearTimeout(timeoutId);
      });
  });
}

function App(): React.JSX.Element {
  const [timer, setTimer] = useState<PomodoroTimerState>(IDLE_STATE);
  const [loading, setLoading] = useState(true);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function syncTimerState() {
    try {
      const nextState = await getStatus();
      setTimer(nextState);
      setError(null);
    } catch (syncError) {
      const message =
        syncError instanceof Error ? syncError.message : 'Failed to read timer status.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    syncTimerState().catch(() => {
      // syncTimerState already captures and stores UI errors.
    });
  }, []);

  useEffect(() => {
    if (timer.status !== 'running') {
      return;
    }

    const intervalId = setInterval(() => {
      syncTimerState().catch(() => {
        // syncTimerState already captures and stores UI errors.
      });
    }, REFRESH_INTERVAL_MS);

    return () => {
      clearInterval(intervalId);
    };
  }, [timer.status]);

  async function performAction(
    actionName: string,
    action: () => Promise<PomodoroTimerState>,
    options?: {closeAfter?: boolean},
  ) {
    setBusyAction(actionName);
    setError(null);

    try {
      const nextState = await action();
      setTimer(nextState);

      if (options?.closeAfter) {
        await closePluginViewWithTimeout();
      }
    } catch (actionError) {
      const message =
        actionError instanceof Error ? actionError.message : `Failed to ${actionName}.`;
      setError(message);
    } finally {
      setBusyAction(null);
    }
  }

  const closeLabel = busyAction === 'close' ? 'Closing...' : 'Close';
  const quickStartTitle =
    timer.status === 'idle' ? 'Quick Start' : 'Start New Timer';

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f1e8" />

      <View style={styles.header}>
        <View>
          <Text style={styles.kicker}>SUPERNOTE UTILITY</Text>
          <Text style={styles.title}>Pomodoro</Text>
        </View>

        <Pressable
          accessibilityLabel="Close plugin"
          onPress={() => {
            setBusyAction('close');
            setError(null);
            closePluginViewWithTimeout()
              .catch(closeError => {
                const message =
                  closeError instanceof Error
                    ? closeError.message
                    : 'Failed to close the plugin view.';
                setError(message);
              })
              .finally(() => {
                setBusyAction(null);
              });
          }}
          style={({pressed}) => [
            styles.closeButton,
            pressed && styles.pressedButton,
          ]}>
          <Text style={styles.closeButtonText}>{closeLabel}</Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.centeredBlock}>
          <ActivityIndicator color="#111111" />
          <Text style={styles.loadingText}>Loading timer state...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <View style={styles.heroCard}>
            <Text style={styles.heroLabel}>{getStatusLabel(timer.status)}</Text>
            <Text style={styles.heroTime}>{formatClock(timer.remainingMs)}</Text>
            <Text style={styles.heroSummary}>{getStatusSummary(timer)}</Text>
          </View>

          {timer.status !== 'idle' ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Current Controls</Text>
              <View style={styles.controlRow}>
                {timer.status === 'running' ? (
                  <>
                    <ActionButton
                      disabled={busyAction !== null}
                      label="Pause"
                      onPress={() =>
                        performAction('pause', pauseTimer).catch(() => {
                          // performAction already captures and stores UI errors.
                        })
                      }
                      variant="secondary"
                    />
                    <ActionButton
                      disabled={busyAction !== null}
                      label="Restart"
                      onPress={() =>
                        performAction('restart', restartTimer, {
                          closeAfter: true,
                        }).catch(() => {
                          // performAction already captures and stores UI errors.
                        })
                      }
                    />
                    <ActionButton
                      disabled={busyAction !== null}
                      label="Reset"
                      onPress={() =>
                        performAction('reset', resetTimer).catch(() => {
                          // performAction already captures and stores UI errors.
                        })
                      }
                      variant="secondary"
                    />
                  </>
                ) : null}

                {timer.status === 'paused' ? (
                  <>
                    <ActionButton
                      disabled={busyAction !== null}
                      label="Resume"
                      onPress={() =>
                        performAction('resume', resumeTimer, {
                          closeAfter: true,
                        }).catch(() => {
                          // performAction already captures and stores UI errors.
                        })
                      }
                    />
                    <ActionButton
                      disabled={busyAction !== null}
                      label="Restart"
                      onPress={() =>
                        performAction('restart', restartTimer, {
                          closeAfter: true,
                        }).catch(() => {
                          // performAction already captures and stores UI errors.
                        })
                      }
                      variant="secondary"
                    />
                    <ActionButton
                      disabled={busyAction !== null}
                      label="Reset"
                      onPress={() =>
                        performAction('reset', resetTimer).catch(() => {
                          // performAction already captures and stores UI errors.
                        })
                      }
                      variant="secondary"
                    />
                  </>
                ) : null}

                {timer.status === 'completed' ? (
                  <>
                    <ActionButton
                      disabled={busyAction !== null}
                      label="Restart"
                      onPress={() =>
                        performAction('restart', restartTimer, {
                          closeAfter: true,
                        }).catch(() => {
                          // performAction already captures and stores UI errors.
                        })
                      }
                    />
                    <ActionButton
                      disabled={busyAction !== null}
                      label="Reset"
                      onPress={() =>
                        performAction('reset', resetTimer).catch(() => {
                          // performAction already captures and stores UI errors.
                        })
                      }
                      variant="secondary"
                    />
                  </>
                ) : null}
              </View>
            </View>
          ) : null}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{quickStartTitle}</Text>
            {timer.status === 'idle' ? (
              <Text style={styles.helpText}>
                Pick a preset to start a timer and return to your note immediately.
              </Text>
            ) : null}
            <View style={styles.presetGrid}>
              {PRESET_MINUTES.map(minutes => {
                const isSelected = timer.durationMs === minutes * 60 * 1000;
                return (
                  <Pressable
                    key={minutes}
                    accessibilityLabel={`Start ${minutes} minute timer`}
                    disabled={busyAction !== null}
                    onPress={() =>
                      performAction(`start ${minutes}`, () => startTimer(minutes), {
                        closeAfter: true,
                      }).catch(() => {
                        // performAction already captures and stores UI errors.
                      })
                    }
                    style={({pressed}) => [
                      styles.presetButton,
                      isSelected && styles.presetButtonSelected,
                      (pressed || busyAction !== null) && styles.pressedButton,
                    ]}>
                    <Text
                      style={[
                        styles.presetButtonText,
                        isSelected && styles.presetButtonTextSelected,
                      ]}>
                      {minutes}
                    </Text>
                    <Text
                      style={[
                        styles.presetButtonSubtext,
                        isSelected && styles.presetButtonTextSelected,
                      ]}>
                      min
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </ScrollView>
      )}
    </View>
  );
}

type ActionButtonProps = {
  disabled: boolean;
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
};

function ActionButton({
  disabled,
  label,
  onPress,
  variant = 'primary',
}: ActionButtonProps): React.JSX.Element {
  return (
    <Pressable
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={({pressed}) => [
        styles.actionButton,
        variant === 'secondary' && styles.actionButtonSecondary,
        (pressed || disabled) && styles.pressedButton,
      ]}>
      <Text
        style={[
          styles.actionButtonText,
          variant === 'secondary' && styles.actionButtonTextSecondary,
        ]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f5f1e8',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 24,
  },
  scrollContent: {
    paddingBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  kicker: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.6,
    color: '#666055',
    marginBottom: 6,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: '#111111',
  },
  closeButton: {
    borderWidth: 1,
    borderColor: '#111111',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#fcfaf4',
  },
  closeButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111111',
  },
  heroCard: {
    backgroundColor: '#111111',
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 22,
    marginBottom: 24,
  },
  heroLabel: {
    color: '#d9d2c3',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.1,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  heroTime: {
    color: '#ffffff',
    fontSize: 54,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 10,
  },
  heroSummary: {
    color: '#d9d2c3',
    fontSize: 14,
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 12,
    letterSpacing: 0.2,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  presetButton: {
    width: '30%',
    minWidth: 82,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#1f1a14',
    backgroundColor: '#fcfaf4',
    paddingVertical: 16,
    alignItems: 'center',
  },
  presetButtonSelected: {
    backgroundColor: '#1f1a14',
  },
  presetButtonText: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111111',
  },
  presetButtonSubtext: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5c5548',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  presetButtonTextSelected: {
    color: '#f5f1e8',
  },
  controlRow: {
    gap: 10,
  },
  actionButton: {
    borderRadius: 18,
    backgroundColor: '#111111',
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  actionButtonSecondary: {
    backgroundColor: '#ebe4d7',
    borderWidth: 1,
    borderColor: '#c8bfaf',
  },
  actionButtonText: {
    color: '#f5f1e8',
    fontSize: 15,
    fontWeight: '700',
  },
  actionButtonTextSecondary: {
    color: '#111111',
  },
  helpText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#4f493d',
    marginBottom: 12,
  },
  errorText: {
    fontSize: 13,
    lineHeight: 18,
    color: '#7a221f',
  },
  centeredBlock: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#4f493d',
  },
  pressedButton: {
    opacity: 0.72,
  },
});

export default App;
