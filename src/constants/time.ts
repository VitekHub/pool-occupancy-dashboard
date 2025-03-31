// Days of the week in order
export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Standard hours for weekdays
export const HOURS = Array.from({ length: 16 }, (_, i) => i + 6); // 6:00 to 21:00

// Standard hours for weekend
export const WEEKEND_HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 8:00 to 20:00

// Get valid hours for a given day
export const getValidHours = (day: string): number[] => {
  if (['Saturday', 'Sunday'].includes(day)) {
    return WEEKEND_HOURS;
  }
  return HOURS;
};
