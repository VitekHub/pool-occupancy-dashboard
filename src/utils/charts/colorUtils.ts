export const getColorForOccupancy = (occupancy: number): string => {
  if (occupancy === 0) return '#f3f4f6';
  if (occupancy < 25) return '#d1fae5';
  if (occupancy < 40) return '#86efac';
  if (occupancy < 55) return '#fde047';
  if (occupancy < 70) return '#fb923c';
  return '#ef4444';
};