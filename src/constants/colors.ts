// Color constants for utilization levels
export const UTILIZATION_COLORS = {
  EMPTY: 'bg-gray-100',
  VERY_LOW: 'bg-green-100',
  LOW: 'bg-green-300',
  MEDIUM: 'bg-yellow-300',
  HIGH: 'bg-orange-400',
  VERY_HIGH: 'bg-red-500'
} as const;

// Progress bar colors
export const PROGRESS_COLORS = {
  LOW: 'bg-green-500',
  MEDIUM: 'bg-yellow-500',
  HIGH: 'bg-red-500',
  BACKGROUND: 'bg-blue-800',
  FILL: 'bg-blue-400'
} as const;