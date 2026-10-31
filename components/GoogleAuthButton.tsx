'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { fetchApi } from '@/lib/apiConfig';
import PhonePromptModal from './PhonePromptModal';

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initCodeClient: (config: {
            client_id: string;
            scope: string;
            ux_mode?: 'popup' | 'redirect';
            callback: (response: any) => void;
            error_callback?: (error: any) => void;
          }) => {
            requestCode: () => void;
          };
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: any) => void;
            error_callback?: (error: any) => void;
          }) => {
            requestAccessToken: (options?: { prompt?: string }) => void;
          };
        };
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: any) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          prompt?: (notification?: (notification: any) => void) => void;
        };
      };
    };
  }
}

interface GoogleAuthButtonProps {
  redirectUrl?: string;
  onError?: (error: string) => void;
  onLoadingChange?: (loading: boolean) => void;
  disabled?: boolean;
}

export default function GoogleAuthButton({
  redirectUrl = '/',
  onError,
  onLoadingChange,
  disabled = false,
}: GoogleAuthButtonProps) {
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [pendingDestination, setPendingDestination] = useState<string>('');
  const isSubmittingRef = useRef(false);

  const { login } = useAuth();
  const router = useRouter();

  const clientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    '1066299815178-p19mrnln8d15kdnq9m4g3mogmv3b6k4j.apps.googleusercontent.com';

  useEffect(() => {
    // If GIS script already loaded
    if (typeof window !== 'undefined' && window.google?.accounts?.oauth2) {
      setScriptLoaded(true);
      return;
    }

    // Load Google Identity Services script if not already present in DOM
    const existingScript = document.getElementById('google-gsi-client');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'google-gsi-client';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setScriptLoaded(true);
      };
      script.onerror = () => {
        console.error('Failed to load Google Identity Services script.');
      };
      document.head.appendChild(script);
    } else {
      existingScript.addEventListener('load', () => setScriptLoaded(true));
      if ((existingScript as any).loaded || (window as any).google?.accounts?.oauth2) {
        setScriptLoaded(true);
      }
    }
  }, []);

  // Helper to set loading + notify parent
  const updateLoading = (value: boolean) => {
    setLoading(value);
    onLoadingChange?.(value);
  };

  const handleBackendAuth = async (payload: { code?: string; credential?: string; idToken?: string }) => {
    try {
      const res = await fetchApi('/auth/google', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res.success && res.data) {
        login(res.data);
        const destination = res.data.role === 'Admin' ? '/admin' : redirectUrl;

        // If user doesn't have a mobile number (first login via Google), prompt for it
        if (!res.data.phone) {
          setPendingDestination(destination);
          setShowPhoneModal(true);
          updateLoading(false);
          isSubmittingRef.current = false;
        } else {
          router.replace(destination);
        }
      } else {
        const errorMsg = res.message || res.error || 'Google authentication failed. Please try again.';
        onError?.(errorMsg);
        updateLoading(false);
        isSubmittingRef.current = false;
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Network error during Google authentication. Please try again.';
      onError?.(errorMsg);
      updateLoading(false);
      isSubmittingRef.current = false;
    }
  };

  const handleGoogleClick = () => {
    if (loading || disabled || isSubmittingRef.current) return;

    if (!clientId) {
      onError?.('Google OAuth Client ID is not configured.');
      return;
    }

    if (!window.google?.accounts?.oauth2) {
      onError?.('Google sign-in services are still loading. Please try again in a few moments.');
      return;
    }

    updateLoading(true);
    isSubmittingRef.current = true;

    try {
      const client = window.google.accounts.oauth2.initCodeClient({
        client_id: clientId,
        scope: 'openid email profile',
        ux_mode: 'popup',
        callback: async (response: any) => {
          if (response.error) {
            if (response.error !== 'popup_closed_by_user') {
              onError?.(response.error_description || 'Google sign-in was cancelled or encountered an error.');
            }
            updateLoading(false);
            isSubmittingRef.current = false;
            return;
          }

          if (response.code) {
            await handleBackendAuth({ code: response.code });
          } else {
            onError?.('No authorization code received from Google.');
            updateLoading(false);
            isSubmittingRef.current = false;
          }
        },
        error_callback: (error: any) => {
          if (error?.type !== 'popup_closed') {
            onError?.('Google Sign-In popup was closed or blocked. Please enable popups and try again.');
          }
          updateLoading(false);
          isSubmittingRef.current = false;
        },
      });

      client.requestCode();
    } catch (error: any) {
      console.error('Error initiating Google OAuth:', error);
      onError?.(error.message || 'Unable to open Google sign-in window.');
      updateLoading(false);
      isSubmittingRef.current = false;
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleGoogleClick}
        disabled={disabled || loading}
        aria-label="Continue with Google"
        className="w-full py-3.5 px-4 bg-white hover:bg-stone-50/90 active:bg-stone-100 text-stone-800 font-bold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-3 border border-stone-300 hover:border-stone-400 hover:shadow-md shadow-xs transition-all active:scale-[0.99] disabled:opacity-60 cursor-pointer select-none group"
      >
        {loading ? (
          <>
            {/* Google-Colored Bouncing Dots Loading Animation */}
            <div className="flex items-center gap-1.5" aria-hidden="true">
              <span
                className="w-2 h-2 rounded-full bg-[#4285F4] animate-bounce"
                style={{ animationDuration: '0.85s', animationDelay: '0ms' }}
              />
              <span
                className="w-2 h-2 rounded-full bg-[#EA4335] animate-bounce"
                style={{ animationDuration: '0.85s', animationDelay: '150ms' }}
              />
              <span
                className="w-2 h-2 rounded-full bg-[#FBBC05] animate-bounce"
                style={{ animationDuration: '0.85s', animationDelay: '300ms' }}
              />
              <span
                className="w-2 h-2 rounded-full bg-[#34A853] animate-bounce"
                style={{ animationDuration: '0.85s', animationDelay: '450ms' }}
              />
            </div>
            <span className="text-stone-700 font-extrabold text-xs sm:text-sm">Connecting to Google<span className="animate-pulse">...</span></span>
          </>
        ) : (
          <>
            {/* Official Google G Logo */}
            <div className="w-5 h-5 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
              <svg className="w-full h-full" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            </div>
            <span className="tracking-tight text-stone-800 group-hover:text-stone-950 font-extrabold">Continue with Google</span>
          </>
        )}
      </button>

      <PhonePromptModal
        isOpen={showPhoneModal}
        onClose={() => {
          setShowPhoneModal(false);
          router.replace(pendingDestination || redirectUrl);
        }}
        onSuccess={() => {
          setShowPhoneModal(false);
          router.replace(pendingDestination || redirectUrl);
        }}
        title="Please Enter Your Mobile Number"
        description="Your Google account is now connected! Please enter your 10-digit mobile number for order delivery coordination and WhatsApp status updates."
      />
    </>
  );
}
