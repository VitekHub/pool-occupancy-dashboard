export const POOL_TYPES = {
  INSIDE: 'inside',
  OUTSIDE: 'outside'
} as const;

export type PoolType = typeof POOL_TYPES[keyof typeof POOL_TYPES];