import React from 'react';
import { useTranslation } from 'react-i18next';
import { Info } from 'lucide-react';

interface HolidayWarningProps {
  isHoliday: boolean;
  showBelow?: boolean;
}

const HolidayWarning: React.FC<HolidayWarningProps> = ({ isHoliday, showBelow = false }) => {
  const { t } = useTranslation(['heatmaps']);

  if (!isHoliday) return null;

  return (
    <div className="relative group">
      <Info className="w-4 h-4 text-orange-500" />
      <div className={`absolute left-0 ${showBelow ? 'top-full mt-2' : 'bottom-full mb-2'} hidden group-hover:block w-48 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-10`}>
        {t('heatmaps:common.holidayWarning')}
      </div>
    </div>
  );
};

export default HolidayWarning;