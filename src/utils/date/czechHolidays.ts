import { getYear, getMonth, getDate, addDays } from 'date-fns';

// Calculate Easter Sunday using Meeus/Jones/Butcher algorithm
const calculateEasterSunday = (year: number): Date => {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  
  return new Date(year, month - 1, day);
};

// Get all holidays for a given year
export const getCzechHolidays = (year: number): { date: Date; name: string }[] => {
  const easterSunday = calculateEasterSunday(year);
  const goodFriday = addDays(easterSunday, -2);
  const easterMonday = addDays(easterSunday, 1);

  return [
    { date: new Date(year, 0, 1), name: 'Nový rok' },
    { date: new Date(year, 0, 1), name: 'Den obnovy samostatného českého státu' },
    { date: goodFriday, name: 'Velký pátek' },
    { date: easterMonday, name: 'Velikonoční pondělí' },
    { date: new Date(year, 4, 1), name: 'Svátek práce' },
    { date: new Date(year, 4, 8), name: 'Den vítězství' },
    { date: new Date(year, 6, 5), name: 'Den slovanských věrozvěstů Cyrila a Metoděje' },
    { date: new Date(year, 6, 6), name: 'Den upálení mistra Jana Husa' },
    { date: new Date(year, 8, 28), name: 'Den české státnosti' },
    { date: new Date(year, 9, 28), name: 'Den vzniku samostatného československého státu' },
    { date: new Date(year, 10, 17), name: 'Den boje za svobodu a demokracii' },
    { date: new Date(year, 11, 24), name: 'Štědrý den' },
    { date: new Date(year, 11, 25), name: 'První svátek vánoční' },
    { date: new Date(year, 11, 26), name: 'Druhý svátek vánoční' }
  ];
};

// Check if a date is a Czech holiday
export const isCzechHoliday = (dateInput: Date | string): { isHoliday: boolean; name?: string } => {
  let date: Date;
  
  if (typeof dateInput === 'string') {
    const [day, month] = dateInput.split('.').map(Number);
    date = new Date(new Date().getFullYear(), month - 1, day);
  } else {
    date = dateInput;
  }
  
  const year = getYear(date);
  const holidays = getCzechHolidays(year);
  
  const holiday = holidays.find(h => 
    getYear(h.date) === getYear(date) &&
    getMonth(h.date) === getMonth(date) &&
    getDate(h.date) === getDate(date)
  );
  
  return {
    isHoliday: !!holiday,
    name: holiday?.name
  };
};