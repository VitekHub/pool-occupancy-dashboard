import React, { useEffect, useState } from 'react';

interface FloatingTooltipProps {
  children: React.ReactNode;
  isVisible: boolean;
  targetRect: DOMRect | null;
}

const FloatingTooltip: React.FC<FloatingTooltipProps> = ({
  children,
  isVisible,
  targetRect
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (targetRect && isVisible) {
      const tooltipWidth = 400; // Approximate width of the tooltip
      const tooltipHeight = 600; // Approximate height of the tooltip
      const margin = 10; // Margin from the target element

      // Try positioning to the right first, then left if it doesn't fit
      const preferredX = targetRect.right + margin;
      const x = preferredX + tooltipWidth > window.innerWidth 
        ? Math.max(margin, targetRect.left - tooltipWidth - margin)
        : preferredX;
      
      // Clamp Y position within viewport bounds
      const y = Math.max(margin, Math.min(targetRect.top, window.innerHeight - tooltipHeight - margin));

      setPosition({ x, y });
    }
  }, [targetRect, isVisible]);

  if (!isVisible || !targetRect || position.x === 0 || position.y === 0) {
    return null;
  }

  return (
    <div
      className="fixed bg-white border border-gray-200 rounded-lg shadow-lg p-4 pointer-events-none w-96 h-[600px]"
      style={{
        left: position.x,
        top: position.y,
        zIndex: 1000
      }}
    >
      {children}
    </div>
  );
};

export default FloatingTooltip;