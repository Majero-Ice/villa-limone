'use client';

import { useState, useEffect } from 'react';
import { Calendar, Save } from 'lucide-react';
import { Button } from '@/shared/ui';
import { documentApi, CrawlSchedule } from '@/entities/document';
import { formatDate } from '@/shared/lib/formatDate';

export function CrawlScheduleForm() {
  const [schedule, setSchedule] = useState<CrawlSchedule | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    try {
      const data = await documentApi.getCrawlSchedule();
      setSchedule(data);
    } catch (err: any) {
      setError('Failed to load schedule');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedule) return;

    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const updated = await documentApi.updateCrawlSchedule(schedule);
      setSchedule(updated);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError('Failed to update schedule');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-soft p-6">
        <div className="text-warm-gray">Loading schedule...</div>
      </div>
    );
  }

  if (!schedule) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-soft p-6">
      <h3 className="text-lg font-semibold text-graphite mb-4 flex items-center gap-2">
        <Calendar size={20} />
        Auto-Crawl Schedule
      </h3>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="enabled"
            checked={schedule.enabled}
            onChange={(e) => setSchedule({ ...schedule, enabled: e.target.checked })}
            className="w-4 h-4 text-terracotta rounded focus:ring-terracotta"
          />
          <label htmlFor="enabled" className="text-graphite font-medium">
            Enable automatic crawling
          </label>
        </div>

        {schedule.enabled && (
          <>
            <div>
              <label className="block text-sm font-medium text-graphite mb-2">Frequency</label>
              <select
                value={schedule.frequency}
                onChange={(e) =>
                  setSchedule({
                    ...schedule,
                    frequency: e.target.value as 'daily' | 'weekly' | 'monthly',
                  })
                }
                className="w-full px-4 py-2 border border-soft-beige rounded-lg focus:outline-none focus:ring-2 focus:ring-terracotta"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-graphite mb-2">Source URL</label>
              <input
                type="url"
                value={schedule.sourceUrl}
                onChange={(e) => setSchedule({ ...schedule, sourceUrl: e.target.value })}
                placeholder="https://example.com"
                className="w-full px-4 py-2 border border-soft-beige rounded-lg focus:outline-none focus:ring-2 focus:ring-terracotta"
              />
            </div>

            {schedule.lastRun && (
              <div className="text-sm text-warm-gray">
                Last run: {formatDate(schedule.lastRun)}
              </div>
            )}

            {schedule.nextRun && (
              <div className="text-sm text-warm-gray">
                Next run: {formatDate(schedule.nextRun)}
              </div>
            )}
          </>
        )}

        {error && (
          <div className="text-danger text-sm bg-danger/10 p-3 rounded-lg">{error}</div>
        )}

        {success && (
          <div className="text-success text-sm bg-success/10 p-3 rounded-lg">
            Schedule updated successfully
          </div>
        )}

        <Button type="submit" disabled={isSaving} className="w-full">
          <Save size={16} className="mr-2" />
          {isSaving ? 'Saving...' : 'Save Schedule'}
        </Button>
      </div>
    </form>
  );
}
