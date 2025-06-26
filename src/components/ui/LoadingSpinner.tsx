import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      width: '100vw'
    }}>
      <svg
        width="48"
        height="48"
        viewBox="0 0 48 48"
        fill="none"
        className="animate-spin"
      >
        <circle
          cx="24"
          cy="24"
          r="20"
          stroke="#3b82f6"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="31.4 31.4"
        />
      </svg>
    </div>
  );
};

export default LoadingSpinner;
