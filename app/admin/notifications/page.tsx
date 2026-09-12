'use client';

import { useCallback, useEffect, useState } from 'react';
import { Bell, RefreshCw } from 'lucide-react';
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

export default function NotificationsPage() {
  const [records, setRecords] = useState<NotificationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [channelFilter, setChannelFilter] = useState('');

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: '100' });
    if (statusFilter) params.set('status', statusFilter);
    if (channelFilter) params.set('channel', channelFilter);
    const response = await fetchApi(`/notifications?${params.toString()}`);
    if (response.success) setRecords(response.data);
    setLoading(false);
  }, [statusFilter, channelFilter]);

  useEffect(() => { loadNotifications(); }, [loadNotifications]);

  async function retryNotification(id: string) {
    await fetchApi(`/notifications/${id}/retry`, { method: 'POST' });
    await loadNotifications();
  }

  return (
    <main className="min-h-screen bg-[#E8EEE0] p-4 text-[#1E201D] sm:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#4D583F] text-white"><Bell className="h-5 w-5" /></div>
            <div><h1 className="text-2xl font-black">Notification History</h1><p className="text-sm text-[#61665D]">Email and Telegram delivery status.</p></div>
          </div>
          <div className="flex flex-wrap items-center gap-2"><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-xl bg-white px-3 py-2 text-sm"><option value="">All statuses</option><option value="Sent">Sent</option><option value="Failed">Failed</option><option value="Pending">Pending</option></select><select value={channelFilter} onChange={(event) => setChannelFilter(event.target.value)} className="rounded-xl bg-white px-3 py-2 text-sm"><option value="">All channels</option><option value="customer-email">Customer email</option><option value="admin-email">Admin email</option><option value="telegram">Telegram</option></select><button onClick={loadNotifications} className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold shadow-sm"><RefreshCw className="h-4 w-4" /> Refresh</button></div>
        </header>

        <div className="overflow-x-auto rounded-2xl border border-[#4F534C]/15 bg-white shadow-sm">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="border-b border-[#4F534C]/10 bg-[#F5F7F0] text-xs uppercase text-[#61665D]"><tr><th className="px-5 py-4">Event</th><th className="px-5 py-4">Channel</th><th className="px-5 py-4">Recipient</th><th className="px-5 py-4">Status</th><th className="px-5 py-4">Attempts</th><th className="px-5 py-4">Created</th><th className="px-5 py-4">Action</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={7} className="px-5 py-10 text-center text-[#61665D]">Loading notifications...</td></tr> : records.map((record) => (
                <tr key={record._id} className="border-b border-[#4F534C]/10 last:border-0"><td className="px-5 py-4"><div className="font-bold">{record.eventType}</div><div className="text-xs text-[#61665D]">{record.subject}</div></td><td className="px-5 py-4">{record.channel}</td><td className="px-5 py-4">{record.recipient}</td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${record.status === 'Sent' ? 'bg-emerald-100 text-emerald-800' : record.status === 'Failed' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>{record.status}</span>{record.lastError && <div className="mt-1 max-w-xs text-xs text-red-700">{record.lastError}</div>}</td><td className="px-5 py-4">{record.attempts}</td><td className="px-5 py-4 text-xs text-[#61665D]">{new Date(record.createdAt).toLocaleString('en-IN')}</td><td className="px-5 py-4">{record.status === 'Failed' && <button onClick={() => retryNotification(record._id)} className="rounded-lg bg-[#4D583F] px-3 py-2 text-xs font-bold text-white">Retry</button>}</td></tr>
              ))}
              {!loading && records.length === 0 && <tr><td colSpan={7} className="px-5 py-10 text-center text-[#61665D]">No notifications recorded yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
