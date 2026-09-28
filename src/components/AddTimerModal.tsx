import { useState, useEffect } from 'react';
import { DURATION_PRESETS } from '../types/account';
import { formatDateTime, toDateTimeLocalString } from '../utils/formatting';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  providerName: string;
  defaultDurationMinutes: number;
  onStart: (durationMinutes: number, startDate: Date) => void;
};

export function AddTimerModal({
  isOpen,
  onClose,
  providerName,
  defaultDurationMinutes,
  onStart,
}: Props) {
  const [durationMinutes, setDurationMinutes] = useState(defaultDurationMinutes);
  const [customDuration, setCustomDuration] = useState('');
  const [customUnit, setCustomUnit] = useState<'hours' | 'days'>('days');
  const [isCustom, setIsCustom] = useState(false);
  const [startDateTime, setStartDateTime] = useState(
    toDateTimeLocalString(new Date())
  );

  useEffect(() => {
    if (isOpen) {
      setDurationMinutes(defaultDurationMinutes);
      setIsCustom(false);
      setCustomDuration('');
      setStartDateTime(toDateTimeLocalString(new Date()));
    }
  }, [isOpen, defaultDurationMinutes]);

  useEffect(() => {
    if (isCustom && customDuration) {
      const num = parseFloat(customDuration);
      if (!isNaN(num) && num > 0) {
        setDurationMinutes(
          customUnit === 'hours' ? num * 60 : num * 24 * 60
        );
      }
    }
  }, [isCustom, customDuration, customUnit]);

  if (!isOpen) return null;

  const startDate = new Date(startDateTime);
  const resetDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStart(durationMinutes, startDate);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className="relative bg-zinc-900 border border-zinc-700/50 rounded-xl shadow-2xl p-6 w-full max-w-md mx-4 animate-scale-in">
        <h3 className="text-lg font-semibold text-zinc-100 mb-4">
          Start {providerName} Timer
        </h3>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Duration Presets */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Duration
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {DURATION_PRESETS.map((preset) => (
                <button
                  key={preset.minutes}
                  type="button"
                  onClick={() => {
                    setDurationMinutes(preset.minutes);
                    setIsCustom(false);
                  }}
                  className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                    !isCustom && durationMinutes === preset.minutes
                      ? 'bg-blue-600/20 text-blue-400 border-blue-500/40'
                      : 'bg-zinc-800 text-zinc-400 border-zinc-700/50 hover:bg-zinc-700'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setIsCustom(true)}
                className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                  isCustom
                    ? 'bg-blue-600/20 text-blue-400 border-blue-500/40'
                    : 'bg-zinc-800 text-zinc-400 border-zinc-700/50 hover:bg-zinc-700'
                }`}
              >
                Custom
              </button>
            </div>

            {isCustom && (
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  value={customDuration}
                  onChange={(e) => setCustomDuration(e.target.value)}
                  placeholder="Duration"
                  className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700/50 rounded-lg text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
                <select
                  value={customUnit}
                  onChange={(e) =>
                    setCustomUnit(e.target.value as 'hours' | 'days')
                  }
                  className="px-3 py-2 bg-zinc-800 border border-zinc-700/50 rounded-lg text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                >
                  <option value="hours">Hours</option>
                  <option value="days">Days</option>
                </select>
              </div>
            )}
          </div>

          {/* Start Date/Time */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Start date & time
            </label>
            <input
              type="datetime-local"
              value={startDateTime}
              onChange={(e) => setStartDateTime(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700/50 rounded-lg text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
          </div>

          {/* Calculated Reset Date */}
          <div className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700/30">
            <p className="text-xs text-zinc-500 mb-1">Reset date</p>
            <p className="text-sm font-medium text-zinc-200">
              {formatDateTime(resetDate.toISOString())}
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-200 bg-zinc-800 hover:bg-zinc-700 rounded-lg border border-zinc-700/50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Start Timer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
