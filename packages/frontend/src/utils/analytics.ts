import React from 'react';

interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp?: string;
  userId?: string;
  sessionId?: string;
}

interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count' | 'percentage';
  timestamp: string;
  metadata?: Record<string, any>;
}

interface UserBehavior {
  pageViews: string[];
  clickEvents: { element: string; timestamp: string }[];
  formSubmissions: { form: string; timestamp: string; success: boolean }[];
  searchQueries: { query: string; results: number; timestamp: string }[];
  featureUsage: Record<string, number>;
}

class Analytics {
  private events: AnalyticsEvent[] = [];
  private performanceMetrics: PerformanceMetric[] = [];
  private sessionId: string;
  private userId?: string;
  private isEnabled: boolean = true;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.setupPerformanceTracking();
    this.trackPageLoad();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  setUserId(userId: string): void {
    this.userId = userId;
    this.track('user_identified', { userId });
  }

  track(eventName: string, properties?: Record<string, any>): void {
    if (!this.isEnabled) return;

    const event: AnalyticsEvent = {
      name: eventName,
      properties: {
        ...properties,
        url: window.location.href,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
      userId: this.userId,
      sessionId: this.sessionId,
    };

    this.events.push(event);
    this.sendToAnalytics(event);

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Analytics Event:', event);
    }
  }

  trackPageView(path?: string): void {
    this.track('page_view', {
      path: path || window.location.pathname,
      title: document.title,
    });
  }

  trackClick(element: string, properties?: Record<string, any>): void {
    this.track('click', {
      element,
      ...properties,
    });
  }

  trackFormSubmission(formName: string, success: boolean, properties?: Record<string, any>): void {
    this.track('form_submission', {
      form: formName,
      success,
      ...properties,
    });
  }

  trackSearch(query: string, resultsCount: number, properties?: Record<string, any>): void {
    this.track('search', {
      query,
      results_count: resultsCount,
      ...properties,
    });
  }

  trackFeatureUsage(feature: string, action: string, properties?: Record<string, any>): void {
    this.track('feature_usage', {
      feature,
      action,
      ...properties,
    });
  }

  trackError(error: Error, context?: Record<string, any>): void {
    this.track('error', {
      error_message: error.message,
      error_stack: error.stack,
      context,
    });
  }

  trackPerformance(metricName: string, value: number, unit: PerformanceMetric['unit'], metadata?: Record<string, any>): void {
    const metric: PerformanceMetric = {
      name: metricName,
      value,
      unit,
      timestamp: new Date().toISOString(),
      metadata,
    };

    this.performanceMetrics.push(metric);

    if (process.env.NODE_ENV === 'development') {
      console.log('⚡ Performance Metric:', metric);
    }
  }

  private setupPerformanceTracking(): void {
    // Track page load performance
    window.addEventListener('load', () => {
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (perfData) {
        this.trackPerformance('page_load_time', perfData.loadEventEnd - perfData.fetchStart, 'ms');
        this.trackPerformance('dom_content_loaded', perfData.domContentLoadedEventEnd - perfData.fetchStart, 'ms');
        this.trackPerformance('time_to_interactive', perfData.domInteractive - perfData.fetchStart, 'ms');
      }
    });

    // Track Core Web Vitals
    this.trackWebVitals();

    // Track resource loading
    this.trackResourcePerformance();
  }

