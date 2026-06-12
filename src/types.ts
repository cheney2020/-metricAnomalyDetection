import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Compare Type
export type CompareType = 'time_compare' | 'homogeneous_compare';

// Detection Target
export type DetectionTarget = 
  | 'target_point'
  | 'scan_points'
  | 'trend'
  | 'volatility'
  | 'target_object'
  | 'scan_objects'
  | 'distribution';

// Data Sources
export type DataSource = 'metric_api';

// Algorithms
export type Algorithm = 
  | 'gesd' 
  | 'zscore'
  | 'iqr'
  | 'volatility' 
  | 'mann_kendall' 
  | 'quantile'
  | 'dispersion'
  | 'extreme_ratio';

export interface DimensionKey {
  id: string;
  name: string;
  mapping: string;
  example: string;
}

export interface MetricConfig {
  name: string;
  code: string;
  aggregation: 'sum' | 'avg';
}

export interface QueryCondition {
  id: string;
  relation: 'WHERE' | 'AND' | 'OR';
  isNot?: boolean;
  field: string;
  operator: string;
  valueSource: 'variable' | 'constant';
  value: string;
}

export interface TimeRangeConfig {
  timeField?: string;
  timeDimensionField?: string;
  granularity: 'hour' | 'day' | 'week' | 'month';
  mode: 'preset' | 'function' | 'variable';
  preset?: string;
  startExpression?: string;
  endExpression?: string;
  startVariable?: string;
  endVariable?: string;
}

export interface TargetConfig {
  targetDate?: string;
  targetDateConfig?: {
    mode: 'date' | 'function' | 'variable';
    preset?: string;
    expression?: string;
    variable?: string;
    value?: string;
  };
  excludeTargetPoint?: boolean;
  timeRangeConfig?: TimeRangeConfig;
  trendWindow?: string;
  trendDirection?: 'auto' | 'up' | 'down';
  volatilityWindow?: string;
  changeRateThreshold?: string;
  peerDimensionField?: string;
  targetDimensionValue?: string;
  benchmarkDimensionValue?: string;
  benchmarkDimensionCondition?: string;
  timeDimensionField?: string;
  timeField?: string;
  comparisonTimeRange?: string;
  distributionMetrics?: string[];
}

export interface AlgorithmParams {
  direction?: 'both' | 'high' | 'low';
  alpha?: number;
  maxAnomalyRatio?: number;
  zscoreThreshold?: number;
  iqrMultiplier?: number;
  upperQuantile?: number;
  lowerQuantile?: number;
  mkAlpha?: number;
  mkWindow?: string;
  volatilityWindow?: string;
  changeRate?: number;
  dispersionMetric?: string;
  dispersionThreshold?: number;
  extremeRatioThreshold?: number;
}

export interface ManualRule {
  id: string;
  condition: string;
  action: 'mark_anomaly' | 'ignore';
}

export interface NodeConfig {
  name: string;
  description: string;
  dataSource: DataSource;
  metricConfig: MetricConfig;
  queryConditions: QueryCondition[];
  compareType: CompareType;
  detectionTarget: DetectionTarget;
  targetConfig?: TargetConfig;
  detectionMethodType: 'algorithm' | 'manual_rule';
  algorithmSelectionMode: 'system_recommended' | 'manual';
  algorithm: Algorithm;
  algorithmParams?: AlgorithmParams;
  manualRules?: ManualRule[];
  manualRuleConfig: {
    ruleGroups: Array<{
      id: string;
      name: string;
      logicOperator: 'AND' | 'OR';
      anomalyDirection: 'high' | 'low' | 'both' | 'custom';
      anomalyLevel: 'low' | 'medium' | 'high' | 'critical';
      rules: Array<{
        id: string;
        relation: 'WHERE' | 'AND' | 'OR';
        field: string;
        operator: string;
        valueSource: 'constant' | 'upstream_variable' | 'system_variable' | 'metric_result';
        value: string;
      }>;
    }>;
  };
  outputFields: {
    hasAnomaly: boolean;
    anomalyCount: boolean;
    normalCount: boolean;
    totalCount: boolean;
    anomalyItems: boolean;
  };
  triggerCondition: 'any' | 'severe_only' | 'count' | 'ratio' | 'custom';
  triggerValue?: string;
  status: 'pending' | 'configured' | 'tested' | 'error';
}

export interface AnomalyPoint {
  dimension_value?: string;
  time_value: string;
  actual_value: number;
  expected_value: string;
  diff_ratio: string;
  anomaly_direction: string;
  anomaly_level: string;
  evidence: string;
}
