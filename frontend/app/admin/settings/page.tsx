'use client';

import { useState, useEffect } from 'react';
import { AdminHeader } from '@/widgets/admin';
import { BotSettings, botSettingsApi, UpdateBotSettingsRequest } from '@/entities/bot-settings';
import { Button } from '@/shared/ui';
import { formatDateTime } from '@/shared/lib/formatDate';
import { useToastStore } from '@/shared/lib/toast.store';

export default function SettingsPage() {
  const toast = useToastStore();
  const [botSettings, setBotSettings] = useState<BotSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [systemPrompt, setSystemPrompt] = useState('');
  const [enableBooking, setEnableBooking] = useState(true);
  const [enableRecommendations, setEnableRecommendations] = useState(true);
  const [enableAvailability, setEnableAvailability] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const settings = await botSettingsApi.get();
        setBotSettings(settings);
        setSystemPrompt(settings.systemPrompt);
        setEnableBooking(settings.enableBooking);
        setEnableRecommendations(settings.enableRecommendations);
        setEnableAvailability(settings.enableAvailability);
      } catch (error) {
        console.error('Failed to load settings:', error);
        toast.error('Failed to load settings');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [toast]);

  const handleSaveBotSettings = async () => {
    setIsSaving(true);
    try {
      const update: UpdateBotSettingsRequest = {
        systemPrompt,
        enableBooking,
        enableRecommendations,
        enableAvailability,
      };
      const updated = await botSettingsApi.update(update);
      setBotSettings(updated);
      toast.success('Bot settings saved successfully');
    } catch (error) {
      console.error('Failed to save bot settings:', error);
      toast.error('Failed to save bot settings');
    } finally {
      setIsSaving(false);
    }
  };


  if (isLoading) {
    return (
      <>
        <AdminHeader />
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="card-base p-12 text-center">
              <p className="text-warm-gray">Loading settings...</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <AdminHeader />
      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-serif text-graphite mb-6">Settings</h1>

          <div className="card-base p-6 space-y-6">
            <div>
              <h2 className="text-xl font-serif text-graphite mb-4">System Prompt</h2>
              <textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                className="w-full h-64 p-4 border border-soft-beige rounded-lg font-mono text-sm text-graphite bg-ivory"
                placeholder="Enter system prompt..."
              />
              {botSettings && (
                <p className="text-sm text-warm-gray mt-2">
                  Last updated: {formatDateTime(botSettings.updatedAt)}
                </p>
              )}
            </div>

            <div>
              <h2 className="text-xl font-serif text-graphite mb-4">Features</h2>
              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableBooking}
                    onChange={(e) => setEnableBooking(e.target.checked)}
                    className="w-5 h-5 text-terracotta rounded border-soft-beige focus:ring-terracotta"
                  />
                  <span className="text-graphite">Enable Booking</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableRecommendations}
                    onChange={(e) => setEnableRecommendations(e.target.checked)}
                    className="w-5 h-5 text-terracotta rounded border-soft-beige focus:ring-terracotta"
                  />
                  <span className="text-graphite">Enable Recommendations</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableAvailability}
                    onChange={(e) => setEnableAvailability(e.target.checked)}
                    className="w-5 h-5 text-terracotta rounded border-soft-beige focus:ring-terracotta"
                  />
                  <span className="text-graphite">Enable Availability Check</span>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-soft-beige">
              <Button
                variant="primary"
                onClick={handleSaveBotSettings}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Bot Settings'}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
