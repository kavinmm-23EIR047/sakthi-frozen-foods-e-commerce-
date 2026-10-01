'use client';

import { useCallback, useEffect, useState } from 'react';
import { Bell, RefreshCw, Send, CheckCircle2, AlertTriangle, MessageSquare, Info, ShieldCheck } from 'lucide-react';
import { fetchApi } from '@/lib/apiConfig';

type NotificationRecord = {
  _id: string;
  eventType: string;
  channel: string;
  recipient: string;
  subject: string;
  status: 'Pending' | 'Sent' | 'Failed';
  attempts: number;
  lastError?: string;
  createdAt: string;
  sentAt?: string;
};

type TelegramStatus = {
  configured: boolean;
  tokenConfigured: boolean;
  chatIdConfigured: boolean;
  chatId: string | null;
  valid?: boolean;
  bot?: {
    id: number;
    first_name: string;
    username: string;
  };
  error?: string;
  isFullyConfigured: boolean;
};

type TelegramChat = {
  id: number;
  type: string;
  title: string | null;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
};

export default function NotificationsPage() {
  const [records, setRecords] = useState<NotificationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [channelFilter, setChannelFilter] = useState('');

  // Telegram Status & Testing State
  const [telegramStatus, setTelegramStatus] = useState<TelegramStatus | null>(null);
  const [testingTelegram, setTestingTelegram] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [recentChats, setRecentChats] = useState<TelegramChat[]>([]);
  const [loadingChats, setLoadingChats] = useState(false);
  const [showSetupGuide, setShowSetupGuide] = useState(false);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: '100' });
    if (statusFilter) params.set('status', statusFilter);
    if (channelFilter) params.set('channel', channelFilter);
    const response = await fetchApi(`/notifications?${params.toString()}`);
    if (response?.success) setRecords(response.data || []);
    setLoading(false);
  }, [statusFilter, channelFilter]);

  const loadTelegramStatus = useCallback(async () => {
    try {
      const res = await fetchApi('/notifications/telegram-status');
      if (res?.success) {
        setTelegramStatus(res.data);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    loadNotifications();
    loadTelegramStatus();
  }, [loadNotifications, loadTelegramStatus]);

  async function handleSendTestTelegram() {
    setTestingTelegram(true);
    setTestResult(null);
    try {
      const res = await fetchApi('/notifications/test-telegram', { method: 'POST' });
      if (res?.success) {
        setTestResult({ success: true, message: 'Test message sent to Telegram successfully! Check your Telegram app.' });
        loadNotifications();
      } else {
        setTestResult({ success: false, message: res?.error || 'Failed to send test notification.' });
      }
    } catch (err: unknown) {
      setTestResult({
        success: false,
        message: err instanceof Error ? err.message : 'Error sending Telegram message.',
      });
    } finally {
      setTestingTelegram(false);
    }
  }

  async function handleFindRecentChats() {
    setLoadingChats(true);
    try {
      const res = await fetchApi('/notifications/telegram-updates');
      if (res?.success && Array.isArray(res.recentChats)) {
        setRecentChats(res.recentChats);
      }
    } catch {
      // ignore
    } finally {
      setLoadingChats(false);
    }
  }

  async function retryNotification(id: string) {
    await fetchApi(`/notifications/${id}/retry`, { method: 'POST' });
    await loadNotifications();
  }

  return (
    <main className="min-h-screen bg-[#E8EEE0] p-4 text-[#1E201D] sm:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        
        {/* Header */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#656B4F] text-white shadow-sm">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">Notification System</h1>
              <p className="text-sm text-[#61665D]">Instant admin order alerts via Email and Telegram.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-[#4F534C]/20 bg-white px-3 py-2 text-sm font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-[#656B4F]"
            >
              <option value="">All statuses</option>
              <option value="Sent">Sent</option>
              <option value="Failed">Failed</option>
              <option value="Pending">Pending</option>
            </select>
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="rounded-xl border border-[#4F534C]/20 bg-white px-3 py-2 text-sm font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-[#656B4F]"
            >
              <option value="">All channels</option>
              <option value="customer-email">Customer email</option>
              <option value="admin-email">Admin email</option>
              <option value="telegram">Telegram</option>
            </select>
            <button
              onClick={() => { loadNotifications(); loadTelegramStatus(); }}
              className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold text-[#1E201D] shadow-sm transition hover:bg-[#F5F7F0]"
            >
              <RefreshCw className="h-4 w-4" /> Refresh
            </button>
          </div>
        </header>

        {/* Integration Status Cards */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          
          {/* Email Integration Card */}
          <div className="rounded-2xl border border-[#4F534C]/15 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-[#4F534C]/10">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EAF0E5] text-[#656B4F]">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1E201D]">Email Notifications</h3>
                  <p className="text-xs text-[#61665D]">Brevo SMTP / Resend</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EAF0E5] px-3 py-1 text-xs font-bold text-[#50563D] border border-[#656B4F]/20">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#656B4F]" /> Active
              </span>
            </div>
            <div className="mt-4 space-y-2 text-xs text-[#61665D]">
              <div className="flex justify-between">
                <span>Admin Alerts Recipient:</span>
                <span className="font-semibold text-[#1E201D]">sakthifrozenfoods@gmail.com</span>
              </div>
              <div className="flex justify-between">
                <span>Customer Order Confirmations:</span>
                <span className="font-semibold text-[#656B4F]">Enabled (HTML Invoice Template)</span>
              </div>
            </div>
          </div>

          {/* Telegram Integration Card */}
          <div className="rounded-2xl border border-[#4F534C]/15 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-[#4F534C]/10">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1E201D]">Telegram Admin Alerts</h3>
                  <p className="text-xs text-[#61665D]">Instant mobile order notifications</p>
                </div>
              </div>
              {telegramStatus?.valid && telegramStatus?.chatIdConfigured ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EAF0E5] px-3 py-1 text-xs font-bold text-[#50563D] border border-[#656B4F]/20">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#656B4F]" /> Connected
                </span>
              ) : telegramStatus?.valid && !telegramStatus?.chatIdConfigured ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                  <AlertTriangle className="h-3.5 w-3.5" /> Needs Chat ID
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                  <AlertTriangle className="h-3.5 w-3.5" /> Setup Required
                </span>
              )}
            </div>

            <div className="mt-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#61665D]">Bot Status:</span>
                <span className="font-semibold text-[#1E201D]">
                  {telegramStatus?.valid
                    ? `Active (@${telegramStatus.bot?.username || 'Bot'})`
                    : telegramStatus?.tokenConfigured
                    ? 'Token configured (Check validity)'
                    : 'Not Configured'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#61665D]">Admin Chat ID:</span>
                <span className="font-semibold text-[#1E201D]">
                  {telegramStatus?.chatIdConfigured ? telegramStatus.chatId : 'Missing in .env (TELEGRAM_CHAT_ID)'}
                </span>
              </div>
            </div>

            {/* Test & Setup Action Buttons */}
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={handleSendTestTelegram}
                disabled={testingTelegram}
                className="flex items-center gap-1.5 rounded-xl bg-[#656B4F] px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-[#50563D] disabled:opacity-50"
              >
                <Send className="h-3.5 w-3.5" />
                {testingTelegram ? 'Sending Test...' : 'Send Test Notification'}
              </button>
              
              <button
                onClick={() => setShowSetupGuide(!showSetupGuide)}
                className="flex items-center gap-1.5 rounded-xl border border-[#4F534C]/20 bg-[#F9FAF6] px-3.5 py-1.5 text-xs font-bold text-[#1E201D] transition hover:bg-[#f0f2eb]"
              >
                <Info className="h-3.5 w-3.5 text-[#656B4F]" />
                {showSetupGuide ? 'Hide Instructions' : 'Setup Instructions'}
              </button>

              <button
                onClick={handleFindRecentChats}
                disabled={loadingChats}
                className="flex items-center gap-1.5 rounded-xl border border-[#4F534C]/20 bg-[#F9FAF6] px-3.5 py-1.5 text-xs font-bold text-[#61665D] transition hover:bg-[#f0f2eb]"
              >
                {loadingChats ? 'Scanning...' : 'Find Chat ID'}
              </button>
            </div>

            {/* Test Feedback */}
            {testResult && (
              <div
                className={`mt-3 rounded-xl p-3 text-xs font-medium ${
                  testResult.success
                    ? 'bg-[#EAF0E5] text-[#50563D] border border-[#656B4F]/30'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {testResult.message}
              </div>
            )}

            {/* Recent Chats Found */}
            {recentChats.length > 0 && (
              <div className="mt-3 rounded-xl border border-sky-200 bg-sky-50 p-3 text-xs text-sky-900">
                <p className="font-bold mb-1.5">Discovered Chat IDs from your Telegram Bot:</p>
                <ul className="space-y-1">
                  {recentChats.map((c) => (
                    <li key={c.id} className="flex items-center justify-between bg-white/70 p-1.5 rounded-lg">
                      <span>{c.firstName || c.title || c.username || 'User'} ({c.type})</span>
                      <code className="font-mono font-bold text-sky-800 select-all">TELEGRAM_CHAT_ID={c.id}</code>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Telegram Setup Guide (Collapsible) */}
        {showSetupGuide && (
          <div className="rounded-2xl border border-[#656B4F]/30 bg-white p-6 shadow-sm">
            <h3 className="text-base font-black text-[#1E201D] mb-2 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-[#656B4F]" />
              How to Setup Telegram Admin Notifications in 3 Simple Steps:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-[#61665D] mt-4">
              <div className="rounded-xl border border-[#4F534C]/10 bg-[#F9FAF6] p-4 space-y-2">
                <div className="font-black text-sm text-[#1E201D]">Step 1: Get Bot Token</div>
                <p>1. Open Telegram &amp; search for <b>@BotFather</b></p>
                <p>2. Send <code>/newbot</code> and follow prompts to give it a name</p>
                <p>3. Copy the <b>HTTP API Token</b> (e.g. <code>123456789:ABCdef...</code>)</p>
              </div>

              <div className="rounded-xl border border-[#4F534C]/10 bg-[#F9FAF6] p-4 space-y-2">
                <div className="font-black text-sm text-[#1E201D]">Step 2: Start Bot &amp; Get Chat ID</div>
                <p>1. Open your new bot in Telegram &amp; tap <b>Start</b></p>
                <p>2. Search for <b>@userinfobot</b> or <b>@RawDataBot</b> in Telegram</p>
                <p>3. It will give you your numeric <b>Id</b> (e.g. <code>987654321</code>)</p>
              </div>

              <div className="rounded-xl border border-[#4F534C]/10 bg-[#F9FAF6] p-4 space-y-2">
                <div className="font-black text-sm text-[#1E201D]">Step 3: Add to .env &amp; Test</div>
                <p>1. Add to <code>backend/.env</code>:</p>
                <code className="block bg-white p-1.5 rounded border border-[#4F534C]/15 font-mono text-[11px] text-[#1E201D]">
                  TELEGRAM_BOT_TOKEN=your_token<br />
                  TELEGRAM_CHAT_ID=your_chat_id
                </code>
                <p>2. Click <b>Send Test Notification</b> above to verify!</p>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Table */}
        <div className="overflow-x-auto rounded-2xl border border-[#4F534C]/15 bg-white shadow-sm">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="border-b border-[#4F534C]/10 bg-[#F5F7F0] text-xs uppercase text-[#61665D]">
              <tr>
                <th className="px-5 py-4">Event</th>
                <th className="px-5 py-4">Channel</th>
                <th className="px-5 py-4">Recipient</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Attempts</th>
                <th className="px-5 py-4">Created</th>
                <th className="px-5 py-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-[#61665D]">
                    Loading notifications...
                  </td>
                </tr>
              ) : records.map((record) => (
                <tr key={record._id} className="border-b border-[#4F534C]/10 last:border-0 hover:bg-[#FDFEFD] transition">
                  <td className="px-5 py-4">
                    <div className="font-bold text-[#1E201D]">{record.eventType}</div>
                    <div className="text-xs text-[#61665D] line-clamp-1">{record.subject}</div>
                  </td>
                  <td className="px-5 py-4 font-medium">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                      record.channel === 'telegram'
                        ? 'bg-sky-100 text-sky-800'
                        : record.channel === 'admin-email'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-[#EAF0E5] text-[#50563D] border border-[#656B4F]/20'
                    }`}>
                      {record.channel}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs font-mono text-[#61665D]">{record.recipient}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                        record.status === 'Sent'
                          ? 'bg-[#EAF0E5] text-[#50563D] border border-[#656B4F]/20'
                          : record.status === 'Failed'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {record.status}
                    </span>
                    {record.lastError && (
                      <div className="mt-1 max-w-xs text-xs text-red-700 line-clamp-2" title={record.lastError}>
                        {record.lastError}
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-4 font-semibold text-center">{record.attempts}</td>
                  <td className="px-5 py-4 text-xs text-[#61665D]">
                    {new Date(record.createdAt).toLocaleString('en-IN', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                      timeZone: 'Asia/Kolkata',
                    })}
                  </td>
                  <td className="px-5 py-4">
                    {record.status === 'Failed' && (
                      <button
                        onClick={() => retryNotification(record._id)}
                        className="rounded-lg bg-[#656B4F] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[#52573f]"
                      >
                        Retry
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {!loading && records.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-[#61665D]">
                    No notifications recorded yet. Place a test order to see logs here.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
