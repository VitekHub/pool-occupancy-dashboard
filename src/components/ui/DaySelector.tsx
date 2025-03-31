import React from 'react';
import { useTranslation } from 'react-i18next';
import { DAYS } from '@/constants/time';

interface DaySelectorProps {
  selectedDay: string;
  onChange: (day: string) => void;
}

const DaySelector: React.FC<DaySelectorProps> = ({ selectedDay, onChange }) => {
  const { t } = useTranslation('common');

  return (
    <div className="mb-6">
      <p className="block text-sm font-medium text-gray-700 mb-2">
        {t('selectDay')}
      </p>
      <div className="flex flex-wrap gap-2">
        {DAYS.map(day => (
          <button
            key={day}
            onClick={() => onChange(day)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              selectedDay === day
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {t(`days.${day.toLowerCase()}`)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DaySelector;