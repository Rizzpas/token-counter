import { useState, useEffect } from 'react';
import { DURATION_PRESETS } from '../types/account';
import { formatDateTime, toDateTimeLocalString } from '../utils/formatting';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Calendar, Clock, Timer } from 'lucide-react';

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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent onClose={onClose} className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Timer className="h-4 w-4 text-blue-500" />
            <DialogTitle>Start {providerName} Timer</DialogTitle>
          </div>
          <DialogDescription>
            Configure the countdown duration and start time for quota reset.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Duration Presets */}
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Duration
            </label>
            <div className="flex flex-wrap gap-1.5">
              {DURATION_PRESETS.map((preset) => (
                <Button
                  key={preset.minutes}
                  type="button"
                  size="xs"
                  variant={!isCustom && durationMinutes === preset.minutes ? 'default' : 'outline'}
                  onClick={() => {
                    setDurationMinutes(preset.minutes);
                    setIsCustom(false);
                  }}
                  className="h-7 text-xs"
                >
                  {preset.label}
                </Button>
              ))}
              <Button
                type="button"
                size="xs"
                variant={isCustom ? 'default' : 'outline'}
                onClick={() => setIsCustom(true)}
                className="h-7 text-xs"
              >
                Custom
              </Button>
            </div>

            {isCustom && (
              <div className="flex gap-2 mt-2">
                <Input
                  type="number"
                  min="1"
                  value={customDuration}
                  onChange={(e) => setCustomDuration(e.target.value)}
                  placeholder="e.g. 12"
                  className="h-8"
                  autoFocus
                />
                <select
                  value={customUnit}
                  onChange={(e) =>
                    setCustomUnit(e.target.value as 'hours' | 'days')
                  }
                  className="h-8 rounded-md border border-zinc-200 bg-white px-2.5 text-xs text-zinc-800 shadow-2xs dark:border-zinc-800 dark:bg-zinc-950/60 dark:text-zinc-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400"
                >
                  <option value="hours">Hours</option>
                  <option value="days">Days</option>
                </select>
              </div>
            )}
          </div>

          {/* Start Date/Time */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              <Calendar className="h-3 w-3 text-zinc-400" />
              Start Date & Time
            </label>
            <Input
              type="datetime-local"
              value={startDateTime}
              onChange={(e) => setStartDateTime(e.target.value)}
              className="h-8 font-mono"
            />
          </div>

          {/* Calculated Reset Date */}
          <div className="rounded-lg border border-zinc-200/80 bg-zinc-50 p-2.5 dark:border-zinc-800/80 dark:bg-zinc-950/50">
            <div className="flex items-center gap-1 text-[11px] text-zinc-500 mb-0.5">
              <Clock className="h-3 w-3" />
              <span>Calculated Reset Time</span>
            </div>
            <p className="text-xs font-semibold font-mono text-zinc-900 dark:text-zinc-100">
              {formatDateTime(resetDate.toISOString())}
            </p>
          </div>

          {/* Footer */}
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Start Timer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
