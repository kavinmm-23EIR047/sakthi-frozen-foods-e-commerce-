'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import {
  isPushNotificationSupported,
  getNotificationPermission,
  getExistingPushSubscription,
  subscribeToWebPush,
  unsubscribeFromWebPush,
  sendTestWebPush,
  updateWebPushPreferences,
} from '@/lib/pushNotification';
import { fetchApi } from '@/lib/apiConfig';
import {
  Bell,
  BellRing,
  BellOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Send,
  ShieldAlert,
  Smartphone,
  Check,
  X,
  SlidersHorizontal,
} from 'lucide-react';

interface NotificationPreferences {
  orderUpdates: boolean;
  paymentUpdates: boolean;
  deliveryUpdates: boolean;
  promotional: boolean;
}

export default function NotificationManager({ className = '' }: { className?: string }) {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [supported, setSupported] = useState<boolean>(true);
  const [supportReason, setSupportReason] = useState<string>('');
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [testingLoading, setTestingLoading] = useState<boolean>(false);
  const [showPreferences, setShowPreferences] = useState<boolean>(false);
  const [showBlockedGuide, setShowBlockedGuide] = useState<boolean>(false);

  const [preferences, setPreferences] = useState<NotificationPreferences>({
    orderUpdates: true,
    paymentUpdates: true,
    deliveryUpdates: true,
    promotional: false,
  });

  // Check support and active status on mount
  useEffect(() => {
    const checkStatus = async () => {
      const support = isPushNotificationSupported();
      setSupported(support.supported);
      if (!support.supported) {
        setSupportReason(support.reason || 'Browser notifications are not supported.');
        setPermission('unsupported');
        setLoading(false);
        return;
      }

      const perm = getNotificationPermission();
      setPermission(perm);

      try {
        const sub = await getExistingPushSubscription();
        setIsSubscribed(Boolean(sub));

        // If user is logged in, sync preferences from backend
        if (user) {
          const statusRes = await fetchApi<any>('/notifications/status');
          if (statusRes.success && statusRes.data) {
            if (statusRes.data.preferences) {
              setPreferences(statusRes.data.preferences);
            }
            if (statusRes.data.isSubscribed !== undefined) {
              setIsSubscribed(statusRes.data.isSubscribed && Boolean(sub));
            }
          }
        }
      } catch (e) {
        console.error('Error fetching notification status:', e);
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, [user]);

  // Toggle push notifications
  const handleToggleSubscription = async () => {
    if (!user) {
      showToast('Please sign in to enable push notifications for your account.', 'info');
      return;
    }

    if (permission === 'denied') {
      setShowBlockedGuide(true);
      return;
    }

    setActionLoading(true);
    try {
      if (isSubscribed) {
        const res = await unsubscribeFromWebPush();
        if (res.success) {
          setIsSubscribed(false);
          showToast('Web push notifications have been disabled.', 'info');
        } else {
          showToast(res.error || 'Failed to disable notifications', 'error');
        }
      } else {
        const res = await subscribeToWebPush(preferences);
        if (res.success) {
          setIsSubscribed(true);
          setPermission('granted');
          showToast('🔔 Push notifications enabled successfully!', 'success');
        } else {
          setPermission(res.permission || getNotificationPermission());
          if (res.permission === 'denied') {
            setShowBlockedGuide(true);
          }
          showToast(res.error || 'Could not enable notifications.', 'error');
        }
      }
    } catch (err: any) {
      showToast(err.message || 'An unexpected error occurred.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Trigger real test push notification
  const handleTestNotification = async () => {
    if (!user) {
      showToast('Please sign in to send a test notification.', 'info');
      return;
    }

    setTestingLoading(true);
    try {
      const res = await sendTestWebPush();
      if (res.success) {
        showToast('🔔 Test notification sent! Check your system notification tray.', 'success');
      } else {
        showToast(res.error || 'Test notification failed. Ensure notifications are enabled on this browser.', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error triggering test notification.', 'error');
    } finally {
      setTestingLoading(false);
    }
  };

  // Update preferences
  const handlePreferenceChange = async (key: keyof NotificationPreferences, value: boolean) => {
    const updated = { ...preferences, [key]: value };
    setPreferences(updated);

    if (user && isSubscribed) {
      try {
        await updateWebPushPreferences(updated);
        showToast('Preferences updated.', 'success');
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <div className={`rounded-3xl border border-[#D4DBC9] bg-white p-5 sm:p-6 shadow-xs overflow-hidden transition-all ${className}`}>
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAF0E5] pb-5">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl shrink-0 transition-colors ${
            isSubscribed ? 'bg-[#656B4F] text-white shadow-md' : 'bg-[#EAF0E5] text-[#50563D]'
          }`}>
            {isSubscribed ? <BellRing className="h-6 w-6 animate-pulse" /> : <Bell className="h-6 w-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-black text-[#1A1E16] font-poppins">
                Browser System Notifications
              </h3>
              {/* Dynamic Status Badge */}
              {loading ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-stone-100 text-stone-600">
                  <Loader2 className="w-3 h-3 animate-spin" /> Checking...
                </span>
              ) : !supported ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-stone-100 text-stone-600 border border-stone-200">
                  <AlertCircle className="w-3 h-3 text-stone-400" /> Not Supported
                </span>
              ) : permission === 'denied' ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-100 text-red-800 border border-red-200">
                  <BellOff className="w-3 h-3 text-red-600" /> Blocked in Browser
                </span>
              ) : isSubscribed ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#EAF0E5] text-[#2D3823] border border-[#656B4F]/30">
                  <span className="w-2 h-2 rounded-full bg-[#656B4F] animate-ping shrink-0" />
                  Notifications: ON
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-800 border border-amber-200">
                  <Bell className="w-3 h-3 text-amber-600" /> Notifications: OFF
                </span>
              )}
            </div>
            <p className="text-xs font-semibold text-[#50563D] mt-1 leading-relaxed">
              Receive real-time desktop & mobile browser alerts for order confirmations, payments, and cold-chain delivery milestones.
            </p>
          </div>
        </div>

        {/* Action Button */}
        {supported && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleToggleSubscription}
              disabled={actionLoading || loading}
              className={`px-4 py-2.5 rounded-xl font-black text-xs transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
                isSubscribed
                  ? 'border border-red-200 bg-red-50 text-red-800 hover:bg-red-100'
                  : 'bg-[#656B4F] hover:bg-[#50563D] text-white'
              }`}
            >
              {actionLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                  <span>{isSubscribed ? 'Disabling...' : 'Enabling...'}</span>
                </>
              ) : isSubscribed ? (
                <>
                  <BellOff className="w-4 h-4 shrink-0" />
                  <span>Disable Notifications</span>
                </>
              ) : (
                <>
                  <BellRing className="w-4 h-4 shrink-0" />
                  <span>Enable Notifications</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Unblock Guidance Notice (When permission is 'denied') */}
      {showBlockedGuide && permission === 'denied' && (
        <div className="mt-4 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs space-y-2 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-black text-amber-950">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>How to Unblock Notifications</span>
            </div>
            <button
              onClick={() => setShowBlockedGuide(false)}
              className="text-amber-700 hover:text-amber-900 p-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-amber-900 leading-relaxed">
            Your browser has blocked notifications for this website. To enable them:
          </p>
          <ol className="list-decimal list-inside space-y-1 text-amber-950 font-bold pl-1">
            <li>Click the <strong>Lock / Padlock / Settings icon</strong> in your browser&apos;s address bar.</li>
            <li>Find <strong>Notifications</strong> and change the setting to <strong>Allow</strong>.</li>
            <li>Refresh this page and click <strong>Enable Notifications</strong>.</li>
          </ol>
        </div>
      )}

      {/* Unsupported Browser Notice */}
      {!supported && (
        <div className="mt-4 p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-600 space-y-1">
          <p className="font-bold text-stone-800 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-stone-500" />
            Web Push is not available in this browser
          </p>
          <p>{supportReason || 'Please use modern Google Chrome, Microsoft Edge, Mozilla Firefox, or Safari on iOS 16.4+.'}</p>
        </div>
      )}

      {/* Interactive Controls & Preferences (Active when subscribed) */}
      {isSubscribed && (
        <div className="mt-5 space-y-4 pt-1">
          {/* Quick Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#F9FAF6] p-3.5 rounded-2xl border border-[#D4DBC9]/60">
            <div className="flex items-center gap-2 text-xs font-black text-[#50563D]">
              <Smartphone className="w-4 h-4 text-[#656B4F]" />
              <span>Registered Browser Device Active</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowPreferences(!showPreferences)}
                className="px-3 py-1.5 rounded-lg border border-[#D4DBC9] bg-white hover:bg-[#EAF0E5] text-xs font-bold text-[#50563D] transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>{showPreferences ? 'Hide Preferences' : 'Preferences'}</span>
              </button>

              <button
                type="button"
                onClick={handleTestNotification}
                disabled={testingLoading}
                className="px-3 py-1.5 rounded-lg bg-[#656B4F] hover:bg-[#50563D] text-white text-xs font-black transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
              >
                {testingLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Test Push</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Granular Notification Preferences */}
          {showPreferences && (
            <div className="p-4 rounded-2xl bg-[#F4F7EE] border border-[#D4DBC9] space-y-3 animate-in fade-in duration-200">
              <p className="text-xs font-black uppercase tracking-wider text-[#50563D]">
                Customize Push Alert Types
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Order Updates */}
                <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white border border-[#D4DBC9]/70 cursor-pointer select-none hover:border-[#656B4F] transition-colors">
                  <input
                    type="checkbox"
                    checked={preferences.orderUpdates}
                    onChange={(e) => handlePreferenceChange('orderUpdates', e.target.checked)}
                    className="w-4 h-4 rounded text-[#656B4F] accent-[#656B4F] focus:ring-[#656B4F]"
                  />
                  <div>
                    <p className="font-extrabold text-[#1A1E16]">Order Updates</p>
                    <p className="text-[11px] text-[#61665D]">Placement, confirmations & cancellations</p>
                  </div>
                </label>

                {/* Payment Updates */}
                <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white border border-[#D4DBC9]/70 cursor-pointer select-none hover:border-[#656B4F] transition-colors">
                  <input
                    type="checkbox"
                    checked={preferences.paymentUpdates}
                    onChange={(e) => handlePreferenceChange('paymentUpdates', e.target.checked)}
                    className="w-4 h-4 rounded text-[#656B4F] accent-[#656B4F] focus:ring-[#656B4F]"
                  />
                  <div>
                    <p className="font-extrabold text-[#1A1E16]">Payment Updates</p>
                    <p className="text-[11px] text-[#61665D]">Successful payments & verified receipts</p>
                  </div>
                </label>

                {/* Cold-Chain Delivery Updates */}
                <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white border border-[#D4DBC9]/70 cursor-pointer select-none hover:border-[#656B4F] transition-colors">
                  <input
                    type="checkbox"
                    checked={preferences.deliveryUpdates}
                    onChange={(e) => handlePreferenceChange('deliveryUpdates', e.target.checked)}
                    className="w-4 h-4 rounded text-[#656B4F] accent-[#656B4F] focus:ring-[#656B4F]"
                  />
                  <div>
                    <p className="font-extrabold text-[#1A1E16]">Cold-Chain Delivery</p>
                    <p className="text-[11px] text-[#61665D]">Dispatched, Out for Delivery, Delivered</p>
                  </div>
                </label>

                {/* Promotional Offers */}
                <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white border border-[#D4DBC9]/70 cursor-pointer select-none hover:border-[#656B4F] transition-colors">
                  <input
                    type="checkbox"
                    checked={preferences.promotional}
                    onChange={(e) => handlePreferenceChange('promotional', e.target.checked)}
                    className="w-4 h-4 rounded text-[#656B4F] accent-[#656B4F] focus:ring-[#656B4F]"
                  />
                  <div>
                    <p className="font-extrabold text-[#1A1E16]">Special Offers</p>
                    <p className="text-[11px] text-[#61665D]">Seasonal discounts & fresh stock arrivals</p>
                  </div>
                </label>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
