// API Base URL config
// If running standalone backend on port 5000, it uses http://localhost:5000/api
// Otherwise defaults to internal Next.js API routes /api

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const timeout = new AbortController();
  const timeoutId = setTimeout(() => timeout.abort(), 10000);
  try {
    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const isFormData = options.body instanceof FormData;
    const headers = new Headers(options.headers);
    if (!isFormData && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    const res = await fetch(url, {
      ...options,
      headers,
      signal: options.signal || timeout.signal,
    });
    return await res.json();
  } catch (error: any) {
    console.error(`API Fetch Error [${endpoint}]:`, error);
    // Fallback to internal route if standalone server is unavailable
    try {
      const fallbackUrl = `/api${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
      const res = await fetch(fallbackUrl, { ...options, signal: options.signal || timeout.signal });
      return await res.json();
    } catch (fbErr: any) {
      return { success: false, error: fbErr.message };
    }
  } finally {
    clearTimeout(timeoutId);
  }
}
