/**
 * Type definitions for system metrics and monitoring
 */

export interface SystemMetrics {
  totalSessions: number;
  averageTopK: number;
  averageResponseTime: number; // milliseconds
  weeklyActivity: WeeklyActivity[];
}

export interface WeeklyActivity {
  day: string;
  sessions: number;
}

export interface DatasetFeature {
  name: string;
  originalType: 'numeric' | 'categorical' | 'text';
  missingPercentage: number;
  nonNullCount?: number;
  description?: string;
}

export interface DatasetOverview {
  totalRecords: number;
  totalFeatures: number;
  numericFeatures: number;
  categoricalFeatures: number;
  features: DatasetFeature[];
}

export interface PreprocessingStep {
  step: number;
  name: string;
  description: string;
  appliesTo: 'numeric' | 'categorical' | 'all';
}
