import React from 'react';
import { useTranslation } from 'react-i18next';
import { Users } from 'lucide-react';
import { OccupancyRecord } from '@/utils/processData';

interface CurrentOccupancyProps {
  currentOccupancy: OccupancyRecord | null;
}

const CurrentOccupancy: React.FC<CurrentOccupancyProps> = ({ currentOccupancy }) => {
  const { t } = useTranslation(['common']);

  if (!currentOccupancy) {
    return null;
  }

  return (
    <div className="flex items-center bg-blue-700 px-4 py-2 rounded-lg">
      <Users className="w-5 h-5 mr-2" />
      <div>
        <div className="text-sm opacity-90">{t('currentOccupancy')}</div>
        <div className="font-bold">
          {currentOccupancy.time} • {currentOccupancy.occupancy} {t('people')}
        </div>
      </div>
    </div>
  );
};

export default CurrentOccupancy;