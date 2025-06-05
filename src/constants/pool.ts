// Pool capacity constants
export const TOTAL_MAX_OCCUPANCY = 135;
export const TOTAL_LANES = 6;

// Utilization thresholds (in percentage)
export const UTILIZATION_THRESHOLDS = {
  VERY_LOW: 25,
  LOW: 33,
  MEDIUM: 42,
  HIGH: 52
} as const;