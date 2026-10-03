'use client';

import React, { useState, useEffect } from 'react';
import {
  isPushNotificationSupported,
  getNotificationPermission,
  getExistingPushSubscription,
  subscribeToWebPush,
} from '@/lib/pushNotification';
import { useToast } from '@/context/ToastContext';
import {
  Bell,
  BellRing,
  X,
  Loader2,
  ChevronRight,
} from 'lucide-react';

const DISMISS_STORAGE_KEY = 'sakthi_push_prompt_dismissed_until';
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export default function PushNotificationPrompt() {
  const { showToast } = useToast();
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [loading, setLoading] = useState<boolean>(false);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    const checkPushStatus = async () => {
      const support = isPushNotificationSupported();
      if (!support.supported) {
        setPermission('unsupported');
        return;
      }

      const perm = getNotificationPermission();
      setPermission(perm);

      // If already granted, check if active subscription exists
      if (perm === 'granted') {
        const sub = await getExistingPushSubscription();
        setIsSubscribed(Boolean(sub));
        return;
      }

      // If denied or unsupported, don't auto-popup
      if (perm === 'denied') return;

      // Check if user previously dismissed prompt
      const dismissedUntil = localStorage.getItem(DISMISS_STORAGE_KEY);
      if (dismissedUntil && Number(dismissedUntil) > Date.now()) {
        return;
      }

      // Show prompt after a pleasant 3.5s delay so the user first sees the storefront
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3500);

      return () => clearTimeout(timer);
    };

    checkPushStatus();
  }, []);

  const handleEnableNotifications = async () => {
    setLoading(true);
    try {
      const result = await subscribeToWebPush({
        orderUpdates: true,
        paymentUpdates: true,
        deliveryUpdates: true,
        promotional: true,
      });

      if (result.success) {
        setIsSubscribed(true);
        setPermission('granted');
        setIsVisible(false);
        showToast('🔔 Push Notifications enabled for Sakthi Frozen Foods!', 'success');
      } else {
        if (result.permission) {
          setPermission(result.permission);
        }
        if (result.permission === 'denied') {
          showToast('Notifications blocked in browser settings. Please allow notifications.', 'error');
          setIsVisible(false);
        } else {
          showToast(result.error || 'Could not enable notifications.', 'error');
        }
      }
    } catch (err: any) {
      showToast(err.message || 'An error occurred enabling notifications.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    try {
      localStorage.setItem(DISMISS_STORAGE_KEY, String(Date.now() + DISMISS_DURATION_MS));
    } catch {
      // ignore
    }
  };

  if (!isVisible || permission === 'unsupported' || permission === 'denied' || isSubscribed) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-3 sm:p-4 md:bottom-5 md:right-5 md:left-auto md:max-w-md pointer-events-none animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="pointer-events-auto bg-white border-2 border-[#50563D]/30 rounded-2xl shadow-2xl p-4 sm:p-5 text-[#1E201D] relative overflow-hidden backdrop-blur-md">
        {/* Decorative Top Accent Bar */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#50563D] via-[#656B4F] to-[#A9B896]" />

        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
          aria-label="Close notification prompt"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3.5 pt-1">
          {/* Bell Icon Badge */}
          <div className="w-10 h-10 rounded-xl bg-[#EAF0E5] border border-[#656B4F]/30 flex items-center justify-center shrink-0 shadow-2xs">
            <BellRing className="w-5 h-5 text-[#50563D] animate-bounce" />
          </div>

          <div className="space-y-1 pr-4">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#656B4F]">
                Instant Order Updates
              </span>
              <span className="inline-flex items-center px-1.5 py-0.2 bg-[#FAFBF7] border border-[#656B4F]/20 rounded text-[9px] font-bold text-[#50563D]">
                -18°C Cold Chain
              </span>
            </div>
            <h3 className="font-extrabold text-sm sm:text-base text-[#1E201D] leading-tight font-poppins">
              Get Live Delivery & Dispatch Alerts
            </h3>
            <p className="text-xs text-stone-600 leading-snug pt-0.5">
              Receive instant mobile notifications when your pure veg mock meats are packed and dispatched!
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex flex-col sm:flex-row items-center gap-2 pt-1 border-t border-stone-100">
          <button
            onClick={handleEnableNotifications}
            disabled={loading}
            className="w-full sm:flex-1 py-2.5 px-4 bg-[#50563D] hover:bg-[#3D4533] active:scale-[0.98] text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                <span>Enabling...</span>
              </>
            ) : (
              <>
                <Bell className="w-3.5 h-3.5 text-[#B4CEB1]" />
                <span>Allow Notifications</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>

          <button
            onClick={handleDismiss}
            className="w-full sm:w-auto py-2 px-3 text-xs font-bold text-stone-500 hover:text-stone-800 hover:bg-stone-50 rounded-xl transition-colors cursor-pointer text-center"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}
