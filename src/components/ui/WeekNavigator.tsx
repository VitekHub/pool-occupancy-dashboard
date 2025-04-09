import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { WeekInfo } from '@/utils/types/poolData';
import { formatWeekRange } from '@/utils/date/dateUtils';

interface WeekNavigatorProps {
  weeks: WeekInfo[];
  selectedWeekId: string;
  onWeekChange: (weekId: string) => void;
}

const WeekNavigator: React.FC<WeekNavigatorProps> = ({ 
  weeks, 
  selectedWeekId, 
  onWeekChange 
}) => {
  const { t, i18n } = useTranslation('common');
  
  // Find the current week index
  const currentIndex = weeks.findIndex(week => week.id === selectedWeekId);
  
  const handlePreviousWeek = () => {
    if (currentIndex < weeks.length - 1) {
      onWeekChange(weeks[currentIndex + 1].id);
    }
  };
  
  const handleNextWeek = () => {
    if (currentIndex > 0) {
      onWeekChange(weeks[currentIndex - 1].id);
    }
  };
  
  // If no weeks available, don't render
  if (weeks.length === 0) return null;
  
  // Get the current week for display
  const currentWeek = weeks[currentIndex] || weeks[0];
  
  // Format the date range with the current locale
  const dateRangeText = formatWeekRange(
    currentWeek.startDate, 
    currentWeek.endDate, 
    i18n.language
  );

  return (
    <div className="flex items-center space-x-2 bg-blue-500 text-white py-2 px-3 rounded-lg">
      <button
        onClick={handlePreviousWeek}
        disabled={currentIndex === weeks.length - 1}
        className={`p-1 rounded-full ${
          currentIndex === weeks.length - 1
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:bg-blue-600'
        }`}
        aria-label={t('previousWeek')}
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      
      <span className="font-medium">{dateRangeText}</span>
      
      <button
        onClick={handleNextWeek}
        disabled={currentIndex === 0}
        className={`p-1 rounded-full ${
          currentIndex === 0
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:bg-blue-600'
        }`}
        aria-label={t('nextWeek')}
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};

export default WeekNavigator;