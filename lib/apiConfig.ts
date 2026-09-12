// API Base URL config
// If running standalone backend on port 5000, it uses http://localhost:5000/api
// Otherwise defaults to internal Next.js API routes /api

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || '';

async function safeParseResponse(res: Response) {
  const text = await res.text();
  if (!text || !text.trim()) {
    return res.ok ? { success: true } : { success: false, error: `HTTP ${res.status}: ${res.statusText || 'Error'}` };
  }
  try {
    return JSON.parse(text);
  } catch {
    return {
      success: false,
      status: res.status,
      error: res.ok ? 'Invalid JSON response received' : `HTTP ${res.status}: ${res.statusText || 'Server Error'}`,
    };
  }
}

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const timeoutMs = normalizedEndpoint === '/upload' ? 60000 : 15000;
  const requestController = options.signal ? null : new AbortController();
  const timeoutId = requestController ? setTimeout(() => requestController.abort(), timeoutMs) : null;
  const isFormData = options.body instanceof FormData;
  const headers = new Headers(options.headers);
  if (!headers.has('Authorization') && typeof window !== 'undefined') {
    const token = sessionStorage.getItem('auth_token');
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }
  if (!isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  try {
    const url = API_BASE_URL ? `${API_BASE_URL}${normalizedEndpoint}` : `/api${normalizedEndpoint}`;
    const res = await fetch(url, {
      ...options,
      headers,
      signal: options.signal || requestController?.signal,
    });
    return await safeParseResponse(res);
  } catch (error: any) {
    // Fallback to the internal route if an explicitly configured standalone server is unavailable.
    try {
      if (!API_BASE_URL) {
        throw error;
      }
      const fallbackUrl = `/api${normalizedEndpoint}`;
      const fallbackController = options.signal ? null : new AbortController();
      const fallbackTimeoutId = fallbackController ? setTimeout(() => fallbackController.abort(), timeoutMs) : null;
      try {
        const res = await fetch(fallbackUrl, { ...options, headers, signal: options.signal || fallbackController?.signal });
        return await safeParseResponse(res);
      } finally {
        if (fallbackTimeoutId) clearTimeout(fallbackTimeoutId);
      }
    } catch (fbErr: any) {
      console.warn(`API Fetch fallback failed [${endpoint}]:`, fbErr?.message || fbErr);
      return { success: false, error: fbErr?.message || 'Network error' };
    }
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}
