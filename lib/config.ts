// Configuration for environment variables with safe fallbacks

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://buy.tnmockmeat.com').replace(/\/+$/, '');
export const MAIN_SITE_URL = (process.env.NEXT_PUBLIC_MAIN_SITE_URL || 'https://tnmockmeat.com').replace(/\/+$/, '');
export const API_URL = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/+$/, '');

/**
 * Build URL to corporate website
 * @param path - path like '/about' or '/contact'
 */
export function getCorporateUrl(path = ''): string {
  const cleanPath = path ? (path.startsWith('/') ? path : `/${path}`) : '';
  return `${MAIN_SITE_URL}${cleanPath}`;
}

/**
 * Build URL for ecommerce store
 * @param path - path like '/shop' or '/product/123'
 * @param params - optional query params
 */
export function getEcommerceUrl(path = '', params: Record<string, string> = {}): string {
  const cleanPath = path ? (path.startsWith('/') ? path : `/${path}`) : '';
  const url = new URL(`${SITE_URL}${cleanPath}`);
  
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value);
    }
  });

  return url.toString();
}
