import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Label
} from 'recharts';
import CustomBar from './CustomBar';
import type { ChartDataItem, CustomBarPayload, WeekInfo } from '@/utils/types/poolData';

interface GroupedBarChartProps {
  chartData: ChartDataItem[];
  relevantWeeks: WeekInfo[];
  selectedDay: string;
  hideOccupancySquare?: boolean;
}

const GroupedBarChart: React.FC<GroupedBarChartProps> = ({
  chartData,
  relevantWeeks,
  selectedDay,
  hideOccupancySquare = false
}) => {
  const { t } = useTranslation(['charts', 'common']);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        margin={{ top: 40, right: 30, left: 20, bottom: 60 }}
        barSize={65}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="hour"
          interval={0}
          tick={({ x, y, payload }) => (
            <g transform={`translate(${x},${y})`}>
              <text
                x={0}
                y={0}
                dy={30}
                textAnchor="middle"
                fill="#374151"
                fontSize="16"
              >
                {t(`common:days.${selectedDay.toLowerCase()}`)}
                {` ${payload.value}`}
              </text>
            </g>
          )}
        >
          <Label value={t('charts:axis.hour')} position="bottom" offset={60} />
        </XAxis>
        <YAxis domain={[0, 100]}>
          <Label
            value={t('charts:weeklyComparison.utilizationRate')}
            angle={-90}
            position="insideLeft"
            offset={0}
          />
        </YAxis>
        <Tooltip
          formatter={function (value: number, name: string, props: { payload: ChartDataItem }) {
            const weekIndex = parseInt(name.replace('week', ''));
            const payload = props.payload;
            const minOccupancy = payload[`minOccupancy${weekIndex}`];
            const maxOccupancy = payload[`maxOccupancy${weekIndex}`];
            const openedLanes = payload[`openedLanes${weekIndex}`];
            const openedLanesText = openedLanes ? `, ${openedLanes} ${t('charts:weeklyComparison.lanes')}` : '';
            const dayLabel = payload[`dayLabel${weekIndex}`];
            const occupancyText = minOccupancy === maxOccupancy ?
              `${maxOccupancy}` :
              `${minOccupancy}-${maxOccupancy}`;
            return [
              `${t(`common:days.${selectedDay.toLowerCase()}`)} ${dayLabel} - ${value}% (${occupancyText} ${t('common:people')}${openedLanesText})`
            ];
          }}
        />
        {relevantWeeks.map((_, index) => (
          <Bar
            key={index}
            dataKey={`week${relevantWeeks.length - 1 - index}`}
            isAnimationActive={false}
            fill={`hsl(${200 + index * 30}, 80%, ${50 - index * 5}%)`}
            shape={
              <CustomBar
                minOccupancy={(data: CustomBarPayload) => data[`minOccupancy${relevantWeeks.length - 1 - index}`] as number}
                maxOccupancy={(data: CustomBarPayload) => data[`maxOccupancy${relevantWeeks.length - 1 - index}`] as number}
                openedLanes={(data: CustomBarPayload) => data[`openedLanes${relevantWeeks.length - 1 - index}`] as number}
                dayLabel={(data: CustomBarPayload) => data[`dayLabel${relevantWeeks.length - 1 - index}`] as string}
                hideOccupancySquare={hideOccupancySquare}
              />
            }
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

export default GroupedBarChart;