'use client';

import { fetchApi } from './apiConfig';

/**
 * Convert standard/URL-safe base64 string to Uint8Array required by applicationServerKey
 */
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Detect browser and device Web Push capabilities
 */
export function isPushNotificationSupported(): { supported: boolean; reason?: string } {
  if (typeof window === 'undefined') {
    return { supported: false, reason: 'SSR' };
  }

  if (!('Notification' in window)) {
    return { supported: false, reason: 'Notification API is not supported in this browser.' };
  }

  if (!('serviceWorker' in navigator)) {
    return { supported: false, reason: 'Service Worker is not supported in this browser.' };
  }

  if (!('PushManager' in window)) {
    return { supported: false, reason: 'PushManager API is not supported in this browser.' };
  }

  return { supported: true };
}

/**
 * Get current browser notification permission
 */
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

/**
 * Register Service Worker for Web Push
 */
export async function registerPushServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!isPushNotificationSupported().supported) return null;

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });
    await navigator.serviceWorker.ready;
    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
}

/**
 * Get existing push subscription for this browser
 */
export async function getExistingPushSubscription(): Promise<PushSubscription | null> {
  if (!isPushNotificationSupported().supported) return null;

  try {
    const registration = await registerPushServiceWorker();
    if (!registration) return null;
    return await registration.pushManager.getSubscription();
  } catch (error) {
    console.error('Error checking existing push subscription:', error);
    return null;
  }
}

/**
 * Subscribe current browser to Web Push Notifications
 */
export async function subscribeToWebPush(preferences?: {
  orderUpdates?: boolean;
  paymentUpdates?: boolean;
  deliveryUpdates?: boolean;
  promotional?: boolean;
}): Promise<{ success: boolean; error?: string; permission?: NotificationPermission }> {
  const check = isPushNotificationSupported();
  if (!check.supported) {
    return { success: false, error: check.reason || 'Web Push is not supported in this browser.' };
  }

  try {
    // 1. Request user permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return {
        success: false,
        permission,
        error: permission === 'denied'
          ? 'Notifications are blocked in your browser settings. Please allow notifications in site permissions.'
          : 'Notification permission was not granted.',
      };
    }

    // 2. Fetch VAPID Public Key from server
    let publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!publicKey) {
      const keyRes = await fetchApi<{ publicKey: string }>('/notifications/vapid-public-key');
      if (keyRes.success && keyRes.data?.publicKey) {
        publicKey = keyRes.data.publicKey;
      } else if (keyRes.publicKey) {
        publicKey = keyRes.publicKey;
      }
    }

    if (!publicKey) {
      return { success: false, error: 'Could not obtain VAPID public key from server.' };
    }

    // 3. Register Service Worker and subscribe via PushManager
    const registration = await registerPushServiceWorker();
    if (!registration) {
      return { success: false, error: 'Failed to initialize Service Worker.' };
    }

    const applicationServerKey = urlBase64ToUint8Array(publicKey);
    let subscription = await registration.pushManager.getSubscription();

    // If an old subscription exists with different key, unsubscribe first
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey as unknown as BufferSource,
      });
    }

    const subscriptionJson = subscription.toJSON();
    const deviceType = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop';

    // 4. Send subscription to backend
    const res = await fetchApi('/notifications/subscribe', {
      method: 'POST',
      body: JSON.stringify({
        subscription: subscriptionJson,
        userAgent: navigator.userAgent,
        deviceType,
        preferences: preferences || {
          orderUpdates: true,
          paymentUpdates: true,
          deliveryUpdates: true,
          promotional: false,
        },
      }),
    });

    if (!res.success) {
      return { success: false, error: res.error || 'Failed to save subscription on server.' };
    }

    return { success: true, permission: 'granted' };
  } catch (error: any) {
    console.error('Web Push subscription error:', error);
    return { success: false, error: error.message || 'An error occurred while enabling notifications.' };
  }
}

/**
 * Unsubscribe current browser from Web Push
 */
export async function unsubscribeFromWebPush(): Promise<{ success: boolean; error?: string }> {
  if (!isPushNotificationSupported().supported) return { success: true };

  try {
    const registration = await registerPushServiceWorker();
    if (!registration) return { success: true };

    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      const endpoint = subscription.endpoint;
      await subscription.unsubscribe();

      // Notify backend to remove subscription record
      await fetchApi('/notifications/subscribe', {
        method: 'DELETE',
        body: JSON.stringify({ endpoint }),
      }).catch(() => {});
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error unsubscribing from Web Push:', error);
    return { success: false, error: error.message || 'Failed to disable notifications.' };
  }
}

/**
 * Send a test Web Push notification to current user's active devices
 */
export async function sendTestWebPush(): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const res = await fetchApi<any>('/notifications/test', {
      method: 'POST',
    });

    if (res.success) {
      return { success: true, message: res.message || 'Test notification dispatched!' };
    }
    return { success: false, error: res.error || 'Failed to send test notification.' };
  } catch (error: any) {
    return { success: false, error: error.message || 'Test service unavailable.' };
  }
}

/**
 * Update user's notification preferences
 */
export async function updateWebPushPreferences(preferences: {
  orderUpdates?: boolean;
  paymentUpdates?: boolean;
  deliveryUpdates?: boolean;
  promotional?: boolean;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetchApi('/notifications/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
    return { success: Boolean(res.success), error: res.error };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
