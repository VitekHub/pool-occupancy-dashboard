export const getColorForOccupancy = (occupancy: number): string => {
  if (occupancy === 0) return '#f3f4f6';
  if (occupancy < 25) return '#d1fae5';
  if (occupancy < 33) return '#86efac';
  if (occupancy < 42) return '#fde047';
  if (occupancy < 52) return '#fb923c';
  return '#ef4444';
};