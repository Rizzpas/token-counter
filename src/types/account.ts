export type TimerState = {
  startedAt: string;   // ISO timestamp
  resetAt: string;     // ISO timestamp
  durationMinutes: number;
};

export type Provider = {
  id: string;
  name: string;
  enabled: boolean;
  defaultDurationMinutes: number;
  timer?: TimerState;
};

export type Account = {
  id: string;
  email: string;
  providers: Provider[];
  createdAt: string;
  updatedAt: string;
};

export type NotificationSettings = {
  enabled: boolean;
  notifyOnReady: boolean;
  notify24h: boolean;
  notify6h: boolean;
  notify1h: boolean;
};

export type AppSettings = {
  theme: 'dark' | 'light' | 'system';
  notifications: NotificationSettings;
};

export type SortOption =
  | 'name'
  | 'soonest'
  | 'latest'
  | 'ready-first'
  | 'recently-added';

export type FilterOption = 'all' | 'ready' | 'not-ready';

export const DEFAULT_PROVIDERS: Pick<Provider, 'name' | 'defaultDurationMinutes'>[] = [
  { name: 'Gemini', defaultDurationMinutes: 7 * 24 * 60 },
  { name: 'Claude', defaultDurationMinutes: 7 * 24 * 60 },
];

export const DURATION_PRESETS = [
  { label: '1 Day', minutes: 24 * 60 },
  { label: '2 Days', minutes: 2 * 24 * 60 },
  { label: '3 Days', minutes: 3 * 24 * 60 },
  { label: '7 Days', minutes: 7 * 24 * 60 },
];
