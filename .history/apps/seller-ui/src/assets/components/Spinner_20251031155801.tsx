import React from 'react';

type SpinnerProps = {
  size?: number; // Tailwind size scale (e.g., 4 = 1rem)
  color?: string; // base border color
  highlight?: string; // top border color
};

export const Spinner: React.FC<SpinnerProps> = ({
  size = 6,
  color = 'border-t-gray-100',
  highlight = 'border-t-blue-500',
}) => {
  const dimension = `${size * 0.25}rem`; // Tailwind scale: 4 = 1rem

  return (
    <div
      className={`animate-spin rounded-full border-4 ${color} ${highlight}`}
      style={{ width: dimension, height: dimension }}
    />
  );
};
