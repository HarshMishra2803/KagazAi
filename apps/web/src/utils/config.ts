/**
 * Dynamic environment URL resolution utility.
 * Supports:
 * 1. Explicit cloud environment variables (NEXT_PUBLIC_API_URL / NEXT_PUBLIC_COLLAB_URL)
 * 2. Unified single-service deployment (uses current window.location origin & wss:// protocol)
 * 3. Local dual-port development (http://localhost:5001 and ws://localhost:1234)
 */

export function getApiUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return window.location.origin;
  }
  return 'http://localhost:5001';
}

export function getCollabUrl(): string {
  if (process.env.NEXT_PUBLIC_COLLAB_URL) {
    let url = process.env.NEXT_PUBLIC_COLLAB_URL.replace(/\/+$/, '');
    if (url.startsWith('https://')) return url.replace(/^https:\/\//, 'wss://');
    if (url.startsWith('http://')) return url.replace(/^http:\/\//, 'ws://');
    return url;
  }
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}`;
  }
  return 'ws://localhost:1234';
}
