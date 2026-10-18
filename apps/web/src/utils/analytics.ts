/**
 * KagazAi Privacy-Friendly Analytics & Conversion Tracking
 * Completely privacy-respecting: no third-party trackers, no cookies, no PII.
 * Respects navigator.doNotTrack and provides verifiable conversion events.
 */

export type AnalyticsEvent =
  | 'landing_view'
  | 'cta_click_hero'
  | 'cta_click_nav'
  | 'cta_click_footer'
  | 'template_selected'
  | 'document_created'
  | 'share_link_copied'
  | 'version_saved'
  | 'comment_created'
  | 'faq_expanded';

interface EventProperties {
  label?: string;
  template?: string;
  source?: string;
  role?: string;
  [key: string]: any;
}

export function trackEvent(event: AnalyticsEvent, properties?: EventProperties): void {
  // Check if browser has Do Not Track enabled
  if (typeof window !== 'undefined' && (navigator.doNotTrack === '1' || (window as any).doNotTrack === '1')) {
    return;
  }

  const payload = {
    event,
    properties: properties || {},
    timestamp: new Date().toISOString(),
    path: typeof window !== 'undefined' ? window.location.pathname : '',
  };

  // In development and production, log event cleanly or dispatch to an optional internal telemetry buffer
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[analytics] ${event}`, payload);
  }

  // Dispatch custom window event so client components or listeners can react
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('kagazai:analytics', { detail: payload }));
  }
}
