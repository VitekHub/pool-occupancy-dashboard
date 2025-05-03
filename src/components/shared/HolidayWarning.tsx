import React from 'react';
import { useTranslation } from 'react-i18next';
import { Info } from 'lucide-react';

interface HolidayWarningProps {
  isHoliday: boolean;
}

const HolidayWarning: React.FC<HolidayWarningProps> = ({ isHoliday }) => {
  const { t } = useTranslation(['heatmaps']);

  if (!isHoliday) return null;

  return (
    <div className="relative group">
      <Info className="w-4 h-4 text-orange-500" />
      <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-48 p-2 bg-gray-800 text-white text-xs rounded shadow-lg">
        {t('heatmaps:todayTomorrow.holidayWarning')}
      </div>
    </div>
  );
};

export default HolidayWarning;