  private trackWebVitals(): void {
    // Largest Contentful Paint (LCP)
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.trackPerformance('largest_contentful_paint', lastEntry.startTime, 'ms');
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay (FID)
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        this.trackPerformance('first_input_delay', entry.processingStart - entry.startTime, 'ms');
      });
    }).observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      this.trackPerformance('cumulative_layout_shift', clsValue, 'count');
    }).observe({ entryTypes: ['layout-shift'] });
  }

  private trackResourcePerformance(): void {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === 'resource') {
          const resourceEntry = entry as PerformanceResourceTiming;
          
          // Track slow resources
          if (resourceEntry.duration > 1000) {
            this.trackPerformance('slow_resource', resourceEntry.duration, 'ms', {
              resource_name: resourceEntry.name,
              resource_type: this.getResourceType(resourceEntry.name),
            });
          }
        }
      });
    });

    observer.observe({ entryTypes: ['resource'] });
  }

  private getResourceType(url: string): string {
    const extension = url.split('.').pop()?.toLowerCase();
    
    if (['js', 'jsx', 'ts', 'tsx'].includes(extension || '')) return 'script';
    if (['css', 'scss', 'sass'].includes(extension || '')) return 'stylesheet';
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension || '')) return 'image';
    if (['woff', 'woff2', 'ttf', 'otf'].includes(extension || '')) return 'font';
    
    return 'other';
  }

  private trackPageLoad(): void {
    this.track('session_start');
    this.trackPageView();
  }

  private sendToAnalytics(event: AnalyticsEvent): void {
    // In a real application, send to your analytics service
    // Example: Google Analytics, Mixpanel, Amplitude, etc.
    
    // For demo, store in localStorage
    try {
      const stored = localStorage.getItem('analytics_events') || '[]';
      const events = JSON.parse(stored);
      events.push(event);
      
      // Keep only last 100 events to prevent storage bloat
      if (events.length > 100) {
        events.splice(0, events.length - 100);
      }
      
      localStorage.setItem('analytics_events', JSON.stringify(events));
    } catch (error) {
      console.warn('Failed to store analytics event:', error);
    }
  }

  getSessionEvents(): AnalyticsEvent[] {
    return this.events.filter(event => event.sessionId === this.sessionId);
  }

  getPerformanceMetrics(): PerformanceMetric[] {
    return this.performanceMetrics;
  }

  getUserBehavior(): UserBehavior {
    const events = this.getSessionEvents();
    
    return {
      pageViews: events
        .filter(e => e.name === 'page_view')
        .map(e => e.properties?.path || ''),
      
      clickEvents: events
        .filter(e => e.name === 'click')
        .map(e => ({
          element: e.properties?.element || '',
          timestamp: e.timestamp || '',
        })),
        
      formSubmissions: events
        .filter(e => e.name === 'form_submission')
        .map(e => ({
          form: e.properties?.form || '',
          timestamp: e.timestamp || '',
          success: e.properties?.success || false,
        })),
        
      searchQueries: events
        .filter(e => e.name === 'search')
        .map(e => ({
          query: e.properties?.query || '',
          results: e.properties?.results_count || 0,
          timestamp: e.timestamp || '',
        })),
        
      featureUsage: events
        .filter(e => e.name === 'feature_usage')
        .reduce((acc, e) => {
          const feature = e.properties?.feature;
          if (feature) {
            acc[feature] = (acc[feature] || 0) + 1;
          }
          return acc;
        }, {} as Record<string, number>),
    };
  }

  disable(): void {
    this.isEnabled = false;
  }

  enable(): void {
    this.isEnabled = true;
  }

  isTrackingEnabled(): boolean {
    return this.isEnabled;
  }

  clearSession(): void {
    this.events = [];
    this.performanceMetrics = [];
    this.sessionId = this.generateSessionId();
  }
}

// Create singleton instance
export const analytics = new Analytics();

// React Hook for analytics
export function useAnalytics() {
  return {
    track: analytics.track.bind(analytics),
    trackPageView: analytics.trackPageView.bind(analytics),
    trackClick: analytics.trackClick.bind(analytics),
    trackFormSubmission: analytics.trackFormSubmission.bind(analytics),
    trackSearch: analytics.trackSearch.bind(analytics),
    trackFeatureUsage: analytics.trackFeatureUsage.bind(analytics),
    trackError: analytics.trackError.bind(analytics),
    trackPerformance: analytics.trackPerformance.bind(analytics),
    setUserId: analytics.setUserId.bind(analytics),
    getSessionEvents: analytics.getSessionEvents.bind(analytics),
    getPerformanceMetrics: analytics.getPerformanceMetrics.bind(analytics),
    getUserBehavior: analytics.getUserBehavior.bind(analytics),
  };
}

// HOC for automatic page view tracking
export function withAnalytics<P extends object>(Component: React.ComponentType<P>) {
  return function AnalyticsWrapper(props: P) {
    React.useEffect(() => {
      analytics.trackPageView();
    }, []);

    return React.createElement(Component, props);
  };
}

// Error boundary with analytics
export class AnalyticsErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error }> },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    analytics.trackError(error, {
      component_stack: errorInfo.componentStack,
      error_boundary: true,
    });
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return React.createElement(this.props.fallback, { error: this.state.error });
      }
      
      return React.createElement('div', {
        className: 'p-4 text-center',
        children: [
          React.createElement('h2', { key: 'title' }, 'Something went wrong'),
          React.createElement('p', { key: 'message' }, 'An error occurred. Please refresh the page.'),
        ],
      });
    }

    return this.props.children;
  }
} 