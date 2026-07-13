import * as React from 'react';

interface PinFilledIconProps {
  size?: number;
  strokeWidth?: number;
  color?: string;
}

const PinFilledIcon: React.FC<PinFilledIconProps> = ({
  size = 22,
  strokeWidth = 1.5,
  color = '#C70000',
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 80 80"
  >
    <path d="M0 0h80v80H0z" fill="none" />
    <g fill="none">
      <path
        fill="#000"
        d="M40.131 34.635a2 2 0 1 0-4 0zm-4 24.155a2 2 0 1 0 4 0zm0-24.155V58.79h4V34.635z"
      />
      <path
        fill={color}
        stroke="#555"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="4"
        d="M32.878 15.033A10.506 10.506 0 1 1 43.384 33.23a10.506 10.506 0 0 1-10.506-18.197"
      />
    </g>
  </svg>
);

export default PinFilledIcon;
