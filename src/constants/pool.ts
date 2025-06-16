// Pool capacity constants
export const INSIDE_MAX_CAPACITY = 135;
export const INSIDE_TOTAL_LANES = 6;
export const OUTSIDE_MAX_CAPACITY = 2000;

// Utilization thresholds (in percentage)
export const UTILIZATION_THRESHOLDS = {
  VERY_LOW: 25,
  LOW: 33,
  MEDIUM: 42,
  HIGH: 52
} as const;