import React from 'react';
import { getColorForOccupancy } from '@/utils/charts/colorUtils';
import type { CustomBarPayload } from '@/utils/types/poolData';
import { usePoolSelector } from '@/contexts/PoolSelectorContext';

interface CustomBarProps {
  fill: string;
  x: number;
  y: number;
  width: number;
  height: number;
  value: number;
  minOccupancy: (payload: CustomBarPayload) => number;
  maxOccupancy: (payload: CustomBarPayload) => number;
  openedLanes: (payload: CustomBarPayload) => number;
  dayLabel: (payload: CustomBarPayload) => string;
  payload: CustomBarPayload;
  hideOccupancySquare?: boolean;
}

const CustomBar: React.FC<CustomBarProps> = ({
  fill,
  x,
  y,
  width,
  height,
  value,
  minOccupancy: getMinOccupancy,
  maxOccupancy: getMaxOccupancy,
  openedLanes: getOpenedLanes,
  dayLabel: getDayLabel,
  payload,
  hideOccupancySquare = false
}) => {
  const { selectedPool } = usePoolSelector();
  const maxOccupancy = getMaxOccupancy(payload);
  const minOccupancy = getMinOccupancy(payload);
  const occupancyColor = getColorForOccupancy(maxOccupancy);
  const squareSize = Math.min(width * 0.6, height * 0.3);
  const openedLanes = getOpenedLanes(payload);
  
  return (
    <g>
      {/* Main bar */}
      <rect 
        x={x} 
        y={y} 
        width={width} 
        height={height} 
        fill="white" 
        stroke={fill}
        strokeWidth="2"
      />
      
      {/* Week label */}
      <text
        x={x + width / 2}
        y={y + height + 15}
        textAnchor="middle" 
        fill="#6b7280"
        fontSize="12"
      >
        {getDayLabel(payload)}
      </text>
      
      {/* Utilization rate label */}
      <text
        x={x + width / 2}
        y={y - 5}
        textAnchor="middle"
        fill="#374151"
        fontSize="13"
      >
        {value}%
      </text>
      
      {/* Occupancy label */}
      {value > 0 && (
        <text
          x={x + width / 2}
          y={hideOccupancySquare ? y + height / 2 + 5 : y + height / 2 + squareSize / 2 + 15}
          textAnchor="middle"
          fill="#374151"
          fontSize="12"
        >
          {minOccupancy === maxOccupancy ? maxOccupancy : `${minOccupancy}-${maxOccupancy}`}
        </text>
      )}
      
      {/* Occupancy square - only show if not hidden */}
      {!hideOccupancySquare && (
        <rect
          x={x + (width - squareSize) / 2}
          y={y + height / 2 - squareSize / 2}
          width={squareSize}
          height={squareSize}
          fill={occupancyColor}
          stroke="#374151"
          strokeWidth="1"
        />
      )}
      
      {/* Lanes text */}
      {openedLanes && value > 0 && (
        <text
          x={x + width / 2}
          y={y + 20}
          textAnchor="middle"
          fill="#3b82f6"
          fontSize="13"
          fontWeight="500"
        >
          {`${openedLanes}/${selectedPool.insidePool?.totalLanes || 0}`}
        </text>
      )}
    </g>
  );
};

export default CustomBar;