import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, CalendarClock } from 'lucide-react';
import Tooltip from './Tooltip';
import { usePoolDataContext } from '@/contexts/PoolDataContext';
import { formatWeekRange } from '@/utils/date/dateUtils';

const WeekNavigator: React.FC = () => {
  const { t, i18n } = useTranslation('common');
  const { availableWeeks, selectedWeekId, setSelectedWeekId } = usePoolDataContext();
  
  // Find the current week index
  const currentWeekIndex = availableWeeks.findIndex(week => {
    const now = new Date();
    return now >= week.startDate && now <= week.endDate;
  });
  const selectedIndex = availableWeeks.findIndex(week => week.id === selectedWeekId);
  
  const handlePreviousWeek = () => {
    if (selectedIndex < availableWeeks.length - 1) {
      setSelectedWeekId(availableWeeks[selectedIndex + 1].id);
    }
  };
  
  const handleNextWeek = () => {
    if (selectedIndex > 0) {
      setSelectedWeekId(availableWeeks[selectedIndex - 1].id);
    }
  };

  const handleCurrentWeek = () => {
    if (currentWeekIndex >= 0) {
      setSelectedWeekId(availableWeeks[currentWeekIndex].id);
    }
  };
  
  // If no weeks available, don't render
  if (availableWeeks.length === 0) return null;
  
  // Get the current week for display
  const selectedWeek = availableWeeks[selectedIndex] || availableWeeks[0];
  
  // Format the date range with the current locale
  const dateRangeText = formatWeekRange(
    selectedWeek.startDate, 
    selectedWeek.endDate, 
    i18n.language
  );

  return (
    <div className="flex items-center space-x-2 bg-blue-500 text-white py-2 px-3 rounded-lg relative">
      <Tooltip text={t('previousWeek')}>
        <button
          onClick={handlePreviousWeek}
          disabled={selectedIndex === availableWeeks.length - 1}
          className={`p-1 rounded-full ${
            selectedIndex === availableWeeks.length - 1
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-blue-600'
          }`}
          aria-label={t('previousWeek')}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </Tooltip>
      
      <span className="font-medium text-center min-w-[210px]">{dateRangeText}</span>
      
      <Tooltip text={t('nextWeek')}>
        <button
          onClick={handleNextWeek}
          disabled={selectedIndex === 0}
          className={`p-1 rounded-full ${
            selectedIndex === 0
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-blue-600'
          }`}
          aria-label={t('nextWeek')}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </Tooltip>
      
      <Tooltip text={t('currentWeek')}>
        <button
          onClick={handleCurrentWeek}
          disabled={currentWeekIndex === selectedIndex || currentWeekIndex === -1}
          className={`p-1 rounded-full ml-2 ${
            currentWeekIndex === selectedIndex || currentWeekIndex === -1
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-blue-600'
          }`}
          aria-label={t('currentWeek')}
        >
          <CalendarClock className="w-5 h-5" />
        </button>
      </Tooltip>
    </div>
  );
};

export default WeekNavigator;