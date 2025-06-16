export const POOL_TYPES = {
  INSIDE: 'inside',
  OUTSIDE: 'outside'
} as const;

export type PoolType = typeof POOL_TYPES[keyof typeof POOL_TYPES];

export const isInsidePool = (poolType: PoolType): boolean => {
  return poolType === POOL_TYPES.INSIDE;
}