import type { TimerState } from '../types/account';

export type TimerStatus = 'ready' | 'active' | 'expiring-soon' | 'almost-ready';

export function getTimerStatus(timer?: TimerState): TimerStatus {
  if (!timer) return 'ready';

  const now = Date.now();
  const resetAt = new Date(timer.resetAt).getTime();
  const remaining = resetAt - now;

  if (remaining <= 0) return 'ready';
  if (remaining <= 60 * 60 * 1000) return 'almost-ready';     // < 1 hour
  if (remaining <= 24 * 60 * 60 * 1000) return 'expiring-soon'; // < 24 hours
  return 'active';
}

export function getRemainingMs(timer?: TimerState): number {
  if (!timer) return 0;
  const remaining = new Date(timer.resetAt).getTime() - Date.now();
  return Math.max(0, remaining);
}

export function getElapsedMs(timer?: TimerState): number {
  if (!timer) return 0;
  const start = new Date(timer.startedAt).getTime();
  return Date.now() - start;
}

export function getProgressPercent(timer?: TimerState): number {
  if (!timer) return 100;

  const remaining = getRemainingMs(timer);
  if (remaining <= 0) return 100;

  const totalDuration = timer.durationMinutes * 60 * 1000;
  const elapsed = getElapsedMs(timer);
  const progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
  return progress;
}

export function createTimer(
  durationMinutes: number,
  startDate?: Date
): TimerState {
  const startedAt = startDate || new Date();
  const resetAt = new Date(startedAt.getTime() + durationMinutes * 60 * 1000);

  return {
    startedAt: startedAt.toISOString(),
    resetAt: resetAt.toISOString(),
    durationMinutes,
  };
}

export function isTimerExpired(timer?: TimerState): boolean {
  if (!timer) return true;
  return new Date(timer.resetAt).getTime() <= Date.now();
}
