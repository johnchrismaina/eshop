// components/Spinner
import React from 'react';

interface SpinnerProps {
  size?: number; // size in pixels
  borderColor?: string; // Tailwind border color class
}

const Spinner: React.FC<SpinnerProps> = ({
  size = 16,
  borderColor = 'border-gray-200',
}) => {
  return (
    <div
      className={`rounded-full animate-spin border-2 border-t-transparent ${borderColor}`}
      style={{ width: size, height: size }}
    />
  );
};

export default Spinner;
