import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download } from 'lucide-react';
import { usePoolDataContext } from '@/contexts/PoolDataContext';
import Table from '@/components/ui/Table';
import DaySelector from '@/components/ui/DaySelector';
import { getValidHours } from '@/constants/time';

const PoolOccupancyTable: React.FC = () => {
  const { t } = useTranslation(['tables', 'common']);
  const { hourlySummary, loading, error } = usePoolDataContext();
  const [selectedDay, setSelectedDay] = useState<string>('Monday');
  const validHours = getValidHours(selectedDay);

  if (loading) {
    return <div className="flex justify-center items-center h-32">{t('common:loading')}</div>;
  }

  if (error?.message) {
    return <div className="text-red-500">{t('common:error', { message: error.message })}</div>;
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
      header: t('tables:columns.maximumCapacity'),
      accessor: 'maximumCapacity'
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

  const DownloadButton = ({ url, label }: { url: string, label: string }) => (
    <button
      onClick={() => window.open(url, '_blank')}
      className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
    >
      <Download className="w-4 h-4 mr-2" />
      {label}
    </button>
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">

      {/* Download section */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-2">{t('tables:downloads.title')}</h3>
        <div className="flex flex-wrap gap-4">
          <DownloadButton
            url={import.meta.env.VITE_POOL_OCCUPANCY_CSV_URL}
            label={t('tables:downloads.occupancy')}
          />
          <DownloadButton
            url={import.meta.env.VITE_MAX_CAPACITY_CSV_URL}
            label={t('tables:downloads.capacity')}
          />
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