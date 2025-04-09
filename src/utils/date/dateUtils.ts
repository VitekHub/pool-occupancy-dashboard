import { format, parse, startOfWeek, endOfWeek } from 'date-fns';
import { cs, enUS } from 'date-fns/locale';
import type { WeekInfo } from '../types/poolData';

// Parse date string in format "DD.MM.YYYY" to Date object
export const parseDate = (dateStr: string): Date => {
  return parse(dateStr, 'dd.MM.yyyy', new Date());
};

// Format week range for display based on locale
export const formatWeekRange = (startDate: Date, endDate: Date, locale: string = 'cs'): string => {
  const dateLocale = locale === 'cs' ? cs : enUS;
  const start = format(startDate, 'd. MMMM', { locale: dateLocale });
  const end = format(endDate, 'd. MMMM yyyy', { locale: dateLocale });
  return `${start} - ${end}`;
};

// Generate a unique ID for a week based on its start date
export const getWeekId = (date: Date): string => {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // Week starts on Monday
  return format(weekStart, 'yyyy-MM-dd');
};

// Group dates into weeks and generate week info
export const getAvailableWeeks = (dates: Date[]): WeekInfo[] => {
  const today = new Date();
  // Map to store unique weeks
  const weeksMap = new Map<string, WeekInfo>();
  
  // Process each date
  dates.forEach(date => {
    const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // Week starts on Monday
    const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
    const weekId = getWeekId(date);
    
    if (!weeksMap.has(weekId)) {
      weeksMap.set(weekId, {
        id: weekId,
        startDate: weekStart,
        endDate: weekEnd,
        displayText: formatWeekRange(weekStart, weekEnd)
      });
    }
  });
  
  // Convert map to array, filter out future weeks, and sort by date (newest first)
  return Array.from(weeksMap.values())
    .filter(week => week.startDate <= today)
    .sort((a, b) => 
      b.startDate.getTime() - a.startDate.getTime()
    );
};