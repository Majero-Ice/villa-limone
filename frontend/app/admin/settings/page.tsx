'use client';

import { useState, useEffect } from 'react';
import { AdminHeader } from '@/widgets/admin';
import { BotSettings, botSettingsApi, UpdateBotSettingsRequest } from '@/entities/bot-settings';
import { QuickReply, quickReplyApi, CreateQuickReplyRequest, UpdateQuickReplyRequest } from '@/entities/quick-reply';
import { Button } from '@/shared/ui';
import { formatDateTime } from '@/shared/lib/formatDate';

export default function SettingsPage() {
  const [botSettings, setBotSettings] = useState<BotSettings | null>(null);
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'bot' | 'quick-replies'>('bot');

  const [systemPrompt, setSystemPrompt] = useState('');
  const [enableBooking, setEnableBooking] = useState(true);
  const [enableRecommendations, setEnableRecommendations] = useState(true);
  const [enableAvailability, setEnableAvailability] = useState(true);

  const [editingQuickReply, setEditingQuickReply] = useState<QuickReply | null>(null);
  const [newQuickReply, setNewQuickReply] = useState<CreateQuickReplyRequest>({
    trigger: '',
    response: '',
    isActive: true,
    sortOrder: 0,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [settings, replies] = await Promise.all([
          botSettingsApi.get(),
          quickReplyApi.getAll(),
        ]);
        setBotSettings(settings);
        setSystemPrompt(settings.systemPrompt);
        setEnableBooking(settings.enableBooking);
        setEnableRecommendations(settings.enableRecommendations);
        setEnableAvailability(settings.enableAvailability);
        setQuickReplies(replies);
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

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
      alert('Bot settings saved successfully');
    } catch (error) {
      console.error('Failed to save bot settings:', error);
      alert('Failed to save bot settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateQuickReply = async () => {
    if (!newQuickReply.trigger || !newQuickReply.response) {
      alert('Please fill in both trigger and response');
      return;
    }

    setIsSaving(true);
    try {
      const created = await quickReplyApi.create(newQuickReply);
      setQuickReplies([...quickReplies, created]);
      setNewQuickReply({ trigger: '', response: '', isActive: true, sortOrder: 0 });
      alert('Quick reply created successfully');
    } catch (error) {
      console.error('Failed to create quick reply:', error);
      alert('Failed to create quick reply');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateQuickReply = async (id: string, update: UpdateQuickReplyRequest) => {
    setIsSaving(true);
    try {
      const updated = await quickReplyApi.update(id, update);
      setQuickReplies(quickReplies.map((qr) => (qr.id === id ? updated : qr)));
      setEditingQuickReply(null);
      alert('Quick reply updated successfully');
    } catch (error) {
      console.error('Failed to update quick reply:', error);
      alert('Failed to update quick reply');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteQuickReply = async (id: string) => {
    if (!confirm('Are you sure you want to delete this quick reply?')) {
      return;
    }

    setIsSaving(true);
    try {
      await quickReplyApi.delete(id);
      setQuickReplies(quickReplies.filter((qr) => qr.id !== id));
      alert('Quick reply deleted successfully');
    } catch (error) {
      console.error('Failed to delete quick reply:', error);
      alert('Failed to delete quick reply');
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

          <div className="mb-6 flex gap-4 border-b border-soft-beige">
            <button
              onClick={() => setActiveTab('bot')}
              className={`pb-4 px-2 font-medium ${
                activeTab === 'bot'
                  ? 'text-terracotta border-b-2 border-terracotta'
                  : 'text-warm-gray hover:text-graphite'
              }`}
            >
              Bot Settings
            </button>
            <button
              onClick={() => setActiveTab('quick-replies')}
              className={`pb-4 px-2 font-medium ${
                activeTab === 'quick-replies'
                  ? 'text-terracotta border-b-2 border-terracotta'
                  : 'text-warm-gray hover:text-graphite'
              }`}
            >
              Quick Replies
            </button>
          </div>

          {activeTab === 'bot' && (
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
          )}

          {activeTab === 'quick-replies' && (
            <div className="space-y-6">
              <div className="card-base p-6">
                <h2 className="text-xl font-serif text-graphite mb-4">Create Quick Reply</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-graphite mb-2">
                      Trigger
                    </label>
                    <input
                      type="text"
                      value={newQuickReply.trigger}
                      onChange={(e) =>
                        setNewQuickReply({ ...newQuickReply, trigger: e.target.value })
                      }
                      className="w-full p-3 border border-soft-beige rounded-lg text-graphite bg-ivory"
                      placeholder="e.g., hello, hi, greeting"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-graphite mb-2">
                      Response
                    </label>
                    <textarea
                      value={newQuickReply.response}
                      onChange={(e) =>
                        setNewQuickReply({ ...newQuickReply, response: e.target.value })
                      }
                      className="w-full h-32 p-3 border border-soft-beige rounded-lg text-graphite bg-ivory"
                      placeholder="Enter response text..."
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newQuickReply.isActive}
                        onChange={(e) =>
                          setNewQuickReply({ ...newQuickReply, isActive: e.target.checked })
                        }
                        className="w-4 h-4 text-terracotta rounded border-soft-beige"
                      />
                      <span className="text-sm text-graphite">Active</span>
                    </label>
                    <div>
                      <label className="block text-sm font-medium text-graphite mb-1">
                        Sort Order
                      </label>
                      <input
                        type="number"
                        value={newQuickReply.sortOrder}
                        onChange={(e) =>
                          setNewQuickReply({
                            ...newQuickReply,
                            sortOrder: parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-24 p-2 border border-soft-beige rounded-lg text-graphite bg-ivory"
                      />
                    </div>
                  </div>
                  <Button
                    variant="primary"
                    onClick={handleCreateQuickReply}
                    disabled={isSaving}
                  >
                    Create Quick Reply
                  </Button>
                </div>
              </div>

              <div className="card-base p-6">
                <h2 className="text-xl font-serif text-graphite mb-4">Quick Replies</h2>
                {quickReplies.length === 0 ? (
                  <p className="text-warm-gray">No quick replies found</p>
                ) : (
                  <div className="space-y-4">
                    {quickReplies.map((qr) => (
                      <div
                        key={qr.id}
                        className="p-4 border border-soft-beige rounded-lg bg-sand/30"
                      >
                        {editingQuickReply?.id === qr.id ? (
                          <div className="space-y-3">
                            <input
                              type="text"
                              value={editingQuickReply.trigger}
                              onChange={(e) =>
                                setEditingQuickReply({
                                  ...editingQuickReply,
                                  trigger: e.target.value,
                                })
                              }
                              className="w-full p-2 border border-soft-beige rounded text-graphite bg-ivory"
                            />
                            <textarea
                              value={editingQuickReply.response}
                              onChange={(e) =>
                                setEditingQuickReply({
                                  ...editingQuickReply,
                                  response: e.target.value,
                                })
                              }
                              className="w-full h-24 p-2 border border-soft-beige rounded text-graphite bg-ivory"
                            />
                            <div className="flex items-center gap-4">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={editingQuickReply.isActive}
                                  onChange={(e) =>
                                    setEditingQuickReply({
                                      ...editingQuickReply,
                                      isActive: e.target.checked,
                                    })
                                  }
                                  className="w-4 h-4 text-terracotta rounded"
                                />
                                <span className="text-sm text-graphite">Active</span>
                              </label>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  onClick={() =>
                                    handleUpdateQuickReply(qr.id, {
                                      trigger: editingQuickReply.trigger,
                                      response: editingQuickReply.response,
                                      isActive: editingQuickReply.isActive,
                                    })
                                  }
                                  disabled={isSaving}
                                >
                                  Save
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => setEditingQuickReply(null)}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <div className="font-medium text-graphite">
                                  Trigger: <span className="font-mono text-sm">{qr.trigger}</span>
                                </div>
                                <div className="text-sm text-warm-gray mt-1">
                                  {qr.isActive ? (
                                    <span className="text-success">Active</span>
                                  ) : (
                                    <span className="text-warm-gray">Inactive</span>
                                  )}
                                  {' • '}
                                  Sort: {qr.sortOrder}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  onClick={() => setEditingQuickReply({ ...qr })}
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => handleDeleteQuickReply(qr.id)}
                                  disabled={isSaving}
                                  className="text-danger border-danger hover:bg-danger hover:text-ivory"
                                >
                                  Delete
                                </Button>
                              </div>
                            </div>
                            <div className="text-graphite bg-ivory p-3 rounded border border-soft-beige">
                              {qr.response}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
