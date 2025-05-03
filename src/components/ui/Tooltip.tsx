import React from 'react';

interface TooltipProps {
  text: string;
  position?: 'top' | 'bottom';
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ text, position = 'top', children }) => {
  return (
    <div className="relative group">
      {children}
      <div className={`absolute left-1/2 transform -translate-x-1/2 ${
        position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
      } hidden group-hover:block z-10`}>
        <div className="bg-gray-900 text-white text-xs py-1 px-2 rounded whitespace-nowrap">
          {text}
        </div>
      </div>
    </div>
  );
};

export default Tooltip;