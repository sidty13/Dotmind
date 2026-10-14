/**
 * DotMind API Base URL configuration and sanitizer.
 * 
 * Browsers block or reject fetch calls to 0.0.0.0 / 127.0.0.0.0 due to W3C security restrictions,
 * throwing "TypeError: NetworkError when attempting to fetch resource".
 * This helper ensures any local binding is mapped to localhost / 127.0.0.1 for browser fetches.
 */
export function getApiBaseUrl(): string {
  let url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
  url = url.trim().replace(/\/+$/, '');

  if (url.includes('127.0.0.0.0')) {
    url = url.replace('127.0.0.0.0', 'localhost');
  }
  if (url.includes('0.0.0.0')) {
    url = url.replace('0.0.0.0', 'localhost');
  }

  return url;
}

export const API_BASE_URL = getApiBaseUrl();
