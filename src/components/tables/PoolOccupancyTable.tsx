import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download } from 'lucide-react';
import { usePoolData } from '@/utils/processData';
import Table from '@/components/ui/Table';
import DaySelector from '@/components/ui/DaySelector';
import { getValidHours } from '@/constants/time';

const PoolOccupancyTable: React.FC = () => {
  const { t } = useTranslation(['tables', 'common']);
  const { hourlySummary, loading, error } = usePoolData();
  const [selectedDay, setSelectedDay] = useState<string>('Monday');
  const validHours = getValidHours(selectedDay);

  if (loading) {
    return <div className="flex justify-center items-center h-32">{t('common:loading')}</div>;
  }

  if (error) {
    return <div className="text-red-500">{t('common:error', { message: error })}</div>;
  }

  // Filter data for the selected day
  const filteredData = hourlySummary.filter(item => 
    item.day === selectedDay && validHours.includes(item.hour)
  );
  
  // Sort by hour for proper display
  const sortedData = [...filteredData].sort((a, b) => a.hour - b.hour);

  const columns = [
    {
      header: t('tables:columns.hour'),
      accessor: (item: typeof sortedData[0]) => `${item.hour}:00`,
      className: 'font-medium text-gray-900'
    },
    {
      header: t('tables:columns.averageOccupancy'),
      accessor: 'averageOccupancy'
    },
    {
      header: t('tables:columns.maximumOccupancy'),
      accessor: 'maximumOccupancy'
    },
    {
      header: t('tables:columns.utilizationRate'),
      accessor: (item: typeof sortedData[0]) => (
        <div className="flex items-center">
          <div className="w-16 bg-gray-200 rounded-full h-2.5 mr-2">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${item.utilizationRate}%` }}
            ></div>
          </div>
          <span>{item.utilizationRate}%</span>
        </div>
      )
    },
    {
      header: t('tables:columns.remainingCapacity'),
      accessor: 'remainingCapacity'
    }
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">{t('tables:title')}</h2>
      
      {/* Download section */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-2">{t('tables:downloads.title')}</h3>
        <div className="flex gap-4">
          <a
            href="/pool_occupancy.csv"
            target="_blank"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Download className="w-4 h-4 mr-2" />
            {t('tables:downloads.occupancy')}
          </a>
          <a
            href="/capacity.csv"
            target="_blank"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Download className="w-4 h-4 mr-2" />
            {t('tables:downloads.capacity')}
          </a>
        </div>
      </div>
      
      {/* Day selector */}
      <DaySelector
        selectedDay={selectedDay}
        onChange={setSelectedDay}
        id="day-select-table"
      />
      
      {/* Data table */}
      <Table
        columns={columns}
        data={sortedData}
        className="mt-4"
      />
    </div>
  );
};

export default PoolOccupancyTable;