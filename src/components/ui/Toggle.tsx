import React from 'react';

interface ToggleProps {
  value: boolean;
  setValue: (value: boolean) => void;
  label: string;
}

const Toggle: React.FC<ToggleProps> = ({ value, setValue, label }) => {
  return (
    <div className="flex items-center">
    <label className="flex items-center cursor-pointer">
        <span className="mr-2 text-sm text-gray-700">{label}</span>
        <div className="relative">
        <input
            type="checkbox"
            checked={value}
            onChange={(e) => setValue(e.target.checked)}
            className="sr-only"
        />
        <div className={`block w-11 h-6 rounded-full ${value ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
        <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${value ? 'transform translate-x-5' : ''}`}></div>
        </div>
    </label>
    </div>
  );
};

export default Toggle;