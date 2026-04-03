// ============================================================================
// Common types shared across the Orbit application
// ============================================================================

/** Severity levels for alerts, signals, and notifications */
export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';

/** Health score — a normalized float from 0 (critical) to 1 (healthy) */
export type HealthScore = number;

/** A time range defined by ISO-8601 start/end timestamps */
export interface TimeRange {
  start: Date;
  end: Date;
}

/** Data sources that the system can ingest from */
export type DataSource =
  | 'SLACK'
  | 'GMAIL'
  | 'GOOGLE_CALENDAR'
  | 'LINEAR'
  | 'GITHUB'
  | 'NOTION'
  | 'JIRA'
  | 'CONFLUENCE'
  | 'ASANA'
  | 'HUBSPOT'
  | 'SALESFORCE'
  | 'FIGMA'
  | 'ZOOM'
  | 'MANUAL'
  | 'SYSTEM';

/** Trend direction for metrics and health indicators */
export type Trend = 'improving' | 'stable' | 'declining';

/** Short-form trend used in briefing UI cards */
export type TrendDirection = 'up' | 'stable' | 'down';

/** Project lifecycle status */
export type ProjectStatus =
  | 'PLANNING'
  | 'ACTIVE'
  | 'AT_RISK'
  | 'ON_HOLD'
  | 'COMPLETED'
  | 'CANCELLED';

/** Delivery channel for alerts and notifications */
export type DeliveryChannel = 'IN_APP' | 'EMAIL' | 'SLACK' | 'PUSH';

/** Industry event categories for intelligence signals */
export type IndustryEventType =
  | 'FUNDING_ROUND'
  | 'ACQUISITION'
  | 'PRODUCT_LAUNCH'
  | 'LEADERSHIP_CHANGE'
  | 'PARTNERSHIP'
  | 'LAYOFF'
  | 'PRICING_CHANGE'
  | 'REGULATION_CHANGE'
  | 'EARNINGS_REPORT'
  | 'SECURITY_BREACH'
  | 'IPO_FILING'
  | 'PATENT_FILING'
  | 'OPEN_SOURCE_RELEASE';
