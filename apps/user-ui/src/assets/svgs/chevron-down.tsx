import * as React from 'react';

interface ChevronDownProps {
  size?: number;
  width?: number;
  height?: number;
  strokeWidth?: number;
  color?: string;
}

const ChevronDownIcon: React.FC<ChevronDownProps> = ({
  size = 22,
  width = 12,
  height = 14,
  strokeWidth = 1.5,
  color = '#000',
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    viewBox="0 0 24 24"
  >
    <path d="M0 0h24v24H0z" fill="none" />
    <path
      fill={color}
      d="M18.53 9.53a.75.75 0 0 0 0-1.06H5.47a.75.75 0 0 0 0 1.06l6 6a.75.75 0 0 0 1.06 0z"
    />
  </svg>
);

export default ChevronDownIcon;
