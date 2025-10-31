import React from 'react';

type SpinnerProps = {
  size?: number;
  color?: string;
};

export const Spinner: React.FC<SpinnerProps> = ({
  size = 24,
  color = '#333',
}) => (
  <div
    style={{
      width: size,
      height: size,
      border: `${size / 8}px solid #ccc`,
      borderTop: `${size / 8}px solid ${color}`,
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
    }}
  />
);
