import React, { useState } from 'react';
import { Waves, Building, TreePine, MapPin, Droplets, Users, Zap, Shield, Star, Heart } from 'lucide-react';
import { usePoolSelector } from '@/contexts/PoolSelectorContext';
import poolConfig from '@/pool_occupancy_config.json';
import { PoolConfig } from '@/utils/types/poolConfig';
import { POOL_TYPES } from '@/utils/types/poolTypes';

const getPoolIcon = (index: number) => {
  const icons = [
    Building,
    Waves,
    TreePine,
    MapPin,
    Droplets,
    Zap,
    Users,
    Shield,
    Star,
    Heart
  ];
  
  return icons[index] || Waves;
};

const LeftSidebar: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { selectedPool, setSelectedPool, setSelectedPoolType } = usePoolSelector();

  const handlePoolSelect = (pool: PoolConfig) => {
    setSelectedPool(pool);
    if (pool?.outsidePool?.viewStats) {
      setSelectedPoolType(POOL_TYPES.OUTSIDE);
    } else {
      setSelectedPoolType(POOL_TYPES.INSIDE);
    }
  };

  // Filter pools to only show those that have at least one pool type with viewStats enabled
  const visiblePools = poolConfig.filter((pool: PoolConfig) => pool.insidePool?.viewStats || pool.outsidePool?.viewStats);
  return (
    <div
      className={`fixed left-0 top-0 h-full bg-blue-600 text-white shadow-lg transition-all duration-300 z-50 ${
        isExpanded ? 'w-64' : 'w-16'
      }`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-blue-500">
          <div className="flex items-center">
            <Waves className="w-8 h-8 text-blue-200 flex-shrink-0" />
          </div>
        </div>

        {/* Pool List */}
        <div className="flex-1 overflow-y-auto py-4">
          {visiblePools.map((pool, index) => {
            const IconComponent = getPoolIcon(index);
            const isSelected = selectedPool.name === pool.name;
            
            return (
              <button
                key={index}
                onClick={() => handlePoolSelect(pool)}
                className={`w-full flex items-center px-4 py-3 text-left transition-colors hover:bg-blue-500 ${
                  isSelected ? 'bg-blue-700 border-r-4 border-blue-200' : ''
                }`}
                title={!isExpanded ? pool.name : undefined}
              >
                <IconComponent className="w-6 h-6 flex-shrink-0" />
                {isExpanded && (
                  <span className="ml-3 whitespace-nowrap overflow-hidden text-ellipsis">
                    {pool.name}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        {isExpanded && (
          <div className="p-4 border-t border-blue-500">
            <p className="text-xs text-blue-200">
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeftSidebar;